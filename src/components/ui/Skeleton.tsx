import { useColors } from '@/src/hooks/useColors'
import { borderRadius, spacing, type Colors } from '@/src/lib/theme'
import { useMemo } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

interface SkeletonProps {
    width?: number | string
    height?: number | string
    borderRadius?: number
    style?: object
}

export function Skeleton({ width = '100%', height = 20, borderRadius: radius = 4, style }: SkeletonProps) {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])

    return (
        <View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius: radius,
                    backgroundColor: colors.border,
                },
                style,
            ]}
        />
    )
}

export function SkeletonCard({ height = 120 }: { height?: number }) {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])

    return (
        <View style={[styles.card, { height }]}>
            <Skeleton width={60} height={60} borderRadius={30} />
            <View style={styles.cardContent}>
                <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
                <Skeleton width="40%" height={12} />
            </View>
        </View>
    )
}

export function SkeletonList({ count = 5, itemHeight = 80 }: { count?: number; itemHeight?: number }) {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])

    return (
        <View style={styles.list}>
            {[...Array(count)].map((_, i) => (
                <View key={i} style={[styles.listItem, { height: itemHeight }]}>
                    <Skeleton width={48} height={48} borderRadius={24} />
                    <View style={styles.listItemContent}>
                        <Skeleton width="50%" height={14} style={{ marginBottom: 8 }} />
                        <Skeleton width="30%" height={10} />
                    </View>
                </View>
            ))}
        </View>
    )
}

export function SkeletonStatsRow({ count = 3 }: { count?: number }) {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])

    return (
        <View style={styles.statsRow}>
            {[...Array(count)].map((_, i) => (
                <View key={i} style={styles.statItem}>
                    <Skeleton width={60} height={60} borderRadius={12} />
                    <Skeleton width={50} height={12} style={{ marginTop: 8 }} />
                </View>
            ))}
        </View>
    )
}

export function SkeletonChart({ height = 200 }: { height?: number }) {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])

    return (
        <View style={[styles.chart, { height }]}>
            <View style={styles.chartHeader}>
                <Skeleton width={120} height={20} />
            </View>
            <View style={styles.chartBody}>
                <Skeleton width="100%" height="80%" />
            </View>
        </View>
    )
}

export function SkeletonContactDetail() {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])

    return (
        <View style={styles.contactDetail}>
            <View style={styles.avatarSection}>
                <Skeleton width={100} height={100} borderRadius={50} />
                <Skeleton width={150} height={24} style={{ marginTop: 16 }} />
                <Skeleton width={100} height={16} style={{ marginTop: 8 }} />
            </View>
            <View style={styles.infoSection}>
                <Skeleton width="100%" height={60} style={{ marginBottom: 12 }} />
                <Skeleton width="100%" height={60} style={{ marginBottom: 12 }} />
                <Skeleton width="100%" height={60} style={{ marginBottom: 12 }} />
            </View>
        </View>
    )
}

const createStyles = (colors: Colors) => StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    cardContent: {
        flex: 1,
    },
    list: {
        gap: spacing.sm,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
    },
    listItemContent: {
        flex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    chart: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
    },
    chartHeader: {
        marginBottom: spacing.md,
    },
    chartBody: {
        flex: 1,
        justifyContent: 'center',
    },
    contactDetail: {
        gap: spacing.lg,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    infoSection: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
})
