'use client'

import { DateOrNull, MantineYearPicker } from './MantineDatePicker'

type YearRangePickerProps = {
  value: [DateOrNull, DateOrNull]
  setValue: (v: DateOrNull[]) => void
}

const YearRangePicker = ({ value, setValue }: YearRangePickerProps) => {
  return (
    <MantineYearPicker
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

export default YearRangePicker
