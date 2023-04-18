import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { useHistory } from "react-router-dom";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import TicketListForwardMessageItem from "../TicketListForwardMessageItem";

const useStyles = makeStyles(theme => ({
    selectedTicketBackground: {
        backgroundColor: "#4caf50",
    }
}))

const ForwardMessageModal = ({ modalOpen, onClose, message }) => {
    const classes = useStyles();
    const history = useHistory();
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        const loadTickets = () => {
            try {
                api.get("/tickets/").then((data => {
                    setTickets(data.data.tickets);
                }));
            } catch (err) {
                const errorMsg = err.response?.data?.error;
                if (errorMsg) {
                    if (i18n.exists(`backendErrors.${errorMsg}`)) {
                        toast.error(i18n.t(`backendErrors.${errorMsg}`));
                    } else {
                        toast.error(err.response.data.error);
                    }
                } else {
                    toast.error("Unknown error");
                }
            }
        }
        loadTickets()
    }, [])

    const handleClose = () => {
        onClose();
        setSelectedTicket(null);
    };

    const handleForwardMessage = async data => {
        data.preventDefault();
        message.isForwarded = true;
        await api.post(`/messages/${selectedTicket.id}`, message);
        history.push(`/tickets/${selectedTicket.uuid}`);
        handleClose()
    }

    const getData = (val) => {
        setSelectedTicket(val);
    }

    return (
        <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
            <form onSubmit={handleForwardMessage}>
                <DialogTitle id="form-dialog-title">
                    {i18n.t("forwardMessageModal.title")}
                </DialogTitle>
                <DialogContent>
                    {tickets.map(ticket => (
                        <div key={ticket.id}
                            className={clsx(classes.ticket, {
                                [classes.selectedTicketBackground]: ticket === selectedTicket
                            })}
                        >
                            {
                                ticket.status === 'open' ?
                                    (<TicketListForwardMessageItem ticket={ticket} selectedTicket={selectedTicket} sendData={getData} />) :
                                    null
                            }
                        </div>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        color="secondary"
                        variant="outlined"
                    >
                        {i18n.t("transferTicketModal.buttons.cancel")}
                    </Button>
                    <ButtonWithSpinner
                        variant="contained"
                        type="submit"
                        color="primary"
                    >
                        {i18n.t("forwardMessageModal.buttons.ok")}
                    </ButtonWithSpinner>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ForwardMessageModal;