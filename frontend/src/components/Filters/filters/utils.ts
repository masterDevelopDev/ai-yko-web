import { SearchQueryDateFilterValueModeEnum } from '@/lib/axios-client'

export const MODE_TO_SYMBOL: Record<
  SearchQueryDateFilterValueModeEnum,
  string
> = {
  [SearchQueryDateFilterValueModeEnum.Before]: '<',
  [SearchQueryDateFilterValueModeEnum.BeforeOrEqual]: '≤',
  [SearchQueryDateFilterValueModeEnum.Equal]: '=',
  [SearchQueryDateFilterValueModeEnum.AfterOrEqual]: '≥',
  [SearchQueryDateFilterValueModeEnum.After]: '>',
}
