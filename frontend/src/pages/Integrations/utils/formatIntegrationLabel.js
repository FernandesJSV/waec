/* eslint-disable no-console */
const formatIntegrationLabel = (integration) => {
  try {
    switch (integration) {
      case 'google_agenda':
        return 'Google Agenda';
      case 'mik_web':
        return 'Mik Web';
      default:
        return 'Selecione uma integração';
    }
  } catch (error) {
    console.log(error);
  }
};

export default formatIntegrationLabel;
