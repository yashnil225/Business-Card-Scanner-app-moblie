import { useColors } from '@/src/hooks/useColors'
import { borderRadius, fontSize, fontWeight, spacing, type Colors } from '@/src/lib/theme'
import { Ionicons } from '@expo/vector-icons'
import { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { PieChart } from 'react-native-gifted-charts'

interface QualityReportCardProps {
  excellent: number
  good: number
  poor: number
  unknown: number
  onPoorQualityPress?: () => void
}

export function QualityReportCard({ 
  excellent, 
  good, 
  poor, 
  unknown,
  onPoorQualityPress 
}: QualityReportCardProps) {
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  
  const total = excellent + good + poor + unknown || 1
  const excellentPercent = Math.round((excellent / total) * 100)
  const goodPercent = Math.round((good / total) * 100)
  const poorPercent = Math.round((poor / total) * 100)
  const unknownPercent = Math.round((unknown / total) * 100)
  
  const chartData = [
    { value: excellent, color: '#4CAF50', label: 'Excellent' },
    { value: good, color: '#2196F3', label: 'Good' },
    { value: poor, color: '#FF9800', label: 'Poor' },
    { value: unknown, color: '#9E9E9E', label: 'Unknown' },
  ].filter(d => d.value > 0)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="scan-outline" size={20} color={colors.accent} />
        <Text style={[styles.title, { color: colors.text }]}>
          Scan Quality Report
        </Text>
      </View>

      <View style={styles.content}>
        {chartData.length > 0 && (
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              radius={60}
              innerRadius={40}
              centerLabelComponent={() => (
                <Text style={[styles.chartCenterText, { color: colors.text }]}>
                  {total}
                </Text>
              )}
            />
          </View>
        )}

        <View style={styles.legend}>
          <LegendItem color="#4CAF50" label="Excellent" value={excellent} percentage={excellentPercent} />
          <LegendItem color="#2196F3" label="Good" value={good} percentage={goodPercent} />
          <LegendItem color="#FF9800" label="Poor" value={poor} percentage={poorPercent} />
          <LegendItem color="#9E9E9E" label="Unknown" value={unknown} percentage={unknownPercent} />
        </View>
      </View>

      {poor > 0 && onPoorQualityPress && (
        <Pressable 
          onPress={onPoorQualityPress}
          style={[styles.actionButton, { borderColor: colors.accent }]}
        >
          <Ionicons name="warning-outline" size={16} color={colors.accent} />
          <Text style={[styles.actionText, { color: colors.accent }]}>
            Review {poor} poor quality scans
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </Pressable>
      )}
    </View>
  )
}

function LegendItem({ color, label, value, percentage }: { color: string; label: string; value: number; percentage: number }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
      <View style={styles.legendValues}>
        <Text style={styles.legendValue}>{value}</Text>
        <Text style={styles.legendPercentage}>{percentage}%</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenterText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  legend: {
    flex: 1,
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: '#666',
  },
  legendValues: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  legendValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  legendPercentage: {
    fontSize: fontSize.xs,
    color: '#999',
    width: 40,
    textAlign: 'right',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  actionText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
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
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenterText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  legend: {
    flex: 1,
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text + '80',
  },
  legendValues: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  legendValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  legendPercentage: {
    fontSize: fontSize.xs,
    color: colors.text + '60',
    width: 40,
    textAlign: 'right',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  actionText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
})
