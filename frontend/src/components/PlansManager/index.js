import React, { useState, useEffect } from "react";
import {
    makeStyles,
    Paper,
    Grid,
    TextField,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    IconButton,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@material-ui/core";
import { Formik, Form, Field } from 'formik';
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import { Edit as EditIcon } from "@material-ui/icons";

import { toast } from "react-toastify";
import usePlans from "../../hooks/usePlans";


const useStyles = makeStyles(theme => ({
    root: {
        width: '100%'
    },
    mainPaper: {
        width: '100%',
        flex: 1,
        padding: theme.spacing(2)
    },
    fullWidth: {
        width: '100%'
    },
    tableContainer: {
        width: '100%',
        overflowX: "scroll",
        ...theme.scrollbarStyles
    },
    textfield: {
        width: '100%'
    },
    textRight: {
        textAlign: 'right'
    },
    row: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    },
    control: {
        paddingRight: theme.spacing(1),
        paddingLeft: theme.spacing(1)
    },
    buttonContainer: {
        textAlign: 'right',
        padding: theme.spacing(1)
    }
}));

export function PlanManagerForm(props) {
    const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
    const classes = useStyles()

    const [record, setRecord] = useState({
        name: '',
        users: 0,
        connections: 0,
        queues: 0,
        amount: 0,
        useWhatsapp: true,
        useFacebook: true,
        useInstagram: true,
        useCampaigns: true,
        useSchedules: true,
        useInternalChat: true,
        useExternalApi: true,
    });

    useEffect(() => {
        setRecord(initialValue)
    }, [initialValue])

    const handleSubmit = async (data) => {
        onSubmit(data)
    }

    return (
        <Formik
            enableReinitialize
            className={classes.fullWidth}
            initialValues={record}
            onSubmit={(values, { resetForm }) =>
                setTimeout(() => {
                    handleSubmit(values)
                    resetForm()
                }, 500)
            }
        >
            {(values) => (
                <Form className={classes.fullWidth}>
                    <Grid spacing={2} justifyContent="flex-end" container>
                        
                        {/* NOME */}
                        <Grid xs={12} sm={6} md={2} item>
                            <Field
                                as={TextField}
                                label="Nome"
                                name="name"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                            />
                        </Grid>

                        {/* USUARIOS */}
                        <Grid xs={12} sm={6} md={1} item>
                            <Field
                                as={TextField}
                                label="Usuários"
                                name="users"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                                type="number"
                            />
                        </Grid>

                        {/* CONEXOES */}
                        <Grid xs={12} sm={6} md={1} item>
                            <Field
                                as={TextField}
                                label="Conexões"
                                name="connections"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                                type="number"
                            />
                        </Grid>
                        
                        {/* FILAS */}
                        <Grid xs={12} sm={6} md={1} item>
                            <Field
                                as={TextField}
                                label="Filas"
                                name="queues"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                                type="number"
                            />
                        </Grid>
                        
                        {/* VALOR */}
                        <Grid xs={12} sm={6} md={1} item>
                            <Field
                                as={TextField}
                                label="Valor"
                                name="amount"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                                type="string"
                            />
                        </Grid>
                        
                        {/* WHATSAPP */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useWhatsapp-selection">Whatsapp</InputLabel>
                                <Field
                                    as={Select}
                                    id="useWhatsapp-selection"
                                    label="Whatsapp"
                                    labelId="useWhatsapp-selection-label"
                                    name="useWhatsapp"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>Habilitadas</MenuItem>
                                    <MenuItem value={false}>Desabilitadas</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* FACEBOOK */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useFacebook-selection">Facebook</InputLabel>
                                <Field
                                    as={Select}
                                    id="useFacebook-selection"
                                    label="Facebook"
                                    labelId="useFacebook-selection-label"
                                    name="useFacebook"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>Habilitadas</MenuItem>
                                    <MenuItem value={false}>Desabilitadas</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* INSTAGRAM */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useInstagram-selection">Instagram</InputLabel>
                                <Field
                                    as={Select}
                                    id="useInstagram-selection"
                                    label="Instagram"
                                    labelId="useInstagram-selection-label"
                                    name="useInstagram"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>Habilitadas</MenuItem>
                                    <MenuItem value={false}>Desabilitadas</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* CAMPANHAS */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useCampaigns-selection">Campanhas</InputLabel>
                                <Field
                                    as={Select}
                                    id="useCampaigns-selection"
                                    label="Campanhas"
                                    labelId="useCampaigns-selection-label"
                                    name="useCampaigns"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>Habilitadas</MenuItem>
                                    <MenuItem value={false}>Desabilitadas</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* AGENDAMENTOS */}
                        <Grid xs={12} sm={8} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useSchedules-selection">Agendamentos</InputLabel>
                                <Field
                                    as={Select}
                                    id="useSchedules-selection"
                                    label="Agendamentos"
                                    labelId="useSchedules-selection-label"
                                    name="useSchedules"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>Habilitadas</MenuItem>
                                    <MenuItem value={false}>Desabilitadas</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* CHAT INTERNO */}
                        <Grid xs={12} sm={8} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useInternalChat-selection">Chat Interno</InputLabel>
                                <Field
                                    as={Select}
                                    id="useInternalChat-selection"
                                    label="Chat Interno"
                                    labelId="useInternalChat-selection-label"
                                    name="useInternalChat"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>Habilitadas</MenuItem>
                                    <MenuItem value={false}>Desabilitadas</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* API Externa */}
                        <Grid xs={12} sm={8} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useExternalApi-selection">API Externa</InputLabel>
                                <Field
                                    as={Select}
                                    id="useExternalApi-selection"
                                    label="API Externa"
                                    labelId="useExternalApi-selection-label"
                                    name="useExternalApi"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>Habilitadas</MenuItem>
                                    <MenuItem value={false}>Desabilitadas</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        <Grid sm={3} md={1} item>
                            <ButtonWithSpinner className={classes.fullWidth} loading={loading} onClick={() => onCancel()} variant="contained">
                                Limpar
                            </ButtonWithSpinner>
                        </Grid>
                        {record.id !== undefined ? (
                            <Grid sm={3} md={1} item>
                                <ButtonWithSpinner className={classes.fullWidth} loading={loading} onClick={() => onDelete(record)} variant="contained" color="secondary">
                                    Excluir
                                </ButtonWithSpinner>
                            </Grid>
                        ) : null}
                        <Grid sm={3} md={1} item>
                            <ButtonWithSpinner className={classes.fullWidth} loading={loading} type="submit" variant="contained" color="primary">
                                Salvar
                            </ButtonWithSpinner>
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik>
    )
}

