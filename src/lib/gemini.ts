import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ContactCategory, CompanySize, ScanQuality, ExtractedContact, Location } from '@/src/types/contact';

// Initialize Gemini API
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
if (!API_KEY) {
    console.warn('Gemini API Key is missing. Please check your .env file.')
}

const genAI = new GoogleGenerativeAI(API_KEY)

// Helper to convert base64 or URI to a generic Part object
async function fileToGenerativePart(
    uri: string
): Promise<{ inlineData: { data: string; mimeType: string } }> {
    try {
        const response = await fetch(uri)
        const blob = await response.blob()
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1]
                resolve(base64)
            }
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
        return {
            inlineData: {
                data: base64Data,
                mimeType: blob.type || 'image/jpeg',
            },
        }
    } catch (error) {
        console.error('Error converting file to generative part:', error)
        throw error
    }
}

/**
 * Analyze scan quality and OCR confidence
 */
export async function analyzeScanQuality(extracted: ExtractedContact): Promise<{ confidence: number; quality: ScanQuality }> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        
        const prompt = `
            Based on this extracted business card data, analyze the OCR quality.
            
            Extracted data:
            - Name: "${extracted.name || 'MISSING'}"
            - Title: "${extracted.title || 'MISSING'}"
            - Company: "${extracted.company || 'MISSING'}"
            - Email: "${extracted.email || 'MISSING'}"
            - Phone: "${extracted.phone || 'MISSING'}"
            - Address: "${extracted.address || 'MISSING'}"
            - Website: "${extracted.website || 'MISSING'}"
            
            Calculate an OCR confidence score (0-100) based on:
            - How many critical fields (name, company) were extracted
            - Whether email format looks valid
            - Whether phone format looks valid
            - Whether company and title look professional
            
            Return ONLY a JSON object in this format:
            { "confidence": number, "quality": "excellent" | "good" | "poor" }
            
            Quality guidelines:
            - excellent: confidence >= 85, all critical fields present
            - good: confidence >= 60, most critical fields present
            - poor: confidence < 60 or missing critical fields
        `
        
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(jsonStr)
        
        return {
            confidence: Math.max(0, Math.min(100, parsed.confidence || 0)),
            quality: ['excellent', 'good', 'poor'].includes(parsed.quality) ? parsed.quality : 'poor'
        }
    } catch (error) {
        console.error('Scan Quality Analysis Error:', error)
        return { confidence: 50, quality: 'unknown' }
    }
}

/**
 * Auto-categorize contact based on role and company context
 */
export async function autoCategorizeContact(
    name: string,
    title: string,
    company: string
): Promise<ContactCategory> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        
        const prompt = `
            Categorize this contact into one category based on their role and likely relationship:
            
            Name: ${name}
            Title: ${title}
            Company: ${company}
            
            Categories to choose from:
            - lead: Potential customer, sales prospect, someone interested in buying
            - partner: Strategic partner, collaborator, joint venture potential
            - investor: Venture capitalist, angel investor, funding source
            - client: Existing customer, current client
            - vendor: Supplier, service provider, someone you buy from
            - prospect: Potential client, early stage relationship
            - influencer: Industry thought leader, blogger, content creator
            - other: None of the above categories
            
            Return ONLY the category name (one word).
        `
        
        const result = await model.generateContent(prompt)
        const category = result.response.text().trim().toLowerCase()
        
        const validCategories: ContactCategory[] = ['lead', 'partner', 'investor', 'client', 'vendor', 'prospect', 'influencer', 'other']
        return validCategories.includes(category as ContactCategory) ? category as ContactCategory : 'other'
    } catch (error) {
        console.error('Auto-categorization Error:', error)
        return 'other'
    }
}

/**
 * Detect industry from company context and title
 */
