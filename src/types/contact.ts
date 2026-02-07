export type ContactCategory = 
  | 'lead' 
  | 'partner' 
  | 'investor' 
  | 'client' 
  | 'vendor' 
  | 'competitor' 
  | 'prospect' 
  | 'influencer'
  | 'other'

export type CompanySize = 
  | 'startup' 
  | 'small' 
  | 'medium' 
  | 'large' 
  | 'enterprise' 
  | 'unknown'

export type ScanQuality = 'excellent' | 'good' | 'poor' | 'unknown'

export interface Location {
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

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
  
  // Smart Tagging
  tags: string[]
  category: ContactCategory
  
  // Business Intelligence
  industry?: string
  companySize: CompanySize
  priorityScore: number
  
  // Location Data
  location?: Location
  
  // Competitive Intelligence
  isCompetitor: boolean
  
  // Quality Metrics
  ocrConfidence: number
  scanQuality: ScanQuality
  scanTimestamp: number
  
  // Event tracking (for ROI)
  eventName?: string
  eventCost?: number
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
  tags: string[]
  category: ContactCategory
  industry: string
  companySize: CompanySize
  isCompetitor: boolean
}

export interface ExtractedContact {
  name: string
  title: string
  company: string
  email: string
  phone: string
  address: string
  website: string
  
  // Enhanced extraction
  location?: Location
  industry?: string
  companySize?: CompanySize
  category?: ContactCategory
  tags?: string[]
  priorityScore?: number
  isCompetitor?: boolean
  ocrConfidence?: number
  scanQuality?: ScanQuality
}
