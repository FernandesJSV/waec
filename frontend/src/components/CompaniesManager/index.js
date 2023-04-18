import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Select,
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import { Edit as EditIcon } from "@material-ui/icons";

import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies";
import usePlans from "../../hooks/usePlans";
import ModalUsers from "../ModalUsers";
import api from "../../services/api";
import { head, isArray, has } from "lodash";
import { useDate } from "../../hooks/useDate";

import moment from "moment";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: "2px"
  },
  mainPaper: {
    width: "100%",
    flex: 1,
    // padding: theme.spacing(2), //comentado para retirar o scroll do Empresas
  },
  fullWidth: {
    width: "100%",
  },
  tableContainer: {
    width: "100%",
    // overflowX: "scroll",
    // ...theme.scrollbarStyles,
    padding: "2px",
  },
  textfield: {
    width: "100%",
  },
  textRight: {
    textAlign: "right",
  },
  row: {
    // paddingTop: theme.spacing(2),
    // paddingBottom: theme.spacing(2),
  },
  control: {
    // paddingRight: theme.spacing(1),
    // paddingLeft: theme.spacing(1),
  },
  buttonContainer: {
    textAlign: "right",
    // padding: theme.spacing(1),
  },
}));

export function CompanyForm(props) {
  const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
  const classes = useStyles();
  const [plans, setPlans] = useState([]);
  const [modalUser, setModalUser] = useState(false);
  const [firstUser, setFirstUser] = useState({});

  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    // campaignsEnabled: false,
    dueDate: "",
    recurrence: "",
    password: "",
    ...initialValue,
  });

  const { list: listPlans } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const list = await listPlans();
      setPlans(list);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRecord((prev) => {
      if (moment(initialValue).isValid()) {
        initialValue.dueDate = moment(initialValue.dueDate).format(
          "YYYY-MM-DD"
        );
      }
      return {
        ...prev,
        ...initialValue,
      };
    });
  }, [initialValue]);

  const handleSubmit = async (data) => {
    if (data.dueDate === "" || moment(data.dueDate).isValid() === false) {
      data.dueDate = null;
    }
    onSubmit(data);
    setRecord({ ...initialValue, dueDate: "" });
  };

  const handleOpenModalUsers = async () => {
    try {
      const { data } = await api.get("/users/list", {
        params: {
          companyId: initialValue.id,
        },
      });
      if (isArray(data) && data.length) {
        setFirstUser(head(data));
      }
      setModalUser(true);
    } catch (e) {
      toast.error(e);
    }
  };

  const handleCloseModalUsers = () => {
    setFirstUser({});
    setModalUser(false);
  };

  const incrementDueDate = () => {
    const data = { ...record };
    if (data.dueDate !== "" && data.dueDate !== null) {
      switch (data.recurrence) {
        case "MENSAL":
          data.dueDate = moment(data.dueDate)
            .add(1, "month")
            .format("YYYY-MM-DD");
          break;
        case "BIMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(2, "month")
            .format("YYYY-MM-DD");
          break;
        case "TRIMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(3, "month")
            .format("YYYY-MM-DD");
          break;
        case "SEMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(6, "month")
            .format("YYYY-MM-DD");
          break;
        case "ANUAL":
          data.dueDate = moment(data.dueDate)
            .add(12, "month")
            .format("YYYY-MM-DD");
          break;
        default:
          break;
      }
    }
    setRecord(data);
  };

  return (
    <>
      <ModalUsers
        userId={firstUser.id}
        companyId={initialValue.id}
        open={modalUser}
        onClose={handleCloseModalUsers}
      />
      <Formik
        enableReinitialize
        className={classes.fullWidth}
        initialValues={record}
        onSubmit={(values, { resetForm }) =>
          setTimeout(() => {
            handleSubmit(values);
            resetForm();
          }, 500)
        }
      >
        {(values, setValues) => (
          <Form className={classes.fullWidth}>
            <Grid spacing={1} justifyContent="center" container>
              <Grid xs={12} sm={6} md={3} item>
                <Field
                  as={TextField}
                  label="Nome"
                  name="name"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label="E-mail"
                  name="email"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                  required
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label="Senha"
                  name="password"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label="Telefone"
                  name="phone"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="plan-selection">Plano</InputLabel>
                  <Field
                    as={Select}
                    id="plan-selection"
                    label="Plano"
                    labelId="plan-selection-label"
                    name="planId"
                    margin="dense"
                    required
                  >
                    {plans.map((plan, key) => (
                      <MenuItem key={key} value={plan.id}>
                        {plan.name}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={1} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="status-selection">Ativa</InputLabel>
                  <Field
                    as={Select}
                    id="status-selection"
                    label="Ativa"
                    labelId="status-selection-label"
                    name="status"
                    margin="dense"
                  >
                    <MenuItem value={true}>Sim</MenuItem>
                    <MenuItem value={false}>Não</MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              {/* <Grid xs={12} sm={6} md={3} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="payment-method-selection">
                    Método de Pagamento
                  </InputLabel>
                  <Field
                    as={Select}
                    id="payment-method-selection"
                    label="Método de Pagamento"
                    labelId="payment-method-selection-label"
                    name="paymentMethod"
                    margin="dense"
                  >
                    <MenuItem value={"pix"}>PIX</MenuItem>
                  </Field>
                </FormControl>
              </Grid> */}
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label="CPF/CNPJ"
                  name="document"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                />
              </Grid>
              {/* <Grid xs={12} sm={6} md={2} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="status-selection">Campanhas</InputLabel>
                  <Field
                    as={Select}
                    id="campaigns-selection"
                    label="Campanhas"
                    labelId="campaigns-selection-label"
                    name="campaignsEnabled"
                    margin="dense"
                  >
                    <MenuItem value={true}>Habilitadas</MenuItem>
                    <MenuItem value={false}>Desabilitadas</MenuItem>
                  </Field>
                </FormControl>
              </Grid> */}
              <Grid xs={12} sm={6} md={2} item>
                <FormControl variant="outlined" fullWidth>
                  <Field
                    as={TextField}
                    label="Data de Vencimento"
                    type="date"
                    name="dueDate"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                    fullWidth
                    margin="dense"
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="recorrencia-selection">
                    Recorrência
                  </InputLabel>
                  <Field
                    as={Select}
                    label="Recorrência"
                    labelId="recorrencia-selection-label"
                    id="recurrence"
                    name="recurrence"
                    margin="dense"
                  >
                    <MenuItem value="MENSAL">Mensal</MenuItem>
                    <MenuItem value="BIMESTRAL">Bimestral</MenuItem>
                    <MenuItem value="TRIMESTRAL">Trimestral</MenuItem>
                    <MenuItem value="SEMESTRAL">Semestral</MenuItem>
                    <MenuItem value="ANUAL">Anual</MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              <Grid xs={12} item>
                <Grid justifyContent="flex-end" spacing={1} container>
                  <Grid xs={4} md={1} item>
                    <ButtonWithSpinner
                      className={classes.fullWidth}
                      style={{ marginTop: 7 }}
                      loading={loading}
                      onClick={() => onCancel()}
                      variant="contained"
                    >
                      Limpar
                    </ButtonWithSpinner>
                  </Grid>
                  {record.id !== undefined ? (
                    <>
                      <Grid xs={6} md={1} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => onDelete(record)}
                          variant="contained"
                          color="secondary"
                        >
                          Excluir
                        </ButtonWithSpinner>
                      </Grid>
                      <Grid xs={6} md={2} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => incrementDueDate()}
                          variant="contained"
                          color="primary"
                        >
                          + Vencimento
                        </ButtonWithSpinner>
                      </Grid>
                      <Grid xs={6} md={1} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => handleOpenModalUsers()}
                          variant="contained"
                          color="primary"
                        >
                          Usuário
                        </ButtonWithSpinner>
                      </Grid>
                    </>
                  ) : null}
                  <Grid xs={6} md={1} item>
                    <ButtonWithSpinner
                      className={classes.fullWidth}
                      style={{ marginTop: 7 }}
                      loading={loading}
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Salvar
                    </ButtonWithSpinner>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
}

export function CompaniesManagerGrid(props) {
  const { records, onSelect } = props;
  const classes = useStyles();
  const { dateToClient, datetimeToClient } = useDate();

  const renderStatus = (row) => {
    return row.status === false ? "Não" : "Sim";
  };

  const renderPlan = (row) => {
    return row.planId !== null ? row.plan.name : "-";
  };

  const renderPlanValue = (row) => {
    return row.planId !== null ? row.plan.amount ? row.plan.amount.toLocaleString('pt-br', { minimumFractionDigits: 2 }) : '00.00' : "-";
  };

  // const renderCampaignsStatus = (row) => {
  //   if (
  //     has(row, "settings") &&
  //     isArray(row.settings) &&
  //     row.settings.length > 0
  //   ) {
  //     const setting = row.settings.find((s) => s.key === "campaignsEnabled");
  //     if (setting) {
  //       return setting.value === "true" ? "Habilitadas" : "Desabilitadas";
  //     }
  //   }
  //   return "Desabilitadas";
  // };

  const rowStyle = (record) => {
    if (moment(record.dueDate).isValid()) {
      const now = moment();
      const dueDate = moment(record.dueDate);
      const diff = dueDate.diff(now, "days");
      if (diff >= 1 && diff <= 5) {
        return { backgroundColor: "#fffead" };
      }
      if (diff <= 0) {
        return { backgroundColor: "#fa8c8c" };
      }
      // else {
      //   return { backgroundColor: "#affa8c" };
      // }
    }
    return {};
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
            <TableCell align="center" style={{ width: "1%" }}>#</TableCell>
            <TableCell align="left">Nome</TableCell>
            <TableCell align="left">E-mail</TableCell>
            <TableCell align="center">Telefone</TableCell>
            <TableCell align="center">Plano</TableCell>
            <TableCell align="center">Valor Plano</TableCell>
            {/* <TableCell align="center">Campanhas</TableCell> */}
            <TableCell align="center">Ativa</TableCell>
            <TableCell align="center">Criada Em</TableCell>
            <TableCell align="center">Vencimento</TableCell>
            <TableCell align="center">Ult. Login</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((row, key) => (
            <TableRow style={rowStyle(row)} key={key}>
              <TableCell align="center" style={{ width: "1%" }}>
                <IconButton onClick={() => onSelect(row)} aria-label="delete">
                  <EditIcon />
                </IconButton>
              </TableCell>
              <TableCell align="left">{row.name || "-"}</TableCell>
              <TableCell align="left" size="small">{row.email || "-"}</TableCell>
              <TableCell align="center">{row.phone || "-"}</TableCell>
              <TableCell align="center">{renderPlan(row)}</TableCell>
              <TableCell align="center">$ {renderPlanValue(row)}</TableCell>
              {/* <TableCell align="center">{renderCampaignsStatus(row)}</TableCell> */}
              <TableCell align="center">{renderStatus(row)}</TableCell>
              <TableCell align="center">{dateToClient(row.createdAt)}</TableCell>
              <TableCell align="center">{dateToClient(row.dueDate)}<br /><span>{row.recurrence}</span></TableCell>
              <TableCell align="center">{datetimeToClient(row.lastLogin)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default function CompaniesManager() {
  const classes = useStyles();
  const { list, save, update, remove } = useCompanies();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    // campaignsEnabled: false,
    dueDate: "",
    recurrence: "",
    password: "",
    document: "",
    paymentMethod: ""
  });

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const companyList = await list();
      setRecords(companyList);
    } catch (e) {
      toast.error("Não foi possível carregar a lista de registros");
    }
    setLoading(false);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (data.id !== undefined) {
        await update(data);
      } else {
        await save(data);
      }
      await loadPlans();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error(
        "Não foi possível realizar a operação. Verifique se já existe uma empresa com o mesmo nome ou se os campos foram preenchidos corretamente"
      );
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadPlans();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error("Não foi possível realizar a operação");
    }
    setLoading(false);
  };

  const handleOpenDeleteDialog = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    setRecord((prev) => ({
      ...prev,
      name: "",
      email: "",
      phone: "",
      planId: "",
      status: true,
      // campaignsEnabled: false,
      dueDate: "",
      recurrence: "",
      password: "",
      document: "",
      paymentMethod: ""
    }));
  };

  const handleSelect = (data) => {
    // let campaignsEnabled = false;

    // const setting = data.settings.find(
    //   (s) => s.key.indexOf("campaignsEnabled") > -1
    // );
    // if (setting) {
    //   campaignsEnabled = setting.value === "true" || setting.value === "enabled";
    // }

    setRecord((prev) => ({
      ...prev,
      id: data.id,
      name: data.name || "",
      phone: data.phone || "",
      email: data.email || "",
      planId: data.planId || "",
      status: data.status === false ? false : true,
      // campaignsEnabled,
      dueDate: data.dueDate || "",
      recurrence: data.recurrence || "",
      password: "",
      document: data.document || "",
      paymentMethod: data.paymentMethod || "",
    }));
  };

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <Grid spacing={2} container>
        <Grid xs={12} item>
          <CompanyForm
            initialValue={record}
            onDelete={handleOpenDeleteDialog}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </Grid>
        <Grid xs={12} item>
          <CompaniesManagerGrid records={records} onSelect={handleSelect} />
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
  );
}
