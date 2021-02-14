import React, { useEffect, useRef, useState } from 'react';
import firebase from "firebase/app";
import "firebase/storage";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";

import localforage from "localforage";
import moment from "moment";
import './App.css';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { AppBar, LinearProgress, Fab, Card, CardContent, CardMedia, IconButton, Toolbar, Typography, Button, List, ListItem, ListItemText, ListItemIcon, Box } from '@material-ui/core';

// 이 방식은 빌드 및 테스트 초기 로딩이 느린 단점이 있음.
// import { PlaylistPlay, PlayArrow, Pause, SkipNext, SkipPrevious } from "@material-ui/icons";

// 아이콘 검색 URL : https://material-ui.com/components/material-icons/#material-icons
import IconPlaylistPlay from '@material-ui/icons/PlaylistPlay';
import IconPlayArrow from "@material-ui/icons/PlayArrowRounded";
import IconPause from "@material-ui/icons/Pause";
import IconSkipNext from "@material-ui/icons/SkipNext";
import IconSkipPrevious from "@material-ui/icons/SkipPrevious";
import IconRepeat from "@material-ui/icons/Repeat";
import IconShuffle from "@material-ui/icons/Shuffle";
import IconAudiotrack from "@material-ui/icons/Audiotrack";
import IconVolumeMute from "@material-ui/icons/VolumeMute";
import IconClose from "@material-ui/icons/Close";
import IconExitToApp from '@material-ui/icons/ExitToApp';

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
    controlarea: {
      top: 'auto',
      position: 'fixed',
      bottom: 0,
      paddingTop: theme.spacing(2),
      width: '100%',
      textAlign: 'center',
    },
    appBar: {
      paddingTop: theme.spacing(2)
    },
    flexGrow: {
      alignItems: 'center',
      flexGrow: 1 // 해당 영역과 함께 나란히 놓인 다른 태그들을 양끝으로 밀어낸다(?)
    },
    cardMedia : {
      height: '50vmin'
    },
    cardContent : {
      height: '20vmin'
    },
    Icon: {
      height: 32,
      width: 32
    },
    progress: {
      margin: '1em 1em 0em'
    },
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

  function signOut() {
    if(window.confirm('로그아웃 하시겠습니까?')) {
      auth.signOut();
    }
  }

  return auth.currentUser && (
    <IconButton color={'inherit'} onClick={signOut}>
      <IconExitToApp />
    </IconButton>
  )
}

interface MusicListProp {
  close : Function,
  playList : Media[],
  currentPlayIdx : number,
  setCurrentPlayIdx : Function
}

/**
 * 음악 리스트 화면
 */
function MusicList({ close, playList, currentPlayIdx, setCurrentPlayIdx } : MusicListProp) {

  return (
  <List>
  {playList && playList.map(item => {
    
    return (
      <ListItem key={item.title} button onClick={() => { setCurrentPlayIdx(playList.findIndex(p => p.idx === item.idx)) }}>
        <ListItemIcon>
          {(item.idx === playList[currentPlayIdx].idx)? <IconAudiotrack /> : <IconVolumeMute /> }
        </ListItemIcon>
        <ListItemText>{ item.title }</ListItemText>
      </ListItem>
    )
  }) }
  <IconButton onClick={() => close() }>
    <IconClose />
  </IconButton>
  </List>
  )
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
      setTotalTime(Number.isNaN(audio.duration)? 1 : audio.duration);
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
      setPlayList(list => list.sort((a, b) => a.idx - b.idx));
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

  function convertTimeString(ms : number) {
    return moment(ms * 1000).format("mm:ss");
  }
  
  return (
    <>
    <audio ref={audioRef} hidden={true} />
    {isShowPlayList? 
    <MusicList close={setIsShowPlayList} playList={playList} currentPlayIdx={currentPlayIdx} setCurrentPlayIdx={setCurrentPlayIdx} /> : 
    <>
    <Box width={1} position={'absolute'} top={0}>
    <Card>
      <CardMedia
        className={classes.cardMedia}
        image="logo512.png"
        title="music cover"/>
      <CardContent
        className={classes.cardContent}>
        <Typography variant={'body2'}>
          {currentPlayTitle}
        </Typography>
      </CardContent>
    </Card>
    </Box>
    <div className={classes.controlarea}>
      <LinearProgress className={classes.progress} variant="determinate" value={currentTime / totalTime * 100 } />
      <Toolbar>
        <Typography variant={'body2'}>{convertTimeString(currentTime)}</Typography>
          <div className={classes.flexGrow}></div>
        <Typography variant={'body2'}>{convertTimeString(totalTime)}</Typography>
      </Toolbar>
      <AppBar position={'relative'} className={classes.appBar}>
        <Toolbar>
        <IconButton color={ isRepeat? 'inherit' : 'default' } aria-label="loop" onClick={() => setIsRepeat(!isRepeat)}>
          <IconRepeat />
        </IconButton>
        <div className={classes.flexGrow}>
        <IconButton aria-label="previous" onClick={() => audioRef.current.currentTime = 0}>
          {theme.direction === 'rtl' ? 
          <IconSkipNext className={classes.Icon} /> : 
          <IconSkipPrevious className={classes.Icon} />
          }
        </IconButton>
        <Fab color={'secondary'} aria-label="play/pause" onClick={() => isPlay? audioRef.current.pause() : audioRef.current.play() }>
          {
            isPlay? 
            <IconPause className={classes.Icon} /> : 
            <IconPlayArrow className={classes.Icon} />
          }
        </Fab>
        <IconButton aria-label="next" onClick={setNextPlay}>
          {theme.direction === 'rtl' ? 
          <IconSkipPrevious className={classes.Icon} /> : 
          <IconSkipNext className={classes.Icon} />}
        </IconButton>
      </div>
      <IconButton color={isSuffle? 'inherit' : 'default'} aria-label="shuffle" onClick={() => setIsSuffle(!isSuffle)}>
        <IconShuffle />
      </IconButton>
      </Toolbar>
      <Toolbar>
        <IconButton color="inherit" aria-label="menu" onClick={() => setIsShowPlayList(true)}>
          <IconPlaylistPlay />
        </IconButton>
        <div className={classes.flexGrow}></div>
        <SignOut />
      </Toolbar>
      </AppBar>
    </div>
    </>
    }
    </>
  );
}