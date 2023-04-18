import React, { useContext, useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import usePlans from "../../hooks/usePlans";

import { makeStyles, createTheme, ThemeProvider } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import TicketOptionsMenu from "../TicketOptionsMenu";
import ButtonWithSpinner from "../ButtonWithSpinner";
import TransferTicketModalCustom from "../TransferTicketModalCustom";
import { Can } from "../Can";
import ConfirmationModal from "../ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import Tooltip from '@material-ui/core/Tooltip';
import { green, blue } from '@material-ui/core/colors';
import ScheduleModal from "../ScheduleModal";
import MenuItem from "@material-ui/core/MenuItem";
import { Switch } from "@material-ui/core";

//icones
import { MoreVert, Replay } from "@material-ui/icons";
import EventIcon from "@material-ui/icons/Event";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import CachedOutlinedIcon from "@material-ui/icons/CachedOutlined";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import UndoIcon from '@material-ui/icons/Undo';
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';

const useStyles = makeStyles((theme) => ({
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
}));

const TicketActionButtonsCustom = ({ ticket, handleClose }) => {
	const classes = useStyles();
	const history = useHistory();
	const [anchorEl, setAnchorEl] = useState(null);
	const [loading, setLoading] = useState(false);
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);
	const { setCurrentTicket } = useContext(TicketsContext);
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
	const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
	const [contactId, setContactId] = useState(null);
	const [acceptAudioMessage, setAcceptAudio] = useState(ticket.contact.acceptAudioMessage);
	const [showSchedules, setShowSchedules] = useState(false);

	const { getPlanCompany } = usePlans();

	useEffect(() => {
		async function fetchData() {
			const companyId = localStorage.getItem("companyId");
			const planConfigs = await getPlanCompany(undefined, companyId);
			setShowSchedules(planConfigs.plan.useSchedules);
		}
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const handleOpenTransferModal = (e) => {
		setTransferTicketModalOpen(true);
		if (typeof handleClose == "function") handleClose();
	};

	const handleOpenConfirmationModal = (e) => {
		setConfirmationOpen(true);
		if (typeof handleClose == "function") handleClose();
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

	const handleOpenScheduleModal = () => {
		if (typeof handleClose == "function") handleClose();
		setContactId(ticket.contact.id);
		setScheduleModalOpen(true);
	}

	const handleCloseScheduleModal = () => {
		setScheduleModalOpen(false);
		setContactId(null);
	}

	return (
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
						<Tooltip title="Devolver a Fila">
							<UndoIcon
								color="primary"
								onClick={(e) => handleUpdateTicketStatus(e, "pending", null)}
							/>
						</Tooltip>
					</IconButton>

					<IconButton className={classes.bottomButtonVisibilityIcon}>
						<Tooltip title="Cerrar Conversación con mensaje de despedida">
							<HighlightOffIcon
								color="primary"
								onClick={(e) => handleUpdateTicketStatus(e, "closed", user?.id)}
							/>
						</Tooltip>
					</IconButton>

					<IconButton className={classes.bottomButtonVisibilityIcon}>
						<Tooltip title="Cerrar Conversación Sin Mensaje de Despedida">
							<CancelPresentationIcon
								color="primary"
								onClick={(e) => handleCloseTicketWithoutFarewellMsg()}
							/>
						</Tooltip>
					</IconButton>

					<IconButton className={classes.bottomButtonVisibilityIcon}>
						<Tooltip title="Transferir Conversación">
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
	);
};

export default TicketActionButtonsCustom;
