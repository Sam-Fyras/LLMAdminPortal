import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * TimeRangeSelector Component
 * Dropdown selector for choosing a time range
 * Options: 24 hours, 7 days, 30 days, 90 days
 */
export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <FormControl sx={{ minWidth: 200 }} variant="outlined" size="small">
      <InputLabel id="time-range-label" sx={{ backgroundColor: 'white', px: 0.5 }}>
        Time Range
      </InputLabel>
      <Select
        labelId="time-range-label"
        value={value}
        label="Time Range"
        onChange={handleChange}
        variant="outlined"
        size="small"
      >
        <MenuItem value="24h">Last 24 Hours</MenuItem>
        <MenuItem value="7d">Last 7 Days</MenuItem>
        <MenuItem value="30d">Last 30 Days</MenuItem>
        <MenuItem value="90d">Last 90 Days</MenuItem>
      </Select>
    </FormControl>
  );
};

export default TimeRangeSelector;
