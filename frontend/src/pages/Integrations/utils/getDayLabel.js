const getDayLabel = (day) => {
  switch (day) {
    case 'mon':
      return 'SEG';
    case 'tue':
      return 'TER';
    case 'wed':
      return 'QUA';
    case 'thu':
      return 'QUI';
    case 'fri':
      return 'SEX';
    case 'sat':
      return 'SÁB';
    case 'sun':
      return 'DOM';
    default:
      return '';
  }
};

export default getDayLabel;
