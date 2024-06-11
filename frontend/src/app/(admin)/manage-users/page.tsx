'use client'

import { ApiClient } from '@/lib/api-client'
import { PencilIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useState } from 'react'
import UserComponent from './UserComponent'
import { useDebounce } from '@uidotdev/usehooks'

const getAllUsersExceptMe = async (searchText: string) => {
  const response = await ApiClient.admin.adminControllerFindAllUsers(searchText)

  return response.data
}

const ManageUsers = () => {
  const [searchText, setSearchText] = useState('')

  const debouncedSearchText = useDebounce(searchText, 300)

  const { data: allUsers, isLoading } = useQuery({
    queryKey: ['ALL_USERS_EXCEPT_ME', debouncedSearchText],
    queryFn: () => getAllUsersExceptMe(debouncedSearchText),
  })

  return (
    <div className="p-1 md:p-4">
      <h1 className="text-xl font-bold">Manage users</h1>

      <div>
        <div className="mx-auto my-2 w-full max-w-96">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            type="search"
            name="search-text"
            id="search-text"
            className="block w-full rounded-full border-0 px-6 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search user by name or email"
          />
        </div>

        <div className="p2 flex flex-col gap-4 md:p-6">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            allUsers?.map((user) => (
              <UserComponent user={user} key={user.email} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageUsers
