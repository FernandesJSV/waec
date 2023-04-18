import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Badge from "@material-ui/core/Badge";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import MessageSharpIcon from "@material-ui/icons/MessageSharp";
import ClockIcon from "@material-ui/icons/AccessTime";
import UsersIcon from "@material-ui/icons/People";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid"

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsListCustom";
import TabPanel from "../TabPanel";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { Button } from "@material-ui/core";
import { TagsFilter } from "../TagsFilter";
import { UsersFilter } from "../UsersFilter";
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

  tabsHeader: {
    flex: "none",
    // backgroundColor: "#eee",
    backgroundColor: theme.palette.tabHeaderBackground,
  },

  settingsIcon: {
    alignSelf: "center",
    marginLeft: "auto",
    padding: 8,
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
    // background: "#fafafa",
    background: theme.palette.optionsBackground,
    padding: theme.spacing(1),
  },

  serachInputWrapper: {
    flex: 1,
    // background: "#fff",
    background: theme.palette.total,
    display: "flex",
    borderRadius: 40,
    padding: 4,
    marginRight: theme.spacing(1),
  },

  searchIcon: {
    color: "grey",
    marginLeft: 6,
    marginRight: 6,
    alignSelf: "center",
  },

  searchInput: {
    flex: 1,
    border: "none",
    borderRadius: 30,
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
}));

const TicketsManagerTabs = () => {
  const classes = useStyles();
  const history = useHistory();

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);
  const { profile } = user;

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [msgIsGroup, setMsgIsGroup] = useState(true);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function fetchData() {
      const { data } = await api.get("/settings/CheckMsgIsGroup");

      if (data.value === "disabled") {
        setMsgIsGroup(false);
      } else {
        setMsgIsGroup(true);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
    }
  }, [tab]);

  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      setTab("open");
      return;
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
    }, 500);
  };

  const handleBack = () => {
    history.push("/tickets");
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {

    if (newValue === 'pending') {
      handleBack()
    }

    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);
    setSelectedTags(tags);
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setSelectedUsers(users);
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      className={classes.ticketsWrapper}
    >
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(ticket) => {
          console.log("ticket", ticket);
          handleCloseOrOpenTicket(ticket);
        }}
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
      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        {tab === "search" ? (
          <div className={classes.serachInputWrapper}>
            <SearchIcon className={classes.searchIcon} />
            <InputBase
              className={classes.searchInput}
              inputRef={searchInputRef}
              placeholder={i18n.t("tickets.search.placeholder")}
              type="search"
              onChange={handleSearch}
            />
          </div>
        ) : (
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setNewTicketModalOpen(true)}
            >
              {i18n.t("ticketsManager.buttons.newTicket")}
            </Button>
            <Can
              role={user.profile}
              perform="tickets-manager:showall"
              yes={() => (
                <FormControlLabel
                  label={i18n.t("tickets.buttons.showAll")}
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={showAllTickets}
                      onChange={() =>
                        setShowAllTickets((prevState) => !prevState)
                      }
                      name="showAllTickets"
                      color="primary"
                    />
                  }
                />
              )}
            />
          </>
        )}
        <TicketsQueueSelect
          style={{ marginLeft: 6 }}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
      </Paper>
      <TabPanel
        value={tab}
        name="open"
        className={classes.ticketsWrapper}
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
            name="open"
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
            name="pending"
            classes={{ root: classes.tabPanelItem }}
          />

          {/* GRUPOS */}
          {/* {!msgIsGroup && (
            <Tab
              label={
                <Grid container alignItems="center" justifyContent="center">
                  <Grid item>
                    <Badge
                      overlap="rectangular"
                      classes={{ badge: classes.badge }}
                      badgeContent={groupCount}
                      color="primary"
                    >
                      <UsersIcon
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
                      Grupos
                    </Typography>
                  </Grid>
                </Grid>
              }
              value={"groups"}
              classes={{ root: classes.tabPanelItem }}
            />
          )} */}

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
            handleChangeTab={handleChangeTabOpen}
          />
          <TicketsList
            status="open"
            isGroup="1"
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setGroupCount(val)}
            style={applyPanelStyle("groups")}
          />
        </Paper>
      </TabPanel>
      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
        <TicketsList
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
        <TagsFilter onFiltered={handleSelectedTags} />
        {profile === "admin" && (
          <UsersFilter onFiltered={handleSelectedUsers} />
        )}
        <TicketsList
          searchParam={searchParam}
          showAll={true}
          tags={selectedTags}
          users={selectedUsers}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
    </Paper>
  );
};

export default TicketsManagerTabs;
