import { ScreenErrorBoundary } from '@/src/components/error'
import { Button, Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { spacing } from '@/src/lib/theme'
import { useContactsStore } from '@/src/stores/contactsStore'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native'

// Reusable Action Button Component
function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
    const colors = useColors()
    return (
        <View style={styles.actionButtonContainer}>
            <Pressable
                style={[styles.actionButton, { backgroundColor: '#F0F5FF' }]} // Light blue background
                onPress={onPress}
            >
                <Ionicons name={icon as any} size={24} color={colors.accent} />
            </Pressable>
            <Text style={[styles.actionLabel, { color: colors.accent }]}>{label}</Text>
        </View>
    )
}

function ContactDetailScreen() {
    const colors = useColors()
    const router = useRouter()
    const { id } = useLocalSearchParams<{ id: string }>()
    const getContact = useContactsStore((state) => state.getContact)
    const deleteContact = useContactsStore((state) => state.deleteContact)

    const contact = useMemo(() => (id ? getContact(id) : null), [id, getContact])

    const handleCall = () => {
        if (contact?.phone) {
            Linking.openURL(`tel:${contact.phone}`)
        }
    }

    const handleEmail = () => {
        if (contact?.email) {
            Linking.openURL(`mailto:${contact.email}`)
        }
    }

    const handleWebsite = () => {
        if (contact?.website) {
            const url = contact.website.startsWith('http') ? contact.website : `https://${contact.website}`
            Linking.openURL(url)
        }
    }

    const handleShare = async () => {
        // Implement share functionality
    }

    const handleDelete = () => {
        Alert.alert('Delete Contact', 'Are you sure you want to delete this contact?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    if (id) {
                        deleteContact(id)
                        router.back()
                    }
                },
            },
        ])
    }

    if (!contact) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="person-outline" size={64} color={colors.border} />
                <Text style={styles.emptyText}>Contact not found</Text>
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
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </Pressable>
                <Pressable style={styles.menuButton} onPress={handleDelete}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
                </Pressable>
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
                                    {contact.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.name, { color: colors.text }]}>{contact.name}</Text>
                    <Text style={[styles.title, { color: colors.secondary }]}>
                        {contact.title}{contact.company ? `, ${contact.company}` : ''}
                    </Text>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                    <ActionButton icon="call" label="Call" onPress={handleCall} />
                    <ActionButton icon="mail" label="Email" onPress={handleEmail} />
                    <ActionButton icon="share-social" label="Share" onPress={handleShare} />
                    {contact.website && <ActionButton icon="globe" label="Website" onPress={handleWebsite} />}
                </View>

                {/* Contact Info Card */}
                <View style={styles.section}>
                    <View style={styles.card}>
                        {contact.phone && <InfoRow icon="call" text={contact.phone} />}
                        {/* Mocking secondary phone for exact UI match if needed, but sticking to data */}
                        {contact.email && <InfoRow icon="mail" text={contact.email} />}
                        {contact.address && <InfoRow icon="location" text={contact.address} />}
                        {contact.website && <InfoRow icon="globe" text={contact.website} />}
                    </View>
                </View>

                {/* Tags Section matching reference 28 AM */}
                <View style={styles.section}>
                    <View style={styles.tagContainer}>
                        <View style={[styles.infoIconContainer, { backgroundColor: '#F0F5FF' }]}>
                            <Ionicons name="pricetag" size={20} color={colors.accent} />
                        </View>
                        <View style={styles.tagPill}>
                            <Text style={styles.tagText}>New Lead</Text>
                        </View>
                    </View>
                </View>

                {/* Notes Section matching reference 28 AM */}
                <View style={styles.section}>
                    <View style={styles.notesCard}>
                        <Text style={styles.noteDate}>Sat, Jan 24, 2026</Text>
                        <View style={styles.noteRow}>
                            <Text style={styles.notePlaceholder}>
                                Keep notes on key details like where you met, what you discussed and any follow-ups.
                            </Text>
                            <Ionicons name="mic" size={20} color={colors.secondary} />
                        </View>
                    </View>
                </View>

                {/* AI Summaries (Only if they exist) */}
                {(contact.personSummary || contact.companySummary) ? (
                    <>
                        <View style={styles.section}>
                            {contact.personSummary && (
                                <>
                                    <View style={styles.pillHeader}>
                                        <Ionicons name="person" size={12} color={colors.accent} style={{ marginRight: 4 }} />
                                        <Text style={[styles.pillText, { color: colors.accent }]}>Person Summary</Text>
                                    </View>
                                    <Text style={[styles.bodyText, { color: colors.text }]}>{contact.personSummary}</Text>
                                </>
                            )}
                        </View>
                        {contact.companySummary && (
                            <View style={styles.section}>
                                <View style={styles.pillHeader}>
                                    <Ionicons name="business" size={12} color={colors.accent} style={{ marginRight: 4 }} />
                                    <Text style={[styles.pillText, { color: colors.accent }]}>Company Summary</Text>
                                </View>
                                <Text style={[styles.bodyText, { color: colors.text }]}>{contact.companySummary}</Text>
                            </View>
                        )}
                    </>
                ) : (
                    /* Research Call to Action (When no summary exists) matching reference 28 AM */
                    <View style={styles.researchContainer}>
                        <Text style={styles.researchTitle}>What didn&apos;t {contact.name.split(' ')[0]} tell you?</Text>
                        <Pressable
                            style={styles.researchButton}
                            onPress={() => {
                                // In a real app, this would trigger the AI research job
                                Alert.alert("Start Research", "This would trigger AI research.")
                            }}
                        >
                            <Text style={styles.researchButtonText}>Start research</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

// Helper for Contact Info Rows matching reference
function InfoRow({ icon, text, type }: { icon: string; text: string; type?: 'link' | 'text' }) {
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl + 20,
        paddingBottom: spacing.sm,
    },
    backButton: {
        padding: spacing.xs,
    },
    menuButton: {
        padding: spacing.xs,
    },
    scrollContent: {
        paddingBottom: spacing.xl * 4, // Extra padding for fixed button space
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
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.xl,
        marginBottom: spacing.xl, // Reduced margin
        paddingHorizontal: spacing.lg,
    },
    actionButtonContainer: {
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        width: 50, // Slightly smaller to match reference
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    // Contact Info Card Style
    card: {
        backgroundColor: '#fff',
        borderRadius: 24, // High border radius as per reference
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
    // Tags
    tagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: spacing.md,
        borderRadius: 16,
        gap: spacing.md,
        marginTop: spacing.md,
    },
    tagPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
    },
    tagText: {
        fontSize: 14,
    },
    // Notes Card
    notesCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: spacing.lg,
        marginTop: spacing.md,
    },
    noteDate: {
        fontSize: 12,
        color: '#999',
        marginBottom: spacing.sm,
    },
    noteRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    notePlaceholder: {
        fontSize: 15,
        color: '#666',
        flex: 1,
        paddingRight: spacing.md,
        lineHeight: 22,
    },
    // Research CTA
    researchContainer: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        paddingBottom: spacing.xl,
    },
    researchTitle: {
        fontSize: 16,
        fontWeight: '600', // Semibold
        marginBottom: spacing.lg,
        color: '#333',
    },
    researchButton: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4169E1', // Royal Blue
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#4169E1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    researchButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    // Inherited
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
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
    },
})



export default function ContactDetail() {
    return (
        <ScreenErrorBoundary screenName="Contact Detail">
            <ContactDetailScreen />
        </ScreenErrorBoundary>
    )
}
