import { ScreenErrorBoundary } from '@/src/components/error'
import { Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { borderRadius, fontSize, spacing, type Colors } from '@/src/lib/theme'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Pressable, SafeAreaView, StyleSheet, View } from 'react-native'

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#EEF2FF', // Light blue background matching image
        },
        content: {
            flex: 1,
        },
        heroSection: {
            flex: 0.45,
            backgroundColor: '#EEF2FF',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
        },
        illustration: {
            width: 200,
            height: 200,
        },
        bottomSection: {
            flex: 0.55,
            backgroundColor: colors.background,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            paddingBottom: spacing.xl,
            justifyContent: 'space-between',
        },
        textSection: {
            alignItems: 'center',
            gap: spacing.md,
            marginTop: spacing.lg,
        },
        title: {
            fontSize: fontSize['3xl'],
            fontWeight: '700',
            textAlign: 'center',
            color: colors.text,
            lineHeight: 42,
        },
        subtitle: {
            fontSize: fontSize.base,
            textAlign: 'center',
            color: colors.secondary,
            lineHeight: 24,
            paddingHorizontal: spacing.md,
        },
        actionContainer: {
            width: '100%',
            marginTop: spacing.xl,
        },
        continueButton: {
            height: 56,
            borderRadius: borderRadius.full,
            backgroundColor: colors.accent,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
        },
        continueButtonText: {
            color: '#fff',
            fontSize: fontSize.lg,
            fontWeight: '600',
        },
    })

function CongratsScreen() {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])
    const router = useRouter()

    const { contactData } = useLocalSearchParams<{ contactData: string }>()

    const handleContinue = () => {
        router.replace({
            pathname: '/(scan)/summary',
            params: { contactData }
        })
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Hero Section with Rocket Illustration */}
                <View style={styles.heroSection}>
                    <Image
                        source={require('@/assets/images/image.png')}
                        style={styles.illustration}
                        contentFit="contain"
                    />
                </View>

                {/* Bottom Section with Text and Button */}
                <View style={styles.bottomSection}>
                    <View style={styles.textSection}>
                        <Text style={styles.title}>
                            Congrats, you&apos;ve{'\n'}captured your first lead!
                        </Text>

                        <Text style={styles.subtitle}>
                            Keep the momentum with a free trial and join 2M pros boosting ROI with Covve.
                        </Text>
                    </View>

                    <View style={styles.actionContainer}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.continueButton,
                                { opacity: pressed ? 0.9 : 1 }
                            ]}
                            onPress={handleContinue}
                        >
                            <Text style={styles.continueButtonText}>Continue</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default function Congrats() {
    return (
        <ScreenErrorBoundary screenName="Congrats">
            <CongratsScreen />
        </ScreenErrorBoundary>
    )
}
