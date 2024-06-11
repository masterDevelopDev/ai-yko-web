'use client'

import {
  DateOrNull,
  MantineDatePicker,
} from './MantineDatePicker'

type DatePickerProps = {
  value: DateOrNull
  setValue: (v: DateOrNull) => void
}

const DatePicker = ({ value, setValue }: DatePickerProps) => {
  return (
      <MantineDatePicker
        value={value}
        onChange={setValue}
        maxDate={new Date()}
      />
  )
}

export default DatePicker
