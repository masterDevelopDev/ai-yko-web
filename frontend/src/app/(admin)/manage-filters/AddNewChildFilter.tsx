'use client'

import Modal from '@/components/Modal'
import { useDisclosure } from '@mantine/hooks'
import CreateFilterForm from './CreateFilterForm'
import { PlusCircleIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import useCategories from '@/hooks/useCategories'

const AddNewChildFilter = ({
  parentId,
  categoryId,
}: {
  parentId: string | null
  categoryId: string | null
}) => {
  const [opened, { open, close }] = useDisclosure(false)

  const { getCategoryName } = useCategories({ withGenericCategory: true })

  const text = `Add new ${parentId === null ? '' : 'child'} filter or group${parentId === null ? (categoryId ? ` for category ${getCategoryName(categoryId ?? '')}` : ' for all categories') : ''}`

  return (
    <div className={clsx('flex flex-row items-center gap-2 p-2')}>
      <p>{text}</p>

      <button onClick={open}>
        <PlusCircleIcon className="h-5 w-5 stroke-black" />
      </button>

      <Modal
        title={`Create filter or group of filters for ${categoryId ? `category ${getCategoryName(categoryId ?? '')}` : 'all categories'}`}
        opened={opened}
        onClose={close}
      >
        <CreateFilterForm
          categoryId={categoryId}
          parentId={parentId}
          onSuccess={close}
        />
      </Modal>
    </div>
  )
}

export default AddNewChildFilter
