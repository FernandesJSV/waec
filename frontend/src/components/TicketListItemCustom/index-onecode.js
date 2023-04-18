import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";
import { v4 as uuidv4 } from "uuid";

import { TicketsContext } from "../../context/Tickets/TicketsContext";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

import contrastColor from "../../helpers/contrastColor";
// import { toggleFixedTicket } from "../../helpers/userOptions";
import ContactTag from "../ContactTag";

const useStyles = makeStyles(theme => ({
    ticket: {
        position: "relative",
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
    },

    closedBadge: {
        alignSelf: "center",
        justifySelf: "flex-end",
        marginRight: 32,
        marginLeft: "auto",
    },

    contactLastMessage: {
        paddingRight: 20,
    },

    newMessagesCount: {
        position: "absolute",
        alignSelf: "center",
        marginRight: 8,
        marginLeft: "auto",
        marginTop: "-15px",
        left: "15px",
        borderRadius: 0,
    },

    fixItem: {
        position: "absolute",
        alignSelf: "center",
        marginRight: "auto",
        marginLeft: 8,
        marginTop: 0,
        right: "15px",
        borderRadius: 0,
    },

    badgeStyle: {
        color: "white",
        backgroundColor: green[500],
    },

    acceptButton: {
        position: "absolute",
        left: "50%",
    },

    ticketQueueColor: {
        flex: "none",
        width: "8px",
        height: "100%",
        position: "absolute",
        top: "0%",
        left: "0%",
    },
    ticketRightBottomBlock: {
        bottom: 5,
        display: "flex"
    },
    userTag: {
        background: "#FCFCFC",
        color: "#999",
        border: "1px solid #CCC",
        marginRight: 5,
        padding: 1,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 3,
        fontSize: "0.8em",
        whiteSpace: "nowrap"
    },
    queueTag: {
        background: "#FCFCFC",
        color: "#000",
        marginRight: 5,
        padding: 1,
        fontWeight: 'bold',
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 3,
        fontSize: "0.8em",
        whiteSpace: "nowrap"
    },
    connectionTag: {
        background: "green",
        color: "#FFF",
        marginRight: 5,
        padding: 1,
        fontWeight: 'bold',
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 3,
        fontSize: "0.8em",
        whiteSpace: "nowrap"
    },
    ticketRateEmoji: {
        marginRight: 10
    },
    whatsappName: {
        color: "#AAA"
    },
    secondaryContentWrapper: {
        minHeight: "45px",
        display: 'block'
    },
    secondaryContentFirst: {

    },
    secondaryContentSecond: {
        display: 'flex',
        // marginTop: 5,
        alignItems: "flex-start",
        flexWrap: "wrap",
        flexDirection: "row",
        alignContent: "flex-start",
    },
    cardBottom: {
        overflow: 'hidden'
    }
}));

