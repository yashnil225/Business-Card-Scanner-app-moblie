import { useColors } from '@/src/hooks/useColors'
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated'
import Svg, { Circle, Path } from 'react-native-svg'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedPath = Animated.createAnimatedComponent(Path)

interface CircularProgressProps {
    size?: number
    strokeWidth?: number
    color?: string
    status?: 'loading' | 'success'
}

export function CircularProgress({
    size = 180,
    strokeWidth = 6,
    color,
    status = 'loading',
}: CircularProgressProps) {
    const colors = useColors()
    const activeColor = color || colors.accent

    const rotation = useSharedValue(0)
    const progress = useSharedValue(0)
    const checkmarkOpacity = useSharedValue(0)
    const checkmarkProgress = useSharedValue(0)

    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI

    useEffect(() => {
        if (status === 'loading') {
            // Reset states
            checkmarkOpacity.value = 0
            checkmarkProgress.value = 0

            // Continuous rotation
            rotation.value = withRepeat(
                withTiming(360, { duration: 1500, easing: Easing.linear }),
                -1,
                false
            )

            // Indeterminate progress (breathing effect)
            progress.value = withRepeat(
                withSequence(
                    withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
                    withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.quad) })
                ),
                -1,
                true
            )
        } else if (status === 'success') {
            // Stop rotation and align to top
            cancelAnimation(rotation)
            rotation.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })

            // Fill circle completely
            progress.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }, () => {
                // Show checkmark after circle is full
                checkmarkOpacity.value = withTiming(1, { duration: 200 })
                checkmarkProgress.value = withTiming(1, {
                    duration: 400,
                    easing: Easing.out(Easing.back(1.5))
                })
            })
        }
    }, [status])

    // Helper for withRepeat since it's not a hook but needs to be imported
    function withRepeat(animation: any, numberOfReps?: number, reverse?: boolean) {
        'worklet';
        return Animated.withRepeat(animation, numberOfReps, reverse);
    }

    const circleProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference * (1 - progress.value)
        return {
            strokeDashoffset,
            transform: [{ rotate: '-90deg' }], // Start from top
        }
    })

    const containerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }]
        }
    })

    const checkmarkProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: 50 * (1 - checkmarkProgress.value),
            opacity: checkmarkOpacity.value
        }
    })

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            {/* Rotating Container for the indeterminate state */}
            <Animated.View style={[StyleSheet.absoluteFill, containerStyle]}>
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Background Track */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={status === 'success' ? activeColor : colors.border}
                        strokeWidth={strokeWidth}
                        fill="none"
                        opacity={status === 'success' ? 0.1 : 1}
                    />

                    {/* Animated Progress Arc */}
                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={activeColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        originX={size / 2}
                        originY={size / 2}
                        animatedProps={circleProps}
                    />
                </Svg>
            </Animated.View>

            {/* Checkmark (Static position, separate Svg) */}
            <Svg
                width={size * 0.5}
                height={size * 0.5}
                viewBox="0 0 24 24"
                style={{ position: 'absolute' }}
            >
                <AnimatedPath
                    d="M5 13l4 4L19 7"
                    stroke={activeColor}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    strokeDasharray={50}
                    animatedProps={checkmarkProps}
                />
            </Svg>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
})
