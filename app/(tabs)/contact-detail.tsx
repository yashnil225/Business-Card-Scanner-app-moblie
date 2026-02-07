import { ScreenErrorBoundary } from '@/src/components/error'
import { Button, Text } from '@/src/components/ui'
import { EditableTagList } from '@/src/components/ui/TagList'
import { useColors } from '@/src/hooks/useColors'
import { spacing } from '@/src/lib/theme'
import { useContactsStore } from '@/src/stores/contactsStore'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native'

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

function ContactDetailScreen() {
    const colors = useColors()
    const router = useRouter()
    const { id } = useLocalSearchParams<{ id: string }>()
    const getContact = useContactsStore((state) => state.getContact)
    const deleteContact = useContactsStore((state) => state.deleteContact)
    const updateContact = useContactsStore((state) => state.updateContact)
    const addTagToContact = useContactsStore((state) => state.addTagToContact)
    const removeTagFromContact = useContactsStore((state) => state.removeTagFromContact)

    const contact = useMemo(() => (id ? getContact(id) : null), [id, getContact])
    const [isEditing, setIsEditing] = useState(false)

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

    const handleLinkedIn = () => {
        if (contact?.linkedInUrl) {
            Linking.openURL(contact.linkedInUrl)
        }
    }

    const handleShare = async () => {
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

    const handleStartResearch = () => {
        Alert.alert("Start Research", "This would trigger AI research on this contact.")
    }

    const handleAddTag = (tag: string) => {
        if (id) {
            addTagToContact(id, tag)
        }
    }

    const handleRemoveTag = (tag: string) => {
        if (id) {
            removeTagFromContact(id, tag)
        }
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

    const getPriorityColor = (score: number) => {
        if (score >= 70) return '#4CAF50'
        if (score >= 40) return '#FF9800'
        return '#F44336'
    }

    const getCategoryColor = (category: string) => {
        const categoryColors: Record<string, string> = {
            lead: '#4CAF50',
            partner: '#2196F3',
            investor: '#9C27B0',
            client: '#FF9800',
            vendor: '#607D8B',
            competitor: '#F44336',
            prospect: '#00BCD4',
            influencer: '#E91E63',
            other: '#9E9E9E',
        }
        return categoryColors[category] || '#9E9E9E'
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </Pressable>
                <Pressable style={styles.menuButton} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={24} color={colors.text} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

                    {(contact.priorityScore !== undefined || contact.category) && (
                        <View style={styles.badgeRow}>
                            {contact.priorityScore !== undefined && (
                                <View style={[styles.badge, { backgroundColor: getPriorityColor(contact.priorityScore) + '20' }]}>
                                    <Ionicons name="star" size={12} color={getPriorityColor(contact.priorityScore)} />
                                    <Text style={[styles.badgeText, { color: getPriorityColor(contact.priorityScore) }]}>
                                        {contact.priorityScore}/100 Priority
                                    </Text>
                                </View>
                            )}
                            {contact.category && (
                                <View style={[styles.badge, { backgroundColor: getCategoryColor(contact.category) + '20' }]}>
                                    <Text style={[styles.badgeText, { color: getCategoryColor(contact.category) }]}>
                                        {contact.category.charAt(0).toUpperCase() + contact.category.slice(1)}
                                    </Text>
                                </View>
                            )}
                            {contact.isCompetitor && (
                                <View style={[styles.badge, { backgroundColor: '#F4433620' }]}>
                                    <Ionicons name="warning" size={12} color="#F44336" />
                                    <Text style={[styles.badgeText, { color: '#F44336' }]}>
                                        Competitor
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <View style={styles.actionsRow}>
                    <ActionButton icon="call" label="Call" onPress={handleCall} />
                    <ActionButton icon="mail" label="Email" onPress={handleEmail} />
                    <ActionButton icon="share-social" label="Share" onPress={handleShare} />
                    {contact.linkedInUrl && <ActionButton icon="logo-linkedin" label="LinkedIn" onPress={handleLinkedIn} />}
                    {contact.website && <ActionButton icon="globe" label="Website" onPress={handleWebsite} />}
                </View>

                <View style={styles.section}>
                    <View style={styles.card}>
                        {contact.phone && <InfoRow icon="call" text={contact.phone} />}
                        {contact.email && <InfoRow icon="mail" text={contact.email} />}
                        {contact.address && <InfoRow icon="location" text={contact.address} />}
                        {contact.website && <InfoRow icon="globe" text={contact.website} />}
                    </View>
                </View>

                {(contact.industry || contact.companySize || contact.location) && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
                        <View style={styles.card}>
                            {contact.industry && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="grid-outline" size={20} color={colors.accent} />
                                    <Text style={[styles.detailText, { color: colors.text }]}>{contact.industry}</Text>
                                </View>
                            )}
                            {contact.companySize && contact.companySize !== 'unknown' && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="business-outline" size={20} color={colors.accent} />
                                    <Text style={[styles.detailText, { color: colors.text }]}>
                                        {contact.companySize.charAt(0).toUpperCase() + contact.companySize.slice(1)} Company
                                    </Text>
                                </View>
                            )}
                            {contact.location?.city && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="map-outline" size={20} color={colors.accent} />
                                    <Text style={[styles.detailText, { color: colors.text }]}>
                                        {contact.location.city}{contact.location.country ? `, ${contact.location.country}` : ''}
                                    </Text>
                                </View>
                            )}
                            {contact.ocrConfidence !== undefined && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="scan-outline" size={20} color={colors.accent} />
                                    <Text style={[styles.detailText, { color: colors.text }]}>
                                        Scan Quality: {contact.scanQuality}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <View style={styles.tagSectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tags</Text>
                        <Pressable onPress={() => setIsEditing(!isEditing)}>
                            <Ionicons name={isEditing ? "checkmark" : "create-outline"} size={20} color={colors.accent} />
                        </Pressable>
                    </View>
                    <View style={styles.card}>
                        {isEditing ? (
                            <EditableTagList
                                tags={contact.tags || []}
                                onAddTag={handleAddTag}
                                onRemoveTag={handleRemoveTag}
                            />
                        ) : (
                            <View style={styles.tagRow}>
                                {(contact.tags || []).length > 0 ? (
                                    contact.tags?.map((tag) => (
                                        <View key={tag} style={[styles.tagPill, { borderColor: colors.border }]}>
                                            <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={[styles.noTagsText, { color: colors.text + '60' }]}>No tags yet</Text>
                                )}
                            </View>
                        )}
                    </View>
                </View>

                {contact.conversationStarters && contact.conversationStarters.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Conversation Starters</Text>
                        <View style={styles.card}>
                            {contact.conversationStarters.map((starter, index) => (
                                <View key={index} style={styles.starterRow}>
                                    <View style={[styles.starterNumber, { backgroundColor: colors.accent + '20' }]}>
                                        <Text style={[styles.starterNumberText, { color: colors.accent }]}>{index + 1}</Text>
                                    </View>
                                    <Text style={[styles.starterText, { color: colors.text }]}>{starter}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <View style={styles.notesCard}>
                        <View style={styles.notesHeader}>
                            <Text style={[styles.notesTitle, { color: colors.text }]}>Notes</Text>
                            <Ionicons name="mic-outline" size={20} color={colors.secondary} />
                        </View>
                        {contact.notes ? (
                            <Text style={[styles.notesText, { color: colors.text }]}>{contact.notes}</Text>
                        ) : (
                            <Text style={[styles.notesPlaceholder, { color: colors.text + '60' }]}>
                                Keep notes on key details like where you met, what you discussed and any follow-ups.
                            </Text>
                        )}
                    </View>
                </View>

                {(contact.personSummary || contact.companySummary) ? (
                    <>
                        {contact.personSummary && (
                            <View style={styles.section}>
                                <View style={[styles.pillHeader, { backgroundColor: '#F0F5FF' }]}>
                                    <Ionicons name="person" size={12} color={colors.accent} style={{ marginRight: 4 }} />
                                    <Text style={[styles.pillText, { color: colors.accent }]}>Person Summary</Text>
                                </View>
                                <Text style={[styles.bodyText, { color: colors.text }]}>{contact.personSummary}</Text>
                            </View>
                        )}
                        {contact.companySummary && (
                            <View style={styles.section}>
                                <View style={[styles.pillHeader, { backgroundColor: '#F0F5FF' }]}>
                                    <Ionicons name="business" size={12} color={colors.accent} style={{ marginRight: 4 }} />
                                    <Text style={[styles.pillText, { color: colors.accent }]}>Company Summary</Text>
                                </View>
                                <Text style={[styles.bodyText, { color: colors.text }]}>{contact.companySummary}</Text>
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.researchContainer}>
                        <Text style={styles.researchTitle}>What didn't {contact.name.split(' ')[0]} tell you?</Text>
                        <Pressable style={styles.researchButton} onPress={handleStartResearch}>
                            <Text style={styles.researchButtonText}>Start research</Text>
                        </Pressable>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
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
        paddingBottom: spacing.xl * 4,
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
    badgeRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 16,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.xl,
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
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
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
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
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    detailText: {
        fontSize: 15,
        flex: 1,
    },
    tagSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    tagPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderRadius: 20,
    },
    tagText: {
        fontSize: 14,
    },
    noTagsText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    starterRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    starterNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    starterNumberText: {
        fontSize: 12,
        fontWeight: '600',
    },
    starterText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
    notesCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: spacing.lg,
    },
    notesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    notesTitle: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
    },
    notesText: {
        fontSize: 15,
        lineHeight: 22,
    },
    notesPlaceholder: {
        fontSize: 15,
        lineHeight: 22,
        fontStyle: 'italic',
    },
    pillHeader: {
        flexDirection: 'row',
        alignItems: 'center',
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
    researchContainer: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        paddingBottom: spacing.xl,
    },
    researchTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: spacing.lg,
        color: '#333',
    },
    researchButton: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4169E1',
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
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
    },
})

import { fontSize, fontWeight } from '@/src/lib/theme'

export default function ContactDetail() {
    return (
        <ScreenErrorBoundary screenName="Contact Detail">
            <ContactDetailScreen />
        </ScreenErrorBoundary>
    )
}
