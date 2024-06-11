'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useEffect, useState, Fragment, useRef, CSSProperties } from 'react'
import { Slider } from '@mantine/core'
import { useEventListener } from 'usehooks-ts'
import { classnames } from '@/styles/classnames'
import Image from 'next/image'

const NAV_ICONS_CLASSNAMES =
  'h-10 md:h-7 w-10 md:w-7 cursor-pointer select-none'

const ImageCarousel = ({
  imageUrls,
  initialIndex = 0,
  withZoom = false,
  naturalSize = false,
}: {
  imageUrls: string[]
  initialIndex?: number
  withZoom?: boolean
  naturalSize?: boolean
}) => {
  const numberOfImages = imageUrls.length

  const imageRef = useRef<HTMLImageElement>(null)

  const { naturalWidth, naturalHeight } = imageRef.current ?? {}

  const [value, setValue] = useState(1)

  const imageStyle: CSSProperties = {
    ...(naturalSize
      ? { height: naturalHeight, width: naturalWidth }
      : { height: '100%', width: '100%' }),
    objectFit: 'contain',
    transform: withZoom ? `scale(${1 + (2 * value) / 100})` : undefined,
  }

  const [currentIndex, setCurrentIndex] = useState(
    initialIndex % numberOfImages,
  )

  useEffect(() => {
    setValue(Math.abs(1 - value))
  }, [currentIndex])

  const goToNextImage = (e: any) => {
    e.stopPropagation()
    if (numberOfImages <= 1) return
    setCurrentIndex((currentIndex + 1) % numberOfImages)
  }

  const goToPreviousImage = (e: any) => {
    e.stopPropagation()
    if (numberOfImages <= 1) return
    setCurrentIndex((currentIndex - 1 + numberOfImages) % numberOfImages)
  }

  useEventListener('load', () => {}, imageRef)

  if (numberOfImages === 0) return <div></div>

  return (
    <div className="relative grid h-full w-full grid-cols-1 grid-rows-7 justify-center gap-y-2">
      <div className={classnames('row-span-6 flex w-full justify-center')}>
        <img
          loading="lazy"
          ref={imageRef}
          src={imageUrls[currentIndex]}
          alt=""
          style={imageStyle}
        />
      </div>

      {withZoom ? <Slider value={value} onChange={setValue} /> : null}

      <div
        className={clsx(
          'z-20 flex flex-1 flex-row items-center justify-center gap-5 md:gap-2',
          { hidden: numberOfImages <= 1 },
        )}
      >
        <div onClick={goToPreviousImage}>
          <ChevronLeftIcon className={NAV_ICONS_CLASSNAMES} />
        </div>

        <div onClick={goToNextImage}>
          <ChevronRightIcon className={NAV_ICONS_CLASSNAMES} />
        </div>
      </div>
    </div>
  )
}

export default ImageCarousel
