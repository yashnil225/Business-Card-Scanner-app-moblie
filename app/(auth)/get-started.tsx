import { ScreenErrorBoundary } from '@/src/components/error'
import { Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { borderRadius, fontSize, spacing, type Colors } from '@/src/lib/theme'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Dimensions, Modal, Pressable, SafeAreaView, StyleSheet, View } from 'react-native'

const { width, height } = Dimensions.get('window')

function WelcomeScreen() {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])
    const router = useRouter()
    const [showLoginModal, setShowLoginModal] = useState(false)

    const handleGetStarted = () => {
        router.push('/(auth)/create-account')
    }

    const handleLoginPress = () => {
        setShowLoginModal(true)
    }

    const handleContinueEmail = () => {
        setShowLoginModal(false)
        // TODO: Navigate to email auth screen when created
        console.log('Navigate to email auth')
    }

    const handleContinueGoogle = async () => {
        console.log('Google sign-in')
        setShowLoginModal(false)
    }

    return (
        <>
            <SafeAreaView style={styles.container}>
                {/* Hero Section with light blue background */}
                <View style={styles.heroSection}>
                    <Image
                        source={require('@/assets/images/dashboard-illustration.png')}
                        style={styles.heroImage}
                        contentFit="contain"
                    />
                </View>

                {/* Bottom Content */}
                <View style={styles.bottomSection}>
                    {/* Title */}
                    <Text style={[styles.title, { color: colors.text }]}>
                        Capture new leads,{'\n'}in seconds
                    </Text>

                    {/* Subtitle */}
                    <Text style={[styles.subtitle, { color: colors.secondary }]}>
                        The most accurate lead capture to turn every exchange into powerful connections.
                    </Text>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.primaryButton,
                                { 
                                    backgroundColor: colors.accent, 
                                    opacity: pressed ? 0.9 : 1 
                                }
                            ]}
                            onPress={handleGetStarted}
                        >
                            <Text style={styles.primaryButtonText}>Get Started</Text>
                        </Pressable>

                        <Pressable
                            style={styles.secondaryButton}
                            onPress={handleLoginPress}
                        >
                            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                                Already have an account? <Text style={{ color: colors.accent }}>Login</Text>
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>

            {/* Login Modal */}
            <Modal
                visible={showLoginModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowLoginModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <Pressable 
                        style={styles.modalBackdrop}
                        onPress={() => setShowLoginModal(false)}
                    />
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Choose login
                        </Text>

                        <View style={styles.modalActions}>
                            {/* Google Sign-in */}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.modalButton,
                                    { 
                                        backgroundColor: colors.background,
                                        opacity: pressed ? 0.8 : 1,
                                        borderColor: colors.border
                                    }
                                ]}
                                onPress={handleContinueGoogle}
                            >
                                <Image
                                    source={require('@/assets/images/google.png')}
                                    style={styles.googleIcon}
                                />
                                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                                    Continue with Google
                                </Text>
                            </Pressable>

                            {/* Email Sign-in */}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.modalButton,
                                    styles.emailButton,
                                    { 
                                        backgroundColor: colors.surface,
                                        opacity: pressed ? 0.8 : 1
                                    }
                                ]}
                                onPress={handleContinueEmail}
                            >
                                <Ionicons
                                    name="mail"
                                    size={20}
                                    color={colors.text}
                                />
                                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                                    Continue with email
                                </Text>
                            </Pressable>
                        </View>

                        {/* Cancel Button */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.cancelButton,
                                { opacity: pressed ? 0.7 : 1 }
                            ]}
                            onPress={() => setShowLoginModal(false)}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.secondary }]}>
                                Cancel
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </>
    )
}

const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EEF2FF', // Light blue background matching image
    },
    // Hero Section with light blue background
    heroSection: {
        flex: 0.55,
        backgroundColor: '#EEF2FF', // Light blue/lavender background
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    heroImage: {
        width: width * 0.9,
        height: '100%',
    },
    // Bottom section
    bottomSection: {
        flex: 0.45,
        justifyContent: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        gap: spacing.md,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    // Typography
    title: {
        fontSize: fontSize['3xl'],
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 40,
    },
    subtitle: {
        fontSize: fontSize.base,
        textAlign: 'center',
        lineHeight: 24,
    },
    // Actions
    actions: {
        gap: spacing.md,
        marginTop: spacing.lg,
    },
    primaryButton: {
        height: 56,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: fontSize.lg,
        fontWeight: '600',
    },
    secondaryButton: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: fontSize.base,
        fontWeight: '400',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        flex: 1,
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
    },
    modalTitle: {
        fontSize: fontSize.xl,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    modalActions: {
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    modalButton: {
        height: 56,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        borderWidth: 1,
    },
    emailButton: {
        borderColor: 'transparent',
    },
    googleIcon: {
        width: 20,
        height: 20,
    },
    modalButtonText: {
        fontSize: fontSize.base,
        fontWeight: '500',
    },
    cancelButton: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: fontSize.base,
        fontWeight: '500',
    },
})

export default function GetStarted() {
    return (
        <ScreenErrorBoundary screenName="Get Started">
            <WelcomeScreen />
        </ScreenErrorBoundary>
    )
}
