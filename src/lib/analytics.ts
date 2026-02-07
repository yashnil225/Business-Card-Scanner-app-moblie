import type { Contact, CompanySize } from '@/src/types/contact'

export interface WeeklyTrend {
  day: string
  date: string
  count: number
}

export interface IndustryData {
  name: string
  count: number
  percentage: number
}

export interface CompanySizeData {
  size: CompanySize
  count: number
  label: string
}

export interface GeographicData {
  country: string
  city?: string
  count: number
  coordinates?: { latitude: number; longitude: number }
}

export interface NetworkMetrics {
  totalContacts: number
  thisWeek: number
  thisMonth: number
  networkingVelocity: number // contacts per week average
  uniqueIndustries: number
  uniqueCompanies: number
  competitorCount: number
  highPriorityCount: number
  networkValueScore: number
  averagePriorityScore: number
}

export interface TopCompany {
  name: string
  count: number
  industry?: string
  size?: CompanySize
}

const COMPANY_SIZE_ORDER: CompanySize[] = ['startup', 'small', 'medium', 'large', 'enterprise', 'unknown']

const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  startup: 'Startup',
  small: 'Small (50-200)',
  medium: 'Medium (200-1K)',
  large: 'Large (1K-10K)',
  enterprise: 'Enterprise (10K+)',
  unknown: 'Unknown',
}

export function getWeeklyTrends(contacts: Contact[]): WeeklyTrend[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const trends: WeeklyTrend[] = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const count = contacts.filter(c => {
      const scanDate = new Date(c.scanTimestamp || c.createdAt)
        .toISOString()
        .split('T')[0]
      return scanDate === dateStr
    }).length
    
    trends.push({
      day: days[date.getDay()],
      date: dateStr,
      count,
    })
  }
  
  return trends
}

export function getIndustryBreakdown(contacts: Contact[]): IndustryData[] {
  const industryMap = new Map<string, number>()
  
  contacts.forEach(contact => {
    const industry = contact.industry || 'Unknown'
    industryMap.set(industry, (industryMap.get(industry) || 0) + 1)
  })
  
  const total = contacts.length || 1
  const breakdown: IndustryData[] = []
  
  industryMap.forEach((count, name) => {
    breakdown.push({
      name,
      count,
      percentage: Math.round((count / total) * 100),
    })
  })
  
  return breakdown.sort((a, b) => b.count - a.count)
}

export function getCompanySizeBreakdown(contacts: Contact[]): CompanySizeData[] {
  const sizeMap = new Map<CompanySize, number>()
  
  contacts.forEach(contact => {
    const size = contact.companySize || 'unknown'
    sizeMap.set(size, (sizeMap.get(size) || 0) + 1)
  })
  
  const breakdown: CompanySizeData[] = COMPANY_SIZE_ORDER.map(size => ({
    size,
    count: sizeMap.get(size) || 0,
    label: COMPANY_SIZE_LABELS[size],
  }))
  
  return breakdown.filter(d => d.count > 0)
}

export function getGeographicDistribution(contacts: Contact[]): GeographicData[] {
  const geoMap = new Map<string, GeographicData>()
  
  contacts.forEach(contact => {
    if (contact.location?.country || contact.location?.city) {
      const key = `${contact.location.country || 'Unknown'}-${contact.location.city || 'Unknown'}`
      const existing = geoMap.get(key)
      
      if (existing) {
        existing.count++
      } else {
        geoMap.set(key, {
          country: contact.location.country || 'Unknown',
          city: contact.location.city,
          count: 1,
          coordinates: contact.location.coordinates,
        })
      }
    }
  })
  
  return Array.from(geoMap.values()).sort((a, b) => b.count - a.count)
}

