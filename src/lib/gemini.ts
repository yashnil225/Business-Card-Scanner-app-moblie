import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
if (!API_KEY) {
    console.warn('Gemini API Key is missing. Please check your .env file.')
}

const genAI = new GoogleGenerativeAI(API_KEY)

// Helper to convert base64 or URI to a generic Part object
// In Expo/React Native, we often deal with local file URIs.
// For Gemini, we need to pass the image data.
// This example assumes we can fetch the blob/base64 from the URI.
async function fileToGenerativePart(
    uri: string
): Promise<{ inlineData: { data: string; mimeType: string } }> {
    try {
        const response = await fetch(uri)
        const blob = await response.blob()
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                // reader.result looks like "data:image/jpeg;base64,..."
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

export interface ExtractedContact {
    name: string
    title: string
    company: string
    email: string
    phone: string
    address: string
    website: string
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
        // Fallback or rethrow
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
 * Note: Gemini cannot browse the live web for real-time URLs reliably without search tools,
 * but can generate a likely search URL or best-guess profile format.
 * For this app, we'll generate a LinkedIn Search URL which is safer and functional.
 */
export async function findLinkedInProfile(name: string, company: string): Promise<string> {
    // Direct LinkedIn search URL is reliable
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
