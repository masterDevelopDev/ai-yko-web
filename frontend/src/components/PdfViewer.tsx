'use client'

import { Document, Page, pdfjs } from 'react-pdf'
import { useEffect, useState } from 'react'
import useResizeObserver from 'use-resize-observer'
import clsx from 'clsx'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export const LOADING_PDF_MESSAGE = 'Loading pdf...'

const PdfViewer = ({ url }: { url: string }) => {
  const { ref, width = undefined } = useResizeObserver<HTMLDivElement>()

  const [numPages, setNumPages] = useState(0)

  const [pageNumber, setPageNumber] = useState(1)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const goToNextPage = () => {
    setPageNumber(Math.min(pageNumber + 1, numPages))
  }

  const goToPreviousPage = () => {
    setPageNumber(Math.max(pageNumber - 1, 1))
  }

  useEffect(() => {
    /** @todo use worker from node modules https://github.com/wojtekmaj/react-pdf/issues/1532#issuecomment-1652499033 */
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
  }, [])

  return (
    <div ref={ref} className={clsx('mx-auto flex w-full place-items-center')}>
      <Document
        className="relative"
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div>{LOADING_PDF_MESSAGE}</div>}
        file={url}
      >
        <Page
          pageNumber={pageNumber}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          width={width}
        />

        <button
          onClick={goToPreviousPage}
          className={clsx(
            'absolute left-5 top-1/2  inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10',
            { hidden: pageNumber === 1 },
          )}
        >
          <ArrowLeftIcon className="h-5 w-5 stroke-black" />
        </button>

        <button
          onClick={goToNextPage}
          className={clsx(
            'absolute right-5 top-1/2 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10',
            { hidden: pageNumber === numPages },
          )}
        >
          <ArrowRightIcon className="h-5 w-5 stroke-black" />
        </button>

        <div className="absolute bottom-5 left-1/2  inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10">
          Page {pageNumber}
        </div>
      </Document>
    </div>
  )
}

export default PdfViewer
