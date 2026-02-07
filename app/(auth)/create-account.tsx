import { ScreenErrorBoundary } from '@/src/components/error'
import { Button, Input, Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { fontSize, spacing, type Colors } from '@/src/lib/theme'
import { useUserStore } from '@/src/stores'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native'

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            paddingBottom: spacing.md,
        },
        backButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        scrollContent: {
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xl * 2,
        },
        title: {
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            color: colors.text,
            marginBottom: spacing.sm,
            marginTop: spacing.lg,
        },
        subtitle: {
            fontSize: fontSize.base,
            color: colors.secondary,
            marginBottom: spacing.xl,
        },
        photoSection: {
            alignItems: 'center',
            marginBottom: spacing.xl,
        },
        photoContainer: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.surface,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: colors.border,
            borderStyle: 'dashed',
            overflow: 'hidden',
        },
        photoImage: {
            width: 120,
            height: 120,
        },
        photoPlaceholder: {
            alignItems: 'center',
        },
        photoText: {
            fontSize: fontSize.sm,
            color: colors.secondary,
            marginTop: spacing.sm,
        },
        formSection: {
            gap: spacing.lg,
        },
        inputLabel: {
            fontSize: fontSize.sm,
            fontWeight: '600',
            color: colors.text,
            marginBottom: spacing.xs,
        },
        optionalText: {
            fontWeight: '400',
            color: colors.secondary,
        },
        footer: {
            padding: spacing.lg,
            paddingBottom: spacing.xl,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
    })

function CreateAccountScreen() {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])
    const router = useRouter()
    const createUser = useUserStore((state) => state.createUser)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [photoUri, setPhotoUri] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleBack = () => {
        router.back()
    }

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            })

            if (!result.canceled && result.assets[0]) {
                setPhotoUri(result.assets[0].uri)
            }
        } catch (error) {
            console.error('Image picker error:', error)
            Alert.alert('Error', 'Failed to pick image. Please try again.')
        }
    }

    const handleCreateAccount = async () => {
        if (!name.trim()) {
            Alert.alert('Required', 'Please enter your name to continue.')
            return
        }

        setIsLoading(true)

        try {
            createUser({
                name: name.trim(),
                email: email.trim() || undefined,
                photoUri: photoUri || undefined,
            })

            // Navigate to onboarding
            router.replace('/(auth)/onboarding')
        } catch (error) {
            console.error('Create account error:', error)
            Alert.alert('Error', 'Failed to create account. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const isValid = name.trim().length > 0

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </Pressable>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Title */}
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Set up your profile to get started with business card scanning.
                    </Text>

                    {/* Photo Section */}
                    <View style={styles.photoSection}>
                        <Pressable onPress={handlePickImage}>
                            {photoUri ? (
                                <View style={styles.photoContainer}>
                                    <Image
                                        source={{ uri: photoUri }}
                                        style={styles.photoImage}
                                        contentFit="cover"
                                    />
                                </View>
                            ) : (
                                <View style={styles.photoContainer}>
                                    <View style={styles.photoPlaceholder}>
                                        <Ionicons name="camera-outline" size={32} color={colors.secondary} />
                                        <Text style={styles.photoText}>Add Photo</Text>
                                    </View>
                                </View>
                            )}
                        </Pressable>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <View>
                            <Text style={styles.inputLabel}>Full Name *</Text>
                            <Input
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your full name"
                                autoCapitalize="words"
                            />
                        </View>

                        <View>
                            <Text style={styles.inputLabel}>
                                Email <Text style={styles.optionalText}>(optional)</Text>
                            </Text>
                            <Input
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email address"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                leftIcon="mail-outline"
                            />
                        </View>
                    </View>

                    {/* Spacer for keyboard */}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Footer with Button */}
                <View style={[styles.footer, { backgroundColor: colors.background }]}>
                    <Button
                        onPress={handleCreateAccount}
                        variant="primary"
                        size="lg"
                        loading={isLoading}
                        disabled={!isValid || isLoading}
                    >
                        Create Account
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default function CreateAccount() {
    return (
        <ScreenErrorBoundary screenName="Create Account">
            <CreateAccountScreen />
        </ScreenErrorBoundary>
    )
}