export function PlansManagerGrid(props) {
    const { records, onSelect } = props
    const classes = useStyles()

    const renderWhatsapp = (row) => {
        return row.useWhatsapp === false ? "Não" : "Sim";
    };

    const renderFacebook = (row) => {
        return row.useFacebook === false ? "Não" : "Sim";
    };

    const renderInstagram = (row) => {
        return row.useInstagram === false ? "Não" : "Sim";
    };

    const renderCampaigns = (row) => {
        return row.useCampaigns === false ? "Não" : "Sim";
    };

    const renderSchedules = (row) => {
        return row.useSchedules === false ? "Não" : "Sim";
    };

    const renderInternalChat = (row) => {
        return row.useInternalChat === false ? "Não" : "Sim";
    };

    const renderExternalApi = (row) => {
        return row.useExternalApi === false ? "Não" : "Sim";
    };

    return (
        <Paper className={classes.tableContainer}>
            <Table
                className={classes.fullWidth}
                // size="small"
                padding="none"
                aria-label="a dense table"
            >
                <TableHead>
                    <TableRow>
                        <TableCell align="center" style={{ width: '1%' }}>#</TableCell>
                        <TableCell align="left">Nome</TableCell>
                        <TableCell align="center">Usuários</TableCell>
                        <TableCell align="center">Conexões</TableCell>
                        <TableCell align="center">Filas</TableCell>
                        <TableCell align="center">Valor</TableCell>
                        <TableCell align="center">Whatsapp</TableCell>
                        <TableCell align="center">Facebook</TableCell>
                        <TableCell align="center">Instagram</TableCell>
                        <TableCell align="center">Campanhas</TableCell>
                        <TableCell align="center">Agendamentos</TableCell>
                        <TableCell align="center">Chat Interno</TableCell>
                        <TableCell align="center">API Externa</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {records.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell align="center" style={{ width: '1%' }}>
                                <IconButton onClick={() => onSelect(row)} aria-label="delete">
                                    <EditIcon />
                                </IconButton>
                            </TableCell>
                            <TableCell align="left">{row.name || '-'}</TableCell>
                            <TableCell align="center">{row.users || '-'}</TableCell>
                            <TableCell align="center">{row.connections || '-'}</TableCell>
                            <TableCell align="center">{row.queues || '-'}</TableCell>
                            <TableCell align="center">$ {row.amount ? row.amount.toLocaleString('pt-br', { minimumFractionDigits: 2 }) : '00.00'}</TableCell>
                            <TableCell align="center">{renderWhatsapp(row)}</TableCell>
                            <TableCell align="center">{renderFacebook(row)}</TableCell>
                            <TableCell align="center">{renderInstagram(row)}</TableCell>
                            <TableCell align="center">{renderCampaigns(row)}</TableCell>
                            <TableCell align="center">{renderSchedules(row)}</TableCell>
                            <TableCell align="center">{renderInternalChat(row)}</TableCell>
                            <TableCell align="center">{renderExternalApi(row)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    )
}

export default function PlansManager() {
    const classes = useStyles()
    const { list, save, update, remove } = usePlans()

    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [records, setRecords] = useState([])
    const [record, setRecord] = useState({
        name: '',
        users: 0,
        connections: 0,
        queues: 0,
        amount: 0,
        useWhatsapp: true,
        useFacebook: true,
        useInstagram: true,
        useCampaigns: true,
        useSchedules: true,
        useInternalChat: true,
        useExternalApi: true,
    })

    useEffect(() => {
        async function fetchData() {
            await loadPlans()
        }
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loadPlans = async () => {
        setLoading(true)
        try {
            const planList = await list()
            setRecords(planList)
        } catch (e) {
            toast.error('Não foi possível carregar a lista de registros')
        }
        setLoading(false)
    }

    const handleSubmit = async (data) => {
        setLoading(true)
        try {
            if (data.id !== undefined) {
                await update(data)
            } else {
                await save(data)
            }
            await loadPlans()
            handleCancel()
            toast.success('Operação realizada com sucesso!')
        } catch (e) {
            toast.error('Não foi possível realizar a operação. Verifique se já existe uma plano com o mesmo nome ou se os campos foram preenchidos corretamente')
        }
        setLoading(false)
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            await remove(record.id)
            await loadPlans()
            handleCancel()
            toast.success('Operação realizada com sucesso!')
        } catch (e) {
            toast.error('Não foi possível realizar a operação')
        }
        setLoading(false)
    }

    const handleOpenDeleteDialog = () => {
        setShowConfirmDialog(true)
    }

    const handleCancel = () => {
        setRecord({
            name: '',
            users: 0,
            connections: 0,
            queues: 0,
            amount: 0,
            useWhatsapp: true,
            useFacebook: true,
            useInstagram: true,
            useCampaigns: true,
            useSchedules: true,
            useInternalChat: true,
            useExternalApi: true,
        })
    }

    const handleSelect = (data) => {

        let useWhatsapp = data.useWhatsapp === false ? false : true
        let useFacebook = data.useFacebook === false ? false : true
        let useInstagram = data.useInstagram === false ? false : true
        let useCampaigns = data.useCampaigns === false ? false : true
        let useSchedules = data.useSchedules === false ? false : true
        let useInternalChat = data.useInternalChat === false ? false : true
        let useExternalApi = data.useExternalApi === false ? false : true

        setRecord({
            id: data.id,
            name: data.name || '',
            users: data.users || 0,
            connections: data.connections || 0,
            queues: data.queues || 0,
            amount: data.amount.toLocaleString('pt-br', { minimumFractionDigits: 2 }) || 0,
            useWhatsapp,
            useFacebook,
            useInstagram,
            useCampaigns,
            useSchedules,
            useInternalChat,
            useExternalApi
        })
    }

    return (
        <Paper className={classes.mainPaper} elevation={0}>
            <Grid spacing={2} container>
                <Grid xs={12} item>
                    <PlanManagerForm
                        initialValue={record}
                        onDelete={handleOpenDeleteDialog}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                </Grid>
                <Grid xs={12} item>
                    <PlansManagerGrid
                        records={records}
                        onSelect={handleSelect}
                    />
                </Grid>
            </Grid>
            <ConfirmationModal
                title="Exclusão de Registro"
                open={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={() => handleDelete()}
            >
                Deseja realmente excluir esse registro?
            </ConfirmationModal>
        </Paper>
    )
}