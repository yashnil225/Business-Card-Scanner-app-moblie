import { ScreenErrorBoundary } from '@/src/components/error'
import { Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { borderRadius, fontSize, fontWeight, spacing, type Colors } from '@/src/lib/theme'
import { useContactsStore } from '@/src/stores/contactsStore'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { useMemo } from 'react'
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'

function SummaryScreen() {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])
    const router = useRouter()
    const { contactData } = useLocalSearchParams<{ contactData: string }>()
    const addContact = useContactsStore((state) => state.addContact)

    const contact = useMemo(() => {
        if (!contactData) return null
        try {
            return JSON.parse(contactData)
        } catch (e) {
            console.error('Failed to parse contact data', e)
            return null
        }
    }, [contactData])

    const handleSave = () => {
        if (!contact) return

        addContact({
            ...contact,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })

        router.replace('/(tabs)')
    }

    const handleDiscard = () => {
        Alert.alert('Discard Contact', 'Are you sure you want to discard this scan?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Discard',
                style: 'destructive',
                onPress: () => router.replace('/(tabs)'),
            },
        ])
    }

    // Helper function to render text with LinkedIn links
    const renderTextWithLinks = (text: string) => {
        if (!text) return null

        // Regex to match LinkedIn URLs or "LinkedIn" text
        const linkedInRegex = /(https?:\/\/(www\.)?linkedin\.com\/[^\s]+|LinkedIn)/gi
        const parts = text.split(linkedInRegex)
        const matches: string[] = text.match(linkedInRegex) || []

        return (
            <Text style={[styles.sectionText, { color: colors.text }]}>
                {parts.map((part, index) => {
                    const isLinkedIn = matches.includes(part)
                    if (isLinkedIn) {
                        const url = part.toLowerCase().includes('http') 
                            ? part 
                            : contact?.linkedInUrl || `https://linkedin.com`
                        return (
                            <Text
                                key={index}
                                style={[styles.linkedInText, { color: colors.accent }]}
                                onPress={() => Linking.openURL(url)}
                            >
                                {part}
                            </Text>
                        )
                    }
                    return <Text key={index}>{part}</Text>
                })}
            </Text>
        )
    }

    if (!contact) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
                    <Text style={[styles.emptyText, { color: colors.text }]}>No contact data found</Text>
                    <Pressable
                        style={({ pressed }) => [
                            styles.backButton,
                            { opacity: pressed ? 0.7 : 1 }
                        ]}
                        onPress={() => router.back()}
                    >
                        <Text style={[styles.backButtonText, { color: colors.accent }]}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}
                    onPress={handleDiscard}
                >
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </Pressable>

                {/* Progress Pills */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressPill, styles.progressPillActive, { backgroundColor: colors.accent }]} />
                    <View style={[styles.progressPill, styles.progressPillActive, { backgroundColor: colors.accent }]} />
                    <View style={[styles.progressPill, { backgroundColor: colors.border }]} />
                </View>

                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Card Image Section */}
                <View style={styles.cardImageSection}>
                    <View style={styles.cardImageContainer}>
                        {contact.imageUri ? (
                            <Image
                                source={{ uri: contact.imageUri }}
                                style={styles.cardImage}
                                contentFit="cover"
                            />
                        ) : (
                            <View style={[styles.cardImage, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="image-outline" size={48} color={colors.border} />
                            </View>
                        )}
                    </View>
                </View>

                {/* Name */}
                <View style={styles.nameSection}>
                    <Text style={[styles.nameText, { color: colors.text }]}>
                        {contact.name || 'Unknown'}
                    </Text>
                </View>

                {/* Job Title */}
                <View style={styles.jobTitleSection}>
                    <Text style={[styles.jobTitle, { color: colors.secondary }]}>
                        {contact.title}{contact.company ? ` at ${contact.company}` : ''}
                    </Text>
                </View>

                {/* Summary About the Person */}
                {contact.personSummary && (
                    <View style={styles.sectionContainer}>
                        <Text style={[styles.sectionLabel, { color: colors.tertiary }]}>
                            SUMMARY ABOUT THE PERSON
                        </Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
                            {renderTextWithLinks(contact.personSummary)}
                        </View>
                    </View>
                )}

                {/* Summary About the Company */}
                {contact.companySummary && (
                    <View style={styles.sectionContainer}>
                        <Text style={[styles.sectionLabel, { color: colors.tertiary }]}>
                            SUMMARY ABOUT THE COMPANY
                        </Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
                            {renderTextWithLinks(contact.companySummary)}
                        </View>
                    </View>
                )}

                {/* Conversation Starters */}
                {contact.conversationStarters && contact.conversationStarters.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <Text style={[styles.sectionLabel, { color: colors.tertiary }]}>
                            CONVERSATION STARTERS
                        </Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
                            {contact.conversationStarters.map((starter: string, index: number) => (
                                <View key={index} style={index > 0 ? styles.conversationItem : undefined}>
                                    {renderTextWithLinks(starter)}
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Continue Button */}
            <View style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [
                        styles.continueButton,
                        {
                            backgroundColor: colors.accent,
                            opacity: pressed ? 0.9 : 1
                        }
                    ]}
                    onPress={handleSave}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        gap: spacing.lg,
    },
    emptyText: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        textAlign: 'center',
    },
    backButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButtonText: {
        fontSize: fontSize.base,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
    scrollContent: {
        paddingBottom: 120,
    },
    // Card Image Section
    cardImageSection: {
        paddingHorizontal: spacing.lg,
        marginTop: spacing.md,
        marginBottom: spacing.lg,
        alignItems: 'center',
    },
    cardImageContainer: {
        width: '80%',
        maxWidth: 300,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 160,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    // Name Section
    nameSection: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
        alignItems: 'center',
    },
    nameText: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        textAlign: 'center',
    },
    // Job Title
    jobTitleSection: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        alignItems: 'center',
    },
    jobTitle: {
        fontSize: fontSize.base,
        textAlign: 'center',
        lineHeight: 22,
    },
    // Summary Sections
    sectionContainer: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    sectionLabel: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        marginBottom: spacing.sm,
        letterSpacing: 0.5,
    },
    sectionCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionText: {
        fontSize: fontSize.base,
        lineHeight: 24,
    },
    linkedInText: {
        textDecorationLine: 'underline',
    },
    conversationItem: {
        marginTop: spacing.md,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    continueButton: {
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
    continueButtonText: {
        color: '#fff',
        fontSize: fontSize.lg,
        fontWeight: '600',
    },
})

export default function Summary() {
    return (
        <ScreenErrorBoundary screenName="Review Scan">
            <SummaryScreen />
        </ScreenErrorBoundary>
    )
}
