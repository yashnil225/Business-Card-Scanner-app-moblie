import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface LocalUser {
    id: string
    name: string
    email: string | null
    photoUri: string | null
    hasCompletedOnboarding: boolean
    createdAt: number
    updatedAt: number
}

interface UserState {
    user: LocalUser | null
    isLoading: boolean
}

interface UserActions {
    createUser: (data: { name: string; email?: string; photoUri?: string }) => void
    updateUser: (updates: Partial<Omit<LocalUser, 'id' | 'createdAt'>>) => void
    completeOnboarding: () => void
    deleteUser: () => void
    getUser: () => LocalUser | null
    hasUser: () => boolean
    hasCompletedOnboarding: () => boolean
}

type UserStore = UserState & UserActions

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,

            createUser: (data) => {
                const now = Date.now()
                const newUser: LocalUser = {
                    id: generateId(),
                    name: data.name,
                    email: data.email || null,
                    photoUri: data.photoUri || null,
                    hasCompletedOnboarding: false,
                    createdAt: now,
                    updatedAt: now,
                }
                set({ user: newUser })
            },

            updateUser: (updates) => {
                set((state) => {
                    if (!state.user) return state
                    return {
                        user: {
                            ...state.user,
                            ...updates,
                            updatedAt: Date.now(),
                        },
                    }
                })
            },

            completeOnboarding: () => {
                set((state) => {
                    if (!state.user) return state
                    return {
                        user: {
                            ...state.user,
                            hasCompletedOnboarding: true,
                            updatedAt: Date.now(),
                        },
                    }
                })
            },

            deleteUser: () => {
                set({ user: null })
            },

            getUser: () => {
                return get().user
            },

            hasUser: () => {
                return get().user !== null
            },

            hasCompletedOnboarding: () => {
                return get().user?.hasCompletedOnboarding ?? false
            },
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)