export async function detectIndustry(company: string, title: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        
        const prompt = `
            Determine the industry for this company and role:
            
            Company: ${company}
            Title/Role: ${title}
            
            Return the industry category (one of these or a specific one):
            - Technology
            - Healthcare
            - Finance
            - Education
            - Marketing
            - Retail
            - Real Estate
            - Consulting
            - Legal
            - Manufacturing
            - Entertainment
            - Energy
            - Transportation
            - Hospitality
            - Construction
            - Agriculture
            - Other
            
            Return ONLY the industry name.
        `
        
        const result = await model.generateContent(prompt)
        return result.response.text().trim()
    } catch (error) {
        console.error('Industry Detection Error:', error)
        return 'Other'
    }
}

/**
 * Estimate company size (startup to enterprise)
 */
export async function estimateCompanySize(company: string): Promise<CompanySize> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        
        const prompt = `
            Estimate the company size for "${company}" based on public knowledge.
            
            Consider:
            - Is it a well-known global corporation? (likely enterprise)
            - Is it a mid-sized established company? (likely large)
            - Is it a growing startup with funding? (likely medium)
            - Is it a small local business or early startup? (likely small/startup)
            
            Return ONLY one of these: startup | small | medium | large | enterprise | unknown
            
            Definitions:
            - startup: Early stage, < 50 employees, funded or bootstrapped
            - small: 50-200 employees, established local/regional business
            - medium: 200-1000 employees, regional/national presence
            - large: 1000-10000 employees, national/multinational
            - enterprise: 10000+ employees, global corporation
            - unknown: Cannot determine from available information
        `
        
        const result = await model.generateContent(prompt)
        const size = result.response.text().trim().toLowerCase()
        
        const validSizes: CompanySize[] = ['startup', 'small', 'medium', 'large', 'enterprise', 'unknown']
        return validSizes.includes(size as CompanySize) ? size as CompanySize : 'unknown'
    } catch (error) {
        console.error('Company Size Estimation Error:', error)
        return 'unknown'
    }
}

/**
 * Calculate priority score based on role seniority and company size
 */
export async function calculatePriorityScore(title: string, company: string): Promise<number> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        
        const prompt = `
            Calculate a priority score (0-100) for networking with this contact:
            
            Title: ${title}
            Company: ${company}
            
            Consider:
            - Role seniority (C-level = highest, VP/Director = high, Manager = medium, Individual = lower)
            - Company prestige and size
            - Strategic value for business development
            
            Scoring guidelines:
            - 90-100: C-level/Founder at major company or unicorn startup
            - 70-89: VP/Director at large company or C-level at smaller company
            - 50-69: Manager at established company or Director at small company
            - 30-49: Individual contributor at good company
            - 0-29: Junior role or very small company
            
            Return ONLY a number between 0 and 100.
        `
        
        const result = await model.generateContent(prompt)
        const score = parseInt(result.response.text().trim())
        return Math.max(0, Math.min(100, score || 50))
    } catch (error) {
        console.error('Priority Score Calculation Error:', error)
        return 50
    }
}

/**
 * Check if contact is from a competitor company
 */
export async function checkIfCompetitor(
    company: string,
    title: string,
    userIndustry?: string
): Promise<boolean> {
    if (!userIndustry) return false
    
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        
        const prompt = `
            Determine if this contact's company is a competitor:
            
            User's Industry: ${userIndustry}
            Contact's Company: ${company}
            Contact's Title: ${title}
            
            Analyze if ${company} operates in the same industry as ${userIndustry} and could be considered a competitor.
            
            Return ONLY "true" or "false".
        `
        
        const result = await model.generateContent(prompt)
        const response = result.response.text().trim().toLowerCase()
        return response === 'true'
    } catch (error) {
        console.error('Competitor Check Error:', error)
        return false
    }
}

/**
 * Generate smart tags for the contact
 */
export async function generateTags(name: string, title: string, company: string): Promise<string[]> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        
        const prompt = `
            Generate 3-5 relevant tags for this contact to help with categorization and search:
            
            Name: ${name}
            Title: ${title}
            Company: ${company}
            
            Tag ideas (mix of these):
            - Role-based: "Executive", "Engineer", "Sales", "Marketing", "Founder", "Investor"
            - Priority: "High Priority", "Warm Lead", "Decision Maker"
            - Source: "Conference", "LinkedIn", "Referral"
            - Follow-up: "Follow Up", "Nurture", "Hot Lead"
            
            Return as a JSON array of strings.
            Example: ["Executive", "High Priority", "Follow Up", "Tech Industry"]
        `
        
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const tags = JSON.parse(jsonStr)
        
        return Array.isArray(tags) ? tags.slice(0, 5) : []
    } catch (error) {
        console.error('Tag Generation Error:', error)
        return []
    }
}

