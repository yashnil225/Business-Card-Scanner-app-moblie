import { Button, Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { fontSize, fontWeight, spacing } from '@/src/lib/theme'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
} from 'react-native-reanimated'

interface SuccessScreenProps {
    onContinue: () => void
}

export function SuccessScreen({ onContinue }: SuccessScreenProps) {
    const colors = useColors()
    const router = useRouter()

    // Animation values
    const scale = useSharedValue(0)
    const checkmarkScale = useSharedValue(0)

    useEffect(() => {
        // Animate circle
        scale.value = withSpring(1, {
            damping: 10,
            stiffness: 100,
        })

        // Animate checkmark with delay
        checkmarkScale.value = withDelay(
            300,
            withSequence(
                withSpring(1.2, { damping: 10 }),
                withSpring(1, { damping: 10 })
            )
        )
    }, [])

    const circleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    const checkmarkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkmarkScale.value }],
    }))

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Animated Success Icon */}
                <Animated.View style={[styles.iconContainer, circleStyle]}>
                    <View
                        style={[
                            styles.circle,
                            { borderColor: colors.accent, backgroundColor: colors.background },
                        ]}
                    >
                        <Animated.View style={checkmarkStyle}>
                            <Ionicons name="checkmark" size={80} color={colors.accent} />
                        </Animated.View>
                    </View>
                </Animated.View>

                {/* Success Message */}
                <Text style={[styles.title, { color: colors.text }]}>
                    Congrats, you've captured your first lead!
                </Text>

                <Text style={[styles.subtitle, { color: colors.secondary }]}>
                    Keep the momentum with a free trial and join 2M pros boosting ROI with
                    Covve.
                </Text>
            </View>

            {/* Continue Button */}
            <View style={styles.buttonContainer}>
                <Button onPress={onContinue} variant="primary">
                    Continue
                </Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    iconContainer: {
        marginBottom: spacing.xl * 2,
    },
    circle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    subtitle: {
        fontSize: fontSize.base,
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        padding: spacing.xl,
    },
})
