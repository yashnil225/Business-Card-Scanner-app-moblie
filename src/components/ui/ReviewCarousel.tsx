import { useColors } from '@/src/hooks/useColors'
import { borderRadius, fontSize, fontWeight, spacing } from '@/src/lib/theme'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useRef, useState } from 'react'
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_WIDTH = SCREEN_WIDTH - spacing.xl * 2

interface Review {
    id: string
    name: string
    title: string
    rating: number
    text: string
    avatar: string
}

interface ReviewCarouselProps {
    reviews: Review[]
    autoScroll?: boolean
    autoScrollInterval?: number
}

export function ReviewCarousel({
    reviews,
    autoScroll = true,
    autoScrollInterval = 4000,
}: ReviewCarouselProps) {
    const colors = useColors()
    const scrollViewRef = useRef<ScrollView>(null)
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        if (!autoScroll || reviews.length <= 1) return

        const interval = setInterval(() => {
            const nextIndex = (activeIndex + 1) % reviews.length
            scrollViewRef.current?.scrollTo({
                x: nextIndex * (CARD_WIDTH + spacing.md),
                animated: true,
            })
            setActiveIndex(nextIndex)
        }, autoScrollInterval)

        return () => clearInterval(interval)
    }, [activeIndex, autoScroll, autoScrollInterval, reviews.length])

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x
        const index = Math.round(contentOffsetX / (CARD_WIDTH + spacing.md))
        setActiveIndex(index)
    }

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled={false}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                snapToInterval={CARD_WIDTH + spacing.md}
                decelerationRate="fast"
                contentContainerStyle={styles.scrollContent}
            >
                {reviews.map((review) => (
                    <View
                        key={review.id}
                        style={[
                            styles.card,
                            { backgroundColor: colors.surface, width: CARD_WIDTH },
                        ]}
                    >
                        <View style={styles.header}>
                            <Image source={{ uri: review.avatar }} style={styles.avatar} />
                            <View style={styles.info}>
                                <Text style={[styles.name, { color: colors.text }]}>
                                    {review.name}
                                </Text>
                                <View style={styles.rating}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Ionicons
                                            key={i}
                                            name="star"
                                            size={16}
                                            color={i < review.rating ? '#FFB800' : colors.border}
                                        />
                                    ))}
                                </View>
                            </View>
                        </View>
                        <Text style={[styles.reviewText, { color: colors.text }]}>
                            {review.text}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            {/* Pagination dots */}
            <View style={styles.pagination}>
                {reviews.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            {
                                backgroundColor:
                                    index === activeIndex ? colors.accent : colors.border,
                            },
                        ]}
                    />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: spacing.lg,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        gap: spacing.md,
    },
    card: {
        padding: spacing.lg,
        borderRadius: borderRadius.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: spacing.md,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.xs,
    },
    rating: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewText: {
        fontSize: fontSize.base,
        lineHeight: 22,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
})
