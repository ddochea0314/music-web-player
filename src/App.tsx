import React, { useEffect, useRef, useState } from 'react';
import firebase from "firebase/app";
import "firebase/storage";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";

import localforage from "localforage";
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
import { Media } from './models/media';

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
  closeThis : Function,
  playList : Media[],
  currentPlayIdx : number,
  setCurrentPlayIdx : Function
}

/**
 * 음악 리스트 화면
 */
function MusicList({ closeThis, playList, currentPlayIdx, setCurrentPlayIdx } : MusicListProp) {

  function onCloseClick() {
    closeThis();
  }

  return (<>
  {playList && playList.map(item => {
    
    return (
      <div>
      {(item.idx === currentPlayIdx)? "(playing)" : "" }
      <span>{ item.idx } </span>
      <span>{ item.title } </span>
      <button onClick={() => setCurrentPlayIdx(item.idx)} >jump Music</button>
      </div>
    )
  }) }
  <button onClick={onCloseClick}>Close List</button>
  </>)
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
  const [currentPlayTitle, setCurrentPlayTitle] = useState("");
  // const [playIndexes, setPlayIndexes] = useState(new Array<number>());
  const [playList, setPlayList] = useState(new Array<Media>());
  const [totalTime, setTotalTime] = useState(1); // 초기값을 0으로 주면 바로 다음 음악재생
  const [currentTime, setCurrentTime] = useState(0);

  const [isShowPlayList, setIsShowPlayList] = useState(false);

  // const audio = new Audio(); // 이렇게 선언할 경우 MusicPlayer 내 다른 state값이 변경될때마다 매번 생성됨.
  // const [audio] = useState(new Audio()); // 재생중 로그아웃시 객체가 살아남아있다. 어차피 DevTools 네트워크탭에서 blob URL 확인이 가능하므로 그냥 useRef 쓰도록 하자.
  const audioRef = useRef(new Audio());

  function init() {
    console.log(`init ${MusicPlayer.name}`);
    storage.listAll().then(result => {
      const mediaArray : Media[] = [];
      let i = 0;
      result.items.forEach(item => {
        mediaArray.push({
          idx : i,
          title : item.name,
        });
        i++;
      });
      setPlayList(mediaArray);
      // setPlayIndexes(playIdx);
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
      (async () => {
        URL.revokeObjectURL(audio.src);
        const music = playList[currentPlayIdx];
        const item : any = await localforage.getItem(music.title);
        if(item) {
          audio.src = URL.createObjectURL(item);
          if(isPlay) audio.play();
        }
        else {
          try {
            const url = await storage.child(music.title).getDownloadURL();
            const res = await fetch(url);
            const blob = await res.blob();
            localforage.setItem(music.title, blob);
            audio.src = URL.createObjectURL(blob);
            if(isPlay) audio.play();
          }
          catch(e)
          {
            console.error(e);
          }
        }
        setCurrentPlayTitle(music.title);
      })();
    }
  }, [currentPlayIdx])

  useEffect(() => {
    if(currentTime >= totalTime) {
      setNextPlay();
    }
  }, [currentTime, totalTime]);

  useEffect(() => {
    if(isSuffle) {
      // 현재 듣고 있는 index를 제외하고 Array 내 Index 번호들을 랜덤 순서로 변경
      const p = playList;
      const rndTargets = [...p.slice(0, currentPlayIdx), ...p.slice(currentPlayIdx + 1, p.length)].sort(p => Math.random() - Math.random());
      const result = [...rndTargets.slice(0, currentPlayIdx), p[currentPlayIdx], ...rndTargets.slice(currentPlayIdx, p.length)];
      setPlayList(result);
    }
    else {
      setPlayList(p => p.sort());
    }
  }, [isSuffle]);

  function setNextPlay() {
    let nextIdx = currentPlayIdx + 1;
    if(nextIdx >= playList.length){
      nextIdx = 0;
      if(!isRepeat){
        const audio = audioRef.current;
        audio.pause();
        setIsPlay(false);
      }
    }
    setCurrentPlayIdx(nextIdx);
  }

  function closePlayList() {
    setIsShowPlayList(false);
  }
  
  return (
    <>
    <audio ref={audioRef} hidden={true} />
    {isShowPlayList? 
    <MusicList closeThis={closePlayList} playList={playList} currentPlayIdx={currentPlayIdx} setCurrentPlayIdx={setCurrentPlayIdx} /> : 
      <>
      <Card className={classes.card}>
        <CardHeader>
          <Typography>Test</Typography>
        </CardHeader>
        <CardContent>
          <Typography>{currentPlayTitle}</Typography>
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
        <IconButton edge='start' color="inherit" aria-label="menu" onClick={() => setIsShowPlayList(true)}>
          <PlaylistPlay />
        </IconButton>
        <SignOut />
      </Toolbar>
      </AppBar>
      </>}
    </>
  );
}