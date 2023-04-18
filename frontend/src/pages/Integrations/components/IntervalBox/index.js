import React from 'react';

import { TimeInput } from '@mantine/dates';
import { IconButton } from '@material-ui/core';
import { DeleteOutline } from '@material-ui/icons';
import moment from 'moment';

import { TimeContainer, ButtonsContainer, Container } from './styles';

function IntervalBox({
  remove,
  index,
  value,
  setFieldValue,
  setIntervalRemove,
  errors,
}) {
  const handleRemove = () => {
    if (value?.id) {
      setIntervalRemove((prev) => [...prev, value.id]);
    }

    remove(index);
  };

  return (
    <Container>
      <TimeContainer>
        <TimeInput
          value={value.time_ini && new Date(`2020-08-01 ${value.time_ini}:00`)}
          onChange={(value) => {
            if (!value) {
              setFieldValue(`intervals[${index}].time_ini`, null);
            } else {
              const time = moment(value).format('HH:mm');
              setFieldValue(`intervals[${index}].time_ini`, time);
            }
          }}
          label="Disponível De"
          format="24"
          clearable
          variant="filled"
          required
          style={{
            width: '50%',
          }}
        />
        <TimeInput
          value={value.time_fin && new Date(`2020-08-01 ${value.time_fin}:00`)}
          variant="filled"
          onChange={(value) => {
            if (!value) {
              setFieldValue(`intervals[${index}].time_fin`, null);
            } else {
              const time = moment(value).format('HH:mm');
              setFieldValue(`intervals[${index}].time_fin`, time);
            }
          }}
          label="Disponível Até"
          format="24"
          clearable
          required
          style={{
            width: '50%',
          }}
        />
      </TimeContainer>
      <ButtonsContainer>
        <IconButton
          onClick={handleRemove}
          style={{
            padding: '5px',
            alignSelf: 'center',
            marginTop: '20px',
          }}
        >
          <DeleteOutline />
        </IconButton>
      </ButtonsContainer>
    </Container>
  );
}

export default IntervalBox;
