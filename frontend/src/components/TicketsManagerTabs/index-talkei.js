import React, { useContext, useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import MessageSharpIcon from "@material-ui/icons/MessageSharp";
import ClockIcon from "@material-ui/icons/AccessTime";
import UsersIcon from "@material-ui/icons/People";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Badge from "@material-ui/core/Badge";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import FilterListIcon from "@material-ui/icons/FilterList";
import ClearIcon from "@material-ui/icons/Clear";
import { TagsFilter } from "../TagsFilter";
import { ContactsFilter } from "../ContactsFilter";
import { ParamsFilter } from "../ParamsFilter";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import TicketsQueueSelect from "../TicketsQueueSelect";

import { Can } from "../Can";
import {
    Button,
    Fab,
    FormControlLabel,
    Grid,
    Switch,
    Typography,
} from "@material-ui/core";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import { CreatedAtFilter } from "../CreatedAtFilter";
import { UpdatedAtFilter } from "../UpdatedAtFilter";
import { ConnectionsFilter } from "../ConnectionsFilter";
import { UsersFilter } from "../UsersFilter";
import { StatusFilter } from "../StatusFilter";
import { QueueFilter } from "../QueueFilter";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
    ticketsWrapper: {
        position: "relative",
        display: "flex",
        height: "100%",
        flexDirection: "column",
        overflow: "hidden",
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },

    ticketsWrapper1: {
        position: "relative",
        display: "flex",
        height: "100%",
        flexDirection: "column",
        overflow: "hidden",
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },

    tabsHeader: {
        flex: "none",
        backgroundColor: theme.palette.background.default,
    },

    settingsIcon: {
        alignSelf: "center",
        marginLeft: "auto",
        padding: 8,
        backgroundColor: theme.palette.background.default,
    },

    tab: {
        minWidth: 120,
        width: 120,
    },

    tabPanelItem: {
        minWidth: 120,
        fontSize: 11,
        marginLeft: 0,
    },

    ticketOptionsBox: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(1),
    },

    searchInputWrapper: {
        flex: 1,
        backgroundColor: theme.palette.background.default,
        display: "flex",
        borderRadius: 40,
        padding: 4,
        marginRight: theme.spacing(1),
    },

    searchIcon: {
        color: theme.palette.primary.main,
        marginLeft: 6,
        marginRight: 6,
        alignSelf: "center",
    },

    searchInput: {
        flex: 1,
        border: "none",
        borderRadius: 25,
        padding: "10px",
        outline: "none",
    },

    badge: {
        // right: "-10px",
    },

    customBadge: {
        right: "-10px",
        backgroundColor: "#f44336",
        color: "#fff",
    },
    show: {
        display: "block",
    },
    hide: {
        display: "none !important",
    },
    whatsappIcon: {
        position: "absolute",
        bottom: "15px",
        left: "15px",
        zIndex: 999,
    },
    filterScreen: {
        overflowY: "auto",
        overflowX: "hidden",
        padding: "10px",
    },
}));

