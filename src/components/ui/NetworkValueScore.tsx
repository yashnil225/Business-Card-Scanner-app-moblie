import { useColors } from '@/src/hooks/useColors'
import { borderRadius, fontSize, fontWeight, spacing, type Colors } from '@/src/lib/theme'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface NetworkValueScoreProps {
  score: number
  totalContacts: number
  highPriorityCount: number
  averagePriority: number
}

export function NetworkValueScore({ 
  score, 
  totalContacts, 
  highPriorityCount, 
  averagePriority 
}: NetworkValueScoreProps) {
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  
  const getScoreLevel = (score: number) => {
    if (score >= 800) return { label: 'Elite', color: '#4CAF50' }
    if (score >= 600) return { label: 'Strong', color: '#2196F3' }
    if (score >= 400) return { label: 'Growing', color: '#FF9800' }
    if (score >= 200) return { label: 'Developing', color: '#9C27B0' }
    return { label: 'Starting', color: '#607D8B' }
  }
  
  const level = getScoreLevel(score)
  const progress = score / 10
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people-outline" size={20} color={level.color} />
        <Text style={[styles.title, { color: colors.text }]}>
          Network Value Score
        </Text>
        <View style={[styles.levelBadge, { backgroundColor: level.color + '20' }]}>
          <Text style={[styles.levelText, { color: level.color }]}>
            {level.label}
          </Text>
        </View>
      </View>

      <View style={styles.scoreSection}>
        <View style={styles.scoreCircle}>
          <LinearGradient
            colors={[level.color, level.color + '80']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCircle}
          >
            <Text style={styles.scoreValue}>{score}</Text>
            <Text style={styles.scoreLabel}>out of 1000</Text>
          </LinearGradient>
        </View>

        <View style={styles.statsGrid}>
          <StatItem 
            icon="users" 
            value={totalContacts.toString()} 
            label="Total Contacts" 
            colors={colors}
          />
          <StatItem 
            icon="star" 
            value={highPriorityCount.toString()} 
            label="High Priority" 
            colors={colors}
          />
          <StatItem 
            icon="chart-line" 
            value={`${averagePriority}%`} 
            label="Avg Priority" 
            colors={colors}
          />
          <StatItem 
            icon="trending-up" 
            value={`${progress.toFixed(0)}%`} 
            label="Potential" 
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.description}>
        <Ionicons name="information-circle-outline" size={16} color={colors.text + '60'} />
        <Text style={[styles.descriptionText, { color: colors.text + '80' }]}>
          Your network value is calculated based on contact quality, company size, 
          and role seniority. Higher scores indicate a more valuable professional network.
        </Text>
      </View>
    </View>
  )
}

function StatItem({ icon, value, label, colors }: { icon: string; value: string; label: string; colors: Colors }) {
  return (
    <View style={styles_statItem.container}>
      <Ionicons name={icon as any} size={20} color={colors.accent} />
      <Text style={styles_statItem.value}>{value}</Text>
      <Text style={[styles_statItem.label, { color: colors.text + '80' }]}>{label}</Text>
    </View>
  )
}

const styles_statItem = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
  },
})

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  levelText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  scoreLabel: {
    fontSize: fontSize.xs,
    color: '#fffCC',
  },
  statsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  description: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  descriptionText: {
    flex: 1,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
})