const TicketListItem = ({ ticket, showWhatsappConnection, fixedTickets }) => {
    const classes = useStyles();
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const { ticketId } = useParams();
    const isMounted = useRef(true);
    const [ticketUser, setTicketUser] = useState(null);
    const [whatsAppName, setWhatsAppName] = useState(null);
    const [queueName, setQueueName] = useState(null);
    // const [tagsId, setTagsId] = useState([])
    const { user } = useContext(AuthContext);
    const { setCurrentTicket } = useContext(TicketsContext);

    let tags = [];
    useEffect(() => {
        if (ticket.userId && ticket.user) {
            setTicketUser(ticket.user.name);
        }
        if (ticket.queue.name) {
            setQueueName(ticket.queue.name);
        }

        if (ticket.whatsappId && ticket.whatsapp) {
            setWhatsAppName(ticket.whatsapp.name);
        }

        if (ticket.tags) {
            ticket.tags.forEach(async (tag) => {
                tags.push(tag);
            });
        }

        console.log('tags', tags)

        return () => {
            isMounted.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAcepptTicket = async id => {
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
        console.log('ticket', ticket)
        history.push(`/tickets/${ticket.uuid}`)
    };

    const handleSendMessage = async (id) => {
        const msg = `{{ms}} *{{name}}*, mi nombre es *${user?.name}* y dare seguimiento seguimiento a tu conversación.`;
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

    const handleSelectTicket = () => {
        history.push(`/tickets/${ticket.uuid}`);
    };

    const renderTicketRate = ticket => {
        const map = {
            '5': '🥰',
            '4': '😀',
            '3': '😐',
            '2': '😤',
            '1': '😡'
        }
        return (
            <span>{ticket.rate ? map[ticket.rate] : ''}</span>
        )
    }

    const canShowTicketRate = () => {
        return user.profile === 'admin';
    }

    return (
        <React.Fragment key={ticket.id}>
            <ListItem
                dense
                button
                onClick={e => {
                    //if (ticket.status === "pending") return;
                    handleSelectTicket(ticket.id);
                }}
                selected={ticketId && +ticketId === ticket.id}
                className={clsx(classes.ticket, {
                    [classes.pendingTicket]: ticket.status === "pending",
                })}
            >
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
                    className={classes.cardBottom}
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
                            {ticket.status === "closed" && (
                                <Badge
                                    className={classes.closedBadge}
                                    style={{ right: '10px' }}
                                    badgeContent={"RESOLVIDO"}
                                    color="primary"
                                />
                            )}
                            {ticket.lastMessage && (
                                <Typography
                                    className={classes.lastMessageTime}
                                    component="span"
                                    variant="body2"
                                    color="textSecondary"
                                >
                                    {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                                        <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                                    ) : (
                                        <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy HH:mm")}</>
                                    )}
                                </Typography>
                            )}
                        </span>
                    }
                    secondary={
                        <span className={classes.secondaryContentWrapper}>
                            <span className={classes.secondaryContentFirst}>
                                <Badge
                                    className={classes.newMessagesCount}
                                    badgeContent={ticket.unreadMessages}
                                    classes={{
                                        badge: classes.badgeStyle,
                                    }}
                                />
                                {/* {ticket.status === 'group' &&
                                    <div onClick={() => { fixTicket(ticket) }} style={{ color: fixedTickets && fixedTickets.indexOf(ticket.id) > -1 ? '#000' : '#CCC' }} className={classes.fixItem}>
                                        <FontAwesomeIcon icon={faThumbTack} />
                                    </div>
                                } */}
                                <Typography
                                    className={classes.contactLastMessage}
                                    noWrap
                                    component="span"
                                    variant="body2"
                                    color="textSecondary"
                                >
                                    {ticket.lastMessage ? (
                                        <MarkdownWrapper>{ticket.lastMessage.indexOf('[') === 0 ? i18n.t(`messages.${ticket.lastMessage}`) : ticket.lastMessage}</MarkdownWrapper>
                                    ) : (
                                        <br />
                                    )}
                                </Typography>
                            </span>
                            <span className={classes.secondaryContentSecond} >
                                <div className={classes.connectionTag}>{whatsAppName}</div>
                                {/* {canShowTicketRate() && ticket.rate && (<div className={classes.ticketRateEmoji}>{renderTicketRate(ticket)}</div>)} */}
                                <div style={{ backgroundColor: ticket.queue.color, color: contrastColor(ticket.queue.color) }} className={classes.queueTag}>{queueName}</div>
                                <div className={classes.userTag}>{ticketUser}</div>
                                {/* {ticket.tags && ticket.tags.map((tag) => {
                                    return (
                                        <ContactTag tag={tag} key={`ticket-contact-tag-${ticket.id}-${tag.id}`} />
                                    );
                                })} */}
                            </span>
                            {/* <span className={classes.secondaryContentSecond} >
                                {canShowTicketRate() && ticket.rate && (<div className={classes.ticketRateEmoji}>{renderTicketRate(ticket)}</div>)}
                                {showWhatsappConnection && ticket.whatsapp && (<div className={classes.connectionTag}>{ticket.whatsapp.name}</div>)}
                                {ticket.queue && (<div style={{ backgroundColor: ticket.queue.color, color: contrastColor(ticket.queue.color) }} className={classes.queueTag}>{ticket.queue.name}</div>)}
                                {ticket.user && (
                                    <div className={classes.userTag}>{ticket.user.name}</div>
                                )}
                                {ticket.tags && ticket.tags.map((tag) => {
                                    return (
                                        <ContactTag tag={tag} key={`ticket-contact-tag-${ticket.id}-${tag.id}`} />
                                    );
                                })}
                            </span> */}
                        </span>
                    }
                />
                {ticket.status === "pending" && (
                    <ButtonWithSpinner
                        //color="primary"
                        style={{ backgroundColor: 'green', color: 'white', padding: '0px', bottom: '0px', borderRadius: '0px', left: '8px', fontSize: '0.6rem' }}
                        variant="contained"
                        className={classes.acceptButton}
                        size="small"
                        loading={loading}
                        onClick={e => handleAcepptTicket(ticket.id)}
                    >
                        {i18n.t("ticketsList.buttons.accept")}
                    </ButtonWithSpinner>

                )}
            </ListItem>
            <Divider variant="inset" component="li" />
        </React.Fragment>
    );
};

export default TicketListItem;
