import React, {
    useState,
    useEffect,
    useReducer,
    useCallback,
    useContext,
} from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import RatingModal from "../../components/RatingModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { socketConnection } from "../../services/socket";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
    if (action.type === "LOAD_RATINGS") {
        const ratings = action.payload;
        const newRatings = [];

        ratings.forEach((rating) => {
            const ratingIndex = state.findIndex((s) => s.id === rating.id);
            if (ratingIndex !== -1) {
                state[ratingIndex] = rating;
            } else {
                newRatings.push(rating);
            }
        });

        return [...state, ...newRatings];
    }

    if (action.type === "UPDATE_RATINGS") {
        const rating = action.payload;
        const ratingIndex = state.findIndex((s) => s.id === rating.id);

        if (ratingIndex !== -1) {
            state[ratingIndex] = rating;
            return [...state];
        } else {
            return [rating, ...state];
        }
    }

    if (action.type === "DELETE_TAG") {
        const ratingId = action.payload;

        const ratingIndex = state.findIndex((s) => s.id === ratingId);
        if (ratingIndex !== -1) {
            state.splice(ratingIndex, 1);
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
}));

const Ratings = () => {
    const classes = useStyles();

    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedRating, setSelectedRating] = useState(null);
    const [deletingRating, setDeletingRating] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [searchParam, setSearchParam] = useState("");
    const [ratings, dispatch] = useReducer(reducer, []);
    const [ratingModalOpen, setRatingModalOpen] = useState(false);

    const fetchRatings = useCallback(async () => {
        try {
            const { data } = await api.get("/ratings/", {
                params: { searchParam, pageNumber },
            });
            dispatch({ type: "LOAD_RATINGS", payload: data.ratings });
            setHasMore(data.hasMore);
            setLoading(false);
        } catch (err) {
            toastError(err);
        }
    }, [searchParam, pageNumber]);

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [searchParam]);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            fetchRatings();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber, fetchRatings]);

    useEffect(() => {
        const socket = socketConnection({ companyId: user.companyId });

        socket.on("user", (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_RATINGS", payload: data.ratings });
            }

            if (data.action === "delete") {
                dispatch({ type: "DELETE_USER", payload: +data.ratingId });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const handleOpenRatingModal = () => {
        setSelectedRating(null);
        setRatingModalOpen(true);
    };

    const handleCloseRatingModal = () => {
        setSelectedRating(null);
        setRatingModalOpen(false);
    };

    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase());
    };

    const handleEditRating = (rating) => {
        setSelectedRating(rating);
        setRatingModalOpen(true);
    };

    const handleDeleteRating = async (ratingId) => {
        try {
            await api.delete(`/ratings/${ratingId}`);
            toast.success(i18n.t("ratings.toasts.deleted"));
        } catch (err) {
            toastError(err);
        }
        setDeletingRating(null);
        setSearchParam("");
        setPageNumber(1);

        dispatch({ type: "RESET" });
        setPageNumber(1);
        await fetchRatings();
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

    return (
        <MainContainer>
            <ConfirmationModal
                title={deletingRating && `${i18n.t("ratings.confirmationModal.deleteTitle")}`}
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                onConfirm={() => handleDeleteRating(deletingRating.id)}
            >
                {i18n.t("ratings.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <RatingModal
                open={ratingModalOpen}
                onClose={handleCloseRatingModal}
                reload={fetchRatings}
                aria-labelledby="form-dialog-title"
                ratingId={selectedRating && selectedRating.id}
            />
            <MainHeader>
                <Title>{i18n.t("ratings.title")} ({ratings.length})</Title>
                <MainHeaderButtonsWrapper>
                    <TextField
                        placeholder={i18n.t("contacts.searchPlaceholder")}
                        type="search"
                        value={searchParam}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon style={{ color: "gray" }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenRatingModal}
                    >
                        {i18n.t("ratings.buttons.add")}
                    </Button>
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
                            <TableCell align="center">{i18n.t("ratings.table.name")}</TableCell>
                            <TableCell align="center">
                                {i18n.t("ratings.table.actions")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {ratings.map((rating) => (
                                <TableRow key={rating.id}>
                                    <TableCell align="center">
                                        {rating.name}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => handleEditRating(rating)}>
                                            <EditIcon />
                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                setConfirmModalOpen(true);
                                                setDeletingRating(rating);
                                            }}
                                        >
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton columns={4} />}
                        </>
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default Ratings;
