import useUser from '@/hooks/useUser'

const Profile = () => {
  const { user } = useUser()

  if (!user) return null

  return (
    <a
      href="#"
      className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-indigo-700"
    >
      <span className="sr-only">Your profile</span>
      <span aria-hidden="true">{user.firstName + ' ' + user.lastName}</span>
    </a>
  )
}

export default Profile
