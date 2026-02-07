import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { useNotificationStore } from '@/src/stores/notificationStore'
import type { User } from '@/src/types/database'

// Mock Session type to maintain compatibility with existing code if needed,
// or simplify to just user authentication state.
type Session = {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: User
}

type AuthState = {
  session: Session | null
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  initError: Error | null
}

type AuthActions = {
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void> // Kept as placeholder/mock
  signInWithApple: () => Promise<void> // Kept as placeholder/mock
  signInAnonymously: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  setupAuthListener: () => () => void
  updateUserProfile: (updates: Partial<User>) => Promise<void>
}

type AuthStore = AuthState & AuthActions

// Helper to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Storage keys
const USERS_STORAGE_KEY = 'local_users_db'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      isLoading: false,
      isInitialized: false,
      initError: null,

      setupAuthListener: () => {
        // No-op for local auth, as state is managed synchronously/locally
        return () => { }
      },

      initialize: async () => {
        set({ isInitialized: true, initError: null })
      },

      signIn: async (email, password) => {
        set({ isLoading: true })
        try {
          await delay(500) // Simulate network delay

          const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY)
          const users: Record<string, User & { password: string }> = usersJson ? JSON.parse(usersJson) : {}

          const userKey = email.toLowerCase()
          const userRecord = users[userKey]

          if (!userRecord || userRecord.password !== password) {
            throw new Error('Invalid email or password')
          }

          // Create session
          const session: Session = {
            access_token: 'local-mock-token-' + Date.now(),
            refresh_token: 'local-mock-refresh-' + Date.now(),
            expires_in: 3600,
            token_type: 'bearer',
            user: userRecord,
          }

          set({ session, user: userRecord })

          if (userRecord.id) {
            void useNotificationStore.getState().registerAndSaveToken(userRecord.id)
          }

        } catch (error) {
          throw error instanceof Error ? error : new Error('Sign in failed')
        } finally {
          set({ isLoading: false })
        }
      },

      signUp: async (email, password) => {
        set({ isLoading: true })
        try {
          await delay(500)

          // Get existing users
          const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY)
          const users: Record<string, User & { password: string }> = usersJson ? JSON.parse(usersJson) : {}

          const userKey = email.toLowerCase()

          if (users[userKey]) {
            throw new Error('User already exists')
          }

          // Create new user
          const newUser: User = {
            id: 'local-user-' + Date.now(),
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            full_name: '',
            avatar_url: '',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            role: 'authenticated'
          }

          // Save to storage with password
          users[userKey] = { ...newUser, password }
          await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

          // Create session
          const session: Session = {
            access_token: 'local-mock-token-' + Date.now(),
            refresh_token: 'local-mock-refresh-' + Date.now(),
            expires_in: 3600,
            token_type: 'bearer',
            user: newUser,
          }

          set({ session, user: newUser })
          if (newUser.id) {
            void useNotificationStore.getState().registerAndSaveToken(newUser.id)
          }
        } catch (error) {
          throw error instanceof Error ? error : new Error('Sign up failed')
        } finally {
          set({ isLoading: false })
        }
      },

      signInWithGoogle: async () => {
        // Mock/Placeholder
        set({ isLoading: true })
        try {
          await delay(1000)
          const mockUser: User = {
            id: 'google-mock-' + Date.now(),
            email: 'google@example.com',
            full_name: 'Google User',
            avatar_url: 'https://via.placeholder.com/150',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            role: 'authenticated'
          }

          const session: Session = {
            access_token: 'mock-google-token',
            refresh_token: 'mock-google-refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: mockUser
          }
          set({ session, user: mockUser })
        } finally {
          set({ isLoading: false })
        }
      },

      signInWithApple: async () => {
        set({ isLoading: true })
        try {
          await delay(1000)
          const mockUser: User = {
            id: 'apple-mock-' + Date.now(),
            email: 'apple@example.com',
            full_name: 'Apple User',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            role: 'authenticated'
          }

          const session: Session = {
            access_token: 'mock-apple-token',
            refresh_token: 'mock-apple-refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: mockUser
          }
          set({ session, user: mockUser })
        } finally {
          set({ isLoading: false })
        }
      },

      signInAnonymously: async () => {
        set({ isLoading: true })
        try {
          await delay(500)
          const mockUser: User = {
            id: 'anon-' + Date.now(),
            email: undefined,
            full_name: 'Guest',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            role: 'authenticated'
          }

          const session: Session = {
            access_token: 'mock-anon-token',
            refresh_token: 'mock-anon-refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: mockUser
          }
          set({ session, user: mockUser })
        } finally {
          set({ isLoading: false })
        }
      },

      signOut: async () => {
        set({ session: null, user: null })
        useNotificationStore.getState().clearToken()
      },

      deleteAccount: async () => {
        const { user } = get()
        if (!user || !user.email) return

        const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY)
        if (usersJson) {
          const users: Record<string, User> = JSON.parse(usersJson)
          delete users[user.email.toLowerCase()]
          await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
        }

        set({ session: null, user: null })
      },

      resetPassword: async (email) => {
        await delay(500)
        console.log('Mock password reset for:', email)
      },

      updatePassword: async (password) => {
        const { user } = get()
        if (!user || !user.email) throw new Error('No user logged in')

        const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY)
        const users = usersJson ? JSON.parse(usersJson) : {}

        if (users[user.email.toLowerCase()]) {
          users[user.email.toLowerCase()].password = password
          await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
        }
      },

      updateUserProfile: async (updates) => {
        const { user } = get()
        if (!user || !user.email) return // Anonymous users might not persist profile changes in this simple mock

        const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() }

        // Update in storage
        const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY)
        const users = usersJson ? JSON.parse(usersJson) : {}

        if (users[user.email.toLowerCase()]) {
          // Preserve password if it exists on the record (it should)
          const currentRecord = users[user.email.toLowerCase()]
          users[user.email.toLowerCase()] = { ...currentRecord, ...updatedUser }
          await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
        }

        // Update in state
        // Need to update session.user as well if session exists
        const currentSession = get().session
        const updatedSession = currentSession ? { ...currentSession, user: updatedUser } : null

        set({ user: updatedUser, session: updatedSession })
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ session: state.session, user: state.user }),
    }
  )
)
