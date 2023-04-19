import React, { useContext, useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";

import { Can } from "../Can";
import { makeStyles, createTheme, ThemeProvider } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { MoreVert, Replay } from "@material-ui/icons";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import TicketOptionsMenu from "../TicketOptionsMenu";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import useSettings from "../../hooks/useSettings";
import Tooltip from '@material-ui/core/Tooltip';
import ConfirmationModal from "../ConfirmationModal";
import { green } from '@material-ui/core/colors';
import * as Yup from "yup";
import { Formik, Form } from "formik";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import TransferTicketModalCustom from "../TransferTicketModalCustom";

//icones
import EventIcon from "@material-ui/icons/Event";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import CachedOutlinedIcon from "@material-ui/icons/CachedOutlined";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import UndoIcon from '@material-ui/icons/Undo';
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';

import ScheduleModal from "../ScheduleModal";
import MenuItem from "@material-ui/core/MenuItem";
import { Switch } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    actionButtons: {
        marginRight: 6,
        flex: "none",
        alignSelf: "center",
        marginLeft: "auto",
        // flexBasis: "50%",
        display: "flex",
        "& > *": {
            margin: theme.spacing(1),
        },
    },
    bottomButtonVisibilityIcon: {
        padding: 1,
    },
    botoes: {
        display: "flex",
        padding: "15px",
        justifyContent: "flex-end",
        // alignItems: "center"

    }
}));

const SessionSchema = Yup.object().shape({
    ratingId: Yup.string().required("Avaliação obrigatória"),
});

