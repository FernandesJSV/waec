import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import { green, grey, red, blue } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import Box from "@material-ui/core/Box";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import toastError from "../../errors/toastError";
import { v4 as uuidv4 } from "uuid";

import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import InstagramIcon from "@material-ui/icons/Instagram";
import FacebookIcon from "@material-ui/icons/Facebook";

import AndroidIcon from "@material-ui/icons/Android";
import VisibilityIcon from "@material-ui/icons/Visibility";
import TicketMessagesDialog from "../TicketMessagesDialog";
import DoneIcon from '@material-ui/icons/Done';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
    height: "75px",
  },

  pendingTicket: {
    cursor: "unset",
  },

  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  contactNameWrapper: {
    display: "flex",
    justifyContent: "space-between",
  },

  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: -13
  },

  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 32,
    marginLeft: "auto",
  },

  contactLastMessage: {
    paddingRight: "50%",
  },

  newMessagesCount: {
    alignSelf: "center",
    marginRight: 0,
    marginLeft: "auto",
    top: -13
  },

  badgeStyle: {
    color: "white",
    backgroundColor: green[500],
    right: 20,
  },

  acceptButton: {
    position: "absolute",
    right: "108px",
  },

  ticketQueueColor: {
    flex: "none",
    width: "8px",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
  },

  ticketInfo: {
    position: "relative",
    top: -13
  },

  ticketInfo1: {
    position: "relative",
    top: 20,
    // right: "-10px",
    // left: "-50px",
  },

  Radiusdot: {
    "& .MuiBadge-badge": {
      borderRadius: 3,
      position: "inherit",
      height: 16,
      margin: 2,
      padding: 3
    },
    "& .MuiBadge-anchorOriginTopRightRectangle": {
      transform: "scale(1) translate(0%, -40%)",
    },
  },
}));

