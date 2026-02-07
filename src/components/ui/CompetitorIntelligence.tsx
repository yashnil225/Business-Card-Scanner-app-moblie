import { useColors } from '@/src/hooks/useColors'
import { borderRadius, fontSize, fontWeight, spacing, type Colors } from '@/src/lib/theme'
import { Ionicons } from '@expo/vector-icons'
import { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

interface CompetitorData {
  company: string
  count: number
  industry?: string
  contacts: Array<{ name: string; title?: string; id: string }>
}

interface CompetitorIntelligenceProps {
  competitors: CompetitorData[]
  totalCompetitorCount: number
  onCompanyPress?: (company: string) => void
  onViewAllPress?: () => void
}

export function CompetitorIntelligence({ 
  competitors, 
  totalCompetitorCount,
  onCompanyPress,
  onViewAllPress 
}: CompetitorIntelligenceProps) {
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield-checkmark" size={20} color="#F44336" />
          <Text style={[styles.title, { color: colors.text }]}>
            Competitive Intelligence
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalCompetitorCount} tracked</Text>
        </View>
      </View>

      {competitors.length > 0 ? (
        <View style={styles.list}>
          {competitors.map((company, index) => (
            <CompetitorCompanyRow 
              key={company.company}
              company={company}
              onPress={() => onCompanyPress?.(company.company)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="shield-outline" size={40} color={colors.text + '40'} />
          <Text style={[styles.emptyText, { color: colors.text + '60' }]}>
            No competitors tracked yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.text + '40' }]}>
            Competitors will be automatically detected based on your industry
          </Text>
        </View>
      )}

      {competitors.length > 0 && onViewAllPress && (
        <Pressable onPress={onViewAllPress} style={styles.viewAllButton}>
          <Text style={[styles.viewAllText, { color: colors.accent }]}>
            View All Competitors
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </Pressable>
      )}
    </View>
  )
}

function CompetitorCompanyRow({ 
  company, 
  onPress 
}: { 
  company: CompetitorData
  onPress: () => void 
}) {
  const colors = useColors()
  
  return (
    <Pressable onPress={onPress} style={styles_row.row}>
      <View style={styles_row.info}>
        <View style={[styles_row.indicator, { backgroundColor: '#F44336' }]} />
        <View>
          <Text style={[styles_row.companyName, { color: colors.text }]}>
            {company.company}
          </Text>
          {company.industry && (
            <Text style={[styles_row.industry, { color: colors.text + '60' }]}>
              {company.industry}
            </Text>
          )}
        </View>
      </View>
      <View style={styles_row.right}>
        <View style={styles_row.countBadge}>
          <Text style={styles_row.countText}>{company.count}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.text + '40'} />
      </View>
    </Pressable>
  )
}

const styles_row = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  indicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  companyName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  industry: {
    fontSize: fontSize.xs,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countBadge: {
    backgroundColor: '#F4433620',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  countText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#F44336',
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
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  badge: {
    backgroundColor: '#F4433620',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: '#F44336',
  },
  list: {
    gap: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewAllText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
})
