import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, InputAdornment, IconButton } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';

const useStyles = makeStyles((theme) => ({
  messageInput: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    '& .MuiInputBase-root': {
      borderRadius: 20,
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
    '& .MuiInputAdornment-root': {
      marginRight: theme.spacing(1),
    },
  },
  sendButton: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    borderRadius: 20,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

export default function ConversationInput() {
  const classes = useStyles();

  return (
    <TextField
      variant="outlined"
      placeholder="Type your message here"
      fullWidth
      className={classes.messageInput}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton className={classes.sendButton}>
              <SendIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
