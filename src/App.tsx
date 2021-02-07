import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { AppBar, Fab, Card, CardContent, CardMedia, colors, IconButton, Paper, Toolbar, Typography } from '@material-ui/core';

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
    details: {
      display: 'flex',
      flexDirection: 'column',
    },
    appBar: {
      top: 'auto',
      bottom: 0,
      paddingTop: theme.spacing(2)
    },
    controls: {
      alignItems: 'center',
      flexGrow: 1
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

  function togglePlay() {
    setIsPlay(!isPlay);
  }

  return (
    <div className="App">
      <AppBar position={'fixed'} className={classes.appBar}>
        <Toolbar>
        <IconButton color='inherit' aria-label="loop">
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
      <IconButton aria-label="shuffle">
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
