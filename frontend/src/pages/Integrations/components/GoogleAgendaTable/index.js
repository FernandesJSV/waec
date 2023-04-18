/* eslint-disable no-console */
import React from 'react';

import {
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DeleteOutline, Edit, Settings } from '@material-ui/icons';

import useCalendars from '../../../../hooks/useCalendars';
import { StyledMainHeader } from '../../../Integrations/components/GoogleCalendarComponent/styles';

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    width: '100%',
    height: '300px',
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
  table: {
    overflowY: 'scroll',
    ...theme.scrollbarStyles,
    height: '250px',
  },
}));

const GoogleCalendarConfigTable = ({
  handleOpenEditModal,
  handleDeleteAgenda,
  handleEditConfig,
}) => {
  const classes = useStyles();
  const { calendars: data, isLoading } = useCalendars({ enabled: true });

  return (
    <Paper className={classes.mainPaper}>
      <StyledMainHeader>
        <span>Agendas</span>
      </StyledMainHeader>
      <TableContainer className={classes.table}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center">Nome da agenda</TableCell>
              <TableCell
                align="center"
                style={{
                  width: '30%',
                }}
              >
                Ação
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!isLoading &&
              data &&
              data.length > 0 &&
              data?.map((agenda) => (
                <TableRow key={agenda.id}>
                  <TableCell align="center">{agenda.name}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Configurações">
                      <IconButton size="small">
                        <Settings
                          onClick={() => {
                            handleEditConfig(agenda);
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small">
                        <Edit
                          onClick={() => {
                            handleOpenEditModal(agenda);
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        onClick={() => handleDeleteAgenda(agenda.id)}
                        size="small"
                      >
                        <DeleteOutline />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default GoogleCalendarConfigTable;
