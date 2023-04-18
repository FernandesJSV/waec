import React, { useContext, useState } from "react";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import { Button } from "@material-ui/core";

import CallIcon from "@material-ui/icons/Call";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import ForumIcon from "@material-ui/icons/Forum";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import FilterListIcon from "@material-ui/icons/FilterList";
import ClearIcon from "@material-ui/icons/Clear";

import useTickets from "../../hooks/useTickets";
import useContacts from "../../hooks/useContacts";
import useUsers from "../../hooks/useUsers";
import useMessages from "../../hooks/useMessages";

import { AuthContext } from "../../context/Auth/AuthContext";

import Chart from "./Chart";
import Filters from "./Filters";

const useStyles = makeStyles((theme) => ({
    iframeDashboard: {
        width: "100%",
        height: "calc(100vh - 64px)",
        border: "none",
    },
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
    customFixedHeightPaper: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        height: 120,
    },
    customFixedHeightPaperLg: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        height: "100%",
    },
    card1: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#0094bb",
        color: "#eee",
    },
    card2: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#748e9d",
        color: "#eee",
    },
    card3: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#e53935",
        color: "#eee",
    },
    card4: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#cc991b",
        color: "#eee",
    },
    card5: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#47a7f6",
        color: "#eee",
    },
    card6: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#007daf",
        color: "#eee",
    },
}));

