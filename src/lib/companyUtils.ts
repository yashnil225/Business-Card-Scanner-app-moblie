

// Fixed color palette for company initials
const COMPANY_COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Lavender
    '#85C1E2', // Sky Blue
    '#F8B88B', // Peach
    '#C0E8F9', // Light Blue
]

export function getCompanyColor(companyName: string): string {
    if (!companyName) return COMPANY_COLORS[0]
    let hash = 0
    for (let i = 0; i < companyName.length; i++) {
        hash = companyName.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % COMPANY_COLORS.length
    return COMPANY_COLORS[index]
}

export function getInitials(name: string): string {
    if (!name) return '?'
    const words = name.trim().split(/\s+/)
    if (words.length === 1) {
        return name.charAt(0).toUpperCase()
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

// Industry keywords for simple categorization
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
    'Technology': ['tech', 'software', 'app', 'digital', 'ai', 'artificial intelligence', 'data', 'cloud', 'cyber', 'it ', 'information technology'],
    'Finance': ['bank', 'finance', 'invest', 'capital', 'wealth', 'insurance', 'fintech', 'trading'],
    'Healthcare': ['health', 'medical', 'pharma', 'clinic', 'hospital', 'wellness', 'biotech'],
    'Education': ['education', 'school', 'university', 'academy', 'learning', 'training'],
    'Marketing': ['marketing', 'advertising', 'media', 'pr', 'communications', 'brand'],
    'Retail': ['retail', 'shop', 'store', 'ecommerce', 'consumer', 'fashion'],
    'Real Estate': ['real estate', 'property', 'construction', 'architecture'],
    'Consulting': ['consulting', 'advisory', 'strategy', 'management'],
    'Entertainment': ['entertainment', 'game', 'studio', 'production', 'music', 'film'],
    'Legal': ['law', 'legal', 'attorney'],
}

export function categorizeIndustry(companyName: string): string | null {
    if (!companyName) return null
    const lowerCompany = companyName.toLowerCase()

    for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerCompany.includes(keyword)) {
                return industry
            }
        }
    }
    return 'Other'
}

export function getIndustryStats(contacts: { company?: string }[]): Map<string, number> {
    const stats = new Map<string, number>()

    contacts.forEach((contact) => {
        if (contact.company) {
            const industry = categorizeIndustry(contact.company)
            if (industry) {
                stats.set(industry, (stats.get(industry) || 0) + 1)
            }
        }
    })

    return stats
}

export function getTopCompanies(contacts: { company?: string }[], limit: number = 5): { name: string; count: number }[] {
    const companyCounts = new Map<string, number>()

    contacts.forEach((contact) => {
        if (contact.company) {
            const normalized = contact.company.trim()
            companyCounts.set(normalized, (companyCounts.get(normalized) || 0) + 1)
        }
    })

    return Array.from(companyCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
}

// Industry colors matching theme
const INDUSTRY_COLORS: Record<string, string> = {
    'Technology': '#4169E1',
    'Finance': '#22c55e',
    'Healthcare': '#ef4444',
    'Education': '#f59e0b',
    'Marketing': '#ec4899',
    'Retail': '#8b5cf6',
    'Real Estate': '#14b8a6',
    'Consulting': '#6366f1',
    'Entertainment': '#f97316',
    'Legal': '#64748b',
    'Other': '#94a3b8',
}

export function getIndustryColor(industry: string): string {
    return INDUSTRY_COLORS[industry] || INDUSTRY_COLORS['Other']
}
