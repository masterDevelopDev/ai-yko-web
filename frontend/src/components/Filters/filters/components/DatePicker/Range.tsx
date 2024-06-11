'use client'

import {
  DateOrNull,
  MantineDatePicker,
} from './MantineDatePicker'
type DateRangePickerProps = {
  value: [DateOrNull, DateOrNull]
  setValue: (v: DateOrNull[]) => void
}

const DateRangePicker = ({ value, setValue }: DateRangePickerProps) => {
  return (
      <MantineDatePicker
        value={value}
        onChange={setValue}
        type="range"
        numberOfColumns={2}
        maxDate={new Date()}
        classNames={{
          levelsGroup: 'flex-col md:flex-row',
        }}
      />
  )
}

export default DateRangePicker
