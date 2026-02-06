import { ScreenErrorBoundary } from '@/src/components/error'
import { Button, CircularProgress, Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { fontSize, fontWeight, spacing } from '@/src/lib/theme'
import { processContactImage, useContactsStore } from '@/src/stores/contactsStore'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, Dimensions, Image, StyleSheet, View } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Mock review data
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

// Review Card Component
function ReviewCard({ review }: { review: typeof REVIEWS[0] }) {
    const colors = useColors()

    return (
        <View
            style={[
                styles.reviewCard,
                { backgroundColor: colors.surface, width: SCREEN_WIDTH - spacing.xl * 2 },
            ]}
        >
            <View style={styles.reviewHeader}>
                <Image source={{ uri: review.avatar }} style={styles.avatar} />
                <View style={styles.reviewInfo}>
                    <Text style={[styles.reviewerName, { color: colors.text }]}>
                        {review.name}, {review.title}
                    </Text>
                    <View style={styles.rating}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Ionicons
                                key={i}
                                name="star"
                                size={14}
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
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % REVIEWS.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    return (
        <View style={styles.carouselContainer}>
            <View style={styles.reviewsLabelContainer}>
                <Ionicons
                    name="chatbox-ellipses-outline"
                    size={14}
                    color={colors.accent}
                    style={{ marginRight: 4 }}
                />
                <Text style={[styles.reviewsLabel, { color: colors.accent }]}>
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
                                    i === currentIndex ? colors.accent : colors.border,
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
    const router = useRouter()
    const { imageUri } = useLocalSearchParams<{ imageUri: string }>()
    const [status, setStatus] = useState<'loading' | 'success'>('loading')
    const [statusText, setStatusText] = useState('Scanning business card...')
    const [contactData, setContactData] = useState<any>(null)

    useEffect(() => {
        if (!imageUri) {
            router.back()
            return
        }

        let isMounted = true

        const processImage = async () => {
            try {
                setStatus('loading')
                const data = await processContactImage(imageUri, (text) => {
                    if (isMounted) setStatusText(text)
                })

                if (isMounted) {
                    setContactData(data)
                    setStatusText('Complete!')
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

        processImage()

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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={styles.topSection}>
                    {/* Circular Progress Loader */}
                    <CircularProgress
                        size={220}
                        strokeWidth={8}
                        status={status}
                        color={colors.accent}
                    />

                    {/* Status Text */}
                    <Text style={[styles.statusText, { color: colors.text }]}>
                        {statusText}
                    </Text>
                </View>

                {/* Review Carousel */}
                <ReviewCarousel />

                {/* View Research Button */}
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={handleContinue}
                        variant="primary"
                        style={[
                            styles.viewResearchButton,
                            { opacity: status === 'success' ? 1 : 0.8 }
                        ]}
                        disabled={status !== 'success'}
                    >
                        View research
                    </Button>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.xl * 2,
    },
    topSection: {
        alignItems: 'center',
        marginTop: spacing.xl,
        gap: spacing.xl,
    },
    statusText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.medium,
        textAlign: 'center',
    },
    carouselContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    reviewsLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 16,
        backgroundColor: 'rgba(65, 105, 225, 0.1)',
    },
    reviewsLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    reviewCard: {
        padding: spacing.lg,
        borderRadius: 16,
        marginHorizontal: spacing.xl,
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
    buttonContainer: {
        width: '100%',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.lg,
    },
    viewResearchButton: {
        width: '100%',
    },
})

export default function ProcessingScreenWithErrorBoundary() {
    return (
        <ScreenErrorBoundary screenName="Processing">
            <ProcessingScreen />
        </ScreenErrorBoundary>
    )
}
