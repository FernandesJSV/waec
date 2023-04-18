import React, { useState, useEffect, useReducer, useContext, useRef } from "react";
import { socketConnection } from "../../services/socket";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";

import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import BlockIcon from "@material-ui/icons/Block";
import Archive from "@material-ui/icons/Archive"
import AddCircleOutline from "@material-ui/icons/AddCircleOutline"
import ImportContacts from "@material-ui/icons/ImportContacts"
import Search from "@material-ui/icons/Search"
import DeleteForever from "@material-ui/icons/DeleteForever"

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal/";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";

const reducer = (state, action) => {
    if (action.type === "LOAD_CONTACTS") {
        const contacts = action.payload;
        const newContacts = [];

        contacts.forEach((contact) => {
            const contactIndex = state.findIndex((c) => c.id === contact.id);
            if (contactIndex !== -1) {
                state[contactIndex] = contact;
            } else {
                newContacts.push(contact);
            }
        });

        return [...state, ...newContacts];
    }

    if (action.type === "UPDATE_CONTACTS") {
        const contact = action.payload;
        const contactIndex = state.findIndex((c) => c.id === contact.id);

        if (contactIndex !== -1) {
            state[contactIndex] = contact;
            return [...state];
        } else {
            return [contact, ...state];
        }
    }

    if (action.type === "DELETE_CONTACT") {
        const contactId = action.payload;

        const contactIndex = state.findIndex((c) => c.id === contactId);
        if (contactIndex !== -1) {
            state.splice(contactIndex, 1);
        }
        return [...state];
    }

    if (action.type === "RESET") {
        return [];
    }
};

const useStyles = makeStyles((theme) => ({
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
    },
    csvbtn: {
        textDecoration: 'none',
        flexDirection: 'row',
    },
    avatar: {
        width: "50px",
        height: "50px",
        borderRadius: "25%"
    }
}));

