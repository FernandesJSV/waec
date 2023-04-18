import React, { useState, useEffect, useReducer, useContext } from "react";
import { socketConnection } from "../../services/socket";

import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";

import TicketListItem from "../TicketListItem";
import TicketsListSkeleton from "../TicketsListSkeleton";

import useTickets from "../../hooks/useTickets";
import useSettings from "../../hooks/useSettings";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
    ticketsListWrapper: {
        position: "relative",
        display: "flex",
        height: "100%",
        flexDirection: "column",
        overflow: "hidden",
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },

    ticketsList: {
        flex: 1,
        overflowY: "scroll",
        ...theme.scrollbarStyles,
        borderTop: "2px solid rgba(0, 0, 0, 0.12)",
    },

    ticketsListHeader: {
        color: "rgb(67, 83, 105)",
        zIndex: 2,
        backgroundColor: theme.palette.background.default,
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },

    ticketsCount: {
        fontWeight: "normal",
        color: "rgb(104, 121, 146)",
        marginLeft: "8px",
        fontSize: "14px",
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

    noTicketsDiv: {
        display: "flex",
        height: "100px",
        margin: 40,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
}));

const reducer = (state, action) => {
    if (action.type === "LOAD_TICKETS") {
        const newTickets = action.payload;

        newTickets.forEach((ticket) => {
            const ticketIndex = state.findIndex((t) => t.id === ticket.id);
            if (ticketIndex !== -1) {
                state[ticketIndex] = ticket;
                if (ticket.unreadMessages > 0) {
                    state.unshift(state.splice(ticketIndex, 1)[0]);
                }
            } else {
                state.push(ticket);
            }
        });

        return [...state];
    }

    if (action.type === "RESET_UNREAD") {
        const ticketId = action.payload;

        const ticketIndex = state.findIndex((t) => t.id === ticketId);
        if (ticketIndex !== -1) {
            state[ticketIndex].unreadMessages = 0;
        }

        return [...state];
    }

    if (action.type === "UPDATE_TICKET") {
        const ticket = action.payload;

        const isGroup = action.isGroup === "0" ? false : true;

        if (ticket.status === "open" && ticket.isGroup !== isGroup)
            return [...state];

        if (ticket.status === "pending" && !ticket.isGroup && !isGroup)
            return [...state];

        const ticketIndex = state.findIndex((t) => t.id === ticket.id);
        if (ticketIndex !== -1) {
            state[ticketIndex] = ticket;
        } else {
            state.unshift(ticket);
        }

        return [...state];
    }

    if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
        const ticket = action.payload;

        const isGroup = action.isGroup === "0" ? false : true;

        if (ticket.status === "open" && ticket.isGroup !== isGroup)
            return [...state];

        if (ticket.status === "pending" && !ticket.isGroup && !isGroup)
            return [...state];

        const ticketIndex = state.findIndex((t) => t.id === ticket.id);
        if (ticketIndex !== -1) {
            state[ticketIndex] = ticket;
            state.unshift(state.splice(ticketIndex, 1)[0]);
        } else {
            state.unshift(ticket);
        }

        return [...state];
    }

    if (action.type === "UPDATE_TICKET_CONTACT") {
        const contact = action.payload;
        const ticketIndex = state.findIndex((t) => t.contactId === contact.id);
        if (ticketIndex !== -1) {
            state[ticketIndex].contact = contact;
        }
        return [...state];
    }

    if (action.type === "DELETE_TICKET") {
        const ticketId = action.payload;
        const ticketIndex = state.findIndex((t) => t.id === ticketId);
        if (ticketIndex !== -1) {
            state.splice(ticketIndex, 1);
        }

        return [...state];
    }

    if (action.type === "RESET") {
        return [];
    }
};

