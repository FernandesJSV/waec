import React, { useEffect, useState, useContext } from "react";

import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import FormHelperText from "@material-ui/core/FormHelperText";

import useSettings from "../../hooks/useSettings";

import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "14px",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
}));

export default function Options(props) {
  const { settings, scheduleTypeChanged } = props;
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [userRating, setUserRating] = useState("disabled");
  const [scheduleType, setScheduleType] = useState("disabled");
  const [chatBotType, setChatBotType] = useState("text");

  const [loadingUserRating, setLoadingUserRating] = useState(false);
  const [loadingScheduleType, setLoadingScheduleType] = useState(false);

  const [UserCreation, setUserCreation] = useState("disabled");
  const [loadingUserCreation, setLoadingUserCreation] = useState(false);

  // recursos a mais
  const [CheckMsgIsGroup, setCheckMsgIsGroup] = useState("enabled");
  const [loadingCheckMsgIsGroup, setLoadingCheckMsgIsGroup] = useState(false);

  const [SendGreetingAccepted, setSendGreetingAccepted] = useState("enabled");
  const [loadingSendGreetingAccepted, setLoadingSendGreetingAccepted] = useState(false);

  const [UserRandom, setUserRandom] = useState("enabled");
  const [loadingUserRandom, setLoadingUserRandom] = useState(false);

  const [SettingsTransfTicket, setSettingsTransfTicket] = useState("enabled");
  const [loadingSettingsTransfTicket, setLoadingSettingsTransfTicket] = useState(false);

  const [AcceptCallWhatsapp, setAcceptCallWhatsapp] = useState("enabled");
  const [loadingAcceptCallWhatsapp, setLoadingAcceptCallWhatsapp] = useState(false);

  const [HoursCloseTicketsAuto, setHoursCloseTicketsAuto] = useState("enabled");
  const [loadingHoursCloseTicketsAuto, setLoadingHoursCloseTicketsAuto] = useState(false);

  const [sendSignMessage, setSendSignMessage] = useState("enabled");
  const [loadingSendSignMessage, setLoadingSendSignMessage] = useState(false);

  const [sendGreetingMessageOneQueues, setSendGreetingMessageOneQueues] = useState("enabled");
  const [loadingSendGreetingMessageOneQueues, setLoadingSendGreetingMessageOneQueues] = useState(false);

  const [sendQueuePosition, setSendQueuePosition] = useState("enabled");
  const [loadingSendQueuePosition, setLoadingSendQueuePosition] = useState(false);

  const [sendFarewellWaitingTicket, setSendFarewellWaitingTicket] = useState("enabled");
  const [loadingSendFarewellWaitingTicket, setLoadingSendFarewellWaitingTicket] = useState(false);

  const [acceptAudioMessageContact, setAcceptAudioMessageContact] = useState("enabled");
  const [loadingAcceptAudioMessageContact, setLoadingAcceptAudioMessageContact] = useState(false);

  const { update } = useSettings();

  const isSuper = () => {
    return user.super;
  };

  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {

      const userCreation = settings.find((s) => s.key === "userCreation");
      if (userCreation) {
        setUserRating(userCreation.value);
      }

      const userRating = settings.find((s) => s.key === "userRating");
      if (userRating) {
        setUserRating(userRating.value);
      }

      const scheduleType = settings.find((s) => s.key === "scheduleType");
      if (scheduleType) {
        setScheduleType(scheduleType.value);
      }

      const chatBotType = settings.find((s) => s.key === "chatBotType");
      if (chatBotType) {
        setChatBotType(chatBotType.value);
      }

      const CheckMsgIsGroup = settings.find((s) => s.key === "CheckMsgIsGroup");
      if (CheckMsgIsGroup) {
        setCheckMsgIsGroup(CheckMsgIsGroup.value);
      }

      const SendGreetingAccepted = settings.find((s) => s.key === "sendGreetingAccepted");
      if (SendGreetingAccepted) {
        setSendGreetingAccepted(SendGreetingAccepted.value);
      }

      const UserRandom = settings.find((s) => s.key === "userRandom");
      if (UserRandom) {
        setUserRandom(UserRandom.value);
      }

      const SettingsTransfTicket = settings.find((s) => s.key === "sendMsgTransfTicket");
      if (SettingsTransfTicket) {
        setSettingsTransfTicket(SettingsTransfTicket.value);
      }

      const AcceptCallWhatsapp = settings.find((s) => s.key === "acceptCallWhatsapp");
      if (AcceptCallWhatsapp) {
        setAcceptCallWhatsapp(AcceptCallWhatsapp.value);
      }

      const HoursCloseTicketsAuto = settings.find((s) => s.key === "hoursCloseTicketsAuto");
      if (HoursCloseTicketsAuto) {
        setHoursCloseTicketsAuto(HoursCloseTicketsAuto.value);
      }

      const sendSignMessage = settings.find((s) => s.key === "sendSignMessage");
      if (sendSignMessage) {
        setSendSignMessage(sendSignMessage.value)
      }

      const sendGreetingMessageOneQueues = settings.find((s) => s.key === "sendGreetingMessageOneQueues");
      if (sendGreetingMessageOneQueues) {
        setSendGreetingMessageOneQueues(sendGreetingMessageOneQueues.value)
      }

      const sendQueuePosition = settings.find((s) => s.key === "sendQueuePosition");
      if (sendQueuePosition) {
        setSendQueuePosition(sendQueuePosition.value)
      }

      const sendFarewellWaitingTicket = settings.find((s) => s.key === "sendFarewellWaitingTicket");
      if (sendFarewellWaitingTicket) {
        setSendFarewellWaitingTicket(sendFarewellWaitingTicket.value)
      }

      const acceptAudioMessageContact = settings.find((s) => s.key === "acceptAudioMessageContact");
      if (acceptAudioMessageContact) {
        setAcceptAudioMessageContact(acceptAudioMessageContact.value)
      }

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  async function handleChangeUserCreation(value) {
    setUserCreation(value);
    setLoadingUserCreation(true);
    await update({
      key: "userCreation",
      value,
    });
    setLoadingUserCreation(false);
  }

  async function handleChangeUserRating(value) {
    setUserRating(value);
    setLoadingUserRating(true);
    await update({
      key: "userRating",
      value,
    });
    setLoadingUserRating(false);
  }

  async function handleScheduleType(value) {
    setScheduleType(value);
    setLoadingScheduleType(true);
    await update({
      key: "scheduleType",
      value,
    });
    setLoadingScheduleType(false);
    if (typeof scheduleTypeChanged === "function") {
      scheduleTypeChanged(value);
    }
  }

  async function handleChatBotType(value) {
    setChatBotType(value);
    await update({
      key: "chatBotType",
      value,
    });
    if (typeof scheduleTypeChanged === "function") {
      setChatBotType(value);
    }
  }

  async function handleCheckMsgIsGroup(value) {
    setCheckMsgIsGroup(value);
    setLoadingCheckMsgIsGroup(true);
    await update({
      key: "CheckMsgIsGroup",
      value,
    });
    setLoadingCheckMsgIsGroup(false);
  }

  async function handleSendGreetingAccepted(value) {
    setSendGreetingAccepted(value);
    setLoadingSendGreetingAccepted(true);
    await update({
      key: "sendGreetingAccepted",
      value,
    });
    setLoadingSendGreetingAccepted(false);
  }

  async function handleUserRandom(value) {
    setUserRandom(value);
    setLoadingUserRandom(true);
    await update({
      key: "userRandom",
      value,
    });
    setLoadingUserRandom(false);
  }

  async function handleSettingsTransfTicket(value) {
    setSettingsTransfTicket(value);
    setLoadingSettingsTransfTicket(true);
    await update({
      key: "sendMsgTransfTicket",
      value,
    });
    setLoadingSettingsTransfTicket(false);
  }

  async function handleAcceptCallWhatsapp(value) {
    setAcceptCallWhatsapp(value);
    setLoadingAcceptCallWhatsapp(true);
    await update({
      key: "acceptCallWhatsapp",
      value,
    });
    setLoadingAcceptCallWhatsapp(false);
  }

  async function handleHoursCloseTicketsAuto(value) {
    setHoursCloseTicketsAuto(value);
    setLoadingHoursCloseTicketsAuto(true);
    await update({
      key: "hoursCloseTicketsAuto",
      value,
    });
    setLoadingHoursCloseTicketsAuto(false);
  }

  async function handleSendSignMessage(value) {
    setSendSignMessage(value);
    setLoadingSendSignMessage(true);
    await update({
      key: "sendSignMessage",
      value,
    });
    setLoadingSendSignMessage(false);
  }

  async function handleSendGreetingMessageOneQueues(value) {
    setSendGreetingMessageOneQueues(value);
    setLoadingSendGreetingMessageOneQueues(true);
    await update({
      key: "sendGreetingMessageOneQueues",
      value,
    });
    setLoadingSendGreetingMessageOneQueues(false);
  }

  async function handleSendQueuePosition(value) {
    setSendQueuePosition(value);
    setLoadingSendQueuePosition(true);
    await update({
      key: "sendQueuePosition",
      value,
    });
    setLoadingSendQueuePosition(false);
  }

  async function handleSendFarewellWaitingTicket(value) {
    setSendFarewellWaitingTicket(value);
    setLoadingSendFarewellWaitingTicket(true);
    await update({
      key: "sendFarewellWaitingTicket",
      value,
    });
    setLoadingSendFarewellWaitingTicket(false);
  }

  async function handleAcceptAudioMessageContact(value) {
    setAcceptAudioMessageContact(value);
    setLoadingAcceptAudioMessageContact(true);
    await update({
      key: "acceptAudioMessageContact",
      value,
    });
    setLoadingAcceptAudioMessageContact(false);
  }


  return (
    <>
      <Grid spacing={3} container>

        {/* CRIAÇÃO DE COMPANY/USERS */}
        {isSuper() ?
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={classes.selectContainer}>
              <InputLabel id="UserCreation-label">Criação de Company/Usuário</InputLabel>
              <Select
                labelId="UserCreation-label"
                value={UserCreation}
                onChange={async (e) => {
                  handleChangeUserCreation(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>Desabilitadas</MenuItem>
                <MenuItem value={"enabled"}>Habilitadas</MenuItem>
              </Select>
              <FormHelperText>
                {loadingUserCreation && "Atualizando..."}
              </FormHelperText>
            </FormControl>
          </Grid>
          : null}

        {/* AVALIAÇÕES */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="ratings-label">Avaliações</InputLabel>
            <Select
              labelId="ratings-label"
              value={userRating}
              onChange={async (e) => {
                handleChangeUserRating(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitadas</MenuItem>
              <MenuItem value={"enabled"}>Habilitadas</MenuItem>
            </Select>
            <FormHelperText>
              {loadingUserRating && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* AGENDAMENTO DE EXPEDIENTE */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="schedule-type-label">Agendamento de Expediente</InputLabel>
            <Select
              labelId="schedule-type-label"
              value={scheduleType}
              onChange={async (e) => {
                handleScheduleType(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"queue"}>Gerenciamento Por Fila</MenuItem>
              <MenuItem value={"company"}>Gerenciamento Por Empresa</MenuItem>
            </Select>
            <FormHelperText>
              {loadingScheduleType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* ENVIAR SAUDAÇÃO AO ACEITAR O TICKET */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendGreetingAccepted-label">Enviar saudação ao aceitar o ticket</InputLabel>
            <Select
              labelId="sendGreetingAccepted-label"
              value={SendGreetingAccepted}
              onChange={async (e) => {
                handleSendGreetingAccepted(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendGreetingAccepted && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* ESCOLHER OPERADOR ALEATORIO */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="userRandom-label">Escolher Operador Aleatório Ao Escolher Setor</InputLabel>
            <Select
              labelId="userRandom-label"
              value={UserRandom}
              onChange={async (e) => {
                handleUserRandom(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingUserRandom && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* ENVIAR MENSAGEM DE TRANSFERENCIA DE SETOR/ATENDENTE */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendMsgTransfTicket-label">Enviar mensaje de transferencia de Fila/agente</InputLabel>
            <Select
              labelId="sendMsgTransfTicket-label"
              value={SettingsTransfTicket}
              onChange={async (e) => {
                handleSettingsTransfTicket(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSettingsTransfTicket && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* IGNORAR MENSAGEM DE GRUPOS */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="CheckMsgIsGroup-label">Ignorar mensajes de grupo</InputLabel>
            <Select
              labelId="CheckMsgIsGroup-label"
              value={CheckMsgIsGroup}
              onChange={async (e) => {
                handleCheckMsgIsGroup(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingCheckMsgIsGroup && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* TIPO DO BOT */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="schedule-type-label">Tipo do Bot</InputLabel>
            <Select
              labelId="schedule-type-label"
              value={chatBotType}
              onChange={async (e) => {
                handleChatBotType(e.target.value);
              }}
            >
              <MenuItem value={"text"}>Texto</MenuItem>
              <MenuItem value={"button"}>Botões</MenuItem>
              <MenuItem value={"list"}>Lista</MenuItem>
            </Select>
            <FormHelperText>
              {loadingScheduleType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* AVISO SOBRE LIGAÇÃO DO WHATSAPP */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="acceptCallWhatsapp-label">Informar que não aceita ligação no whatsapp?</InputLabel>
            <Select
              labelId="acceptCallWhatsapp-label"
              value={AcceptCallWhatsapp}
              onChange={async (e) => {
                handleAcceptCallWhatsapp(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingAcceptCallWhatsapp && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* HABILITAR PARA O ATENDENTE RETIRAR O ASSINATURA */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendSignMessage-label">Permite atendente escolher ENVIAR Assinatura</InputLabel>
            <Select
              labelId="sendSignMessage-label"
              value={sendSignMessage}
              onChange={async (e) => {
                handleSendSignMessage(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendSignMessage && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* ENVIAR SAUDAÇÃO QUANDO HOUVER SOMENTE 1 FILA */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendGreetingMessageOneQueues-label">Enviar saudação quando houver somente 1 fila</InputLabel>
            <Select
              labelId="sendGreetingMessageOneQueues-label"
              value={sendGreetingMessageOneQueues}
              onChange={async (e) => {
                handleSendGreetingMessageOneQueues(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendGreetingMessageOneQueues && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* ENVIAR MENSAGEM COM A POSIÇÃO DA FILA */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendQueuePosition-label">Enviar mensaje con posición en la fila</InputLabel>
            <Select
              labelId="sendQueuePosition-label"
              value={sendQueuePosition}
              onChange={async (e) => {
                handleSendQueuePosition(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendQueuePosition && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* ENVIAR MENSAGEM DE DESPEDIDA NO AGUARDANDO */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendFarewellWaitingTicket-label">Enviar mensaje de despedida en En espera</InputLabel>
            <Select
              labelId="sendFarewellWaitingTicket-label"
              value={sendFarewellWaitingTicket}
              onChange={async (e) => {
                handleSendFarewellWaitingTicket(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendFarewellWaitingTicket && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="acceptAudioMessageContact-label">Aceita receber audio de todos contatos?</InputLabel>
            <Select
              labelId="acceptAudioMessageContact-label"
              value={acceptAudioMessageContact}
              onChange={async (e) => {
                handleAcceptAudioMessageContact(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingAcceptAudioMessageContact && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Horas para fechar ticket automaticamente */}
        {/* <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="HoursCloseTicketsAuto-type-label">
              Fechar tickets automaticamente após
            </InputLabel>
            <Select
              labelId="HoursCloseTicketsAuto-type-label"
              value={HoursCloseTicketsAuto}
              onChange={async (e) => {
                handleHoursCloseTicketsAuto(e.target.value);
              }}
            >
              <MenuItem value={1}>1 Hora</MenuItem>
              <MenuItem value={2}>2 Horas</MenuItem>
              <MenuItem value={6}>6 Horas</MenuItem>
              <MenuItem value={12}>12 Horas</MenuItem>
              <MenuItem value={24}>24 Horas</MenuItem>
              <MenuItem value={36}>36 Horas</MenuItem>
              <MenuItem value={48}>48 Horas</MenuItem>
              <MenuItem value={9999999999}>Nunca</MenuItem>
            </Select>
            <FormHelperText>
              {loadingHoursCloseTicketsAuto && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid> */}

      </Grid>
    </>
  );
}