const TicketsManager = () => {
    const classes = useStyles();

    const [tab, setTab] = useState("open");
    const [tabOpen, setTabOpen] = useState("open");
    const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
    const [showAllTickets, setShowAllTickets] = useState(false);
    const { user } = useContext(AuthContext);

    const [openCount, setOpenCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    // const [groupCount, setGroupCount] = useState(0);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedTagsFilter, setSelectedTagsFilter] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [selectedContactsFilter, setSelectedContactsFilter] = useState([]);
    const [params, setParams] = useState("");
    const [paramsFilter, setParamsFilter] = useState("");
    const [selectedConnections, setSelectedConnections] = useState([]);
    const [selectedConnectionsFilter, setSelectedConnectionsFilter] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedUsersFilter, setSelectedUsersFilter] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState([]);
    const [selectedQueues, setSelectedQueues] = useState([]);
    const [selectedQueuesFilter, setSelectedQueuesFilter] = useState([]);
    const [selectedDatesStart, setSelectedDatesStart] = useState([]);
    const [selectedDatesStartFilter, setSelectedDatesStartFilter] = useState([]);
    const [selectedDatesEnd, setSelectedDatesEnd] = useState([]);
    const [selectedDatesEndFilter, setSelectedDatesEndFilter] = useState([]);
    const [selectedUpdatedStart, setSelectedUpdatedStart] = useState([]);
    const [selectedUpdatedEnd, setSelectedUpdatedEnd] = useState([]);
    const [selectedUpdatedStartFilter, setSelectedUpdatedStartFilter] = useState([]);
    const [selectedUpdatedEndFilter, setSelectedUpdatedEndFilter] = useState([]);

    const [msgIsGroup, setMsgIsGroup] = useState(true);

    const [visibleFilters, setVisibleFilters] = useState(false);

    const userQueueIds = user.queues.map((q) => q.id);
    const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

    useEffect(() => {
        if (user.profile.toUpperCase() === "ADMIN") {
            setShowAllTickets(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        async function fetchData() {
            const { data } = await api.get("/settings", {});

            const dataSort = data.sort((a, b) => a.id - b.id);

            const checkMsgIsGroup = dataSort[4].value;

            if (checkMsgIsGroup === "disabled") {
                setMsgIsGroup(false);
            } else {
                setMsgIsGroup(true);
            }
        }
        fetchData();
    }, []);

    const handleSelectedTags = (selecteds) => {
        const tags = selecteds.map((t) => t.id);
        setSelectedTagsFilter(tags);
    };

    const handleSelectedContacts = (selecteds) => {
        const contacts = selecteds.map((t) => t.id);
        setSelectedContactsFilter(contacts);
    };

    const handleParamsFilter = (selecteds) => {
        const params = selecteds;
        setParamsFilter(params);
    };

    const handleSelectedConnections = (selecteds) => {
        const connections = selecteds.map((t) => t.id);
        setSelectedConnectionsFilter(connections);
    };

    const handleSelectedUsers = (selecteds) => {
        const users = selecteds.map((t) => t.id);
        setSelectedUsersFilter(users);
    };

    const handleSelectedStatus = (selecteds) => {
        const status = selecteds.map((t) => t.id);
        setSelectedStatusFilter(status);
    };

    const handleSelectedQueues = (selecteds) => {
        const queues = selecteds.map((t) => t.id);
        setSelectedQueuesFilter(queues);
    };

    const handleSelectedDatesStart = (dates) => {
        setSelectedDatesStartFilter(dates);
    };

    const handleSelectedDatesEnd = (dates) => {
        setSelectedDatesEndFilter(dates);
    };

    const handleSelectedUpdatedStart = (dates) => {
        setSelectedUpdatedStartFilter(dates);
    };

    const handleSelectedUpdatedEnd = (dates) => {
        setSelectedUpdatedEndFilter(dates);
    };

    const handleChangeTab = (e, newValue) => {
        setTab(newValue);
    };

    const handleChangeTabOpen = (e, newValue) => {
        setTabOpen(newValue);
    };

    const applyPanelStyle = (status) => {
        if (tabOpen !== status) {
            return { width: 0, height: 0 };
        }
    };

    const showFilters = () => {
        setVisibleFilters(true);
    };

    const hideFilters = () => {
        setVisibleFilters(false);
    };

    const handleClearFilters = () => {
        setSelectedTags([]);
        setSelectedContacts([]);
        setParams("");
        setSelectedConnections([]);
        setSelectedUsers([]);
        setSelectedStatus([]);
        setSelectedQueues([]);
        setSelectedDatesStart([]);
        setSelectedDatesEnd([]);
        setSelectedUpdatedStart([]);
        setSelectedUpdatedEnd([]);
        setSelectedQueueIds(userQueueIds);

        setSelectedTagsFilter([]);
        setSelectedContactsFilter([]);
        setParamsFilter("");
        setSelectedConnectionsFilter([]);
        setSelectedUsersFilter([]);
        setSelectedStatusFilter([]);
        setSelectedQueuesFilter([]);
        setSelectedDatesStartFilter([]);
        setSelectedDatesEndFilter([]);
        setSelectedUpdatedStartFilter([]);
        setSelectedUpdatedEndFilter([]);
    };

    const handleApplyFilters = () => {
        setSelectedTags(selectedTagsFilter);
        setSelectedContacts(selectedContactsFilter);
        setParams(paramsFilter);
        setSelectedConnections(selectedConnectionsFilter);
        setSelectedUsers(selectedUsersFilter);
        setSelectedStatus(selectedStatusFilter);
        setSelectedQueues(selectedQueuesFilter);
        setSelectedDatesStart(selectedDatesStartFilter);
        setSelectedDatesEnd(selectedDatesEndFilter);
        setSelectedUpdatedStart(selectedUpdatedStartFilter);
        setSelectedUpdatedEnd(selectedUpdatedEndFilter);
    };

    return (
        <Paper
            elevation={0}
            variant="outlined"
            className={classes.ticketsWrapper}
        >
            <NewTicketModal
                modalOpen={newTicketModalOpen}
                onClose={(e) => setNewTicketModalOpen(false)}
            />
            <Paper elevation={0} square className={classes.tabsHeader}>
                <Tabs
                    value={tab}
                    onChange={handleChangeTab}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                    aria-label="icon label tabs example"
                >
                    <Tab
                        value={"open"}
                        icon={<MoveToInboxIcon />}
                        label={i18n.t("tickets.tabs.open.title")}
                        classes={{ root: classes.tab }}
                    />
                    <Tab
                        value={"closed"}
                        icon={<CheckBoxIcon />}
                        label={i18n.t("tickets.tabs.closed.title")}
                        classes={{ root: classes.tab }}
                    />
                    <Tab
                        value={"search"}
                        icon={<SearchIcon />}
                        label={i18n.t("tickets.tabs.search.title")}
                        classes={{ root: classes.tab }}
                    />
                </Tabs>
            </Paper>
            {tab !== "search" && (
                <Paper
                    square
                    elevation={0}
                    className={classes.ticketOptionsBox}
                >
                    <Fab
                        onClick={() => setNewTicketModalOpen(true)}
                        color="primary"
                        aria-label="add"
                        className={classes.whatsappIcon}
                    >
                        <WhatsAppIcon />
                    </Fab>
                    <TicketsQueueSelect
                        style={{ marginLeft: 6 }}
                        selectedQueueIds={selectedQueueIds}
                        userQueues={user?.queues}
                        onChange={(values) => setSelectedQueueIds(values)}
                    />
                    <Can
                        role={user.profile}
                        perform="tickets-manager:showall"
                        yes={() => (
                            <FormControlLabel
                                label={i18n.t("tickets.buttons.showAll")}
                                labelPlacement="start"
                                style={{ marginLeft: 10, marginRight: 10 }}
                                control={
                                    <Switch
                                        size="small"
                                        checked={showAllTickets}
                                        onChange={() =>
                                            setShowAllTickets(
                                                (prevState) => !prevState
                                            )
                                        }
                                        name="showAllTickets"
                                        color="primary"
                                    />
                                }
                            />
                        )}
                    />
                </Paper>
            )}
            <TabPanel
                value={tab}
                name="open"
                className={classes.ticketsWrapper1}
            >
                <Tabs
                    value={tabOpen}
                    onChange={handleChangeTabOpen}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    {/* ATENDENDO */}
                    <Tab
                        label={
                            <Grid container alignItems="center" justifyContent="center">
                                <Grid item>
                                    <Badge
                                        overlap="rectangular"
                                        className={classes.badge}
                                        badgeContent={openCount}
                                        color="primary"
                                    >
                                        <MessageSharpIcon
                                            style={{
                                                fontSize: 18,
                                            }}
                                        />
                                    </Badge>
                                </Grid>
                                <Grid item>
                                    <Typography
                                        style={{
                                            marginLeft: 8,
                                            fontSize: 10,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {i18n.t("ticketsList.assignedHeader")}
                                    </Typography>
                                </Grid>
                            </Grid>
                        }
                        value={"open"}
                        classes={{ root: classes.tabPanelItem }}
                    />

                    {/* AGUARDANDO */}
                    <Tab
                        label={
                            <Grid container alignItems="center" justifyContent="center">
                                <Grid item>
                                    <Badge
                                        overlap="rectangular"
                                        classes={{ badge: classes.customBadge }}
                                        badgeContent={pendingCount}
                                        color="primary"
                                    >
                                        <ClockIcon
                                            style={{
                                                fontSize: 18,
                                            }}
                                        />
                                    </Badge>
                                </Grid>
                                <Grid item>
                                    <Typography
                                        style={{
                                            marginLeft: 8,
                                            fontSize: 10,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {i18n.t("ticketsList.pendingHeader")}
                                    </Typography>
                                </Grid>
                            </Grid>
                        }
                        value={"pending"}
                        classes={{ root: classes.tabPanelItem }}
                    />

                    {/* GRUPOS */}
                    {!msgIsGroup && (
                        <Tab
                            label={
                                <Grid container alignItems="center" justifyContent="center">
                                    <Grid item>
                                        <UsersIcon
                                            style={{
                                                fontSize: 18,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Typography
                                            style={{
                                                marginLeft: 8,
                                                fontSize: 10,
                                                fontWeight: 600,
                                            }}
                                        >
                                            Grupos
                                        </Typography>
                                    </Grid>
                                </Grid>
                            }
                            value={"groups"}
                            classes={{ root: classes.tabPanelItem }}
                        />
                    )}

                </Tabs>
                <Paper className={classes.ticketsWrapper}>
                    <TicketsList
                        status="open"
                        isGroup="0"
                        showAll={showAllTickets}
                        selectedQueueIds={selectedQueueIds}
                        updateCount={(val) => setOpenCount(val)}
                        style={applyPanelStyle("open")}
                    />
                    <TicketsList
                        status="pending"
                        selectedQueueIds={selectedQueueIds}
                        updateCount={(val) => setPendingCount(val)}
                        style={applyPanelStyle("pending")}
                    />
                    <TicketsList
                        isGroup="1"
                        status="open"
                        selectedQueueIds={selectedQueueIds}
                        // updateCount={(val) => setGroupCount(val)}
                        style={applyPanelStyle("groups")}
                    />
                </Paper>
            </TabPanel>
            <TabPanel
                value={tab}
                name="closed"
                className={classes.ticketsWrapper}
            >
                <TicketsList
                    status="closed"
                    showAll={true}
                    selectedQueueIds={selectedQueueIds}
                />
            </TabPanel>
            <TabPanel
                value={tab}
                name="search"
                className={classes.ticketsWrapper}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={12}>
                        {!visibleFilters && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={showFilters}
                                style={{
                                    float: "right",
                                    marginRight: 10,
                                    marginTop: 10,
                                }}
                            >
                                <FilterListIcon />
                            </Button>
                        )}
                        {visibleFilters && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={hideFilters}
                                style={{
                                    float: "right",
                                    marginRight: 10,
                                    marginTop: 10,
                                }}
                            >
                                <ClearIcon />
                            </Button>
                        )}
                    </Grid>
                </Grid>
                <div
                    className={classes.filterScreen}
                    style={
                        visibleFilters
                            ? {
                                height: "100%",
                            }
                            : null
                    }
                >
                    {visibleFilters && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={12} md={12}>
                                <ParamsFilter onFiltered={handleParamsFilter} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <ContactsFilter
                                    onFiltered={handleSelectedContacts}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <TagsFilter onFiltered={handleSelectedTags} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <ConnectionsFilter
                                    onFiltered={handleSelectedConnections}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <UsersFilter onFiltered={handleSelectedUsers} />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6}>
                                <StatusFilter
                                    onFiltered={handleSelectedStatus}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6}>
                                <QueueFilter
                                    onFiltered={handleSelectedQueues}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12}>
                                <CreatedAtFilter
                                    dateStart={handleSelectedDatesStart}
                                    dateEnd={handleSelectedDatesEnd}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12}>
                                <UpdatedAtFilter
                                    dateStart={handleSelectedUpdatedStart}
                                    dateEnd={handleSelectedUpdatedEnd}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleApplyFilters}
                                    fullWidth
                                >
                                    {i18n.t("tickets.applyFilters")}
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleClearFilters}
                                    fullWidth
                                >
                                    {i18n.t("tickets.clearFilters")}
                                </Button>
                            </Grid>
                        </Grid>
                    )}
                </div>
                <TicketsList
                    searchParam={params}
                    tags={selectedTags}
                    contacts={selectedContacts}
                    showAll={true}
                    selectedQueueIds={selectedQueueIds}
                    dateStart={selectedDatesStart}
                    dateEnd={selectedDatesEnd}
                    updatedStart={selectedUpdatedStart}
                    updatedEnd={selectedUpdatedEnd}
                    connections={selectedConnections}
                    users={selectedUsers}
                    statusFilter={selectedStatus}
                    queuesFilter={selectedQueues}
                />
            </TabPanel>
        </Paper>
    );
};

export default TicketsManager;
