import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
dayjs.extend(weekday);

export const isTodaySameWeekdayAsDate = (d: Date) =>
  dayjs(d).weekday() === dayjs().weekday();

export const isTodaySameMonthdayAsDate = (d: Date) =>
  dayjs(d).date() === dayjs().date();

const DATE_FORMAT_FOR_SEARCH = 'YYYY-MM-DD';

export const getOneDayAgo = () =>
  dayjs().subtract(1, 'day').format(DATE_FORMAT_FOR_SEARCH);

export const getOneWeekAgo = () =>
  dayjs().subtract(1, 'week').format(DATE_FORMAT_FOR_SEARCH);

export const getOneMonthAgo = () =>
  dayjs().subtract(1, 'month').format(DATE_FORMAT_FOR_SEARCH);
