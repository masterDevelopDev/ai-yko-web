import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export const isDate = (value: any) => dayjs(value).isValid()

export const formatAsDay = (value: any) => dayjs(value).format('YYYY-MM-DD')

export const parseDate = (value: string) =>
  dayjs(value, 'YYYY-MM-DD', true).toDate()
