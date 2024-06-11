'use client'

import { DateOrNull, MantineYearPicker } from './MantineDatePicker'

type YearPickerProps = {
  value: DateOrNull
  setValue: (v: DateOrNull) => void
}

const YearPicker = ({ value, setValue }: YearPickerProps) => {
  return (
    <MantineYearPicker value={value} onChange={setValue} maxDate={new Date()} />
  )
}

export default YearPicker
