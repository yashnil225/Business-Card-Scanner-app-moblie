import { ScreenErrorBoundary } from '@/src/components/error'
import { Button, Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { spacing } from '@/src/lib/theme'
import { useContactsStore } from '@/src/stores/contactsStore'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native'

// Reusable Action Button (Same as ContactDetail)
function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
    const colors = useColors()
    return (
        <View style={styles.actionButtonContainer}>
            <Pressable
                style={[styles.actionButton, { backgroundColor: '#F0F5FF' }]}
                onPress={onPress}
            >
                <Ionicons name={icon as any} size={24} color={colors.accent} />
            </Pressable>
            <Text style={[styles.actionLabel, { color: colors.accent }]}>{label}</Text>
        </View>
    )
}

function SummaryScreen() {
    const colors = useColors()
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

        // Add to store
        addContact({
            ...contact,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })

        // Navigate to dashboard (or contact list)
        // Using replace to clear stack history of scanning
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

    if (!contact) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
                <Text style={styles.emptyText}>No contact data found</Text>
                <Button onPress={() => router.back()} style={{ marginTop: spacing.lg }}>
                    Go Back
                </Button>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={handleDiscard}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
                <Text style={{ fontSize: 18, fontWeight: '600' }}>Review Contact</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        {contact.imageUri ? (
                            <Image source={{ uri: contact.imageUri }} style={styles.avatar} contentFit="cover" />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={{ fontSize: 32, fontWeight: '600', color: colors.secondary }}>
                                    {contact.name?.charAt(0).toUpperCase() || '?'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.name, { color: colors.text }]}>{contact.name}</Text>
                    <Text style={[styles.title, { color: colors.secondary }]}>
                        {contact.title}{contact.company ? `, ${contact.company}` : ''}
                    </Text>
                </View>

                {/* Contact Info Card */}
                <View style={styles.section}>
                    <View style={styles.card}>
                        {contact.phone && <InfoRow icon="call" text={contact.phone} />}
                        {contact.email && <InfoRow icon="mail" text={contact.email} />}
                        {contact.address && <InfoRow icon="location" text={contact.address} />}
                        {contact.website && <InfoRow icon="globe" text={contact.website} />}
                    </View>
                </View>

                {/* AI Summaries */}
                {(contact.personSummary || contact.companySummary) && (
                    <View style={styles.section}>
                        {contact.personSummary && (
                            <View style={styles.summaryCard}>
                                <View style={styles.pillHeader}>
                                    <Ionicons name="person" size={12} color={colors.accent} style={{ marginRight: 4 }} />
                                    <Text style={[styles.pillText, { color: colors.accent }]}>AI Person Summary</Text>
                                </View>
                                <Text style={[styles.bodyText, { color: colors.text }]}>{contact.personSummary}</Text>
                            </View>
                        )}
                        {contact.companySummary && (
                            <View style={[styles.summaryCard, { marginTop: spacing.md }]}>
                                <View style={styles.pillHeader}>
                                    <Ionicons name="business" size={12} color={colors.accent} style={{ marginRight: 4 }} />
                                    <Text style={[styles.pillText, { color: colors.accent }]}>AI Company Summary</Text>
                                </View>
                                <Text style={[styles.bodyText, { color: colors.text }]}>{contact.companySummary}</Text>
                            </View>
                        )}
                    </View>
                )}

            </ScrollView>

            <View style={styles.footer}>
                <Button
                    variant="primary"
                    onPress={handleSave}
                    style={styles.saveButton}
                    textStyle={{ fontSize: 18, fontWeight: '600' }}
                >
                    Save Contact
                </Button>
            </View>
        </View>
    )
}

// Helper for Contact Info Rows
function InfoRow({ icon, text }: { icon: string; text: string }) {
    const colors = useColors()
    return (
        <View style={styles.infoRow}>
            <View style={[styles.infoIconContainer, { backgroundColor: '#F0F5FF' }]}>
                <Ionicons name={icon as any} size={20} color={colors.accent} />
            </View>
            <Text style={[styles.infoText, { color: colors.text }]}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl + 20,
        paddingBottom: spacing.sm,
    },
    backButton: {
        padding: spacing.xs,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.xl,
    },
    avatarContainer: {
        marginBottom: spacing.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: spacing.lg,
        gap: spacing.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        fontSize: 16,
        flex: 1,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: spacing.lg,
    },
    pillHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F5FF',
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginBottom: spacing.md,
    },
    pillText: {
        fontSize: 12,
        fontWeight: '600',
    },
    bodyText: {
        fontSize: 15,
        lineHeight: 22,
    },
    footer: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        padding: spacing.lg,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    saveButton: {
        height: 56,
        borderRadius: 28,
    },
    actionButtonContainer: {
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
    },
})

export default function Summary() {
    return (
        <ScreenErrorBoundary screenName="Review Scan">
            <SummaryScreen />
        </ScreenErrorBoundary>
    )
}