const TicketsList = (props) => {
    const {
        status,
        searchParam,
        showAll,
        selectedQueueIds,
        updateCount,
        style,
        tags,
        contacts,
        dateStart,
        dateEnd,
        updatedStart,
        updatedEnd,
        connections,
        users,
        statusFilter,
        queuesFilter,
        isGroup,
    } = props;

    const classes = useStyles();
    const [pageNumber, setPageNumber] = useState(1);
    const [ticketsList, setTicketList] = useReducer(reducer, []);
    const { user } = useContext(AuthContext);
    const { profile, queues } = user;

    useEffect(() => {
        setTicketList({ type: "RESET" });
        setPageNumber(1);
    }, [
        status,
        searchParam,
        setTicketList,
        showAll,
        selectedQueueIds,
        tags,
        contacts,
        dateStart,
        dateEnd,
        updatedStart,
        updatedEnd,
        connections,
        users,
        statusFilter,
        queuesFilter,
        isGroup,
    ]);

    const { tickets, hasMore, loading } = useTickets({
        pageNumber,
        searchParam,
        status,
        showAll,
        tags: JSON.stringify(tags),
        contacts: JSON.stringify(contacts),
        queueIds: JSON.stringify(selectedQueueIds),
        dateStart,
        dateEnd,
        updatedStart,
        updatedEnd,
        connections: JSON.stringify(connections),
        users: JSON.stringify(users),
        statusFilter: JSON.stringify(statusFilter),
        queuesFilter: JSON.stringify(queuesFilter),
        isGroup,
    });

    const { ticketNoQueue } = useSettings();

    useEffect(() => {
        setTicketList({ type: "LOAD_TICKETS", payload: tickets });
    }, [tickets, status, searchParam, queues, profile, ticketNoQueue, isGroup]);

    useEffect(() => {
        const companyId = localStorage.getItem("companyId");
        const socket = socketConnection({ companyId });

        const shouldUpdateTicket = (ticket) =>
            (!ticket.userId || ticket.userId === user?.id || showAll) &&
            (!ticket.queueId || selectedQueueIds.indexOf(ticket.queueId) > -1);

        const notBelongsToUserQueues = (ticket) =>
            ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1;

        socket.on("connect", () => {
            if (status) {
                socket.emit("joinTickets", status);
            } else {
                socket.emit("joinNotification");
            }
        });

        socket.on(`company-${companyId}-ticket`, (data) => {
            if (data.action === "updateUnread") {
                setTicketList({
                    type: "RESET_UNREAD",
                    payload: data.ticketId,
                });
            }

            if (data.action === "update" && shouldUpdateTicket(data.ticket)) {
                setTicketList({
                    type: "UPDATE_TICKET",
                    payload: data.ticket,
                    isGroup: isGroup,
                });
            }

            if (
                data.action === "update" &&
                notBelongsToUserQueues(data.ticket)
            ) {
                setTicketList({
                    type: "DELETE_TICKET",
                    payload: data.ticket.id,
                });
            }

            if (data.action === "delete") {
                setTicketList({
                    type: "DELETE_TICKET",
                    payload: data.ticketId,
                });
            }
        });

        socket.on(`company-${companyId}-appMessage`, (data) => {
            if (data.action === "create" && shouldUpdateTicket(data.ticket)) {
                setTicketList({
                    type: "UPDATE_TICKET_UNREAD_MESSAGES",
                    payload: data.ticket,
                    isGroup: isGroup,
                });
            }
        });

        socket.on(`company-${companyId}-contact`, (data) => {
            if (data.action === "update") {
                setTicketList({
                    type: "UPDATE_TICKET_CONTACT",
                    payload: data.contact,
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [status, isGroup, showAll, user, selectedQueueIds]);

    useEffect(() => {
        if (typeof updateCount === "function") {
            updateCount(ticketsList.length);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketsList]);

    const loadMore = () => {
        setPageNumber((prevState) => prevState + 1);
    };

    const handleScroll = (e) => {
        if (!hasMore || loading) return;

        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        if (scrollHeight - (scrollTop + 100) < clientHeight) {
            loadMore();
        }
    };

    return (
        <Paper className={classes.ticketsListWrapper} style={style}>
            <Paper
                square
                name="closed"
                elevation={0}
                className={classes.ticketsList}
                onScroll={handleScroll}
                style={console.log('ticketsList', ticketsList)}
            >
                <List style={{ paddingTop: 0 }}>
                    {ticketsList.length === 0 && !loading ? (
                        <div className={classes.noTicketsDiv}>
                            <span className={classes.noTicketsTitle}>
                                {i18n.t("ticketsList.noTicketsTitle")}
                            </span>
                            <p className={classes.noTicketsText}>
                                {i18n.t("ticketsList.noTicketsMessage")}
                            </p>
                        </div>
                    ) : (
                        <>
                            {ticketsList.map((ticket) => (
                                <TicketListItem
                                    ticket={ticket}
                                    key={ticket.id}
                                />
                            ))}
                        </>
                    )}
                    {loading && <TicketsListSkeleton />}
                </List>
            </Paper>
        </Paper>
    );
};

export default TicketsList;
