/* eslint-disable no-console */
import React from 'react';

import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  makeStyles,
  CircularProgress,
  Button,
  TextField,
} from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import { Form, Formik, Field } from 'formik';
import * as Yup from 'yup';

import TimeZoneDropdown from '../../../Integrations/components/TimeZoneDropdown';
import useCreateGoogleAgenda from '../../hooks/useCreateGoogleAgenda';
import useEditGoogleAgenda from '../../hooks/useEditGoogleAgenda';

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
  name: '',
  description: '',
  timeZone: 'America/Sao_Paulo',
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Campo obrigatório'),
  description: Yup.string(),
  timeZone: Yup.string().required('Campo obrigatório'),
});

export default function AgendaModal({ agenda, open, onClose }) {
  const classes = useStyles();
  const createAgenda = useCreateGoogleAgenda();
  const editAgenda = useEditGoogleAgenda();

  const handleSubmit = async (values) => {
    try {
      if (!agenda) {
        await createAgenda.mutateAsync(values);
      } else {
        await editAgenda.mutateAsync(values);
      }

      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {' '}
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
        <DialogTitle>{agenda ? 'Editar Agenda' : 'Criar Agenda'}</DialogTitle>

        <Formik
          enableReinitialize={true}
          initialValues={agenda ? agenda : initialValues}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSubmit({
                ...values,
              });
              actions.setSubmitting(false);
            }, 400);
          }}
          validationSchema={validationSchema}
        >
          {({ errors, isSubmitting, touched, values, setFieldValue }) => (
            <Form>
              <DialogContent dividers>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                  }}
                >
                  <Field
                    as={TextField}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    label={'Nome da Agenda'}
                    margin="dense"
                    name="name"
                    required
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                  />
                  <TimeZoneDropdown
                    value={values.timeZone}
                    setFieldValue={setFieldValue}
                  />
                </div>

                <Field
                  as={TextField}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                  label={'Descrição da Agenda'}
                  margin="dense"
                  name="description"
                  multiline
                  rows={4}
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />
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
      </Dialog>
    </div>
  );
}
