import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    margin: '0 auto',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
}));

export default function SearchBar({ onSearch }) {
  const classes = useStyles();

  const handleSearch = (event) => {
    const searchTerm = event.target.value;
    // Do something with the search term
    onSearch(searchTerm)
  };

  return (
    <Paper component="form" className={classes.root}>
      <SearchIcon className={classes.iconButton} />
      <input style={{
        width: '100%',
        height: 40,
        fontSize: 16,
        fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
        "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",sans-serif`,
        border: 'none',
        outline: 'none',
      }} placeholder='Tìm kiếm' onChange={handleSearch} />
    </Paper>
  );
}
