import { ApiClient } from '@/lib/api-client'
import { UserProfileDtoRoleEnum } from '@/lib/axios-client'
import { useQuery } from '@tanstack/react-query'

const getProfile = async () => {
  const response = await ApiClient.user.userControllerGetUser()

  return response.data
}

export const USER_PROFILE_KEY = 'authentication/user-profile'

const useUser = () => {
  const { data: user } = useQuery({
    queryKey: [USER_PROFILE_KEY],
    queryFn: getProfile,
  })

  const role = user?.role!

  const isUserAtLeastOperator =
    role !== undefined &&
    (role === UserProfileDtoRoleEnum.Admin ||
      role === UserProfileDtoRoleEnum.Operator)

  const isUserAdmin = user?.role === UserProfileDtoRoleEnum.Admin

  return { user, isUserAdmin, isUserAtLeastOperator }
}

export default useUser
