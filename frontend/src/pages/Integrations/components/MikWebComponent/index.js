/* eslint-disable no-console */
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  IconButton,
  Paper,
  makeStyles,
  Switch,
  Button,
  FormControlLabel,
  TextField,
  CircularProgress,
} from '@material-ui/core';
import { ChevronLeft } from '@material-ui/icons';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import { Form, Formik, Field, FieldArray } from 'formik';
import * as yup from 'yup';

import MainHeader from '../../../../components/MainHeader';
import Title from '../../../../components/Title';
import MainContainer from '../../../Reports/components/MainContainer';
// import useUpdatePermissions from '../../../Settings/hooks/useUpdatePermissions';
import { StyledMainHeader } from '../GoogleCalendarComponent/styles';
import { Container, TextContainer } from './styles';

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    width: '100%',
    minHeight: '20%',
  },

  listPaper: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: theme.spacing(1),
    ...theme.scrollbarStyles,
    width: '100%',
    marginBottom: 'auto',
    minHeight: '200px',
  },
}));

const validationSchema = yup.object().shape({
  mik_web: yup.boolean(),
  tokens: yup.array().when('hinova', {
    is: true,
    then: yup.array().of(
      yup.object().shape({
        token: yup.string().required('Token é obrigatório'),
        type: yup.string().required('Nome é obrigatório'),
      })
    ),
  }),
});

function MikWebComponent() {
  // const { companyPermissions } = useContext(ReloadContext);

  // const updatePermission = useUpdatePermissions();
  const [removeTokens, setRemoveTokens] = useState([]);
  const classes = useStyles();
  const history = useHistory();

  const handleSubmit = async (values) => {
    try {
      // await updatePermission.mutateAsync({
      //   mik_web: values.mik_web,
      //   tokens: values.tokens,
      //   mik_web_billing_text: values.mik_web_billing_text,
      //   remove_integration_tokens: removeTokens,
      //   mik_web_send_billings_messages: values.mik_web_send_billings_messages,
      // });
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <MainContainer>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0',
          minHeight: '48px',
        }}
      >
        <IconButton onClick={() => history.push('/integrations')}>
          <ChevronLeft />
          <span style={{ fontSize: '1rem' }}>Voltar</span>
        </IconButton>
      </div>
      <MainHeader>
        <Title>MikWeb</Title>
      </MainHeader>
      <Paper className={classes.mainPaper}>
        <StyledMainHeader>Configurações</StyledMainHeader>
        <Container>
          <Formik
            enableReinitialize={true}
            initialValues={true}
            onSubmit={(values, actions) => {
              setTimeout(() => {
                handleSubmit({
                  ...values,
                  remove_integrations_tokens: removeTokens,
                });
                actions.setSubmitting(false);
              }, 400);
            }}
            validationSchema={validationSchema}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <div
                  style={{
                    display: 'flex',
                    flex: 1,
                    marginBottom: 'auto',
                    flexDirection: 'column',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Field
                        as={Switch}
                        size="small"
                        color="primary"
                        name="mik_web"
                        checked={values.mik_web}
                        onChange={(e) => {
                          setFieldValue('mik_web', e.target.checked);
                          if (e.target.checked) {
                            setFieldValue('tokens', [
                              ...values.tokens,
                              {
                                token: '',
                                type: 'mik_web',
                              },
                            ]);
                          }
                        }}
                      />
                    }
                    style={{
                      marginLeft: '5px',
                    }}
                    label="Ativar integração"
                  />
                  {/* <FormControlLabel
                    control={
                      <Field
                        as={Switch}
                        size="small"
                        color="primary"
                        name="mik_web_send_billings_messages"
                        checked={values.mik_web_send_billings_messages}
                      />
                    }
                    style={{
                      marginLeft: '5px',
                    }}
                    label="Enviar mensagens de cobrança"
                  /> */}
                  {values.mik_web && (
                    <>
                      <FieldArray name="tokens">
                        {({ push, remove }) => (
                          <>
                            {values?.tokens?.map((item, index) => (
                              <div
                                key={index}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    marginTop: '20px',
                                    marginRight: '10px',
                                  }}
                                >
                                  <Field
                                    as={TextField}
                                    name={`tokens[${index}].token`}
                                    label="Token"
                                    variant="outlined"
                                    required
                                    fullWidth
                                  />

                                  <IconButton
                                    onClick={() => {
                                      if (values.tokens[index]?.id) {
                                        setRemoveTokens([
                                          ...removeTokens,
                                          values.tokens[index].id,
                                        ]);
                                      }

                                      remove(index);
                                    }}
                                    size="small"
                                  >
                                    <DeleteOutlineIcon />
                                  </IconButton>
                                </div>
                                {/* {errors?.tokens && (
                                  <ErrorMessageComponent
                                    error={errors?.tokens[index]?.token}
                                  />
                                )} */}
                              </div>
                            ))}
                            <div className={classes.extraAttr}>
                              <Button
                                color="primary"
                                onClick={() =>
                                  push({
                                    type: 'mik_web',
                                    token: '',
                                  })
                                }
                                style={{ flex: 1, marginTop: 8 }}
                                variant="outlined"
                              >
                                Adicionar token
                              </Button>
                            </div>
                          </>
                        )}
                      </FieldArray>
                    </>
                  )}
                  {values.mik_web_send_billings_messages && (
                    <TextContainer>
                      <span>Mensaje de facturación</span>
                      {/* <TextEditorWithFormat
                        placeholder="Mensaje de facturación"
                        setFieldValue={setFieldValue}
                        field="mik_web_billing_text"
                        value={values.mik_web_billing_text}
                        contexts={[
                          'nome do cliente',
                          'valor da cobrança',
                          'data de vencimento',
                          'linha digitável',
                        ]}
                      /> */}
                    </TextContainer>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginTop: 'auto',
                      flex: 1,
                    }}
                  >
                    <Button
                      className={classes.btnWrapper}
                      color="primary"
                      disabled={isSubmitting}
                      type="submit"
                      variant="contained"
                    >
                      Salvar
                      {isSubmitting && (
                        <CircularProgress
                          className={classes.buttonProgress}
                          size={24}
                        />
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </Container>
      </Paper>
    </MainContainer>
  );
}

export default MikWebComponent;
