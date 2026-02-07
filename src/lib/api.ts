import AsyncStorage from '@react-native-async-storage/async-storage'

// Storage key must match authStore
const USERS_STORAGE_KEY = 'local_users_db'

export async function deleteAuthUser(userId: string): Promise<void> {
  // Local implementation: Remove user from AsyncStorage
  try {
    const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY)
    if (usersJson) {
      const users = JSON.parse(usersJson)
      // Find user by ID and delete
      // Users are stored by email key, so we iterate
      const userEmailKey = Object.keys(users).find(key => users[key].id === userId)
      if (userEmailKey) {
        delete users[userEmailKey]
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
      }
    }
  } catch (error) {
    console.error('Failed to delete user locally:', error)
    throw new Error('Failed to delete user')
  }
}
