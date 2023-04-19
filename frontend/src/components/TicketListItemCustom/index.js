import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
// import { green, grey, red, blue } from "@material-ui/core/colors";
import { green, grey, blue } from "@material-ui/core/colors";
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

import GroupIcon from '@material-ui/icons/Group';
// import WhatsAppIcon from "@material-ui/icons/WhatsApp";
// import InstagramIcon from "@material-ui/icons/Instagram";
// import FacebookIcon from "@material-ui/icons/Facebook";

import AndroidIcon from "@material-ui/icons/Android";
import VisibilityIcon from "@material-ui/icons/Visibility";
import TicketMessagesDialog from "../TicketMessagesDialog";
import ContactTag from "../ContactTag";
import ConnectionIcon from "../ConnectionIcon";
// import contrastColor from "../../helpers/contrastColor";

const useStyles = makeStyles((theme) => ({
    ticket: {
        position: "relative",
    },

    pendingTicket: {
        cursor: "unset",
    },
    queueTag: {
        background: "#FCFCFC",
        color: "#000",
        marginRight: 1,
        padding: 1,
        fontWeight: 'bold',
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 3,
        fontSize: "0.8em",
        whiteSpace: "nowrap"
    },
    noTicketsDiv: {
        display: "flex",
        height: "100px",
        margin: 40,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    newMessagesCount: {
        position: "absolute",
        alignSelf: "center",
        marginRight: 8,
        marginLeft: "auto",
        top: "10px",
        left: "20px",
        borderRadius: 0,
    },
    noTicketsText: {
        textAlign: "center",
        color: "rgb(104, 121, 146)",
        fontSize: "14px",
        lineHeight: "1.4",
    },
    connectionTag: {
        background: "green",
        color: "#FFF",
        marginRight: 1,
        padding: 1,
        fontWeight: 'bold',
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 3,
        fontSize: "0.8em",
        whiteSpace: "nowrap"
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
        marginLeft: "5px",
    },

  lastMessageTime: {
    position: "absolute",
    marginRight: 20,
    right: -15,
    bottom: 15,
    background: "#9200bf",
    color: "#ffffff",
    border: "1px solid #3a3b6c",
    padding: 1,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 10,
    fontSize: "0.9em"
  },

    closedBadge: {
        alignSelf: "center",
        justifySelf: "flex-end",
        marginRight: 32,
        marginLeft: "auto",
    },

    contactLastMessage: {
        paddingRight: "0%",
        marginLeft: "5px",
    },


    badgeStyle: {
        color: "white",
        backgroundColor: green[500],
    },

    // acceptButton: {
    //     position: "absolute",
    //     right: "108px",
    // },


    acceptButton: {
        position: "absolute",
        left: "75%",
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
    secondaryContentSecond: {
        display: 'flex',
        // marginTop: 2,
        //marginLeft: "5px",
        alignItems: "flex-start",
        flexWrap: "wrap",
        flexDirection: "row",
        alignContent: "flex-start",
    },
    ticketInfo1: {
        position: "relative",
        top: 13,
        right: 0
    },
    Radiusdot: {
        "& .MuiBadge-badge": {
            borderRadius: 2,
            position: "inherit",
            height: 16,
            margin: 2,
            padding: 3
        },
        "& .MuiBadge-anchorOriginTopRightRectangle": {
            transform: "scale(1) translate(0%, -40%)",
        },

    },
    connectionIcon: {
        marginRight: theme.spacing(1)
    }
}));

const TicketListItemCustom = ({ handleChangeTab, ticket }) => {
    const classes = useStyles();
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [ticketUser, setTicketUser] = useState(null);
    const [ticketQueueName, setTicketQueueName] = useState(null);
    const [ticketQueueColor, setTicketQueueColor] = useState(null);
    const [tag, setTag] = useState([]);
    const [whatsAppName, setWhatsAppName] = useState(null);

    const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
    const { ticketId } = useParams();
    const isMounted = useRef(true);
    const { setCurrentTicket } = useContext(TicketsContext);
    const { user } = useContext(AuthContext);
    const { profile } = user;

    useEffect(() => {
        async function fetchData() {
            if (ticket.userId && ticket.user) {
                setTicketUser(ticket.user?.name.toUpperCase());
            }
            setTicketQueueName(ticket.queue?.name.toUpperCase());
            setTicketQueueColor(ticket.queue?.color);

            return () => {
                isMounted.current = false;
            };
        }
        fetchData();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const fetchTicket = async () => {
                try {
                    const { data } = await api.get("/tickets/" + ticket.id);

                    if (data.whatsappId && data.whatsapp) {
                        setWhatsAppName(data.whatsapp.name.toUpperCase());
                    }

                    setTag(data?.tags);

                } catch (err) {
                }
            };
            fetchTicket();
        }, 500);
        return () => {
            if (delayDebounceFn !== null) {
                clearTimeout(delayDebounceFn);
            }
        };
    }, [ticketId, user, history]);

    const handleCloseTicket = async (id) => {
        setLoading(true);
        try {
            await api.put(`/tickets/${id}`, {
                status: "closed",
                userId: user?.id || null,
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

    const handleReopenTicket = async (id) => {
        setLoading(true);
        try {
            await api.put(`/tickets/${id}`, {
                status: "open",
                userId: user?.id,
                queueId: ticket?.queue?.id
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

    const handleAcepptTicket = async (id) => {
        setLoading(true);
        try {
            await api.put(`/tickets/${id}`, {
                status: "open",
                userId: user?.id,
            });

            let settingIndex;

            try {
                const { data } = await api.get("/settings/");
                settingIndex = data.filter((s) => s.key === "sendGreetingAccepted");
            } catch (err) {
                toastError(err);
            }

            if (settingIndex[0].value === "enabled" && !ticket.isGroup) {
                handleSendMessage(ticket.id);
            }

        } catch (err) {
            setLoading(false);
            toastError(err);
        }
        if (isMounted.current) {
            setLoading(false);
        }

        // handleChangeTab(null, "tickets");
        handleChangeTab(null, "open");
        history.push(`/tickets/${ticket.uuid}`);
    };

    const handleSendMessage = async (id) => {
        const msg = `{{ms}} *{{name}}*, mi nombre es *${user?.name}* y dare seguimiento a su conversación.`;
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


    const handleSelectTicket = (ticket) => {
        const code = uuidv4();
        const { id, uuid } = ticket;
        setCurrentTicket({ id, uuid, code });
    };

    const renderTicketInfo = () => {
        if (ticketUser) {
            return (
                <>
                    {ticket.chatbot && (
                        <Tooltip title="Chatbot">
                            <AndroidIcon
                                fontSize="small"
                                style={{ color: grey[700], marginRight: 5 }}
                            />
                        </Tooltip>
                    )}

                    {/* </span> */}
                </>
            );
        } else {
            return (
                <>
                    {ticket.chatbot && (
                        <Tooltip title="Chatbot">
                            <AndroidIcon
                                fontSize="small"
                                style={{ color: grey[700], marginRight: 5 }}
                            />
                        </Tooltip>
                    )}
                </>
            );
        }
    };

    return (
        <React.Fragment key={ticket.id}>
            <TicketMessagesDialog
                open={openTicketMessageDialog}
                handleClose={() => setOpenTicketMessageDialog(false)}
                ticketId={ticket.id}
            ></TicketMessagesDialog>
            <ListItem dense button
                onClick={(e) => {
                    if (ticket.status === "pending") return;
                    handleSelectTicket(ticket);
                }}
                selected={ticketId && +ticketId === ticket.id}
                className={clsx(classes.ticket, {
                    [classes.pendingTicket]: ticket.status === "pending",
                })}
            >
                <Tooltip arrow placement="right" title={ticket.queue?.name.toUpperCase() || "SEM FILA"} >
                    <span style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }} className={classes.ticketQueueColor}></span>
                </Tooltip>
                <ListItemAvatar>
                    {ticket.status !== "pending" ?
                        <Avatar
                            style={{
                                marginTop: "-20px",
                                marginLeft: "-3px",
                                width: "55px",
                                height: "55px",
                                borderRadius: "10%",
                            }}
                            src={ticket?.contact?.profilePicUrl}
                        />
                        :
                        <Avatar
                            style={{
                                marginTop: "-28px",
                                marginLeft: "0px",
                                width: "50px",
                                height: "50px",
                                borderRadius: "10%",
                            }}
                            src={ticket?.contact?.profilePicUrl}
                        />
                    }
                </ListItemAvatar>
                <ListItemText
                    disableTypography
                    primary={
                        <span className={classes.contactNameWrapper}>
                            <Typography
                                noWrap
                                component="span"
                                variant="body2"
                                color="textPrimary"
                            >
                                {ticket.isGroup && ticket.channel === "whatsapp" && <GroupIcon fontSize="small" style={{ color: grey[700], marginBottom: '-5px', marginLeft: '5px' }} />} &nbsp;
                                {ticket.channel && <ConnectionIcon width="20" height="20" className={classes.connectionIcon} connectionType={ticket.channel} />} &nbsp;
                                {ticket.contact.name}
                                {profile === "admin" && ticket.status === "pending" && (
                                    <Tooltip title="Espiar Conversa">
                                        <VisibilityIcon
                                            onClick={() => setOpenTicketMessageDialog(true)}
                                            fontSize="small"
                                            style={{
                                                color: blue[700],
                                                cursor: "pointer",
                                                marginLeft: 10,
                                                verticalAlign: "middle"
                                            }}
                                        />
                                    </Tooltip>
                                )}
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
                            // style={console.log('ticket.lastMessage', ticket.lastMessage)}
                            >
                                <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
                                {/* {ticket.lastMessage ? (
                                    <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
                                ) : (
                                    <br />
                                )} */}
                                <span className={classes.secondaryContentSecond} >
                                    {whatsAppName ? <Badge className={classes.connectionTag}>{whatsAppName}</Badge> : <br></br>}
                                    {ticketUser ? <Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>{ticketUser}</Badge> : <br></br>}
                                    <Badge style={{ backgroundColor: ticket.queue?.color || "#7c7c7c" }} className={classes.connectionTag}>{ticket.queue?.name.toUpperCase() || "SEM FILA"}</Badge>
                                </span>
                                <span className={classes.secondaryContentSecond} >
                                    {
                                        tag?.map((tag) => {
                                            return (
                                                <ContactTag tag={tag} key={`ticket-contact-tag-${ticket.id}-${tag.id}`} />
                                            );
                                        })
                                    }
                                </span>
                            </Typography>

                            <Badge
                                className={classes.newMessagesCount}
                                badgeContent={ticket.unreadMessages}
                                classes={{
                                    badge: classes.badgeStyle,
                                }}
                            />
                        </span>
                    }

                />
                <ListItemSecondaryAction>
                    {ticket.lastMessage && (
                        <>

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
                <span className={classes.secondaryContentSecond} >
                    {ticket.status === "pending" && (
                        <ButtonWithSpinner
                            //color="primary"
                            style={{ backgroundColor: 'green', color: 'white', padding: '0px', bottom: '5px', borderRadius: '6px', rigth: '8px', fontSize: '0.8rem', bottom: '35px' }}
                            variant="contained"
                            className={classes.acceptButton}
                            size="small"
                            loading={loading}
                            onClick={e => handleAcepptTicket(ticket.id, handleChangeTab)}
                        >
                            {i18n.t("ticketsList.buttons.accept")}
                        </ButtonWithSpinner>

                    )}
                    {(ticket.status !== "closed") && (
                        <ButtonWithSpinner
                            //color="primary"
                            style={{ backgroundColor: 'red', color: 'white', padding: '0px', bottom: '5px', borderRadius: '6px', rigth: '8px', fontSize: '0.8rem', bottom: '5px' }}
                            variant="contained"
                            className={classes.acceptButton}
                            size="small"
                            loading={loading}
                            onClick={e => handleCloseTicket(ticket.id)}
                        >
                            {i18n.t("ticketsList.buttons.closed")}
                        </ButtonWithSpinner>

                    )}
                    {(ticket.status === "closed") && (
                        <ButtonWithSpinner
                            //color="primary"
                            style={{ backgroundColor: 'red', color: 'white', padding: '0px', bottom: '5px', borderRadius: '6px', rigth: '8px', fontSize: '0.8rem', bottom: '5px' }}
                            variant="contained"
                            className={classes.acceptButton}
                            size="small"
                            loading={loading}
                            onClick={e => handleReopenTicket(ticket.id)}
                        >
                            {i18n.t("ticketsList.buttons.reopen")}
                        </ButtonWithSpinner>

                    )}
                </span>
            </ListItem>

            <Divider variant="inset" component="li" />
        </React.Fragment>
    );
};

export default TicketListItemCustom;