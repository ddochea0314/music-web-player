import React, { useEffect, useRef, useState } from 'react';
import firebase from "firebase/app";
import "firebase/storage";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";

import localforage from "localforage";
import deepCopy from "fast-copy";

// import logo from './logo.svg';
import './App.css';

import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { AppBar, Fab, Card, CardContent, IconButton, Toolbar, Typography, CardHeader, Button } from '@material-ui/core';

// https://material-ui.com/components/material-icons/#material-icons

// 이 방식은 빌드 및 테스트 초기 로딩이 느린 단점이 있음.
// import { PlaylistPlay, PlayArrow, Pause, SkipNext, SkipPrevious } from "@material-ui/icons";

import PlaylistPlay from '@material-ui/icons/PlaylistPlay';
import PlayArrow from "@material-ui/icons/PlayArrowRounded";
import Pause from "@material-ui/icons/Pause";
import SkipNext from "@material-ui/icons/SkipNext";
import SkipPrevious from "@material-ui/icons/SkipPrevious";
import Repeat from "@material-ui/icons/Repeat";
import Shuffle from "@material-ui/icons/Shuffle";

import { firebaseConfig } from "./firebaseConfig";
import { Media } from "./models/media";

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const storage = firebase.storage().ref();

localforage.config({
  storeName: "media"
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      bottom: 0,
    },
    appBar: {
      top: 'auto',
      bottom: 0,
      paddingTop: theme.spacing(2)
    },
    controls: {
      alignItems: 'center',
      flexGrow: 1 // 해당 영역과 함께 나란히 놓인 다른 태그들을 양끝으로 밀어낸다(?)
    },
    card : {
      margin: theme.spacing(1),
      minHeight: 400
    },
    Icon: {
      height: 32,
      width: 32
    }
  }),
);

function App() {
  const [user] = useAuthState(auth); // firebase auth 기능 사용을 위한 Hook

  return (
    <div className="App">
      { user ? <MusicPlayer /> : <SignIn /> }
    </div>
    );
}

export default App;

/**
 * 로그인 버튼(화면)
 */
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (<Button color={'primary'} onClick={signInWithGoogle}>Sign in with Google</Button>)
}
/**
 * 로그아웃 버튼
 */
function SignOut() {
  return auth.currentUser && (
    <Button color={'inherit'} onClick={() => auth.signOut()}>Sign out</Button>
  )
}

interface MusicListProp {
  playList : Media[]
}

/**
 * 음악 리스트 화면
 */
function MusicList({ playList } : MusicListProp) {

}

/**
 * 음악 재생 화면 
 */
