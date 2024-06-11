import {
  FilterDtoTypeEnum,
  SearchQueryDtoFilterValuesInner,
  SearchQueryMultichoiceFilterValue,
  SearchQuerySinglechoiceFilterValue,
  SearchQueryTextFilterValue,
  SearchQueryTextFilterValueModeEnum,
} from '@/lib/axios-client'
import { useList } from '@uidotdev/usehooks'
import { useEffect } from 'react'

const useFilterValues = (filterValues?: SearchQueryDtoFilterValuesInner[]) => {
  const [selectedFilterValues, { clear, push, removeAt, updateAt, set }] =
    useList<SearchQueryDtoFilterValuesInner>(filterValues ?? [])

  const addOrUpdateFilterValue = (f: SearchQueryDtoFilterValuesInner) => {
    const idxToReplace = selectedFilterValues.findIndex(
      (fv) => fv.filterId === f.filterId,
    )

    if (idxToReplace > -1) {
      updateAt(idxToReplace, f)
    } else {
      push(f)
    }
  }

  const removeFilterValue = (id: string) => {
    const idxToRemove = selectedFilterValues.findIndex(
      (fv) => fv.filterId === id,
    )

    if (idxToRemove > -1) removeAt(idxToRemove)
  }

  const resetFilterValues = () => clear()

  const setFilterValues = (fvs: SearchQueryDtoFilterValuesInner[]) => set(fvs)

  const cleanEmptyFilterValues = () => {
    selectedFilterValues.forEach((fv) => {
      switch (fv.type) {
        case FilterDtoTypeEnum.MultiChoice:
          const fvmc = fv as SearchQueryMultichoiceFilterValue
          if (fvmc.choiceIds.length === 0) {
            removeFilterValue(fv.filterId)
          }
          break

        case FilterDtoTypeEnum.Text:
          const fvt = fv as SearchQueryTextFilterValue
          if (
            fvt.text?.length === 0 &&
            SearchQueryTextFilterValueModeEnum.Isnull !== fvt.mode
          ) {
            removeFilterValue(fv.filterId)
          }
          break

        default:
          break
      }
    })
  }

  useEffect(() => {
    cleanEmptyFilterValues()
  }, [filterValues])

  return {
    selectedFilterValues,
    addOrUpdateFilterValue,
    removeFilterValue,
    resetFilterValues,
    setFilterValues,
  }
}

export default useFilterValues
