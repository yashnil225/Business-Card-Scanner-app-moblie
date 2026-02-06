import { useColors } from '@/src/hooks/useColors'
import { fontSize, fontWeight, spacing } from '@/src/lib/theme'
import React from 'react'
import { StyleSheet, Text } from 'react-native'

interface SectionHeaderProps {
    children: string
}

export function SectionHeader({ children }: SectionHeaderProps) {
    const colors = useColors()

    return (
        <Text style={[styles.header, { color: colors.secondary }]}>
            {children.toUpperCase()}
        </Text>
    )
}

const styles = StyleSheet.create({
    header: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
        letterSpacing: 0.5,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
})
