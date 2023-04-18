/* eslint-disable no-console */
import React from 'react';
import { useHistory } from 'react-router-dom';

import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { StyledMainHeader } from '../GoogleCalendarComponent/styles';
import { Container } from './styles';

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    width: '100%',
    height: '220px',
    cursor: 'pointer',
  },

  listPaper: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: theme.spacing(1),
    ...theme.scrollbarStyles,
    width: '100%',
    marginBottom: 'auto',
    minHeight: '200px',
  },
}));

const IntegrationLinkBox = ({
  title,
  description,
  icon,
  link,
  customStyle = {},
  img,
}) => {

  const classes = useStyles();
  const history = useHistory();

  const handleClick = () => {
    history.push(link);
  };

  return (
    <Paper className={classes.mainPaper} onClick={handleClick}>
      <StyledMainHeader style={{ backgroundColor: '#008080' }}>
        <span>{title}</span>
      </StyledMainHeader>
      <Container style={{ ...customStyle }}>
        {img && <img src={img} alt={title} />}
        {icon && <div>{icon}</div>}
        {description && <p>{description}</p>}
      </Container>
    </Paper>
  );
};

export default IntegrationLinkBox;
