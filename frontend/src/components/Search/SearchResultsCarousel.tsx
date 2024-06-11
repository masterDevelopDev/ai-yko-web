'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import Publication from './Publication'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { SearchContext } from '@/contexts/SearchContext'
import { classnames } from '@/styles/classnames'
import Carousel from 'nuka-carousel'

const SearchResultsCarousel = () => {
  const { searchResults, isSearchPending, totalResults, limit, setLimit } =
    useContext(SearchContext)

  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index === limit) {
      setLimit(limit + 10)
    }
  }, [index])

  useEffect(() => {
    if (limit > 10) {
      setIndex(limit - 10)
    }
  }, [limit])

  useEffect(() => {
    if (totalResults < index + 1) {
      setIndex(totalResults - 1)
    }
  }, [totalResults])

  if (isSearchPending) return <p className="p-10 text-center">Loading...</p>

  if (searchResults && searchResults.length === 0)
    return <p className="p-10 text-center">No result found</p>

  if (!searchResults)
    return <p className="p-10 text-center">Please enter a query</p>

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-[9]">
        <Carousel
          slideIndex={index}
          renderBottomCenterControls={() => null}
          renderCenterLeftControls={({ previousSlide }) => (
            <ArrowLeftIcon
              onClick={() => {
                setIndex(index - 1)
                previousSlide()
              }}
              className={classnames('h-10 w-10 stroke-black', {
                hidden: index === 0,
              })}
            />
          )}
          renderCenterRightControls={({ nextSlide }) => (
            <ArrowRightIcon
              onClick={() => {
                const newIndex = index + 1
                setIndex(newIndex)
                if (newIndex < limit) {
                  nextSlide()
                }
              }}
              className={classnames('h-10 w-10 stroke-black', {
                hidden: index + 1 === totalResults,
              })}
            />
          )}
        >
          {searchResults.map((d) => (
            <div key={d.id} className="flex flex-col gap-2">
              <div className="md:mx-20">
                <Publication isCarouselMode document={d} />
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      <p className="text-center italic">
        Document {index + 1} out of {totalResults}
      </p>
    </div>
  )
}

export default SearchResultsCarousel