const Contacts = () => {
    const classes = useStyles();
    const history = useHistory();

    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [searchParam, setSearchParam] = useState("");
    const [contacts, dispatch] = useReducer(reducer, []);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [deletingContact, setDeletingContact] = useState(null);
    const [blockingContact, setBlockingContact] = useState(null);
    const [unBlockingContact, setUnBlockingContact] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmExcelOpen, setConfirmExcelOpen] = useState(false);
    const [deletingAllContact, setDeletingAllContact] = useState(null);
    const [confirmChatsOpen, setConfirmChatsOpen] = useState(false);
    const [exports, setExports] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const fileUploadRef = useRef(null);

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [searchParam]);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchContacts = async () => {
                try {
                    const { data } = await api.get("/contacts/", {
                        params: { searchParam, pageNumber },
                    });
                    dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
                    setHasMore(data.hasMore);
                    setLoading(false);
                } catch (err) {
                    toastError(err);
                }
            };
            fetchContacts();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber]);

    useEffect(() => {
        const companyId = localStorage.getItem("companyId");
        const socket = socketConnection({ companyId });

        socket.on(`company-${companyId}-contact`, (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
            }

            if (data.action === "delete") {
                dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase());
    };

    const handleOpenContactModal = () => {
        setSelectedContactId(null);
        setContactModalOpen(true);
    };

    const handleCloseContactModal = () => {
        setSelectedContactId(null);
        setContactModalOpen(false);
    };

    const handleSaveTicket = async (contactId) => {
        if (!contactId) return;
        setLoading(true);
        try {
            const { data: ticket } = await api.post("/tickets", {
                contactId: contactId,
                userId: user?.id,
                status: "open",
            });
            history.push(`/tickets/${ticket.id}`);
        } catch (err) {
            toastError(err);
        }
        setLoading(false);
    };

    const hadleEditContact = (contactId) => {
        setSelectedContactId(contactId);
        setContactModalOpen(true);
    };

    const handleDeleteContact = async (contactId) => {
        try {
            await api.delete(`/contacts/${contactId}`);
            toast.success(i18n.t("contacts.toasts.deleted"));
        } catch (err) {
            toastError(err);
        }
        setDeletingContact(null);
        setSearchParam("");
        setPageNumber(1);
    };

    const handleDeleteAllContact = async () => {
        try {
            await api.delete("/contacts");
            toast.success(i18n.t("contacts.toasts.deletedAll"));
            history.go(0);
        } catch (err) {
            toastError(err);
        }
        setDeletingAllContact(null);
        setSearchParam("");
        setPageNumber();
    };

    const handleBlockContact = async (contactId) => {
        try {
            await api.put(`/contacts/block/${contactId}`, { active: false });
            toast.success("Contato bloqueado");
        } catch (err) {
            toastError(err);
        }
        setDeletingContact(null);
        setSearchParam("");
        setPageNumber(1);
    };

    const handleUnBlockContact = async (contactId) => {
        try {
            await api.put(`/contacts/block/${contactId}`, { active: true });
            toast.success("Contato desbloqueado");
        } catch (err) {
            toastError(err);
        }
        setDeletingContact(null);
        setSearchParam("");
        setPageNumber(1);
    };

    const handleimportContact = async () => {
        try {
            await api.post("/contacts/import");
            history.go(0);
        } catch (err) {
            toastError(err);
        }
    };

    const handleImportContacts = async () => {
        try {
            const formData = new FormData();
            formData.append("file", fileUploadRef.current.files[0]);
            await api.request({
                url: `contacts/upload`,
                method: "POST",
                data: formData,
            });
        } catch (err) {
            toastError(err);
        }
    };

    const handleimportChats = async () => {
        try {
            await api.post("/contacts/import/chats");
            history.go(0);
        } catch (err) {
            toastError(err);
        }
    };

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

    function getDateLastMessage(contact) {
        if (!contact) return null;
        if (!contact.tickets) return null;

        if (contact.tickets.length > 0) {
            const date = new Date(
                contact.tickets[contact.tickets.length - 1].updatedAt
            );

            const day =
                date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            const hours = date.getHours();
            const minutes = date.getMinutes();

            return `${day}/${month}/${year} ${hours}:${minutes}`;
        }

        return null;
    }

    return (
        <MainContainer className={classes.mainContainer}>
            <ContactModal
                open={contactModalOpen}
                onClose={handleCloseContactModal}
                aria-labelledby="form-dialog-title"
                contactId={selectedContactId}
            ></ContactModal>

            <ConfirmationModal
                title={
                    deletingContact
                        ? `${i18n.t(
                            "contacts.confirmationModal.deleteTitle"
                        )} ${deletingContact.name}?`
                        : blockingContact
                            ? `Bloquear Contato ${blockingContact.name}?`
                            : unBlockingContact
                                ? `Desbloquear Contato ${unBlockingContact.name}?`
                                : `${i18n.t("contacts.confirmationModal.importTitlte")}`
                }
                open={confirmOpen}
                onClose={setConfirmOpen}
                onConfirm={(e) =>
                    deletingContact
                        ? handleDeleteContact(deletingContact.id)
                        : blockingContact
                            ? handleBlockContact(blockingContact.id)
                            : unBlockingContact
                                ? handleUnBlockContact(unBlockingContact.id)
                                : handleimportContact()
                }
            >
                {deletingContact
                    ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
                    : blockingContact
                        ? `Tem certeza que deseja bloquear este contato?`
                        : unBlockingContact
                            ? `Tem certeza que deseja desbloquear este contato?`
                            : `${i18n.t("contacts.confirmationModal.importMessage")}`}
            </ConfirmationModal>

            <ConfirmationModal
                title={"Importar Conversas"}
                open={confirmChatsOpen}
                onClose={setConfirmChatsOpen}
                onConfirm={(e) => handleimportChats()}
            >
                Deseja importar todos as conversas do telefone?
            </ConfirmationModal>

            <ConfirmationModal
                title={"Importar Excel"}
                open={confirmExcelOpen}
                onClose={setConfirmExcelOpen}
                onConfirm={(e) => handleImportContacts()}
            >
                Deseja importar o Excel?
            </ConfirmationModal>

            <MainHeader >
                <Title>{i18n.t("contacts.title")} ({contacts.length})</Title>
                <MainHeaderButtonsWrapper>
                    <TextField
                        placeholder={i18n.t("contacts.searchPlaceholder")}
                        type="search"
                        value={searchParam}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="secondary" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Can
                        role={user.profile}
                        perform="drawer-admin-items:view"
                        yes={() => (
                            <>
                                <Tooltip title={i18n.t("contacts.buttons.import")}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        onClick={() => {
                                            fileUploadRef.current.value = null;
                                            fileUploadRef.current.click();
                                        }}
                                    >
                                        {i18n.t("contactListItems.buttons.import")}
                                    </Button>
                                </Tooltip>
                            </>
                        )}
                    />

                    <Can
                        role={user.profile}
                        perform="drawer-admin-items:view"
                        yes={() => (
                            <>
                                <Tooltip title={i18n.t("contacts.buttons.import")}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={(e) => setConfirmOpen(true)}
                                    >
                                        <ImportContacts />
                                        &nbsp; {i18n.t("contacts.buttons.import")}
                                    </Button>
                                </Tooltip>
                            </>
                        )}
                    />

                    <Tooltip title={i18n.t("contacts.buttons.add")}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenContactModal}
                        >
                            <AddCircleOutline />
                            &nbsp; {i18n.t("contacts.buttons.add")}
                        </Button>
                    </Tooltip>

                    <Tooltip title={i18n.t("contacts.buttons.export")}>
                        <CSVLink
                            className={classes.csvbtn}
                            separator=";"
                            filename={'contacts.csv'}
                            data={
                                contacts.map((contact) => ({
                                    name: contact.name,
                                    number: contact.number,
                                    email: contact.email
                                }))
                            }>
                            <Button
                                variant="contained"
                                color="primary">
                                <Archive />
                                &nbsp; {i18n.t("contacts.buttons.export")}
                            </Button>
                        </CSVLink>
                    </Tooltip>

                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
                onScroll={handleScroll}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" />
                            <TableCell>
                                {i18n.t("contacts.table.name")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("contacts.table.whatsapp")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("contacts.table.email")}
                            </TableCell>
                            <TableCell align="center">
                                {"Ultimo mensaje"}
                            </TableCell>
                            <TableCell align="center">{"Status"}</TableCell>
                            <TableCell align="center">
                                {i18n.t("contacts.table.actions")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {contacts.map((contact) => (
                                <TableRow key={contact.id}>
                                    <TableCell style={{ paddingRight: 0 }}>
                                        {<Avatar src={contact.profilePicUrl} />}
                                    </TableCell>
                                    <TableCell>{contact.name}</TableCell>
                                    <TableCell align="center">
                                        {contact.number}
                                    </TableCell>
                                    <TableCell align="center">
                                        {contact.email}
                                    </TableCell>
                                    <TableCell align="center">
                                        {getDateLastMessage(contact)}
                                    </TableCell>
                                    <TableCell align="center">
                                        {contact.active ? (
                                            <CheckCircleIcon
                                                style={{ color: "green" }}
                                                fontSize="small"
                                            />
                                        ) : (
                                            <CancelIcon
                                                style={{ color: "red" }}
                                                fontSize="small"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleSaveTicket(contact.id)
                                            }
                                        >
                                            <WhatsAppIcon color="secondary" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                hadleEditContact(contact.id)
                                            }
                                        >
                                            <EditIcon color="secondary" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={
                                                contact.active
                                                    ? () => {
                                                        setConfirmOpen(true);
                                                        setBlockingContact(
                                                            contact
                                                        );
                                                    }
                                                    : () => {
                                                        setConfirmOpen(true);
                                                        setUnBlockingContact(
                                                            contact
                                                        );
                                                    }
                                            }
                                        >
                                            {contact.active ? (
                                                <BlockIcon color="secondary" />
                                            ) : (
                                                <CheckCircleIcon color="secondary" />
                                            )}
                                        </IconButton>
                                        <Can
                                            role={user.profile}
                                            perform="contacts-page:deleteContact"
                                            yes={() => (
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        setConfirmOpen(true);
                                                        setDeletingContact(
                                                            contact
                                                        );
                                                    }}
                                                >
                                                    <DeleteOutlineIcon color="secondary" />
                                                </IconButton>
                                            )}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton avatar columns={3} />}
                        </>
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default Contacts;
