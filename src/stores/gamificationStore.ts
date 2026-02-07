import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: number
  progress: number
  target: number
  category: 'scanning' | 'networking' | 'gamification' | 'business'
}

export interface WeeklyChallenge {
  id: string
  title: string
  description: string
  target: number
  current: number
  startsAt: number
  expiresAt: number
  reward: string
  completed: boolean
}

export interface GamificationState {
  // Streak
  currentStreak: number
  longestStreak: number
  lastScanDate: string | null
  
  // Achievements
  achievements: Achievement[]
  unlockedAchievementIds: string[]
  
  // Weekly Challenges
  weeklyChallenges: WeeklyChallenge[]
  
  // Stats
  totalScans: number
  totalContacts: number
  totalDaysActive: number
  
  // Network Score
  networkValueScore: number
  companiesAdded: number
  
  // Actions
  recordScan: () => void
  checkAchievements: () => void
  refreshWeeklyChallenges: () => void
  getNetworkValueScore: () => number
  getStreakStatus: () => { streak: number; isActive: boolean; daysUntilLost: number }
}

const ACHIEVEMENTS_CONFIG: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  // Scanning Achievements
  { id: 'first_scan', title: 'First Scan', description: 'Scan your first business card', icon: 'scan-outline', target: 1, category: 'scanning' },
  { id: 'scans_10', title: 'Getting Started', description: 'Scan 10 business cards', icon: 'people-outline', target: 10, category: 'scanning' },
  { id: 'scans_50', title: 'Networker', description: 'Scan 50 business cards', icon: 'briefcase-outline', target: 50, category: 'scanning' },
  { id: 'scans_100', title: 'Century Club', description: 'Scan 100 business cards', icon: 'trophy-outline', target: 100, category: 'scanning' },
  { id: 'scans_500', title: 'Master Scanner', description: 'Scan 500 business cards', icon: 'medal-outline', target: 500, category: 'scanning' },
  { id: 'scans_1000', title: 'Elite Networker', description: 'Scan 1,000 business cards', icon: 'ribbon-outline', target: 1000, category: 'scanning' },
  
  // Streak Achievements
  { id: 'streak_3', title: 'Consistency', description: 'Scan cards 3 days in a row', icon: 'flame-outline', target: 3, category: 'gamification' },
  { id: 'streak_7', title: 'On Fire', description: 'Scan cards 7 days in a row', icon: 'fire-outline', target: 7, category: 'gamification' },
  { id: 'streak_14', title: 'Dedicated', description: 'Scan cards 14 days in a row', icon: 'rocket-outline', target: 14, category: 'gamification' },
  { id: 'streak_30', title: 'Unstoppable', description: 'Scan cards 30 days in a row', icon: 'star-outline', target: 30, category: 'gamification' },
  
  // Quality Achievements
  { id: 'high_priority_10', title: 'Eye for Talent', description: 'Add 10 high-priority contacts', icon: 'star-outline', target: 10, category: 'business' },
  { id: 'industry_5', title: 'Industry Expert', description: 'Scan cards from 5 different industries', icon: 'grid-outline', target: 5, category: 'business' },
  { id: 'competitors_5', title: 'Competitive Intel', description: 'Track 5 competitor contacts', icon: 'shield-outline', target: 5, category: 'business' },
  
  // Networking Achievements
  { id: 'leads_25', title: 'Lead Generator', description: 'Add 25 leads', icon: 'trending-up-outline', target: 25, category: 'networking' },
  { id: 'partners_10', title: 'Partnership Builder', description: 'Add 10 partners', icon: 'handshake-outline', target: 10, category: 'networking' },
  { id: 'investors_5', title: 'Investor Relations', description: 'Add 5 investors', icon: 'cash-outline', target: 5, category: 'networking' },
  
  // Gamification
  { id: 'explorer', title: 'Explorer', description: 'Use all main features', icon: 'compass-outline', target: 1, category: 'gamification' },
  { id: 'completionist', title: 'Completionist', description: 'Unlock all achievements', icon: 'checkbox-outline', target: 1, category: 'gamification' },
]

