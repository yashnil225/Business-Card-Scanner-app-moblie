import { ScreenErrorBoundary } from '@/src/components/error'
import { Button, Text } from '@/src/components/ui'
import { useAuthStore } from '@/src/features/auth'
import { useColors } from '@/src/hooks/useColors'
import { spacing, type Colors } from '@/src/lib/theme'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Dimensions, Modal, Pressable, SafeAreaView, StyleSheet, View } from 'react-native'

const { width } = Dimensions.get('window')

function OnboardingScreen() {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])
    const router = useRouter()
    const [showLogin, setShowLogin] = useState(false)
    const signInAnonymously = useAuthStore((state) => state.signInAnonymously)

    const handleGetStarted = () => {
        router.push('/(auth)/get-started')
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    <Image
                        source={require('@/assets/images/onboarding-shared.png')}
                        style={styles.heroImage}
                        contentFit="contain"
                    />
                </View>

                {/* Text Polish */}
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Scan a card, experience{'\n'}true accuracy
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.secondary }]}>
                        Trusted by 2 million professionals
                    </Text>
                </View>

                {/* Bottom Actions */}
                <View style={styles.actions}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.getStartedButton,
                            { backgroundColor: colors.accent, opacity: pressed ? 0.9 : 1 }
                        ]}
                        onPress={handleGetStarted}
                    >
                        <Text style={styles.getStartedText}>Next</Text>
                    </Pressable>

                    <Pressable
                        style={styles.loginButton}
                        onPress={() => setShowLogin(true)}
                    >
                        <Text style={[styles.loginText, { color: colors.text }]}>Log in</Text>
                    </Pressable>
                </View>
            </View>

            {/* Login Modal (Placeholder for the "Sheet" mentioned) */}
            <Modal
                visible={showLogin}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowLogin(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <Text variant="h3">Log in</Text>
                        <Pressable onPress={() => setShowLogin(false)}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </Pressable>
                    </View>
                    <View style={styles.modalContent}>
                        <Text style={{ textAlign: 'center', marginTop: 20 }}>
                            Login flow implementation goes here matching the design.
                        </Text>
                        {/* Initial implementation placeholder */}
                        <Button
                            style={{ marginTop: 20 }}
                            onPress={() => {
                                signInAnonymously()
                                router.replace('/(tabs)')
                            }}
                        >
                            Simulate Login
                        </Button>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        justifyContent: 'space-between',
        paddingVertical: spacing.xl,
    },
    heroContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xl,
        flex: 1,
        // Add specific styling to match the "hand image" placement if needed
    },
    heroImage: {
        width: width * 0.8,
        height: width * 0.8,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: spacing.sm,
        lineHeight: 36,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    socialProof: {
        flexDirection: 'row',
        gap: spacing.lg,
        opacity: 0.7,
    },
    proofText: {
        fontWeight: '600',
        fontSize: 14,
    },
    actions: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    getStartedButton: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    getStartedText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    loginButton: {
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 16,
        fontWeight: '500',
    },
    // Modal
    modalContainer: {
        flex: 1,
        padding: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    modalContent: {
        flex: 1
    }
})

export default function Onboarding() {
    return (
        <ScreenErrorBoundary screenName="Onboarding">
            <OnboardingScreen />
        </ScreenErrorBoundary>
    )
}
