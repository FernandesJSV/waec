import React, { useMemo } from 'react';

import { FormControlLabel, IconButton, Tooltip } from '@material-ui/core';
import { Add } from '@material-ui/icons';

import IntervalBox from '../IntervalBox';
import { DayContainer, Container, IntervalBoxConatiner } from './styles';

function WeekdayIntervals({
  day,
  values,
  push,
  remove,
  setFieldValue,
  setIntervalRemove,
  errors,
}) {
  // const [checked, setChecked] = useState(false);
  const dayIntervals = useMemo(() => {
    const filteredIntervals = [];

    values.intervals.forEach((interval, index) => {
      if (interval.day === day) {
        filteredIntervals.push({ ...interval, index });
      }
    });
    return filteredIntervals;
  }, [values.intervals, day]);

  return (
    <Container>
      <DayContainer>
        <Tooltip title="Adicionar intervalo">
          <FormControlLabel
            control={
              <IconButton
                onClick={() =>
                  push({
                    day,
                    time_ini: '09:00',
                    time_fin: '17:00',
                  })
                }
              >
                <Add />
              </IconButton>
            }
            label="Adicionar intervalo"
          />
        </Tooltip>
      </DayContainer>

      <IntervalBoxConatiner>
        {dayIntervals.map((item, index) => (
          <IntervalBox
            key={index}
            remove={remove}
            index={item?.index}
            value={item}
            setIntervalRemove={setIntervalRemove}
            setFieldValue={setFieldValue}
            errors={errors}
          />
        ))}
      </IntervalBoxConatiner>
    </Container>
  );
}

export default WeekdayIntervals;