const WEEKLY_CHALLENGES: Omit<WeeklyChallenge, 'current' | 'completed'>[] = [
  { id: 'weekly_scan_10', title: 'Weekend Warrior', description: 'Scan 10 cards this week', target: 10, startsAt: 0, expiresAt: 0, reward: '+50 XP' },
  { id: 'weekly_scan_25', title: 'Power Networker', description: 'Scan 25 cards this week', target: 25, startsAt: 0, expiresAt: 0, reward: '+100 XP' },
  { id: 'weekly_streak_7', title: 'Week of Networking', description: 'Maintain a 7-day streak', target: 7, startsAt: 0, expiresAt: 0, reward: '+75 XP' },
  { id: 'weekly_industry_3', title: 'Diverse Network', description: 'Scan cards from 3 industries', target: 3, startsAt: 0, expiresAt: 0, reward: '+50 XP' },
  { id: 'weekly_high_priority_5', title: 'Quality over Quantity', description: 'Add 5 high-priority contacts', target: 5, startsAt: 0, expiresAt: 0, reward: '+60 XP' },
]

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function getDaysBetweenDates(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diff = d2.getTime() - d1.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function isYesterday(date: string): boolean {
  return getDaysBetweenDates(date, getTodayDate()) === 1
}

function generateWeeklyChallenge(config: typeof WEEKLY_CHALLENGES[0]): WeeklyChallenge {
  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const startOfWeek = new Date(now)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  return {
    ...config,
    startsAt: startOfWeek.getTime(),
    expiresAt: startOfWeek.getTime() + weekMs,
    current: 0,
    completed: false,
  }
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastScanDate: null,
      
      achievements: ACHIEVEMENTS_CONFIG.map(a => ({
        ...a,
        unlockedAt: undefined,
        progress: 0,
      })),
      unlockedAchievementIds: [],
      
      weeklyChallenges: WEEKLY_CHALLENGES.map(generateWeeklyChallenge),
      
      totalScans: 0,
      totalContacts: 0,
      totalDaysActive: 0,
      
      networkValueScore: 0,
      companiesAdded: 0,

      recordScan: () => {
        const today = getTodayDate()
        const state = get()
        
        // Update streak
        let newStreak = state.currentStreak
        if (state.lastScanDate === today) {
          // Already scanned today, no change
          return
        } else if (isYesterday(state.lastScanDate || '')) {
          newStreak = state.currentStreak + 1
        } else {
          newStreak = 1
        }
        
        const newLongestStreak = Math.max(newStreak, state.longestStreak)
        
        // Update weekly challenges
        const updatedChallenges = state.weeklyChallenges.map(challenge => {
          if (challenge.completed) return challenge
          if (challenge.id.includes('scan')) {
            const newProgress = Math.min(challenge.target, challenge.current + 1)
            return {
              ...challenge,
              current: newProgress,
              completed: newProgress >= challenge.target,
            }
          }
          return challenge
        })
        
        set({
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastScanDate: today,
          totalScans: state.totalScans + 1,
          totalContacts: state.totalContacts + 1,
          weeklyChallenges: updatedChallenges,
        })
        
        // Check achievements after recording scan
        get().checkAchievements()
      },

      checkAchievements: () => {
        const state = get()
        
        // Calculate achievement progress
        const updatedAchievements = state.achievements.map(achievement => {
          let progress = 0
          
          switch (achievement.id) {
            case 'first_scan':
            case 'scans_10':
            case 'scans_50':
            case 'scans_100':
            case 'scans_500':
            case 'scans_1000':
              progress = state.totalScans
              break
            case 'streak_3':
            case 'streak_7':
            case 'streak_14':
            case 'streak_30':
              progress = state.currentStreak
              break
          }
          
          const isUnlocked = progress >= achievement.target && !state.unlockedAchievementIds.includes(achievement.id)
          
          return {
            ...achievement,
            progress: Math.min(progress, achievement.target),
            unlockedAt: isUnlocked ? Date.now() : achievement.unlockedAt,
          }
        })
        
        // Update unlocked achievements
        const newUnlockedIds = updatedAchievements
          .filter(a => a.unlockedAt && !state.unlockedAchievementIds.includes(a.id))
          .map(a => a.id)
        
        set({
          achievements: updatedAchievements,
          unlockedAchievementIds: [...state.unlockedAchievementIds, ...newUnlockedIds],
        })
        
        // Trigger notification for new achievements
        if (newUnlockedIds.length > 0) {
          // Could trigger local notification here
          console.log(`🎉 Unlocked ${newUnlockedIds.length} new achievements!`)
        }
      },

      refreshWeeklyChallenges: () => {
        const state = get()
        const now = Date.now()
        
        const updatedChallenges = state.weeklyChallenges.map(challenge => {
          if (now > challenge.expiresAt && !challenge.completed) {
            // Generate new challenge
            const randomConfig = WEEKLY_CHALLENGES[Math.floor(Math.random() * WEEKLY_CHALLENGES.length)]
            return generateWeeklyChallenge(randomConfig)
          }
          return challenge
        })
        
        set({ weeklyChallenges: updatedChallenges })
      },

      getNetworkValueScore: () => {
        const state = get()
        // Calculate based on contact quality
        let score = 0
        // This would be calculated from contacts data
        return score
      },

      getStreakStatus: () => {
        const state = get()
        const today = getTodayDate()
        const lastScan = state.lastScanDate
        
        if (!lastScan) {
          return { streak: 0, isActive: false, daysUntilLost: 0 }
        }
        
        if (lastScan === today) {
          return { streak: state.currentStreak, isActive: true, daysUntilLost: 1 }
        }
        
        const daysSinceLastScan = getDaysBetweenDates(lastScan, today)
        
        if (daysSinceLastScan === 1) {
          return { streak: state.currentStreak, isActive: false, daysUntilLost: 1 }
        }
        
        // Streak lost
        return { streak: 0, isActive: false, daysUntilLost: 0 }
      },
    }),
    {
      name: 'gamification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

// Hook to calculate network value score from contacts
export function calculateNetworkValueScore(contacts: Array<{ priorityScore: number; companySize: string; isCompetitor: boolean }>): number {
  let score = 0
  
  contacts.forEach(contact => {
    // Base score from priority
    score += (contact.priorityScore || 50) * 0.5
    
    // Company size bonus
    const sizeBonuses: Record<string, number> = {
      startup: 5,
      small: 10,
      medium: 20,
      large: 30,
      enterprise: 50,
    }
    score += sizeBonuses[contact.companySize] || 0
    
    // Competitor penalty (but still valuable for intelligence)
    if (contact.isCompetitor) {
      score += 5 // Competitors are valuable for competitive intelligence
    }
  })
  
  // Normalize to 0-1000 scale
  return Math.min(1000, Math.round(score))
}
