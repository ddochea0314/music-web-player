import React, { useEffect, useRef, useState } from 'react';
import firebase from "firebase/app";
import "firebase/storage";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";

import localforage from "localforage";
import logo from './logo.svg';
import './App.css';

import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { AppBar, Fab, Card, CardContent, CardMedia, colors, IconButton, Toolbar, Typography, CardHeader, Button } from '@material-ui/core';

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

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const storage = firebase.storage();

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

/**
 * 음악 재생 화면 
 */
function MusicPlayer() {
  const classes = useStyles();
  const theme = useTheme();

  const [isPlay, setIsPlay] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isSuffle, setIsSuffle] = useState(false);

  const [currentPlayIdx, setCurrentPlayIdx] = useState(0);

  useEffect(() => {  // 첫 시작 또는 이벤트 발생시마다 호출됨
    console.log(`isPlay : ${isPlay}`);
    console.log(`isRepeat : ${isRepeat}`);
    console.log(`isSuffle : ${isSuffle}`);
    if(isPlay) {
      const storage = firebase.storage().ref();
      storage.listAll().then(result => {
        console.log(result.items);
      });
    }
    else {
      
    }
    if (isRepeat) {
      
    }
    else {

    }
    if (isSuffle) {
      
    }
    else {

    }
  });

  /**
   * 음악을 재생/일시정지 시킵니다.
   */
  function togglePlay() {
    setIsPlay(!isPlay);
  }

  /**
   * 반복재생을 끄거나 켭니다.
   */
  function toggleRepeat() {
    setIsRepeat(!isRepeat);
  }

  /**
   * 재생리스트를 랜덤하게 정렬하거나, 인덱스 순서에 맞춰 정렬합니다.
   */
  function toggleShuffle() {
    setIsSuffle(!isSuffle);
  }

  return (
    <>
    <Card className={classes.card}>
        <CardHeader>
          <Typography>Test</Typography>
        </CardHeader>
        <CardContent>
          <Typography>Test</Typography>
        </CardContent>
      </Card>
      <AppBar position={'fixed'} className={classes.appBar}>
        <Toolbar>
        <IconButton color={ isRepeat? 'inherit' : 'default' } aria-label="loop" onClick={toggleRepeat}>
          <Repeat />
        </IconButton>
        <div className={classes.controls}>
        <IconButton aria-label="previous">
          {theme.direction === 'rtl' ? 
          <SkipNext className={classes.Icon} /> : 
          <SkipPrevious className={classes.Icon} />
          }
        </IconButton>
        <Fab color={'secondary'} aria-label="play/pause" onClick={togglePlay}>
          {
            isPlay? 
            <Pause className={classes.Icon} /> : 
            <PlayArrow className={classes.Icon} />
          }
        </Fab>
        <IconButton aria-label="next">
          {theme.direction === 'rtl' ? 
          <SkipPrevious className={classes.Icon} /> : 
          <SkipNext className={classes.Icon} />}
        </IconButton>
      </div>
      <IconButton color={isSuffle? 'inherit' : 'default'} aria-label="shuffle" onClick={toggleShuffle}>
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