import { ScreenErrorBoundary } from '@/src/components/error'
import { Text } from '@/src/components/ui'
import { useAuthStore } from '@/src/features/auth'
import { useColors } from '@/src/hooks/useColors'
import { spacing, type Colors } from '@/src/lib/theme'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Dimensions, Pressable, SafeAreaView, StyleSheet, View } from 'react-native'

const { width } = Dimensions.get('window')

function GetStartedScreen() {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])
    const router = useRouter()
    const signInAnonymously = useAuthStore((state) => state.signInAnonymously)

    const handleStart = async () => {
        await signInAnonymously()
        router.replace('/(tabs)')
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

                {/* Text */}
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Never lose a contact{'\n'}again
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.secondary }]}>
                        Digitize your business cards, organize your network, and follow up instantly.
                    </Text>
                </View>

                {/* Bottom Actions */}
                <View style={styles.actions}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.getStartedButton,
                            { backgroundColor: colors.accent, opacity: pressed ? 0.9 : 1 }
                        ]}
                        onPress={handleStart}
                    >
                        <Text style={styles.getStartedText}>Get started</Text>
                    </Pressable>
                </View>
            </View>
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
    },
    heroImage: {
        width: width * 0.7,
        height: width * 0.7,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: spacing.md,
        lineHeight: 36,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
        lineHeight: 24,
    },
    actions: {
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
})

export default function GetStarted() {
    return (
        <ScreenErrorBoundary screenName="Get Started">
            <GetStartedScreen />
        </ScreenErrorBoundary>
    )
}
