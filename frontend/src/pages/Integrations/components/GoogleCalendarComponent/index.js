/* eslint-disable no-console */
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { GoogleLogin } from 'react-google-login';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  Paper,
  Box,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ChevronLeft } from '@material-ui/icons';
import { gapi } from 'gapi-script';

import MainHeader from '../../../../components/MainHeader';
import Title from '../../../../components/Title';
// import { ReloadContext } from '../../../../context/Reload/ReloadContext';
// import { useSystem } from '../../../../hooks/useSystem';
import useDeleteGoogleAgenda from '../../../GoogleAgenda/hooks/useDeleteGoogleAgenda';
import MainContainer from '../../../Reports/components/MainContainer';
import useUpdatePermissions from '../../../Settings/hooks/useUpdatePermissions';
import AgendaModal from '../AgendaModal';
import CalendarConfigModal from '../CalendarConfigModal';
import GoogleAgendaTable from '../GoogleAgendaTable';
import {
  SwitchContainer,
  ButtonsContainer,
  StyledMainHeader,
  GoogleContainer,
} from './styles';

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    width: '100%',
    minHeight: '200px',
  },

  listPaper: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: theme.spacing(1),
    ...theme.scrollbarStyles,
    width: '100%',
    marginBottom: 'auto',
    height: '260px',
  },
}));

const GoogleCalendarComponent = () => {
  // const { system } = useSystem();

  const classes = useStyles();
  const history = useHistory();
  // const { companyPermissions } = useContext(ReloadContext);
  const updatePermissions = useUpdatePermissions();
  // const [permissions, setPermissions] = useState(companyPermissions);
  const deleteAgenda = useDeleteGoogleAgenda();
  const [openGoogleAgendaModal, setOpenGoogleAgendaModal] = useState(false);
  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [agenda, setAgenda] = useState(null);

  const handleEditConfig = (agenda) => {
    setAgenda(agenda);
    setOpenConfigModal(true);
  };

  const handleCloseConfigModal = () => {
    setAgenda(null);
    setOpenConfigModal(false);
  };

  const handleCloseGoogleAgendaModal = () => {
    setOpenGoogleAgendaModal(false);
    setAgenda(null);
  };

  const handleOpenEditModal = (agenda) => {
    setAgenda(agenda);
    setOpenGoogleAgendaModal(true);
  };

  const handleDeleteAgenda = async (id) => {
    try {
      await deleteAgenda.mutateAsync(id);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        scope: 'openid profile email https://www.googleapis.com/auth/calendar',
      });
    }

    gapi.load('client:auth2', start);
  }, []);

  // useEffect(() => {
  //   setPermissions(companyPermissions);
  // }, [companyPermissions]);

  // const handleDisconnect = useCallback(async () => {
  //   try {
  //     await updatePermissions.mutateAsync({
  //       revoke_token: true,
  //     });
  //   } catch (error) {
  //     toast.error('Erro ao desconectar do Google Calendar');
  //   }
  // }, [updatePermissions]);

  // const handleSubmit = useCallback(async () => {
  //   try {
  //     await updatePermissions.mutateAsync({
  //       ...permissions,
  //       google_refresh_token: null,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [permissions, updatePermissions]);

  // const responseGoogle = async (response) => {
  //   try {
  //     const { code } = response;
  //     await updatePermissions.mutateAsync({
  //       google_refresh_token: code,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     toast.error('Erro ao conectar com o Google');
  //   }
  // };

  const responseError = (response) => {
    console.log(response);
  };

  return (
    <MainContainer>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0',
          minHeight: '48px',
        }}
      >
        <IconButton onClick={() => history.push('/integrations')}>
          <ChevronLeft />
          <span style={{ fontSize: '1rem' }}>Voltar</span>
        </IconButton>
      </div>
      <MainHeader>
        <Title>Google Agenda</Title>
      </MainHeader>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          padding: '10px',
          gap: '10px',
        }}
      >
        <div>
          <Button
            onClick={() => setOpenConfigModal(true)}
            color="primary"
            variant="contained"
          >
            Criar configuração de agenda
          </Button>
        </div>
        <div>
          <Button
            onClick={() => setOpenGoogleAgendaModal(true)}
            color="primary"
            variant="contained"
          >
            Criar Agenda
          </Button>
        </div>
      </div>
      <Grid container spacing={5}>
        <Grid item xs={6}>
          <Paper className={classes.mainPaper}>
            <StyledMainHeader style={{ backgroundColor: '#008080' }}>
              <span>Configurações </span>
            </StyledMainHeader>
            <Box className={classes.listPaper}>
              <SwitchContainer custom>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      // value={permissions?.google_calendar}
                      // checked={permissions?.google_calendar}
                      value={true}
                      checked={true}
                      onChange={() => true}
                      // onChange={() =>
                      //   setPermissions({
                      //     ...permissions,
                      //     google_calendar: !permissions?.google_calendar,
                      //   })
                      // }
                      name="googleCalendar"
                      color="primary"
                    />
                  }
                  label={'Google calendário'}
                />
                <GoogleContainer>
                  <div>
                    <Button
                      style={{
                        height: '100%',
                      }}
                      variant="outlined"
                      color="secondary"
                    // onClick={handleDisconnect}
                    >
                      Desconectar
                    </Button>
                  </div>
                </GoogleContainer>
              </SwitchContainer>

              <ButtonsContainer>
                <Button
                  disabled={updatePermissions.isLoading}
                  variant="contained"
                  color="primary"
                  // onClick={handleSubmit}
                >
                  Salvar
                </Button>
              </ButtonsContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <GoogleAgendaTable
            handleOpenEditModal={handleOpenEditModal}
            handleDeleteAgenda={handleDeleteAgenda}
            handleEditConfig={handleEditConfig}
          />
        </Grid>
      </Grid>
      {openGoogleAgendaModal && (
        <AgendaModal
          agenda={agenda}
          open={openGoogleAgendaModal}
          onClose={handleCloseGoogleAgendaModal}
        />
      )}

      {openConfigModal && (
        <CalendarConfigModal
          agenda={agenda}
          open={openConfigModal}
          onClose={handleCloseConfigModal}
        />
      )}
    </MainContainer>
  );
};

export default GoogleCalendarComponent;
