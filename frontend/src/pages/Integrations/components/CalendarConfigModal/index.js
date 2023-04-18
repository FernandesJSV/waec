/* eslint-disable no-console */
import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';

import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  makeStyles,
  CircularProgress,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Tab,
  Switch,
  Tabs,
} from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import { Form, Formik, Field, FieldArray } from 'formik';
import * as Yup from 'yup';

import { showCalendarConfig } from '../../../../services/GoogleCalendar';
import useCreateGoogleCalendarConfig from '../../hooks/useCreateGoogleCalendarConfig';
import useUpdateGoogleCalendarConfig from '../../hooks/useUpdateGoogleCalendarConfig';
import getDayLabel from '../../utils/getDayLabel';
import TimeZoneDropdown from '../TimeZoneDropdown';
import WeekdayIntervals from '../WeekdayIntervals';
import {
  Container,
  CustomLabel,
  IntervalContainer,
  DropdownsContainer,
  LoadingContainer,
} from './styles';

const useStyles = makeStyles((theme) => ({
  btnWrapper: {
    position: 'relative',
  },

  buttonProgress: {
    color: green[500],
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
    position: 'absolute',
    top: '50%',
  },
}));

const initialValues = {
  /* google_calendar_id: null,
  google_calendar_name: '', */
  event_default_duration: 30,
  default_event_color_id: 1,
  description: '',
  timezone: 'America/Sao_Paulo',
  location: '',
  hangout: false,
  default_event_name: '',
  intervals: [
    {
      day: 'mon',
      time_ini: '09:00',
      time_fin: '17:00',
    },
    {
      day: 'tue',
      time_ini: '09:00',
      time_fin: '17:00',
    },
    {
      day: 'wed',
      time_ini: '09:00',
      time_fin: '17:00',
    },
    {
      day: 'thu',
      time_ini: '09:00',
      time_fin: '17:00',
    },
    {
      day: 'fri',
      time_ini: '09:00',
      time_fin: '17:00',
    },
  ],
};

