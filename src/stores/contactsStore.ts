import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
    extractContactFromImage,
    findLinkedInProfile,
    generateCompanySummary,
    generateConversationStarters,
    generatePersonSummary,
} from '@/src/lib/gemini'
import type { Contact, ContactFormData } from '@/src/types/contact'

interface ContactsState {
    contacts: Contact[]
    addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void
    updateContact: (id: string, updates: Partial<ContactFormData>) => void
    deleteContact: (id: string) => void
    getContact: (id: string) => Contact | undefined
    searchContacts: (query: string) => Contact[]
}

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substr(2, 9)

export const useContactsStore = create<ContactsState>()(
    persist(
        (set, get) => ({
            contacts: [],

            addContact: (contactData) => {
                const newContact: Contact = {
                    ...contactData,
                    id: generateId(),
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                }
                set((state) => ({
                    contacts: [newContact, ...state.contacts],
                }))
            },

            updateContact: (id, updates) => {
                set((state) => ({
                    contacts: state.contacts.map((contact) =>
                        contact.id === id
                            ? { ...contact, ...updates, updatedAt: Date.now() }
                            : contact
                    ),
                }))
            },

            deleteContact: (id) => {
                set((state) => ({
                    contacts: state.contacts.filter((contact) => contact.id !== id),
                }))
            },

            getContact: (id) => {
                return get().contacts.find((contact) => contact.id === id)
            },

            searchContacts: (query) => {
                const lowerQuery = query.toLowerCase()
                return get().contacts.filter(
                    (contact) =>
                        contact.name.toLowerCase().includes(lowerQuery) ||
                        contact.company?.toLowerCase().includes(lowerQuery) ||
                        contact.email?.toLowerCase().includes(lowerQuery) ||
                        contact.phone?.toLowerCase().includes(lowerQuery)
                )
            },
        }),
        {
            name: 'contacts-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)

export async function processContactImage(
    imageUri: string,
    onStatusChange?: (status: string) => void
): Promise<Partial<Contact>> {
    try {
        // 1. OCR
        onStatusChange?.('Scanning business card...')
        const extracted = await extractContactFromImage(imageUri)

        const contactPartial: Partial<Contact> = {
            ...extracted,
            imageUri,
            cardImageUri: imageUri,
        }

        // 2. Identify Person & Company
        const name = extracted.name || ''
        const title = extracted.title || ''
        const company = extracted.company || ''

        if (name && company) {
            onStatusChange?.(`Finding info about ${name}...`)
            // Parallel execution for independent AI tasks
            const [personSummary, companySummary, linkedInUrl] = await Promise.all([
                generatePersonSummary(name, title, company),
                generateCompanySummary(company),
                findLinkedInProfile(name, company),
            ])

            contactPartial.personSummary = personSummary
            contactPartial.companySummary = companySummary
            contactPartial.linkedInUrl = linkedInUrl

            onStatusChange?.('Generating conversation starters...')
            const conversationStarters = await generateConversationStarters(
                name,
                title,
                company,
                personSummary
            )
            contactPartial.conversationStarters = conversationStarters
        }

        return contactPartial
    } catch (error) {
        console.error('Processing Error:', error)
        // Return whatever we have so far in case of partial failure
        return { imageUri, cardImageUri: imageUri }
    }
}
