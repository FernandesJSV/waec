/* eslint-disable no-console */
import React from 'react';

import { Select, FormControl, InputLabel, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  textField: {
    flex: 1,
  },
});

const brTimeZones = [
  'America/Sao_Paulo',
  'America/Bahia',
  'America/Araguaina',
  'America/Belem',
  'America/Boa_Vista',
  'America/Campo_Grande',
  'America/Cuiaba',
  'America/Eirunepe',
  'America/Fortaleza',
  'America/Maceio',
  'America/Manaus',
  'America/Noronha',
  'America/Porto_Velho',
  'America/Recife',
  'America/Rio_Branco',
  'America/Santarem',
];

function TimeZoneDropdown({ value, setFieldValue }) {
  const classes = useStyles();

  const handleSelect = (e) => {
    setFieldValue('timezone', e.target.value);
  };

  return (
    <div
      style={{
        width: '50%',
      }}
    >
      <FormControl fullWidth variant="outlined" margin="dense">
        <InputLabel shrink>Fuso Horário</InputLabel>

        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          labelWidth={60}
          value={value}
          onChange={handleSelect}
          className={classes.textField}
        >
          {brTimeZones?.map((timezone, index) => (
            <MenuItem key={index} value={timezone}>
              {timezone}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default TimeZoneDropdown;
