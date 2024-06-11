import {
  FilterOrFilterGroupDto,
  FilterOrFilterGroupDtoKindEnum,
  FilterOrFilterGroupDtoTypeEnum,
  SearchQueryDtoFilterValuesInner,
} from '@/lib/axios-client'
import DateFilter from './filters/DateFilter'
import MultichoiceFilter from './filters/MultichoiceFilter'
import SimplechoiceFilter from './filters/SimplechoiceFilter'
import TextFilter from './filters/TextFilter'
import {
  ChevronDoubleRightIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import YearFilter from './filters/YearFilter'
import IntegerFilter from './filters/IntegerFilter'

export type FilterAndFilterValuesAndFunctions = {
  addOrUpdateFilterValue: (fv: SearchQueryDtoFilterValuesInner) => void
  removeFilterValue: (id: string) => void
  selectedFilterValues: SearchQueryDtoFilterValuesInner[]
  selectedFilterOrGroup: FilterOrFilterGroupDto
  isSearchMode: boolean
  counts?: { value: string; count: number }[]
}

const getFilterOrFilterGroupComponent = (
  fvAndFunctions: FilterAndFilterValuesAndFunctions,
  setSelectedFilterOrGroup?: (f: FilterOrFilterGroupDto) => void,
) => {
  if (
    fvAndFunctions.selectedFilterOrGroup.kind ===
    FilterOrFilterGroupDtoKindEnum.Filter
  ) {
    switch (fvAndFunctions.selectedFilterOrGroup.type) {
      case FilterOrFilterGroupDtoTypeEnum.Date:
        return <DateFilter {...fvAndFunctions} />

      case FilterOrFilterGroupDtoTypeEnum.Year:
        return <YearFilter {...fvAndFunctions} />

      case FilterOrFilterGroupDtoTypeEnum.SingleChoice:
        if (fvAndFunctions.isSearchMode)
          return <MultichoiceFilter {...fvAndFunctions} />
        return <SimplechoiceFilter {...fvAndFunctions} />

      case FilterOrFilterGroupDtoTypeEnum.MultiChoice:
        return <MultichoiceFilter {...fvAndFunctions} />

      case FilterOrFilterGroupDtoTypeEnum.Text:
        return <TextFilter {...fvAndFunctions} />

      case FilterOrFilterGroupDtoTypeEnum.Integer:
        return <IntegerFilter {...fvAndFunctions} />

      default:
        return null
    }
  }

  const getArrowComponent = (f: FilterOrFilterGroupDto) =>
    f.kind === FilterOrFilterGroupDtoKindEnum.Group ? (
      <ChevronDoubleRightIcon className="h-4 w-4" />
    ) : (
      <ChevronRightIcon className="h-4 w-4" />
    )

  if (!setSelectedFilterOrGroup) return null

  return (
    <>
      {fvAndFunctions.selectedFilterOrGroup.children?.map((f) => (
        <div
          className="flex cursor-pointer flex-row items-center gap-1"
          onClick={() => setSelectedFilterOrGroup(f)}
          key={f.id}
        >
          {f.name}
          <motion.div initial={{ x: 0 }} whileHover={{ x: '5px' }}>
            {getArrowComponent(f)}
          </motion.div>
        </div>
      ))}
    </>
  )
}

export default getFilterOrFilterGroupComponent
