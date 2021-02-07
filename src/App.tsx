import React from 'react';
import logo from './logo.svg';
import './App.css';

import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { AppBar, Button, Card, CardContent, CardMedia, colors, IconButton, Paper, Toolbar, Typography } from '@material-ui/core';

import Menu from '@material-ui/icons/Menu';
import PlayArrow from "@material-ui/icons/PlayArrow";
import SkipNext from "@material-ui/icons/SkipNext";
import SkipPrevious from "@material-ui/icons/SkipPrevious";
import Loop from "@material-ui/icons/Loop";
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
    },
    // toolbar: {
    //   minHeight: 128,
    //   alignItems: 'flex-start',
    //   paddingTop: theme.spacing(1),
    //   paddingBottom: theme.spacing(2),
    // },
    content: {
      flex: '1 0 auto',
    },
    controls: {
      alignItems: 'center',
    },
    playIcon: {
      height: 48,
      width: 48,
      flexGrow: 1
    },
  }),
);

function App() {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <div className="App">
      <AppBar position={'fixed'} className={classes.appBar}>
      <div className={classes.controls}>
        <IconButton color='inherit' aria-label="loop">
          <Loop />
        </IconButton>
        <IconButton aria-label="previous">
          {theme.direction === 'rtl' ? <SkipNext /> : <SkipPrevious />}
        </IconButton>
        <IconButton aria-label="play/pause">
          <PlayArrow className={classes.playIcon} />
        </IconButton>
        <IconButton aria-label="next">
          {theme.direction === 'rtl' ? <SkipPrevious /> : <SkipNext />}
        </IconButton>
        <IconButton aria-label="shuffle">
          <Shuffle />
        </IconButton>
      </div>
      
      <Toolbar>
        <IconButton edge='start' color="inherit" aria-label="menu">
          <Menu />
        </IconButton>
      </Toolbar>
      </AppBar>
    </div>
  );
}

export default App;
