import { FilterOrFilterGroupDto } from '@/lib/axios-client'

export const DUMMY_ROOT_FILTER: FilterOrFilterGroupDto = {
  kind: 'GROUP',
  name: 'All filters',
  id: 'root',
  children: [],
}
