import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { AppBar, Fab, Card, CardContent, CardMedia, colors, IconButton, Toolbar, Typography, CardHeader } from '@material-ui/core';

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
  const classes = useStyles();
  const theme = useTheme();

  const [isPlay, setIsPlay] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isSuffle, setIsSuffle] = useState(false);



  useEffect(() => {
    console.log('test'); // 첫 시작 또는 이벤트 발생시마다 호출됨
  });

  /**
   * 음악을 재생/일시정지 시킵니다.
   */
  function togglePlay() {
    setIsPlay(!isPlay);
    if(!isPlay) {
      
    }
    else {

    }
  }

  /**
   * 반복재생을 끄거나 켭니다.
   */
  function toggleRepeat() {
    setIsRepeat(!isRepeat);
    if (!isRepeat) {
      
    }
    else {

    }
  }

  /**
   * 재생리스트를 랜덤하게 정렬하거나, 인덱스 순서에 맞춰 정렬합니다.
   */
  function toggleShuffle() {
    setIsSuffle(!isSuffle);
    if (!isSuffle) {
      
    }
    else {

    }
  }

  return (
    <div className="App">
      <Toolbar>

      </Toolbar>
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
      </Toolbar>
      </AppBar>
    </div>
  );
}

export default App;
