import { ScreenErrorBoundary } from '@/src/components/error'
import { StatsCard } from '@/src/components/StatsCard'
import { SwipeableContactListItem } from '@/src/components/SwipeableContactListItem'
import { Input, Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { groupContactsByDate, getContactsThisWeek } from '@/src/lib/dateUtils'
import { borderRadius, fontSize, spacing, type Colors } from '@/src/lib/theme'
import { useContactsStore } from '@/src/stores/contactsStore'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useMemo, useState, useCallback } from 'react'
import { FlatList, Pressable, RefreshControl, SafeAreaView, StyleSheet, View } from 'react-native'

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl + 20,
            paddingBottom: spacing.md,
            backgroundColor: colors.background,
        },
        headerTitle: {
            fontSize: fontSize['3xl'],
            fontWeight: '700',
            color: colors.text,
            marginBottom: spacing.md,
        },
        searchContainer: {
            marginBottom: spacing.sm,
        },
        statsContainer: {
            flexDirection: 'row',
            gap: spacing.md,
            marginBottom: spacing.lg,
            paddingHorizontal: spacing.lg,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            marginTop: spacing.sm,
        },
        sectionTitle: {
            fontSize: fontSize.lg,
            fontWeight: '600',
            color: colors.text,
        },
        sectionCount: {
            fontSize: fontSize.sm,
            color: colors.secondary,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.full,
        },
        recentsLabel: {
            fontSize: fontSize.base,
            fontWeight: '600',
            color: colors.text,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.sm,
            marginTop: spacing.sm,
        },
        fab: {
            position: 'absolute',
            bottom: 30,
            right: 30,
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
        },
        emptyState: {
            alignItems: 'center',
            paddingVertical: spacing.xl * 3,
            paddingHorizontal: spacing.xl,
        },
        emptyText: {
            fontSize: fontSize.base,
            color: colors.secondary,
            textAlign: 'center',
            marginTop: spacing.md,
            lineHeight: 24,
        },
        emptyButton: {
            marginTop: spacing.xl,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.full,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
        },
        emptyButtonText: {
            color: '#fff',
            fontSize: fontSize.base,
            fontWeight: '600',
        },
        listContent: {
            paddingTop: spacing.md,
            paddingBottom: spacing.xl * 2,
        },
    })

interface Section {
    title: string
    data: any[]
}

function ContactsScreen() {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])
    const router = useRouter()
    const contacts = useContactsStore((state) => state.contacts)
    const deleteContact = useContactsStore((state) => state.deleteContact)
    const searchContacts = useContactsStore((state) => state.searchContacts)
    const [searchQuery, setSearchQuery] = useState('')
    const [refreshing, setRefreshing] = useState(false)

    const totalContacts = contacts.length
    const thisWeekContacts = useMemo(() => getContactsThisWeek(contacts), [contacts])

    const displayedContacts = useMemo(() => {
        if (searchQuery.trim()) {
            return searchContacts(searchQuery)
        }
        return [...contacts].sort((a, b) => b.createdAt - a.createdAt) // Newest first
    }, [contacts, searchQuery, searchContacts])

    const groupedSections = useMemo(() => {
        if (searchQuery.trim()) {
            return [{ title: 'Search Results', data: displayedContacts }]
        }
        const { today, thisWeek, earlier } = groupContactsByDate(displayedContacts)
        const sections: Section[] = []
        if (today.length > 0) {
            sections.push({ title: 'Today', data: today })
        }
        if (thisWeek.length > 0) {
            sections.push({ title: 'This Week', data: thisWeek })
        }
        if (earlier.length > 0) {
            sections.push({ title: 'Earlier', data: earlier })
        }
        return sections
    }, [displayedContacts, searchQuery])

    const handleScanCard = () => {
        router.push('/(scan)/camera')
    }

    const handleDeleteContact = useCallback((id: string) => {
        deleteContact(id)
    }, [deleteContact])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        // Simulate refresh
        setTimeout(() => setRefreshing(false), 1000)
    }, [])

    const renderContact = ({ item }: { item: any }) => (
        <SwipeableContactListItem
            contact={item}
            onDelete={handleDeleteContact}
            showDate={!searchQuery.trim()}
        />
    )

    const renderSectionHeader = (title: string, count: number) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionCount}>{count}</Text>
        </View>
    )

    // Render sections with headers
    const renderItem = ({ item, index }: { item: any; index: number }) => {
        // Find which section this item belongs to
        let currentSection: Section | null = null
        let itemIndex = 0
        for (const section of groupedSections) {
            if (index >= itemIndex && index < itemIndex + section.data.length) {
                currentSection = section
                break
            }
            itemIndex += section.data.length
        }

        const isFirstInSection = currentSection && index === itemIndex

        return (
            <>
                {isFirstInSection && renderSectionHeader(currentSection!.title, currentSection!.data.length)}
                {renderContact({ item })}
            </>
        )
    }

    // Flatten the sections for FlatList
    const flattenedData = groupedSections.flatMap((section) => section.data)

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Contacts</Text>
                <View style={styles.searchContainer}>
                    <Input
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search contacts..."
                        leftIcon="search"
                    />
                </View>
            </View>

            {/* Stats Cards - Only show when not searching */}
            {!searchQuery.trim() && (
                <View style={styles.statsContainer}>
                    <StatsCard
                        title="Total Scans"
                        value={totalContacts}
                        icon="people-outline"
                        backgroundColor="#E3F2FD"
                        iconColor="#1976D2"
                    />
                    <StatsCard
                        title="This Week"
                        value={thisWeekContacts.length}
                        icon="calendar-outline"
                        backgroundColor="#E8F5E9"
                        iconColor="#388E3C"
                    />
                </View>
            )}

            {/* Recents Label - Only show when not searching and have contacts */}
            {!searchQuery.trim() && totalContacts > 0 && (
                <Text style={styles.recentsLabel}>Recents</Text>
            )}

            {/* Contacts List */}
            <FlatList
                data={flattenedData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={64} color={colors.border} />
                        <Text style={styles.emptyText}>
                            {searchQuery.trim()
                                ? 'No contacts found matching your search.'
                                : 'No contacts yet.\nScan your first business card to get started!'}
                        </Text>
                        {!searchQuery.trim() && (
                            <Pressable
                                style={[styles.emptyButton, { backgroundColor: colors.accent }]}
                                onPress={handleScanCard}
                            >
                                <Ionicons name="camera" size={20} color="#fff" />
                                <Text style={styles.emptyButtonText}>Scan Card</Text>
                            </Pressable>
                        )}
                    </View>
                }
            />

            {/* Floating Action Button - Only show when there are contacts */}
            {contacts.length > 0 && (
                <Pressable
                    style={[styles.fab, { backgroundColor: colors.accent }]}
                    onPress={handleScanCard}
                >
                    <Ionicons name="add" size={32} color="#fff" />
                </Pressable>
            )}
        </SafeAreaView>
    )
}

export default function Contacts() {
    return (
        <ScreenErrorBoundary screenName="Contacts">
            <ContactsScreen />
        </ScreenErrorBoundary>
    )
}
