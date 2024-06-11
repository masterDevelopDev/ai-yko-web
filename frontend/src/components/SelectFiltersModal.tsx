import {
  FilterOrFilterGroupDto,
  SearchQueryDtoFilterValuesInner,
} from '@/lib/axios-client'
import Modal from './Modal'
import FilterBadge from './Filters/FilterBadge'
import Filters from './Filters'
import PdfViewer from './PdfViewer'

type Props = {
  opened: boolean
  onClose: () => void
  selectedFilterValues: SearchQueryDtoFilterValuesInner[]
  addOrUpdateFilterValue: (fv: SearchQueryDtoFilterValuesInner) => void
  removeFilterValue: (filterId: string) => void
  setSelectedFilterOrGroup: (f: FilterOrFilterGroupDto) => void
  selectedFilterOrGroup: FilterOrFilterGroupDto
  categoryId: string
  title: string
  getFilterName: (id: string) => string
  pdfUrl?: string
}

const SelectFiltersModal = ({
  title,
  opened,
  onClose,
  selectedFilterValues,
  removeFilterValue,
  selectedFilterOrGroup,
  addOrUpdateFilterValue,
  categoryId,
  getFilterName,
  pdfUrl,
}: Props) => {
  return (
    <Modal
      title={title}
      opened={opened}
      onClose={onClose}
      size={pdfUrl ? '80%' : undefined}
    >
      <div className="flex flex-row">
        {pdfUrl ? (
          <div className="hidden flex-[3] items-center justify-center md:flex">
            <div className="max-h-[80vh] w-full max-w-[900px] overflow-y-auto">
              <PdfViewer url={pdfUrl} />
            </div>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto max-h-[80vh]">
          <div className="mb-3 flex flex-row flex-wrap gap-1">
            {selectedFilterValues.map((filterValue) => (
              <FilterBadge
                removeFilterValue={() =>
                  removeFilterValue(filterValue.filterId)
                }
                key={filterValue.filterId}
                filterValue={filterValue}
                filterName={getFilterName(filterValue.filterId)}
              />
            ))}
          </div>

          <Filters
            selectedFilterOrGroup={selectedFilterOrGroup}
            addOrUpdateFilterValue={addOrUpdateFilterValue}
            isSearchMode={false}
            removeFilterValue={removeFilterValue}
            selectedFilterValues={selectedFilterValues}
            categoryIdToShow={categoryId}
            initialInternalCategoryId={categoryId}
          />
        </div>
      </div>
    </Modal>
  )
}

export default SelectFiltersModal