export function getNetworkMetrics(contacts: Contact[]): NetworkMetrics {
  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const monthMs = 30 * 24 * 60 * 60 * 1000
  
  const thisWeek = contacts.filter(c => 
    (c.scanTimestamp || c.createdAt) > now - weekMs
  ).length
  
  const thisMonth = contacts.filter(c => 
    (c.scanTimestamp || c.createdAt) > now - monthMs
  ).length
  
  const uniqueIndustries = new Set(
    contacts.map(c => c.industry).filter(Boolean)
  ).size
  
  const uniqueCompanies = new Set(
    contacts.map(c => c.company).filter(Boolean)
  ).size
  
  const competitorCount = contacts.filter(c => c.isCompetitor).length
  
  const highPriorityCount = contacts.filter(c => 
    (c.priorityScore || 0) >= 70
  ).length
  
  const totalPriorityScore = contacts.reduce(
    (sum, c) => sum + (c.priorityScore || 0), 0
  )
  
  const averagePriorityScore = contacts.length > 0 
    ? Math.round(totalPriorityScore / contacts.length) 
    : 0
  
  // Calculate networking velocity (contacts per week over last 4 weeks)
  let weeklyVelocity = 0
  for (let i = 0; i < 4; i++) {
    const weekStart = now - (i + 1) * weekMs
    const weekEnd = now - i * weekMs
    const weekCount = contacts.filter(c => 
      (c.scanTimestamp || c.createdAt) > weekStart && 
      (c.scanTimestamp || c.createdAt) <= weekEnd
    ).length
    weeklyVelocity += weekCount
  }
  weeklyVelocity = Math.round(weeklyVelocity / 4)
  
  // Calculate network value score
  let networkValueScore = 0
  contacts.forEach(contact => {
    networkValueScore += (contact.priorityScore || 50) * 0.5
    
    const sizeBonuses: Record<CompanySize, number> = {
      startup: 5,
      small: 10,
      medium: 20,
      large: 30,
      enterprise: 50,
      unknown: 0,
    }
    networkValueScore += sizeBonuses[contact.companySize] || 0
    
    if (contact.isCompetitor) {
      networkValueScore += 5
    }
  })
  networkValueScore = Math.min(1000, Math.round(networkValueScore))
  
  return {
    totalContacts: contacts.length,
    thisWeek,
    thisMonth,
    networkingVelocity: weeklyVelocity,
    uniqueIndustries,
    uniqueCompanies,
    competitorCount,
    highPriorityCount,
    networkValueScore,
    averagePriorityScore,
  }
}

export function getTopCompanies(contacts: Contact[], limit = 10): TopCompany[] {
  const companyMap = new Map<string, { count: number; industry?: string; size?: CompanySize }>()
  
  contacts.forEach(contact => {
    if (contact.company) {
      const existing = companyMap.get(contact.company) || { count: 0 }
      companyMap.set(contact.company, {
        count: existing.count + 1,
        industry: contact.industry,
        size: contact.companySize,
      })
    }
  })
  
  return Array.from(companyMap.entries())
    .map(([name, data]) => ({
      name,
      ...data,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function getRecentActivity(contacts: Contact[], limit = 5): Contact[] {
  return [...contacts]
    .sort((a, b) => (b.scanTimestamp || b.createdAt) - (a.scanTimestamp || a.createdAt))
    .slice(0, limit)
}

export function getContactsByCategory(contacts: Contact[]): Record<string, number> {
  const categoryMap = new Map<string, number>()
  
  contacts.forEach(contact => {
    const category = contact.category || 'other'
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
  })
  
  return Object.fromEntries(categoryMap)
}

export function getQualityReport(contacts: Contact[]): { excellent: number; good: number; poor: number; unknown: number } {
  const report = { excellent: 0, good: 0, poor: 0, unknown: 0 }
  
  contacts.forEach(contact => {
    const quality = contact.scanQuality || 'unknown'
    report[quality]++
  })
  
  return report
}

export function getScanQualityChartData(contacts: Contact[]) {
  const report = getQualityReport(contacts)
  const total = contacts.length || 1
  
  return [
    { label: 'Excellent', value: report.excellent, color: '#4CAF50', percentage: Math.round((report.excellent / total) * 100) },
    { label: 'Good', value: report.good, color: '#2196F3', percentage: Math.round((report.good / total) * 100) },
    { label: 'Poor', value: report.poor, color: '#FF9800', percentage: Math.round((report.poor / total) * 100) },
    { label: 'Unknown', value: report.unknown, color: '#9E9E9E', percentage: Math.round((report.unknown / total) * 100) },
  ]
}