/**
 * Extract structured location data from address string
 */
export async function extractLocationFromAddress(address: string): Promise<Location | undefined> {
    if (!address.trim()) return undefined
    
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        
        const prompt = `
            Parse this address and extract structured location data:
            
            Address: "${address}"
            
            Return ONLY a JSON object in this format:
            {
                "address": "full street address",
                "city": "city name",
                "state": "state/province",
                "country": "country name",
                "postalCode": "zip/postal code"
            }
            
            Use null for any fields you cannot determine.
        `
        
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const location = JSON.parse(jsonStr)
        
        return {
            address: location.address || address,
            city: location.city || undefined,
            state: location.state || undefined,
            country: location.country || undefined,
            postalCode: location.postalCode || undefined,
        }
    } catch (error) {
        console.error('Location Extraction Error:', error)
        return { address }
    }
}

/**
 * Extract contact details from a business card image using Gemini Vision.
 */
export async function extractContactFromImage(
    imageUri: string
): Promise<ExtractedContact> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const imagePart = await fileToGenerativePart(imageUri)

        const prompt = `
            Analyze this business card image and extract the following details in JSON format.
            Return ONLY the JSON object, no markdown or other text.
            If a field is missing, use an empty string.

            Fields to extract:
            - name (Full name)
            - title (Job title)
            - company (Company name)
            - email (Email address)
            - phone (Phone number)
            - address (Physical address)
            - website (Website URL)
        `

        const result = await model.generateContent([prompt, imagePart])
        const response = await result.response
        const text = response.text()

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()

        return JSON.parse(jsonStr)
    } catch (error) {
        console.error('OCR Extraction Error:', error)
        throw new Error('Failed to extract contact info.')
    }
}

/**
 * Generate a professional summary about the person based on their role and company.
 */
export async function generatePersonSummary(
    name: string,
    title: string,
    company: string
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const prompt = `
            Write a comprehensive professional summary for ${name}, who is a ${title} at ${company}.
            Detail the typical responsibilities, strategic impact, and required expertise for this role.
            Keep it professional, insightful, and around 4-5 sentences.
        `
        const result = await model.generateContent(prompt)
        return result.response.text()
    } catch (error) {
        console.error('Person Summary Error:', error)
        return `${name} is a ${title} at ${company}.`
    }
}

/**
 * Generate a summary about the company.
 */
export async function generateCompanySummary(company: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const prompt = `
            Write a comprehensive summary about the company "${company}".
            Detail their industry, key products or services, market position, and any notable achievements or global presence.
            If specific details are unavailable, provide a detailed industry overview relevant to this company type.
            Keep it around 4-5 sentences.
        `
        const result = await model.generateContent(prompt)
        return result.response.text()
    } catch (error) {
        console.error('Company Summary Error:', error)
        return `${company} is a business operating in its respective industry.`
    }
}

/**
 * Find a likely LinkedIn profile URL.
 */
export async function findLinkedInProfile(name: string, company: string): Promise<string> {
    return `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name + ' ' + company)}`
}

/**
 * Generate conversation starters.
 */
export async function generateConversationStarters(
    name: string,
    title: string,
    company: string,
    personSummary: string
): Promise<string[]> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const prompt = `
            Based on this person: ${name}, ${title} at ${company}, and this summary: "${personSummary}",
            generate 3 professional conversation starters or icebreakers to use when meeting them.
            Return them as a JSON array of strings.
            Example: ["Question 1", "Question 2", "Question 3"]
        `
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(jsonStr)
    } catch (error) {
        console.error('Conversation Starters Error:', error)
        return [
            `I'd love to hear more about your work at ${company}.`,
            `How long have you been working as a ${title}?`,
            `What are the biggest challenges in your industry right now?`
        ]
    }
}
