export interface Contact {
    id: string
    name: string
    title?: string
    company?: string
    email?: string
    phone?: string
    address?: string
    website?: string
    notes?: string
    imageUri?: string
    createdAt: number
    updatedAt: number
    // AI-generated content
    personSummary?: string
    companySummary?: string
    conversationStarters?: string[]
    cardImageUri?: string
    linkedInUrl?: string
}

export interface ContactFormData {
    name: string
    title: string
    company: string
    email: string
    phone: string
    address: string
    website: string
    notes: string
}