const TicketActionButtonsCustom = ({ ticket }) => {
    const classes = useStyles();
    const history = useHistory();
    const isMounted = useRef(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);
    const ticketOptionsMenuOpen = Boolean(anchorEl);
    const { user } = useContext(AuthContext);
    const { setCurrentTicket } = useContext(TicketsContext);
    const [initialState, setInitialState] = useState({ ratingId: "" });
    const [dataRating, setDataRating] = useState([]);
    const [open, setOpen] = React.useState(false);
    const formRef = React.useRef(null);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [contactId, setContactId] = useState(null);
    const [acceptAudioMessage, setAcceptAudio] = useState(ticket.contact.acceptAudioMessage);
    const [showSchedules, setShowSchedules] = useState(false);
    const [ratings, setRatings] = useState(false);

    const { getAll: getAllSettings } = useSettings();
    const { getPlanCompany } = usePlans();

    useEffect(() => {

        async function fetchData() {
            const settingList = await getAllSettings();
            const setting = settingList.find(setting => setting.key === "userRating");
            if (setting.value === "enabled") {
                setRatings(true);
            }
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const customTheme = createTheme({
        palette: {
            primary: green,
        }
    });

    useEffect(() => {
        async function fetchData() {
            const companyId = localStorage.getItem("companyId");
            const planConfigs = await getPlanCompany(undefined, companyId);
            setShowSchedules(planConfigs.plan.useSchedules);
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadRatings = async () => {
        try {
            const { data } = await api.get(`/ratings/list`);
            setDataRating(data);
        } catch (err) {
            toastError(err);
        }
    }

    const handleClickOpen = async (e) => {
        const settingList = await getAllSettings();
        const setting = settingList.find(setting => setting.key === "userRating");
        if (setting.value === "enabled") {
            setInitialState({
                ratingId: ""
            });
            await loadRatings();
            setOpen(true);
        } else {
            setOpen(true);
            // handleUpdateTicketStatus(e, "closed", user?.id);
        }
    };

    const handleClose = () => {
        formRef.current.resetForm();
        setOpen(false);
    };

    const handleOpenScheduleModal = () => {
        if (typeof handleClose == "function") handleClose();
        setContactId(ticket.contact.id);
        setScheduleModalOpen(true);
    }

    const handleCloseScheduleModal = () => {
        setScheduleModalOpen(false);
        setContactId(null);
    }

    const handleOpenTicketOptionsMenu = e => {
        setAnchorEl(e.currentTarget);
    };

    const handleOpenTransferModal = (e) => {
        setTransferTicketModalOpen(true);
        if (typeof handleClose == "function") handleClose();
    };

    const handleOpenConfirmationModal = (e) => {
        setConfirmationOpen(true);
        if (typeof handleClose == "function") handleClose();
    };

    const handleCloseTicketOptionsMenu = e => {
        setAnchorEl(null);
    };

    const handleCloseTicketWithoutFarewellMsg = async () => {
        setLoading(true);
        try {
            await api.put(`/tickets/${ticket.id}`, {
                status: "closed",
                userId: user?.id || null,
                sendFarewellMessage: false,
                amountUsedBotQueues: 0
            });

            setLoading(false);
            history.push("/tickets");
        } catch (err) {
            setLoading(false);
            toastError(err);
        }
    };

    const handleContactToggleAcceptAudio = async () => {
        try {
            const contact = await api.put(`/contacts/toggleAcceptAudio/${ticket.contact.id}`);
            setAcceptAudio(contact.data.acceptAudioMessage);
        } catch (err) {
            toastError(err);
        }
    };

    const handleCloseTransferTicketModal = () => {
        if (isMounted.current) {
            setTransferTicketModalOpen(false);
        }
    };

    const handleDeleteTicket = async () => {
        try {
            await api.delete(`/tickets/${ticket.id}`);
        } catch (err) {
            toastError(err);
        }
    };

    const handleUpdateTicketStatus = async (e, status, userId) => {
        setLoading(true);
        try {
            await api.put(`/tickets/${ticket.id}`, {
                status: status,
                userId: userId || null,
            });

            setLoading(false);
            if (status === "open") {
                setCurrentTicket({ ...ticket, code: "#open" });
            } else {
                setCurrentTicket({ id: null, code: null })
                history.push("/tickets");
            }
        } catch (err) {
            setLoading(false);
            toastError(err);
        }
    };

    const handleSendRating = async (userId, ratingId) => {
        handleClose();
        setLoading(true);
        try {
            await api.post(`/ratings/messages/${ticket.id}`, {
                userId: userId || null,
                ratingId
            });

            setLoading(false);
            history.push("/tickets");
        } catch (err) {
            setLoading(false);
            toastError(err);
        }
    };

    return (
        <>
            <div className={classes.actionButtons}>
                {ticket.status === "closed" && (
                    <ButtonWithSpinner
                        loading={loading}
                        startIcon={<Replay />}
                        size="small"
                        onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
                    >
                        {i18n.t("messagesList.header.buttons.reopen")}
                    </ButtonWithSpinner>
                )}
                {ticket.status === "open" && (
                    <>
                        <IconButton className={classes.bottomButtonVisibilityIcon}>
                            <Tooltip title={i18n.t("messagesList.header.buttons.resolve")}>
                                <HighlightOffIcon
                                    color="primary"
                                    onClick={handleClickOpen}
                                />
                            </Tooltip>
                        </IconButton>

                        <IconButton className={classes.bottomButtonVisibilityIcon}>
                            <Tooltip title="Devolver a Fila">
                                <UndoIcon
                                    color="primary"
                                    onClick={(e) => handleUpdateTicketStatus(e, "pending", null)}
                                />
                            </Tooltip>
                        </IconButton>

                        <IconButton className={classes.bottomButtonVisibilityIcon}>
                            <Tooltip title="Transferir Ticket">
                                <CachedOutlinedIcon
                                    color="primary"
                                    onClick={handleOpenTransferModal}
                                />
                            </Tooltip>
                        </IconButton>

                        {showSchedules && (
                            <>
                                <IconButton className={classes.bottomButtonVisibilityIcon}>
                                    <Tooltip title="Agendamento">
                                        <EventIcon
                                            color="primary"
                                            onClick={handleOpenScheduleModal}
                                        />
                                    </Tooltip>
                                </IconButton>
                            </>
                        )}

                        <MenuItem className={classes.bottomButtonVisibilityIcon}>
                            <Tooltip title={i18n.t("ticketOptionsMenu.acceptAudioMessage")}>
                                <Switch
                                    size="small"
                                    color="primary"
                                    checked={acceptAudioMessage}
                                    onChange={() => handleContactToggleAcceptAudio()}
                                />
                            </Tooltip>
                        </MenuItem>

                        <Can
                            role={user.profile}
                            perform="ticket-options:deleteTicket"
                            yes={() => (
                                <IconButton className={classes.bottomButtonVisibilityIcon}>
                                    <Tooltip title="Deletar Ticket">
                                        <DeleteOutlineIcon
                                            color="primary"
                                            onClick={handleOpenConfirmationModal}
                                        />
                                    </Tooltip>
                                </IconButton>
                            )}
                        />

                        <ConfirmationModal
                            title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")} #${ticket.id}?`}
                            open={confirmationOpen}
                            onClose={setConfirmationOpen}
                            onConfirm={handleDeleteTicket}
                        >
                            {i18n.t("ticketOptionsMenu.confirmationModal.message")}
                        </ConfirmationModal>
                        <TransferTicketModalCustom
                            modalOpen={transferTicketModalOpen}
                            onClose={handleCloseTransferTicketModal}
                            ticketid={ticket.id}
                        />
                        <ScheduleModal
                            open={scheduleModalOpen}
                            onClose={handleCloseScheduleModal}
                            aria-labelledby="form-dialog-title"
                            contactId={contactId}
                        />

                    </>
                )}
                {ticket.status === "pending" && (
                    <ButtonWithSpinner
                        loading={loading}
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
                    >
                        {i18n.t("messagesList.header.buttons.accept")}
                    </ButtonWithSpinner>
                )}
            </div>
            <>
                <Formik
                    initialValues={initialState}
                    enableReinitialize={true}
                    validationSchema={SessionSchema}
                    innerRef={formRef}
                    onSubmit={(values, actions) => {
                        handleSendRating(user?.id, values.ratingId);
                        setTimeout(() => {
                            actions.setSubmitting(false);
                            actions.resetForm();
                        }, 400);
                    }}
                >
                    {({ values, touched, errors, isSubmitting, setFieldValue, resetForm }) => (
                        <Dialog
                            open={open}
                            onClose={handleClose}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <Form>
                                <DialogTitle 
                                    id="alert-dialog-title">{ratings ? i18n.t("messagesList.header.dialogRatingTitle") : i18n.t("messagesList.header.dialogClosingTitle")}
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText id="alert-dialog-description">
                                        {ratings && (
                                            <div style={{ marginTop: 8 }}>
                                                <Autocomplete
                                                    size="small"
                                                    options={dataRating}
                                                    name="ratingId"
                                                    getOptionLabel={(option) => option.name}
                                                    onChange={(e, value) => setFieldValue("ratingId", value?.id || "")}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            error={touched.ratingId && Boolean(errors.ratingId)}
                                                            helperText={touched.ratingId && errors.ratingId}
                                                            variant="outlined"
                                                            placeholder={i18n.t("messagesList.header.ratingTitle")}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </DialogContentText>
                                </DialogContent>

                                <DialogActions className={classes.botoes}>
                                    <Button
                                        onClick={e => handleCloseTicketWithoutFarewellMsg()}
                                        style={{ background: "#9200bf", color: "white" }}
                                    >
                                        {i18n.t("messagesList.header.dialogRatingWithoutFarewellMsg")}
                                    </Button>

                                    <Button
                                        onClick={e => handleUpdateTicketStatus(e, "closed", user?.id, ticket?.queue?.id)}
                                        style={{ background: "#9200bf", color: "white" }}
                                    >
                                        {i18n.t("messagesList.header.dialogRatingCancel")}
                                    </Button>

                                    {ratings && (
                                        <Button
                                            disabled={isSubmitting}
                                            variant="contained"
                                            type="submit"
                                            style={{ background: "#9200bf", color: "white" }}
                                        >
                                            {i18n.t("messagesList.header.dialogRatingSuccess")}
                                        </Button>
                                    )}
                                </DialogActions>
                            </Form>
                        </Dialog>
                    )}
                </Formik>
            </>
        </>
    );
};

export default TicketActionButtonsCustom;
