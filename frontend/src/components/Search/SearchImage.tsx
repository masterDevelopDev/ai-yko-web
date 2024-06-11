import Image from 'next/image'

import classnames from './SearchImage.module.css'
import clsx from 'clsx'
import ModalButton from '@/components/ModalButton'

const SearchImage = ({
  url,
  removeImageUrl,
}: {
  url: string
  removeImageUrl?: (f: string) => void
}) => {
  const handleRemoveImageUrl = (e: any) => {
    e.stopPropagation()
    if (removeImageUrl) {
      removeImageUrl(url)
    }
  }
  return (
    <div className="relative h-16 w-16">
      <Image
        onClick={handleRemoveImageUrl}
        src="/close.svg"
        alt="Remove file"
        width={20}
        height={20}
        className={clsx(
          'absolute -right-[12px] -top-[12px] z-10 cursor-pointer',
          classnames['animate-shake-on-hover'],
          { hidden: !removeImageUrl },
        )}
      />

      <ModalButton
        classeNames={{ panel: 'pt-12 h-[80vh]' }}
        buttonContent={
          <Image
            src={url}
            alt="uploaded image"
            fill
            className="rounded-md object-cover"
          />
        }
        modalContent={
          <Image
            src={url}
            alt="uploaded image"
            fill
            className="object-contain"
          />
        }
      />
    </div>
  )
}

export default SearchImage
