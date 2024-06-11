import Image from 'next/image'

import backgroundImage from '@/images/background-auth.jpg'

export function SlimLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative  flex h-full justify-center md:px-12 lg:px-0">
        <div className="relative z-10 flex flex-1 flex-col bg-white px-4 py-10 sm:justify-center md:flex-none md:px-28">
          <main className="mx-auto h-full w-full max-w-md sm:px-4 md:w-96 md:max-w-sm md:px-0">
            <div className="mb-40 md:mb-0">{children}</div>
          </main>
        </div>

        <div className="hidden sm:contents lg:relative lg:block lg:flex-1">
          <Image
            className="absolute inset-0 h-full w-full object-cover"
            src={backgroundImage}
            alt=""
            unoptimized
          />
        </div>
      </div>
    </>
  )
}
