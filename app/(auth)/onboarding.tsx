import { ScreenErrorBoundary } from '@/src/components/error'
import { Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { borderRadius, fontSize, spacing, type Colors } from '@/src/lib/theme'
import { useUserStore } from '@/src/stores'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Dimensions, Pressable, SafeAreaView, StyleSheet, View } from 'react-native'

const { width } = Dimensions.get('window')

// Company logos
const COMPANY_LOGOS = [
    { name: 'PwC' },
    { name: 'DELTA' },
    { name: 'Grant Thornton' },
    { name: 'EY' },
    { name: 'Cartier' },
    { name: 'SAAB' },
    { name: 'Culligan' },
    { name: 'AVIS' },
]

function OnboardingScreen() {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])
    const router = useRouter()

    const handleBack = () => {
        router.back()
    }

    const completeOnboarding = useUserStore((state) => state.completeOnboarding)

    const handleOpenCamera = () => {
        completeOnboarding()
        router.push('/(scan)/camera')
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Back and Progress */}
            <View style={styles.header}>
                <Pressable
                    onPress={handleBack}
                    hitSlop={8}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </Pressable>

                {/* Progress Pills */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressPill, styles.progressPillActive, { backgroundColor: colors.accent }]} />
                    <View style={[styles.progressPill, { backgroundColor: colors.border }]} />
                    <View style={[styles.progressPill, { backgroundColor: colors.border }]} />
                </View>

                <View style={styles.backButton} />
            </View>

            {/* Hero Section with light background */}
            <View style={styles.heroSection}>
                <Image
                    source={require('@/assets/images/onboarding-shared.png')}
                    style={styles.heroImage}
                    contentFit="contain"
                />
            </View>

            {/* Content Section */}
            <View style={styles.content}>
                {/* Title */}
                <Text style={[styles.title, { color: colors.text }]}>
                    Scan a card, experience{'\n'}true accuracy
                </Text>

                {/* Subtitle */}
                <Text style={[styles.subtitle, { color: colors.secondary }]}>
                    Trusted by 2 million professionals
                </Text>

                {/* Company Logos */}
                <View style={styles.logosContainer}>
                    <View style={styles.logosRow}>
                        {COMPANY_LOGOS.slice(0, 4).map((company, idx) => (
                            <View key={idx} style={styles.logoItem}>
                                <Text style={[styles.logoText, { color: colors.secondary }]}>
                                    {company.name === 'PwC' ? 'pwc' : 
                                     company.name === 'DELTA' ? 'DELTA' :
                                     company.name === 'Grant Thornton' ? 'Grant Thornton' :
                                     company.name === 'EY' ? 'EY' : company.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.logosRow}>
                        {COMPANY_LOGOS.slice(4).map((company, idx) => (
                            <View key={idx} style={styles.logoItem}>
                                <Text style={[styles.logoText, { color: colors.secondary }]}>
                                    {company.name === 'Cartier' ? 'Cartier' :
                                     company.name === 'SAAB' ? 'SAAB' :
                                     company.name === 'Culligan' ? 'Culligan' :
                                     company.name === 'AVIS' ? 'AVIS' : company.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Bottom Action */}
            <View style={styles.bottomSection}>
                <Pressable
                    style={({ pressed }) => [
                        styles.ctaButton,
                        {
                            backgroundColor: colors.accent,
                            opacity: pressed ? 0.9 : 1
                        }
                    ]}
                    onPress={handleOpenCamera}
                >
                    <Ionicons name="scan" size={20} color="#fff" />
                    <Text style={styles.ctaButtonText}>Open camera</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EEF2FF', // Light blue background
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        justifyContent: 'center',
    },
    progressPill: {
        height: 6,
        borderRadius: 3,
        width: 40,
    },
    progressPillActive: {
        width: 60,
    },
    // Hero Section
    heroSection: {
        flex: 0.4,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
    },
    heroImage: {
        width: width * 0.7,
        height: 180,
    },
    // Content
    content: {
        flex: 0.4,
        backgroundColor: colors.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: fontSize['2xl'],
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 36,
        marginBottom: spacing.md,
    },
    subtitle: {
        fontSize: fontSize.base,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing.lg,
    },
    // Logos
    logosContainer: {
        width: '100%',
        gap: spacing.md,
    },
    logosRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    logoItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        opacity: 0.7,
    },
    // Bottom Section
    bottomSection: {
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        paddingBottom: spacing.xl,
    },
    ctaButton: {
        height: 56,
        borderRadius: borderRadius.full,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    ctaButtonText: {
        color: '#fff',
        fontSize: fontSize.lg,
        fontWeight: '600',
    },
})

export default function Onboarding() {
    return (
        <ScreenErrorBoundary screenName="Onboarding">
            <OnboardingScreen />
        </ScreenErrorBoundary>
    )
}
