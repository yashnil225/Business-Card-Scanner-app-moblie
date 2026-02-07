import { ScreenErrorBoundary } from '@/src/components/error'
import { CircularProgress, Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { borderRadius, fontSize, fontWeight, spacing, type Colors } from '@/src/lib/theme'
import { processContactImage, useContactsStore } from '@/src/stores/contactsStore'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Dimensions, Pressable, SafeAreaView, StyleSheet, View } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Review data matching the images exactly
const REVIEWS = [
    {
        id: '1',
        name: 'Emily J',
        title: 'Sales Executive',
        rating: 5,
        text: 'Super accurate QR and card scanning, helps me follow up instantly.',
        avatar: 'https://i.pravatar.cc/150?u=emily',
    },
    {
        id: '2',
        name: 'Sarah B',
        title: 'Sales Director',
        rating: 5,
        text: 'Excellent team collaboration, gives me real visibility of leads and event ROI.',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
    },
    {
        id: '3',
        name: 'Tom H',
        title: 'Marketing Manager',
        rating: 5,
        text: 'Scans cards & QRs into our marketing workflow while on the move.',
        avatar: 'https://i.pravatar.cc/150?u=tom',
    },
]

// Status messages that cycle during processing
const STATUS_MESSAGES = [
    'Finding info about RB...',
    'Generating your summary...',
    'Analyzing business card...',
    'Extracting contact details...',
]

// Review Card Component
function ReviewCard({ review }: { review: typeof REVIEWS[0] }) {
    const colors = useColors()
    const styles = useMemo(() => createReviewStyles(colors), [colors])

    return (
        <View style={[styles.reviewCard, { width: SCREEN_WIDTH - spacing.xl * 2 }]}>
            <View style={styles.reviewHeader}>
                <Image source={{ uri: review.avatar }} style={styles.avatar} contentFit="cover" />
                <View style={styles.reviewInfo}>
                    <Text style={[styles.reviewerName, { color: colors.text }]}>
                        {review.name}, {review.title}
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
    )
}

// Review Carousel Component
function ReviewCarousel() {
    const colors = useColors()
    const styles = useMemo(() => createReviewStyles(colors), [colors])
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % REVIEWS.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    return (
        <View style={styles.carouselContainer}>
            {/* User reviews badge */}
            <View style={[styles.reviewsBadge, { backgroundColor: '#F0F5FF' }]}>
                <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={16}
                    color={colors.accent}
                />
                <Text style={[styles.reviewsBadgeText, { color: colors.accent }]}>
                    User reviews
                </Text>
            </View>

            <ReviewCard review={REVIEWS[currentIndex]} />

            {/* Pagination dots */}
            <View style={styles.dotsContainer}>
                {REVIEWS.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            {
                                backgroundColor:
                                    i === currentIndex ? colors.accent : '#E0E0E0',
                            },
                        ]}
                    />
                ))}
            </View>
        </View>
    )
}

// Main Processing Screen
function ProcessingScreen() {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])
    const router = useRouter()
    const { imageUri } = useLocalSearchParams<{ imageUri: string }>()
    const [status, setStatus] = useState<'loading' | 'success'>('loading')
    const [statusIndex, setStatusIndex] = useState(0)
    const [contactData, setContactData] = useState<any>(null)

    // Cycle through status messages
    useEffect(() => {
        if (status === 'loading') {
            const interval = setInterval(() => {
                setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length)
            }, 2000)
            return () => clearInterval(interval)
        }
    }, [status])

    useEffect(() => {
        if (!imageUri) {
            router.back()
            return
        }

        let isMounted = true

        const processImage = async () => {
            try {
                setStatus('loading')
                const data = await processContactImage(imageUri, undefined, (text: string) => {
                    // Ignore callback, we use our own cycling messages
                })

                if (isMounted) {
                    setContactData(data)
                    setStatus('success')
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Processing failed:', error)
                    Alert.alert('Error', 'Failed to process business card. Please try again.')
                    router.back()
                }
            }
        }

        // Simulate processing time for demo
        setTimeout(() => {
            processImage()
        }, 6000)

        return () => {
            isMounted = false
        }
    }, [imageUri, router])

    const handleContinue = () => {
        if (contactData) {
            const contactCount = useContactsStore.getState().contacts.length

            if (contactCount === 0) {
                router.push({
                    pathname: '/(scan)/congrats',
                    params: { contactData: JSON.stringify(contactData) },
                })
            } else {
                router.push({
                    pathname: '/(scan)/summary',
                    params: { contactData: JSON.stringify(contactData) },
                })
            }
        }
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                {/* Top Section - Progress */}
                <View style={styles.progressSection}>
                    <CircularProgress
                        size={240}
                        strokeWidth={8}
                        status={status}
                        color={colors.accent}
                    />

                    {/* Status Text */}
                    <Text style={[styles.statusText, { color: colors.text }]}>
                        {status === 'success' ? 'Complete!' : STATUS_MESSAGES[statusIndex]}
                    </Text>
                </View>

                {/* Review Carousel */}
                <ReviewCarousel />

                {/* View Research Button */}
                <View style={styles.buttonContainer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.viewResearchButton,
                            {
                                backgroundColor: status === 'success' ? colors.accent : '#A8C0FF',
                                opacity: pressed ? 0.9 : 1
                            }
                        ]}
                        onPress={handleContinue}
                        disabled={status !== 'success'}
                    >
                        <Text style={styles.viewResearchButtonText}>
                            {status === 'success' ? 'View research' : 'View research'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    )
}

const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.xl,
    },
    progressSection: {
        alignItems: 'center',
        marginTop: spacing.xl,
        gap: spacing.xl,
    },
    statusText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.medium,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
    },
    viewResearchButton: {
        height: 56,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewResearchButtonText: {
        color: '#fff',
        fontSize: fontSize.lg,
        fontWeight: '600',
    },
})

const createReviewStyles = (colors: Colors) => StyleSheet.create({
    carouselContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: spacing.xl,
    },
    reviewsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 16,
        gap: 6,
    },
    reviewsBadgeText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    reviewCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.surface,
    },
    reviewHeader: {
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
    reviewInfo: {
        flex: 1,
    },
    reviewerName: {
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
    dotsContainer: {
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

export default function ProcessingScreenWithErrorBoundary() {
    return (
        <ScreenErrorBoundary screenName="Processing">
            <ProcessingScreen />
        </ScreenErrorBoundary>
    )
}
