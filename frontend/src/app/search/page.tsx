import Pagination from '@/components/Search/Pagination'
import SaveSearchButton from '@/components/Search/SaveSearchButton'
import SearchBar from '@/components/Search/SearchBar'
import SearchElementsContainerExceptSearchBar from '@/components/Search/SearchElementsContainerExceptSearchBar'
import SearchResults from '@/components/Search/SearchResults'
import SearchResultsActions from '@/components/Search/SearchResultsActions'
import SearchResultsModeSwitch from '@/components/Search/SearchResultsModeSwitch'
import SearchResultsNumber from '@/components/Search/SearchResultsNumber'
import SidebarFilters from '@/components/Search/SidebarFilters'

export default function SearchPage() {
  return (
    <div className="flex h-screen flex-col bg-white pt-5">
      <div className="w-full items-center gap-2 only:flex only:h-full">
        <div className="searchbar flex w-full flex-col items-center justify-between md:flex-row">
          <SearchBar />
        </div>

        <SearchElementsContainerExceptSearchBar>
          <div className="flex flex-row flex-wrap items-center justify-end gap-x-0.5 self-end md:gap-x-4">
            <SearchResultsActions />

            <SaveSearchButton />

            <SearchResultsModeSwitch />

            <SearchResultsNumber />
          </div>
        </SearchElementsContainerExceptSearchBar>
      </div>

      <SearchElementsContainerExceptSearchBar>
        <SidebarFilters>
          <SearchResults />
        </SidebarFilters>

        <Pagination />
      </SearchElementsContainerExceptSearchBar>
    </div>
  )
}
