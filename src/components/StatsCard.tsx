import { Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { borderRadius, fontSize, spacing, type Colors } from '@/src/lib/theme'
import { Ionicons } from '@expo/vector-icons'
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

interface StatsCardProps {
    title: string
    value: string | number
    icon: keyof typeof Ionicons.glyphMap
    backgroundColor?: string
    iconColor?: string
}

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: spacing.md,
            borderRadius: borderRadius.md,
            minHeight: 100,
            justifyContent: 'space-between',
        },
        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: borderRadius.sm,
            justifyContent: 'center',
            alignItems: 'center',
        },
        value: {
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            color: colors.text,
            marginTop: spacing.sm,
        },
        title: {
            fontSize: fontSize.sm,
            color: colors.secondary,
            marginTop: spacing.xs,
        },
    })

export function StatsCard({
    title,
    value,
    icon,
    backgroundColor = '#E3F2FD',
    iconColor = '#4169E1',
}: StatsCardProps) {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
                <Ionicons name={icon} size={24} color={iconColor} />
            </View>
            <View>
                <Text style={styles.value}>{value}</Text>
                <Text style={styles.title}>{title}</Text>
            </View>
        </View>
    )
}