const configSchema = Yup.object().shape({
  /* google_calendar_name: Yup.string().required('O nomé é obrigatório'),
  google_calendar_id: Yup.string().required('O calendário é obrigatório'), */
  event_default_duration: Yup.number().required('A duração é obrigatória'),
  description: Yup.string(),
  timezone: Yup.string(),
  location: Yup.string(),
  default_event_name: Yup.string().required('O nome do evento é obrigatório'),
  intervals: Yup.array().of(
    Yup.object().shape({
      day: Yup.string().required('O dia é obrigatório'),
      time_ini: Yup.string().required('A hora inicial é obrigatória'),
      time_fin: Yup.string().required('A hora final é obrigatória'),
    })
  ),
});
const options = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function CalendarConfigModal({ open, onClose, agenda }) {
  const classes = useStyles();
  const updateConfig = useUpdateGoogleCalendarConfig();
  const createConfig = useCreateGoogleCalendarConfig();

  const [intervalRemove, setIntervalRemove] = useState([]);
  const [tab, setTab] = useState(null);
  const [weekdays, setWeekdays] = useState([
    { day: 'mon', checked: true },
    { day: 'tue', checked: true },
    { day: 'wed', checked: true },
    { day: 'thu', checked: true },
    { day: 'fri', checked: true },
    { day: 'sat', checked: false },
    { day: 'sun', checked: false },
  ]);
  const [config, setConfig] = useState(null);

  const { isLoading } = useQuery(
    ['show_calendar_config', agenda],
    () => showCalendarConfig(agenda.id),
    {
      enabled: !!agenda,
      onSuccess: (data) => {
        if (data) {
          setConfig(data);
        }
      },

      onError: (err) => {
        console.log(err);
        toast.error('Erro ao carregar configuração');
        onClose();
      },
    }
  );

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleSubmit = useCallback(
    async (values) => {
      try {
        if (config) {
          await updateConfig.mutateAsync({
            id: config.id,
            updateData: { ...values, intervalsRemove: intervalRemove },
          });
        } else {
          await createConfig.mutateAsync({
            ...values,
            google_calendar_id: agenda.id,
            google_calendar_name: agenda.name,
          });
        }

        onClose();
        setConfig(null);
      } catch (error) {
        console.log(error);
      }
    },
    [updateConfig, createConfig, onClose, config, intervalRemove, agenda]
  );

  const handleCheckbox = (e, setFieldValue, values) => {
    const { name, checked } = e.target;
    const newWeekdays = weekdays.map((weekday) => {
      if (weekday.day === name) {
        return {
          ...weekday,
          checked,
        };
      }
      return weekday;
    });
    setWeekdays(newWeekdays);

    if (checked) {
      const interval = { day: name, time_ini: '09:00', time_fin: '17:00' };
      setFieldValue('intervals', [...values.intervals, interval]);
    }

    if (checked === false) {
      const removeDays = values.intervals.filter((item) => item.day !== name);
      setFieldValue('intervals', removeDays);
    }
  };

  useEffect(() => {
    const defaultTab = weekdays.filter((weekday) => weekday.checked === true);

    if (defaultTab.length > 0) {
      setTab(defaultTab[0].day);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (config) {
      const { intervals } = config;
      const newWeekdays = weekdays.map((weekday) => {
        const interval = intervals.find((i) => i.day === weekday.day);
        return {
          ...weekday,
          checked: !!interval,
        };
      });
      setWeekdays(newWeekdays);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  return (
    <Container>
      <Dialog
        maxWidth="xl"
        onClose={onClose}
        open={open}
        scroll="paper"
        PaperProps={{
          style: {
            width: '1000px',
          },
        }}
      >
        <DialogTitle>Editar configurações da agenda</DialogTitle>{' '}
        {isLoading ? (
          <DialogContent dividers>
            <LoadingContainer>
              <CircularProgress size={60} />
            </LoadingContainer>
          </DialogContent>
        ) : (
          <>
            {' '}
            <Formik
              enableReinitialize={true}
              initialValues={config ? config : initialValues}
              onSubmit={(values, actions) => {
                setTimeout(() => {
                  handleSubmit({
                    ...values,
                  });
                  actions.setSubmitting(false);
                }, 400);
              }}
              validationSchema={configSchema}
            >
              {({ errors, isSubmitting, touched, values, setFieldValue }) => (
                <Form>
                  <DialogContent dividers>
                    <DropdownsContainer>
                      <TextField
                        as={TextField}
                        value={agenda?.name}
                        label={'Agenda'}
                        margin="dense"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        fullWidth
                        disabled
                        variant="outlined"
                      />

                      <TimeZoneDropdown
                        value={values.timezone}
                        setFieldValue={setFieldValue}
                      />
                    </DropdownsContainer>
                    <Field
                      as={TextField}
                      error={
                        touched.default_event_name &&
                        Boolean(errors.default_event_name)
                      }
                      helperText={
                        touched.default_event_name && errors.default_event_name
                      }
                      label={'Nome padrão do evento'}
                      margin="dense"
                      name="default_event_name"
                      required
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                    <Field
                      as={TextField}
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                      label={'Descrição'}
                      margin="dense"
                      name="description"
                      variant="outlined"
                      multiline
                      rows={4}
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <Field
                      as={TextField}
                      error={
                        touched.event_default_duration &&
                        Boolean(errors.event_default_duration)
                      }
                      helperText={
                        touched.event_default_duration &&
                        errors.event_default_duration
                      }
                      label={'Duração padrão do evento (minutos)'}
                      margin="dense"
                      name="event_default_duration"
                      variant="outlined"
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />

                    <FormControlLabel
                      style={{
                        margin: '10px 0px 10px 1px',
                      }}
                      control={
                        <Field
                          as={Switch}
                          size="small"
                          color="primary"
                          name="hangout"
                          checked={values.hangout}
                        />
                      }
                      label="Adicionar videoconferência do Google Meet"
                    />

                    <FieldArray name="intervals">
                      {({ push, remove }) => (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '250px',
                          }}
                        >
                          <CustomLabel>Horários de atendimento</CustomLabel>{' '}
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              gap: '10px',
                            }}
                          >
                            {options.map((day, index) => (
                              <FormControlLabel
                                key={index}
                                control={
                                  <Checkbox
                                    defaultChecked={
                                      values?.intervals?.filter(
                                        (item) => item.day === day
                                      ).length > 0
                                        ? true
                                        : false
                                    }
                                    onChange={(e) =>
                                      handleCheckbox(e, setFieldValue, values)
                                    }
                                    color="primary"
                                    name={day}
                                  />
                                }
                                label={getDayLabel(day)}
                              />
                            ))}
                          </div>
                          <div>
                            <Tabs
                              value={tab}
                              onChange={handleChangeTab}
                              indicatorColor="primary"
                              textColor="primary"
                              variant="scrollable"
                              scrollButtons="auto"
                              aria-label="scrollable auto tabs example"
                            >
                              {weekdays.map((item, index) => {
                                if (item.checked) {
                                  return (
                                    <Tab
                                      style={{
                                        minWidth: 120,
                                      }}
                                      value={item.day}
                                      key={index}
                                      wrapped
                                      label={getDayLabel(item.day)}
                                    />
                                  );
                                }

                                return null;
                              })}
                            </Tabs>
                          </div>
                          <IntervalContainer>
                            {weekdays.map((weekday, index) => {
                              if (tab === weekday.day) {
                                return (
                                  <WeekdayIntervals
                                    day={weekday.day}
                                    values={values}
                                    push={push}
                                    remove={remove}
                                    setFieldValue={setFieldValue}
                                    setIntervalRemove={setIntervalRemove}
                                    key={index}
                                    errors={errors}
                                  />
                                );
                              }

                              return null;
                            })}
                          </IntervalContainer>
                        </div>
                      )}
                    </FieldArray>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      color="secondary"
                      disabled={isSubmitting}
                      onClick={onClose}
                      variant="outlined"
                    >
                      Cancelar
                    </Button>
                    <Button
                      className={classes.btnWrapper}
                      color="primary"
                      disabled={isSubmitting}
                      type="submit"
                      variant="contained"
                    >
                      Confirmar
                      {isSubmitting && (
                        <CircularProgress
                          className={classes.buttonProgress}
                          size={24}
                        />
                      )}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </>
        )}
      </Dialog>
    </Container>
  );
}

export default CalendarConfigModal;
