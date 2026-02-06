import { useColors } from '@/src/hooks/useColors'
import { spacing } from '@/src/lib/theme'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface ProgressDotsProps {
    total?: number
    active: number
}

export function ProgressDots({ total = 3, active }: ProgressDotsProps) {
    const colors = useColors()

    return (
        <View style={styles.container}>
            {Array.from({ length: total }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        {
                            backgroundColor:
                                index === active ? colors.accent : colors.border,
                        },
                    ]}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
})