const Dashboard = ({ themeDefault }) => {
    const classes = useStyles();

    let newDate = new Date();
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();
    let now = `${year}-${month < 10 ? `0${month}` : `${month}`}-${date < 10 ? `0${date}` : `${date}`}`;

    const [showFilter, setShowFilter] = useState(false);
    const [dateStartTicket, setDateStartTicket] = useState(now);
    const [dateEndTicket, setDateEndTicket] = useState(now);
    const [queueTicket, setQueueTicket] = useState(false);

    const { user } = useContext(AuthContext);
    var userQueueIds = [];

    if (user.queues && user.queues.length > 0) {
        userQueueIds = user.queues.map((q) => q.id);
    }

    const GetClosedTickets = (all) => {
        let props = {};
        if (all) {
            props = {
                status: "closed",
                showAll: "true",
                withUnreadMessages: "false",
                queueIds: queueTicket
                    ? "[" + queueTicket + "]"
                    : JSON.stringify(userQueueIds),
            };
        } else {
            props = {
                status: "closed",
                showAll: "true",
                withUnreadMessages: "false",
                queueIds: queueTicket
                    ? "[" + queueTicket + "]"
                    : JSON.stringify(userQueueIds),
                dateStart: dateStartTicket,
                dateEnd: dateEndTicket,
            };
        }

        const { count } = useTickets(props);
        return count;
    };

    const GetOpenTickets = (all) => {
        let props = {};
        if (all) {
            props = {
                status: "open",
                showAll: "true",
                withUnreadMessages: "false",
                queueIds: queueTicket
                    ? "[" + queueTicket + "]"
                    : JSON.stringify(userQueueIds),
            };
        } else {
            props = {
                status: "open",
                showAll: "true",
                withUnreadMessagenones: "false",
                queueIds: queueTicket
                    ? "[" + queueTicket + "]"
                    : JSON.stringify(userQueueIds),
                dateStart: dateStartTicket,
                dateEnd: dateEndTicket,
            };
        }
        const { count } = useTickets(props);
        return count;
    };

    const GetPendingTickets = (all) => {
        let props = {};
        if (all) {
            props = {
                status: "pending",
                showAll: "true",
                withUnreadMessages: "false",
                queueIds: queueTicket
                    ? "[" + queueTicket + "]"
                    : JSON.stringify(userQueueIds),
            };
        } else {
            props = {
                status: "pending",
                showAll: "true",
                withUnreadMessages: "false",
                queueIds: queueTicket
                    ? "[" + queueTicket + "]"
                    : JSON.stringify(userQueueIds),
                dateStart: dateStartTicket,
                dateEnd: dateEndTicket,
            };
        }
        const { count } = useTickets(props);
        return count;
    };

    const GetContacts = (all) => {
        let props = {};
        if (all) {
            props = {};
        } else {
            props = {
                dateStart: dateStartTicket,
                dateEnd: dateEndTicket,
            };
        }
        const { count } = useContacts(props);
        return count;
    };

    const GetMessages = (all) => {
        let props = {};
        if (all) {
            props = {};
        } else {
            props = {
                dateStart: dateStartTicket,
                dateEnd: dateEndTicket,
            };
        }
        const { count } = useMessages(props);
        console.log('count')
        return count;
    };

    const GetUsers = () => {
        const { count } = useUsers();
        return count;
    };

    function toggleShowFilter() {
        setShowFilter(!showFilter);
    }

    return (
        <div>
            <Container maxWidth={false} className={classes.container}>
                <Grid container spacing={3}>

                    <Grid item xs={12}>
                        <Button
                            onClick={toggleShowFilter}
                            style={{ float: "right" }}
                            color="primary"
                        >
                            {!showFilter ? (
                                <FilterListIcon />
                            ) : (
                                <ClearIcon />
                            )}
                        </Button>
                    </Grid>

                    {showFilter && (
                        <Filters
                            classes={classes}
                            setDateStartTicket={setDateStartTicket}
                            setDateEndTicket={setDateEndTicket}
                            dateStartTicket={dateStartTicket}
                            dateEndTicket={dateEndTicket}
                            setQueueTicket={setQueueTicket}
                            queueTicket={queueTicket}
                        />
                    )}

                    <Grid item xs={12} sm={6} md={4}>
                        <Paper
                            className={classes.card1}
                            style={{ overflow: "hidden" }}
                            elevation={6}
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={8}>
                                    <Typography
                                        component="h3"
                                        variant="h6"
                                        paragraph
                                    >
                                        En Conversación
                                    </Typography>
                                    <Grid item>
                                        <Typography
                                            component="h1"
                                            variant="h4"
                                        >
                                            {GetOpenTickets(false)}
                                            <span
                                                style={{ color: "#4babd1" }}
                                            >
                                                /{GetOpenTickets(true)}
                                            </span>
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid item xs={4}>
                                    <CallIcon
                                        style={{
                                            fontSize: 100,
                                            color: "#0b708c",
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Paper
                            className={classes.card2}
                            style={{ overflow: "hidden" }}
                            elevation={6}
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={8}>
                                    <Typography
                                        component="h3"
                                        variant="h6"
                                        paragraph
                                    >
                                        Esperando
                                    </Typography>
                                    <Grid item>
                                        <Typography
                                            component="h1"
                                            variant="h4"
                                        >
                                            {GetPendingTickets(false)}
                                            <span
                                                style={{ color: "#b6d1e0" }}
                                            >
                                                /{GetPendingTickets(true)}
                                            </span>
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid item xs={4}>
                                    <HourglassEmptyIcon
                                        style={{
                                            fontSize: 100,
                                            color: "#47606e",
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Paper
                            className={classes.card3}
                            style={{ overflow: "hidden" }}
                            elevation={6}
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={8}>
                                    <Typography
                                        component="h3"
                                        variant="h6"
                                        paragraph
                                    >
                                        Finalizados
                                    </Typography>
                                    <Grid item>
                                        <Typography
                                            component="h1"
                                            variant="h4"
                                        >
                                            {GetClosedTickets(false)}
                                            <span
                                                style={{ color: "#a6a2db" }}
                                            >
                                                /{GetClosedTickets(true)}
                                            </span>
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid item xs={4}>
                                    <CheckCircleIcon
                                        style={{
                                            fontSize: 100,
                                            color: "#5852ab",
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Paper
                            className={classes.card4}
                            style={{ overflow: "hidden" }}
                            elevation={6}
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={8}>
                                    <Typography
                                        component="h3"
                                        variant="h6"
                                        paragraph
                                    >
                                        Nuevos Contactos
                                    </Typography>
                                    <Grid item>
                                        <Typography
                                            component="h1"
                                            variant="h4"
                                        >
                                            {GetContacts(false)}
                                            <span
                                                style={{ color: "#f2c65a" }}
                                            >
                                                /{GetContacts(true)}
                                            </span>
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid item xs={4}>
                                    <GroupAddIcon
                                        style={{
                                            fontSize: 100,
                                            color: "#8c6b19",
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Paper
                            className={classes.card5}
                            style={{ overflow: "hidden" }}
                            elevation={6}
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={8}>
                                    <Typography
                                        component="h3"
                                        variant="h6"
                                        paragraph
                                    >
                                        Mensagens totais
                                    </Typography>
                                    <Grid item>
                                        <Typography
                                            component="h1"
                                            variant="h4"
                                        >
                                            {GetMessages(false)}
                                            <span
                                                style={{ color: "#787878" }}
                                            >
                                                /{GetMessages(true)}
                                            </span>
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid item xs={4}>
                                    <ForumIcon
                                        style={{
                                            fontSize: 100,
                                            color: "#333133",
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Paper
                            className={classes.card6}
                            style={{ overflow: "hidden" }}
                            elevation={6}
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={8}>
                                    <Typography
                                        component="h3"
                                        variant="h6"
                                        paragraph
                                    >
                                        Conversación Activa
                                    </Typography>
                                    <Grid item>
                                        <Typography
                                            component="h1"
                                            variant="h4"
                                        >
                                            {GetUsers()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid item xs={4}>
                                    <RecordVoiceOverIcon
                                        style={{
                                            fontSize: 100,
                                            color: "#045575",
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper
                            elevation={6}
                            className={classes.fixedHeightPaper}
                        >
                            <Chart
                                dateStartTicket={dateStartTicket}
                                dateEndTicket={dateEndTicket}
                                queueTicket={queueTicket}
                            />
                        </Paper>
                    </Grid>

                </Grid>
            </Container>
        </div>
    );
};

export default Dashboard;
