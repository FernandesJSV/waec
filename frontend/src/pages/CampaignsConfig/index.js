import React, { useEffect, useState } from "react";
import { Field } from "formik";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import api from "../../services/api";
import usePlans from "../../hooks/usePlans";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import ConfirmationModal from "../../components/ConfirmationModal";
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    // padding: theme.padding,
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  textRight: {
    textAlign: "right",
  },
  tabPanelsContainer: {
    // padding: theme.spacing(2),
    padding: theme.padding,
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
  },

}));

const initialSettings = {
  messageInterval: 20,
  longerIntervalAfter: 20,
  greaterInterval: 60,
  variables: [],
  // sabado: "false",
  // domingo: "false",
  // startHour: "09:00",
  // endHour: "18:00"
};

const CampaignsConfig = () => {
  const classes = useStyles();
  const history = useHistory();

  const [settings, setSettings] = useState(initialSettings);
  const [showVariablesForm, setShowVariablesForm] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [variable, setVariable] = useState({ key: "", value: "" });

  // const [sabado, setSabado] = React.useState(false);
  // const [domingo, setDomingo] = React.useState(false);

  // const [startHour, setStartHour] = useState("08:00");
  // const [endHour, setEndHour] = useState("19:00");

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = localStorage.getItem("companyId");
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useCampaigns) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.get("/campaign-settings").then(({ data }) => {
      const settingsList = [];
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((item) => {
          settingsList.push([item.key, JSON.parse(item.value)]);
        });
        setSettings(Object.fromEntries(settingsList));
      }
    });
  }, []);

  const handleOnChangeVariable = (e) => {
    if (e.target.value !== null) {
      const changedProp = {};
      changedProp[e.target.name] = e.target.value;
      setVariable((prev) => ({ ...prev, ...changedProp }));
    }
  };

  const handleOnChangeSettings = (e) => {
    const changedProp = {};
    changedProp[e.target.name] = e.target.value;
    setSettings((prev) => ({ ...prev, ...changedProp }));
  };

  const addVariable = () => {
    setSettings((prev) => {
      const variablesExists = settings.variables.filter(
        (v) => v.key === variable.key
      );
      const variables = prev.variables;
      if (variablesExists.length === 0) {
        variables.push(Object.assign({}, variable));
        setVariable({ key: "", value: "" });
      }
      return { ...prev, variables };
    });
  };

  const removeVariable = () => {
    const newList = settings.variables.filter((v) => v.key !== selectedKey);
    setSettings((prev) => ({ ...prev, variables: newList }));
    setSelectedKey(null);
  };

  const saveSettings = async () => {
    await api.post("/campaign-settings", { settings });
    toast.success("Configurações salvas");
  };

  // const handleChange = (event) => {
  //   if (event.target.name === "sabado") {
  //     setSabado(event.target.checked);
  //   }
  //   if (event.target.name === "domingo") {
  //     setDomingo(event.target.checked);
  //   }
  // };

  // const handleSaveTimeMass = async () => {
  //   let settings = {
  //     sabado: sabado,
  //     domingo: domingo,
  //     startHour: startHour,
  //     endHour: endHour
  //   }

  //   try {
  //     await api.post(`/campaign-settings/`, { settings });

  //     toast.success(i18n.t("settings.success"));
  //   } catch (err) {
  //     toastError(err);
  //   }
  // };

  return (
    <MainContainer>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={removeVariable}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <MainHeader>
        <Grid style={{ width: "99.6%" }} container>
          <Grid xs={12} item>
            <Title>{i18n.t("campaignsConfig.title")}</Title>
          </Grid>
        </Grid>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">

        {/* <Typography component={"h1"}>Período de Disparo das Campanhas &nbsp;</Typography>
        <Paper className={classes.paper}>
          <TextField
            id="buttonText"
            label="Começar o envio que hora?"
            margin="dense"
            variant="outlined"
            fullWidth
            value={startHour}
            onChange={(e) => handleChange(e.target.value)}
            style={{ marginRight: "10px" }}
          />

          <TextField
            id="buttonText"
            label="Terminar o envio que hora?"
            margin="dense"
            variant="outlined"
            fullWidth
            value={endHour}
            onChange={(e) => handleChange(e.target.value)}
            style={{ marginRight: "10px" }}
          />

          <FormControlLabel
            control={<Checkbox checked={sabado} onChange={handleChange} name="sabado" />}
            label="Sábado"
          />

          <FormControlLabel
            control={<Checkbox checked={domingo} onChange={handleChange} name="domingo" />}
            label="Domigo"
          />

          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => {
              handleSaveTimeMass();
            }}
            style={{ marginRight: "10px" }}
          >
            Salvar
          </Button>

        </Paper> */}

        <Box className={classes.tabPanelsContainer}>
          <Grid spacing={1} container>
            <Grid xs={12} item>
              <Typography component={"h1"}>Intervalos &nbsp;</Typography>
            </Grid>

            {/* TEMPO ENTRE DISPAROS */}
            {/* <Grid xs={12} md={3} item>
              <FormControl
                variant="outlined"
                className={classes.formControl}
                fullWidth
              >
                <InputLabel id="messageInterval-label">
                  Tempo entre Disparos
                </InputLabel>
                <Select
                  name="messageInterval"
                  id="messageInterval"
                  labelId="messageInterval-label"
                  label="Intervalo Randômico de Disparo"
                  value={settings.messageInterval}
                  onChange={(e) => handleOnChangeSettings(e)}
                >
                  <MenuItem value={0}>Sem Intervalo</MenuItem>
                  <MenuItem value={5}>5 segundos</MenuItem>
                  <MenuItem value={10}>10 segundos</MenuItem>
                  <MenuItem value={15}>15 segundos</MenuItem>
                  <MenuItem value={20}>20 segundos</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}

            <Grid xs={12} md={3} item>
              <FormControl
                variant="outlined"
                className={classes.formControl}
                fullWidth
              >
                <InputLabel id="messageInterval-label">
                  Intervalo Randômico de Disparo
                </InputLabel>
                <Select
                  name="messageInterval"
                  id="messageInterval"
                  labelId="messageInterval-label"
                  label="Intervalo Randômico de Disparo"
                  value={settings.messageInterval}
                  onChange={(e) => handleOnChangeSettings(e)}
                >
                  <MenuItem value={0}>Sem Intervalo</MenuItem>
                  <MenuItem value={5}>5 segundos</MenuItem>
                  <MenuItem value={10}>10 segundos</MenuItem>
                  <MenuItem value={15}>15 segundos</MenuItem>
                  <MenuItem value={20}>20 segundos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} md={3} item>
              <FormControl
                variant="outlined"
                className={classes.formControl}
                fullWidth
              >
                <InputLabel id="longerIntervalAfter-label">
                  Intervalo Maior Após
                </InputLabel>
                <Select
                  name="longerIntervalAfter"
                  id="longerIntervalAfter"
                  labelId="longerIntervalAfter-label"
                  label="Intervalo Maior Após"
                  value={settings.longerIntervalAfter}
                  onChange={(e) => handleOnChangeSettings(e)}
                >
                  <MenuItem value={0}>Não definido</MenuItem>
                  <MenuItem value={5}>5 mensagens</MenuItem>
                  <MenuItem value={10}>10 mensagens</MenuItem>
                  <MenuItem value={15}>15 mensagens</MenuItem>
                  <MenuItem value={20}>20 mensagens</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} md={3} item>
              <FormControl
                variant="outlined"
                className={classes.formControl}
                fullWidth
              >
                <InputLabel id="greaterInterval-label">
                  Intervalo de Disparo Maior
                </InputLabel>
                <Select
                  name="greaterInterval"
                  id="greaterInterval"
                  labelId="greaterInterval-label"
                  label="Intervalo de Disparo Maior"
                  value={settings.greaterInterval}
                  onChange={(e) => handleOnChangeSettings(e)}
                >
                  <MenuItem value={0}>Sem Intervalo</MenuItem>
                  <MenuItem value={20}>20 segundos</MenuItem>
                  <MenuItem value={30}>30 segundos</MenuItem>
                  <MenuItem value={40}>40 segundos</MenuItem>
                  <MenuItem value={50}>50 segundos</MenuItem>
                  <MenuItem value={60}>60 segundos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} className={classes.textRight} item>
              <Button
                onClick={() => setShowVariablesForm(!showVariablesForm)}
                color="primary"
                style={{ marginRight: 10 }}
              >
                Adicionar Variável
              </Button>
              <Button
                onClick={saveSettings}
                color="primary"
                variant="contained"
              >
                Salvar Configurações
              </Button>
            </Grid>
            {showVariablesForm && (
              <>
                <Grid xs={12} md={6} item>
                  <TextField
                    label="Atalho"
                    variant="outlined"
                    value={variable.key}
                    name="key"
                    onChange={handleOnChangeVariable}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} md={6} item>
                  <TextField
                    label="Conteúdo"
                    variant="outlined"
                    value={variable.value}
                    name="value"
                    onChange={handleOnChangeVariable}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} className={classes.textRight} item>
                  <Button
                    onClick={() => setShowVariablesForm(!showVariablesForm)}
                    color="primary"
                    style={{ marginRight: 10 }}
                  >
                    Fechar
                  </Button>
                  <Button
                    onClick={addVariable}
                    color="primary"
                    variant="contained"
                  >
                    Adicionar
                  </Button>
                </Grid>
              </>
            )}
            {settings.variables.length > 0 && (
              <Grid xs={12} className={classes.textRight} item>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: "1%" }}></TableCell>
                      <TableCell>Atalho</TableCell>
                      <TableCell>Conteúdo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(settings.variables) &&
                      settings.variables.map((v, k) => (
                        <TableRow key={k}>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedKey(v.key);
                                setConfirmationOpen(true);
                              }}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </TableCell>
                          <TableCell>{"{" + v.key + "}"}</TableCell>
                          <TableCell>{v.value}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>
    </MainContainer>
  );
};

export default CampaignsConfig;
