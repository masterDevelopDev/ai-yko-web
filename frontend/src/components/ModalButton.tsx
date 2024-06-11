'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useEventListener } from 'usehooks-ts'
import clsx from 'clsx'
import { XMarkIcon } from '@heroicons/react/24/outline'

type Props = {
  buttonContent: React.ReactNode
  modalContent: React.ReactNode
  openEventName?: string
  style?: any
  classeNames?: {
    panel?: string
    button?: string
    content?: string
  }
}

const ModalButton = ({
  buttonContent,
  modalContent,
  openEventName,
  style,
  classeNames = { panel: '', button: '' },
}: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const eventName = (openEventName ??
    'event-that-does-not-exist') as keyof WindowEventMap

  const handleEvent = openEventName ? openModal : () => {}

  useEventListener(eventName, handleEvent)

  return (
    <>
      <style>
        {`
          #headlessui-portal-root {
            z-index: 9999;
          }
        `}
      </style>
      <button className={clsx('w-fit', classeNames.button)} onClick={openModal}>
        {buttonContent}
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="z-100 relative" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center p-4 pt-[5rem] text-center md:pt-[5rem] lg:pt-8">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  style={style}
                  className={clsx(
                    'relative mx-auto w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all',
                    classeNames.panel,
                  )}
                >
                  <button
                    onClick={() => setIsOpen(false)}
                    type="button"
                    className="absolute right-3 top-3 z-10 rounded-full bg-gray-300 p-1 text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
                  >
                    <XMarkIcon
                      className="h-8 w-8 md:h-5 md:w-5"
                      aria-hidden="true"
                    />
                  </button>

                  {modalContent}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default ModalButton
