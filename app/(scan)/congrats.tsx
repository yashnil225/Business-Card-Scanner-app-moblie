import { ScreenErrorBoundary } from '@/src/components/error'
import { Button, Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { spacing } from '@/src/lib/theme'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

const createStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
        },
        illustrationArea: {
            marginBottom: spacing.xl * 2,
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
            width: '100%',
            backgroundColor: '#F0F5FF', // Light lavender/blue bg for illustration
            borderRadius: 100, // Make it somewhat circular/cloud-like visually if needed or just bg
            // For exact match to reference (cloud shape), we ideally use an image.
            // Using a simple transparent bg here as the reference has a cloud-blob shape behind the rockets.
            // We'll simulate the blob with a View.
        },
        blob: {
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: '#E8F0FE',
            justifyContent: 'center',
            alignItems: 'center',
        },
        title: {
            fontSize: 28,
            fontWeight: '700',
            textAlign: 'center',
            color: '#000',
            marginBottom: spacing.md,
            lineHeight: 36,
        },
        subtitle: {
            fontSize: 16,
            textAlign: 'center',
            color: '#444',
            lineHeight: 24,
            marginBottom: spacing.xl * 2,
        },
        footer: {
            width: '100%',
            position: 'absolute',
            bottom: spacing.xl + 20,
            paddingHorizontal: spacing.lg,
        },
        button: {
            borderRadius: 30, // Fully rounded
            height: 56,
        }
    })

function CongratsScreen() {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])
    const router = useRouter()

    const { contactData } = useLocalSearchParams<{ contactData: string }>()

    const handleContinue = () => {
        // Navigate to summary with the forwarded data
        router.replace({
            pathname: '/(scan)/summary',
            params: { contactData }
        })
    }

    return (
        <View style={styles.container}>
            <View style={styles.illustrationArea}>
                <Image
                    source={require('@/assets/images/congrats-rocket.jpeg')}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="contain"
                />
            </View>

            <Text style={styles.title}>
                Congrats, you&apos;ve{'\n'}captured your first lead!
            </Text>

            <Text style={styles.subtitle}>
                Keep the momentum with a free trial and join 2M pros boosting ROI with Covve.
            </Text>

            <View style={styles.footer}>
                <Button
                    variant="primary"
                    onPress={handleContinue}
                    style={styles.button}
                    textStyle={{ fontSize: 18, fontWeight: '600' }}
                >
                    Continue
                </Button>
            </View>
        </View>
    )
}

export default function Congrats() {
    return (
        <ScreenErrorBoundary screenName="Congrats">
            <CongratsScreen />
        </ScreenErrorBoundary>
    )
}
