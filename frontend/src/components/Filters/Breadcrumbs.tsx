import { HomeIcon } from '@heroicons/react/20/solid'

type BreadcrumbItem = Array<{name: string; id: string}>

export default function Breadcrumbs({breadcrumbItems, setRootAsCurrent}: {breadcrumbItems: BreadcrumbItem; setRootAsCurrent: () => void}) {

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex flex-wrap items-center space-x-1">
        <li>
          <div className="cursor-pointer" onClick={setRootAsCurrent}>
            <HomeIcon
              color="gray"
              className="h-5 w-5 flex-shrink-0"
              aria-hidden="true"
            />
            <span className="sr-only">Root</span>
          </div>
        </li>
        {breadcrumbItems.map((item) => (
          <li key={item.name}>
            <div className="flex items-center">
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <div
                onClick={setRootAsCurrent}
                className="ml-1 cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {item.name}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
