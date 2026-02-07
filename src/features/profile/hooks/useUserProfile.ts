import AsyncStorage from '@react-native-async-storage/async-storage'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { User, UserUpdate } from '@/src/types/database'

// Storage key must match authStore
const USERS_STORAGE_KEY = 'local_users_db'

export const userKeys = {
  all: ['users'] as const,
  profile: (userId: string) => [...userKeys.all, 'profile', userId] as const,
}

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: userKeys.profile(userId ?? ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required')

      const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY)
      const users: Record<string, User> = usersJson ? JSON.parse(usersJson) : {}

      // Find user by ID (scan all users since key is email)
      const user = Object.values(users).find((u) => u.id === userId)

      if (!user) throw new Error('User not found')
      return user
    },
    enabled: !!userId,
  })
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string
      updates: UserUpdate
    }) => {
      const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY)
      const users: Record<string, User & { password?: string }> = usersJson ? JSON.parse(usersJson) : {}

      // Find user by ID
      const userEmailKey = Object.keys(users).find((key) => users[key].id === userId)

      if (!userEmailKey || !users[userEmailKey]) {
        throw new Error('User not found')
      }

      const updatedUser = { ...users[userEmailKey], ...updates, updated_at: new Date().toISOString() }
      users[userEmailKey] = updatedUser

      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

      return updatedUser
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(userKeys.profile(variables.userId), data)
    },
  })
}

// Re-export types for convenience
export type { User, UserUpdate }
