import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
    analyzeScanQuality,
    autoCategorizeContact,
    detectIndustry,
    estimateCompanySize,
    calculatePriorityScore,
    checkIfCompetitor,
    extractContactFromImage,
    extractLocationFromAddress,
    findLinkedInProfile,
    generateCompanySummary,
    generateConversationStarters,
    generatePersonSummary,
    generateTags,
} from '@/src/lib/gemini'
import type { Contact, ContactCategory, CompanySize, ContactFormData, ScanQuality } from '@/src/types/contact'

interface ContactsState {
    contacts: Contact[]
    addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void
    updateContact: (id: string, updates: Partial<ContactFormData>) => void
    deleteContact: (id: string) => void
    getContact: (id: string) => Contact | undefined
    searchContacts: (query: string) => Contact[]
    getContactsByTag: (tag: string) => Contact[]
    getContactsByCategory: (category: ContactCategory) => Contact[]
    getContactsByIndustry: (industry: string) => Contact[]
    getContactsByCompanySize: (size: CompanySize) => Contact[]
    getContactsByLocation: (country?: string, city?: string) => Contact[]
    getCompetitors: () => Contact[]
    addTagToContact: (id: string, tag: string) => void
    removeTagFromContact: (id: string, tag: string) => void
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
                        contact.phone?.toLowerCase().includes(lowerQuery) ||
                        contact.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
                        contact.industry?.toLowerCase().includes(lowerQuery)
                )
            },

            getContactsByTag: (tag) => {
                return get().contacts.filter((contact) => 
                    contact.tags?.includes(tag)
                )
            },

            getContactsByCategory: (category) => {
                return get().contacts.filter((contact) => 
                    contact.category === category
                )
            },

            getContactsByIndustry: (industry) => {
                return get().contacts.filter((contact) => 
                    contact.industry?.toLowerCase() === industry.toLowerCase()
                )
            },

            getContactsByCompanySize: (size) => {
                return get().contacts.filter((contact) => 
                    contact.companySize === size
                )
            },

            getContactsByLocation: (country, city) => {
                return get().contacts.filter((contact) => {
                    if (!contact.location) return false
                    if (country && contact.location.country !== country) return false
                    if (city && contact.location.city !== city) return false
                    return true
                })
            },

            getCompetitors: () => {
                return get().contacts.filter((contact) => contact.isCompetitor)
            },

            addTagToContact: (id, tag) => {
                set((state) => ({
                    contacts: state.contacts.map((contact) =>
                        contact.id === id && !contact.tags?.includes(tag)
                            ? { 
                                ...contact, 
                                tags: [...(contact.tags || []), tag],
                                updatedAt: Date.now() 
                            }
                            : contact
                    ),
                }))
            },

            removeTagFromContact: (id, tag) => {
                set((state) => ({
                    contacts: state.contacts.map((contact) =>
                        contact.id === id
                            ? { 
                                ...contact, 
                                tags: contact.tags?.filter((t) => t !== tag) || [],
                                updatedAt: Date.now() 
                            }
                            : contact
                    ),
                }))
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
    userIndustry?: string,
    onStatusChange?: (status: string) => void
): Promise<Partial<Contact>> {
    try {
        const scanTimestamp = Date.now()
        
        // 1. OCR with confidence scoring
        onStatusChange?.('Scanning business card...')
        const extracted = await extractContactFromImage(imageUri)

        const contactPartial: Partial<Contact> = {
            ...extracted,
            imageUri,
            cardImageUri: imageUri,
            scanTimestamp,
        }

        const name = extracted.name || ''
        const title = extracted.title || ''
        const company = extracted.company || ''
        const address = extracted.address || ''

        if (name && company) {
            onStatusChange?.(`Analyzing scan quality...`)
            // Analyze OCR quality
            const { confidence, quality } = await analyzeScanQuality(extracted)
            contactPartial.ocrConfidence = confidence
            contactPartial.scanQuality = quality

            onStatusChange?.(`Finding info about ${name}...`)
            // Parallel execution for independent AI tasks
            const [
                personSummary, 
                companySummary, 
                linkedInUrl,
                industry,
                companySize,
                category,
                tags,
                priorityScore,
                isCompetitor,
                location
            ] = await Promise.all([
                generatePersonSummary(name, title, company),
                generateCompanySummary(company),
                findLinkedInProfile(name, company),
                detectIndustry(company, title),
                estimateCompanySize(company),
                autoCategorizeContact(name, title, company),
                generateTags(name, title, company),
                calculatePriorityScore(title, company),
                checkIfCompetitor(company, title, userIndustry),
                address ? extractLocationFromAddress(address) : Promise.resolve(undefined),
            ])

            contactPartial.personSummary = personSummary
            contactPartial.companySummary = companySummary
            contactPartial.linkedInUrl = linkedInUrl
            contactPartial.industry = industry
            contactPartial.companySize = companySize
            contactPartial.category = category
            contactPartial.tags = tags
            contactPartial.priorityScore = priorityScore
            contactPartial.isCompetitor = isCompetitor
            contactPartial.location = location

            onStatusChange?.('Generating conversation starters...')
            const conversationStarters = await generateConversationStarters(
                name,
                title,
                company,
                personSummary
            )
            contactPartial.conversationStarters = conversationStarters
        } else {
            // Set defaults if extraction failed
            contactPartial.tags = []
            contactPartial.category = 'other'
            contactPartial.companySize = 'unknown'
            contactPartial.priorityScore = 0
            contactPartial.isCompetitor = false
            contactPartial.ocrConfidence = 0
            contactPartial.scanQuality = 'poor'
        }

        return contactPartial
    } catch (error) {
        console.error('Processing Error:', error)
        // Return whatever we have so far in case of partial failure
        return { 
            imageUri, 
            cardImageUri: imageUri,
            scanTimestamp: Date.now(),
            tags: [],
            category: 'other',
            companySize: 'unknown',
            priorityScore: 0,
            isCompetitor: false,
            ocrConfidence: 0,
            scanQuality: 'unknown',
        }
    }
}