function MusicPlayer() {
  const classes = useStyles();
  const theme = useTheme();

  const [isPlay, setIsPlay] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isSuffle, setIsSuffle] = useState(false);

  const [currentPlayIdx, setCurrentPlayIdx] = useState(-1);
  const [playIndexes, setPlayIndexes] = useState(new Array<number>());
  const [playList, setPlayList] = useState(new Array<string>());
  const [totalTime, setTotalTime] = useState(1); // 초기값을 0으로 주면 바로 다음 음악재생
  const [currentTime, setCurrentTime] = useState(0);

  // const audio = new Audio(); // 이렇게 선언할 경우 MusicPlayer 내 다른 state값이 변경될때마다 매번 생성됨.
  // const [audio] = useState(new Audio()); // 재생중 로그아웃시 객체가 살아남아있다. 어차피 DevTools 네트워크탭에서 blob URL 확인이 가능하므로 그냥 useRef 쓰도록 하자.
  const audioRef = useRef(new Audio);

  function init() {
    console.log(`init ${MusicPlayer.name}`);
    storage.listAll().then(result => {
      const mediaArray : string[] = [];
      const playIdx : number[] = [];
      let i = 0;
      result.items.forEach(item => {
        mediaArray.push(item.name);
        playIdx.push(i);
        i++;
      });
      setPlayList(mediaArray);
      setPlayIndexes(playIdx);
      setCurrentPlayIdx(0);
    });
    const audio = audioRef.current;
    audio.addEventListener('timeupdate', function() {
      //#region NOTE : // EventListener 안에선 State 값을 사용할 수 없다. 해당 상태값이 이벤트안에선 정상적으로 인지되지 않는다.
      // if(currentTime >= totalTime) {
      //   console.log('do next');
      //   setNext();
      // }
      //#endregion
      setCurrentTime(audio.currentTime);
      setTotalTime(audio.duration);
    });
    audio.addEventListener('play', function() {
      // H/W에서 제어했을때도 State의 변경값 확인이 필요하므로 eventlistener 필요
      setIsPlay(true); // 이벤트리스너 안에선 고정값만 사용가능.
    });
    audio.addEventListener('pause', function() {
      setIsPlay(false);
    });
  }

  useEffect(() => {
    init();
  }, []); // [] 내용물이 없으면 최초 1회만 호출

  useEffect(() => {
    if(currentPlayIdx !== -1){
      const audio = audioRef.current;
      URL.revokeObjectURL(audio.src);
      const key = playList[playIndexes[currentPlayIdx]];
      localforage.getItem(key)
      .then(item => {
        if(item) {
          play(item); 
        }
        else {
          return storage.child(key).getDownloadURL()
          .then(url => {
            if(url) {
              return fetch(url);
            }
          })
          .then(res => {
            if(res) {
              return res.blob();
            }
          })
          .then(blob => {
            if(blob) {
              console.log(`call blob`);
              console.log(blob);
              localforage.setItem(key, blob);
              play(blob);
            }
          });
        }
      });
      const play = (item : any) => {
         if(item){
          audio.src = URL.createObjectURL(item);
          if(isPlay) audio.play();
        }
      }
    }
  }, [currentPlayIdx])

  useEffect(() => {
    if(currentTime >= totalTime) {
      setNextPlay();
    }
  }, [currentTime, totalTime]);

  useEffect(() => {
    if(isSuffle) {
      setPlayIndexes(playIndexes.sort(() => Math.random() - Math.random()));
      // 현재 듣는 음악을 인덱스 가장 앞쪽에 두려했지만, 굳이 안둬도 재생상에는 문제없으므로 쓰도록 한다. (똑같은 음악이 바로 다음순서가 될수도 있긴하다.)
    }
    else {
      setPlayIndexes(playIndexes.sort());
    }
  }, [isSuffle]);

  function setNextPlay() {
    let nextIdx = currentPlayIdx + 1;
    if(nextIdx >= playIndexes.length){
      nextIdx = 0;
      if(!isRepeat){
        const audio = audioRef.current;
        audio.pause();
        setIsPlay(false);
      }
    }
    setCurrentPlayIdx(nextIdx);
  }
  
  return (
    <>
    <audio ref={audioRef} hidden={true} />
    <Card className={classes.card}>
        <CardHeader>
          <Typography>Test</Typography>
        </CardHeader>
        <CardContent>
          <Typography>{currentPlayIdx}</Typography>
          <Typography>{currentTime} / {totalTime}</Typography>
        </CardContent>
      </Card>
      <AppBar position={'fixed'} className={classes.appBar}>
        <Toolbar>
        <IconButton color={ isRepeat? 'inherit' : 'default' } aria-label="loop" onClick={() => setIsRepeat(!isRepeat)}>
          <Repeat />
        </IconButton>
        <div className={classes.controls}>
        <IconButton aria-label="previous" onClick={() => audioRef.current.currentTime += 30}>
          {theme.direction === 'rtl' ? 
          <SkipNext className={classes.Icon} /> : 
          <SkipPrevious className={classes.Icon} />
          }
        </IconButton>
        <Fab color={'secondary'} aria-label="play/pause" onClick={() => isPlay? audioRef.current.pause() : audioRef.current.play() }>
          {
            isPlay? 
            <Pause className={classes.Icon} /> : 
            <PlayArrow className={classes.Icon} />
          }
        </Fab>
        <IconButton aria-label="next" onClick={setNextPlay}>
          {theme.direction === 'rtl' ? 
          <SkipPrevious className={classes.Icon} /> : 
          <SkipNext className={classes.Icon} />}
        </IconButton>
      </div>
      <IconButton color={isSuffle? 'inherit' : 'default'} aria-label="shuffle" onClick={() => setIsSuffle(!isSuffle)}>
        <Shuffle />
      </IconButton>
      </Toolbar>
      <Toolbar>
        <IconButton edge='start' color="inherit" aria-label="menu">
          <PlaylistPlay />
        </IconButton>
        <SignOut />
      </Toolbar>
      </AppBar>
    </>
  );
}