const TicketListItemCustom = ({ ticket }) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [ticketUser, setTicketUser] = useState(null);
  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { setCurrentTicket } = useContext(TicketsContext);
  const { user } = useContext(AuthContext);
  const { profile } = user;

  useEffect(() => {
    if (ticket.userId && ticket.user) {
      setTicketUser(ticket.user.name);
    }

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });

      let settingIndex;

      try {
        const { data } = await api.get("/settings/sendGreetingAccepted");
        settingIndex = data;
      } catch (err) {
        toastError(err);
      }

      if (settingIndex.value === "enabled") {
        handleSendMessage(id);
      }

    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/${ticket.uuid}`);
  };

  const handleCloseTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "closed",
        userId: user?.id,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/`);
  };

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const handleSendMessage = async (id) => {
    const msg = `{{ms}} *{{name}}*, mi nombre es  *${user?.name}* y dare seguimiento a su conversacón.`;
    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: `*Asistente virtual:*\n${msg.trim()}`,
    };
    try {
      await api.post(`/messages/${id}`, message);
    } catch (err) {
      toastError(err);
    }
  };

  const renderTicketInfo = () => {
    return (
      <>
        {ticketUser && (
          <Badge
            className={classes.Radiusdot}
            badgeContent={`${ticketUser}`}
            style={{
              backgroundColor: "#00a884",
              color: "white",
              height: 16,
              padding: 4,
              position: "inherit",
              borderRadius: 2,
              marginLeft: "2px"
              // top: -6
            }}
          />
        )}
        {ticket.queue?.name !== null && (
          <Badge
            className={classes.Radiusdot}
            style={{
              backgroundColor: ticket.queue?.color || "#7C7C7C",
              height: 16,
              padding: 4,
              position: "inherit",
              borderRadius: 2,
              color: "white",
              marginLeft: "2px"
              // top: -6
            }}
            badgeContent={ticket.queue?.name || "Sin Sector"}
          //color="primary"
          />
        )}
        {ticket.whatsapp?.name !== null && (
          <Badge
            className={classes.Radiusdot}
            style={{
              backgroundColor: "#002060",
              height: 16,
              padding: 4,
              position: "inherit",
              borderRadius: 2,
              color: "white",
              marginLeft: "2px"
              // top: -6
            }}
            badgeContent={ticket.whatsapp?.name}
          //color="primary"
          />
        )}

        {ticket.status === "pending" && (
          <Tooltip title="Fechar Conversa">
            <ClearOutlinedIcon
              onClick={() => handleCloseTicket(ticket.id)}
              fontSize="small"
              style={{
                color: red[700],
                cursor: "pointer",
                marginRight: 9,
              }}
            />
          </Tooltip>
        )}
        {ticket.status === "pending" && (
          <Tooltip title="Aceitar Conversa">
            <DoneIcon
              onClick={() => handleAcepptTicket(ticket.id)}
              fontSize="small"
              style={{
                color: green[700],
                cursor: "pointer",
                marginRight: 9,
              }}
            />
          </Tooltip>
        )}
        {ticket.status === "open" && (
          <Tooltip title="Fechar Conversa">
            <ClearOutlinedIcon
              onClick={() => handleCloseTicket(ticket.id)}
              fontSize="small"
              style={{
                color: red[700],
                cursor: "pointer",
                marginRight: 9,
              }}
            />
          </Tooltip>
        )}
        {profile === "admin" && ticket.status === "pending" && (
          <Tooltip title="Espiar Conversa">
            <VisibilityIcon
              onClick={() => setOpenTicketMessageDialog(true)}
              fontSize="small"
              style={{
                color: grey[700],
                cursor: "pointer",
                marginRight: 9,
              }}
            />
          </Tooltip>
        )}
        {ticket.isBot && (
          <Tooltip title="Chatbot">
            <AndroidIcon
              fontSize="small"
              style={{ color: grey[700], marginRight: 9 }}
            />
          </Tooltip>
        )}
        {ticket.channel === "whatsapp" && (
          <Tooltip title={`Asignado a${ticketUser}`}>
            <WhatsAppIcon fontSize="small" style={{ color: grey[700] }} />
          </Tooltip>
        )}
        {ticket.channel === "instagram" && (
          <Tooltip title={`Asignado a${ticketUser}`}>
            <InstagramIcon fontSize="small" style={{ color: grey[700] }} />
          </Tooltip>
        )}
        {ticket.channel === "facebook" && (
          <Tooltip title={`Asignado a${ticketUser}`}>
            <FacebookIcon fontSize="small" style={{ color: grey[700] }} />
          </Tooltip>
        )}


      </>
    );
  }
  //   } else {
  //     return (
  //       <>
  //         {ticket.queue?.name !== null && (
  //           <Badge
  //             className={classes.Radiusdot}
  //             style={{
  //               backgroundColor: ticket.queue?.color || "#7C7C7C",
  //               height: 16,
  //               padding: 4,
  //               position: "inherit",
  //               borderRadius: 2,
  //               color: "white",
  //               top: -6
  //             }}
  //             badgeContent={ticket.queue?.name || "Sem fila"}
  //           />
  //         )}
  //         {ticket.status === "pending" && (
  //           <Tooltip title="Fechar Conversa">
  //             <ClearOutlinedIcon
  //               onClick={() => handleCloseTicket(ticket.id)}
  //               fontSize="small"
  //               style={{
  //                 color: red[700],
  //                 cursor: "pointer",
  //                 marginRight: 5,
  //               }}
  //             />
  //           </Tooltip>
  //         )}
  //         {ticket.isBot && (
  //           <Tooltip title="Chatbot">
  //             <AndroidIcon
  //               fontSize="small"
  //               style={{ color: grey[700], marginRight: 5 }}
  //             />
  //           </Tooltip>
  //         )}
  //         {profile === "admin" && (
  //           <Tooltip title="Espiar Conversa">
  //             <VisibilityIcon
  //               onClick={() => setOpenTicketMessageDialog(true)}
  //               fontSize="small"
  //               style={{
  //                 color: grey[700],
  //                 cursor: "pointer",
  //                 marginRight: 5,
  //               }}
  //             />
  //           </Tooltip>
  //         )}
  //         {ticket.status === "pending" && (
  //           <Tooltip title="Aceitar Conversa">
  //             <DoneIcon
  //               onClick={() => handleAcepptTicket(ticket.id)}
  //               fontSize="small"
  //               style={{
  //                 color: green[700],
  //                 cursor: "pointer",
  //                 marginRight: 5,
  //               }}
  //             />
  //           </Tooltip>
  //         )}
  //       </>
  //     );
  //   }
  // };

  return (
    <React.Fragment key={ticket.id}>
      <TicketMessagesDialog
        open={openTicketMessageDialog}
        handleClose={() => setOpenTicketMessageDialog(false)}
        ticketId={ticket.id}
      ></TicketMessagesDialog>
      <ListItem
        dense
        button
        onClick={(e) => {
          if (ticket.status === "pending") return;
          handleSelectTicket(ticket);
        }}
        selected={ticketId && +ticketId === ticket.id}
        className={clsx(classes.ticket, {
          [classes.pendingTicket]: ticket.status === "pending",
        })}
      >
        {/* <Tooltip
          arrow
          placement="right"
          title={ticket.queue?.name || "SEM FILA"}
        >
          <span
            style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }}
            className={classes.ticketQueueColor}
          ></span>
        </Tooltip> */}
        <ListItemAvatar>
          <Avatar
            style={{
              marginTop: "-20px",
              marginLeft: "0px",
              width: "45px",
              height: "45px",
              borderRadius: "20%",
            }}
            src={ticket?.contact?.profilePicUrl}
          />
        </ListItemAvatar>
        <ListItemText
          style={{ marginTop: "-18px" }}
          disableTypography
          primary={
            <span className={classes.contactNameWrapper}>
              <Typography
                noWrap
                component="span"
                variant="body2"
                color="textPrimary"
              >
                {ticket.contact.name}
              </Typography>
              <ListItemSecondaryAction>
                <Box className={classes.ticketInfo1}>{renderTicketInfo()}</Box>
              </ListItemSecondaryAction>
            </span>
          }
          secondary={
            <span className={classes.contactNameWrapper}>
              <Typography
                className={classes.contactLastMessage}
                noWrap
                component="span"
                variant="body2"
                color="textSecondary"
              >
                {ticket.lastMessage ? (
                  <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
                ) : (
                  <br />
                )}
              </Typography>

              {/* <Badge
                className={classes.newMessagesCount}
                badgeContent={ticket.unreadMessages}
                classes={{
                  badge: classes.badgeStyle,
                }}
              /> */}
            </span>
          }
        />

        {/* {ticket.status === "pending" && (
          <ButtonWithSpinner
            color="primary"
            variant="contained"
            className={classes.acceptButton}
            size="small"
            loading={loading}
            onClick={(e) => handleAcepptTicket(ticket.id)}
          >
            {i18n.t("ticketsList.buttons.accept")}
          </ButtonWithSpinner>
        )} */}

        <ListItemSecondaryAction>
          {ticket.status === "closed" && (
            <Badge
              className={classes.Radiusdot}
              badgeContent={"FECHADO"}
              //color="primary"
              style={{
                marginRight: 5,
                backgroundColor: ticket.queue?.color || "#ff0000",
                height: 16,
                padding: 4,
                borderRadius: 2,
                color: "white",
                top: -13
              }}
            />
          )}
          {ticket.lastMessage && (
            <>
              <Badge
                className={classes.newMessagesCount}
                badgeContent={ticket.unreadMessages}
                classes={{
                  badge: classes.badgeStyle,
                }}
              />
              <Typography
                className={classes.lastMessageTime}
                component="span"
                variant="body2"
                color="textSecondary"
              >
                {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                  <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                ) : (
                  <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                )}
              </Typography>
              <br />

            </>
          )}
        </ListItemSecondaryAction>

      </ListItem>
      <Divider variant="inset" component="li" />
    </React.Fragment>
  );
};

export default TicketListItemCustom;
