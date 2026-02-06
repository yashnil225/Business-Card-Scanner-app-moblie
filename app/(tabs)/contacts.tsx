import { ScreenErrorBoundary } from '@/src/components/error'
import { Input, Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { borderRadius, fontSize, spacing, type Colors } from '@/src/lib/theme'
import { useContactsStore } from '@/src/stores/contactsStore'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'

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
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            color: colors.text,
            marginBottom: spacing.md,
        },
        searchContainer: {
            marginBottom: spacing.sm,
        },
        contactCard: {
            flexDirection: 'row',
            backgroundColor: colors.surface,
            padding: spacing.md,
            marginHorizontal: spacing.lg,
            marginBottom: spacing.md,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border,
            gap: spacing.md,
        },
        contactImage: {
            width: 60,
            height: 60,
            borderRadius: borderRadius.md,
            backgroundColor: colors.border,
        },
        contactInfo: {
            flex: 1,
            justifyContent: 'center',
        },
        contactName: {
            fontSize: fontSize.base,
            fontWeight: '600',
            color: colors.text,
            marginBottom: spacing.xs,
        },
        contactDetails: {
            fontSize: fontSize.sm,
            color: colors.secondary,
            marginBottom: 2,
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
        },
    })

function ContactsScreen() {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])
    const router = useRouter()
    const contacts = useContactsStore((state) => state.contacts)
    const searchContacts = useContactsStore((state) => state.searchContacts)
    const [searchQuery, setSearchQuery] = useState('')

    const displayedContacts = useMemo(() => {
        if (searchQuery.trim()) {
            return searchContacts(searchQuery)
        }
        return contacts
    }, [contacts, searchQuery, searchContacts])

    const renderContact = ({ item }: { item: any }) => (
        <Pressable
            style={styles.contactCard}
            onPress={() => router.push(`/(tabs)/contact-detail?id=${item.id}`)}
        >
            {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.contactImage} contentFit="cover" />
            ) : (
                <View style={[styles.contactImage, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: fontSize.xl, fontWeight: '600', color: colors.secondary }}>
                        {item.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
            )}
            <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                {item.title && <Text style={styles.contactDetails}>{item.title}</Text>}
                {item.company && <Text style={styles.contactDetails}>{item.company}</Text>}
                {item.email && <Text style={styles.contactDetails} numberOfLines={1}>{item.email}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
        </Pressable>
    )

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Contacts</Text>
                <View style={styles.searchContainer}>
                    <Input
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search contacts..."
                        leftIcon={() => <Ionicons name="search" size={20} color={colors.secondary} />}
                    />
                </View>
            </View>

            {/* Contacts List */}
            <FlatList
                data={displayedContacts}
                renderItem={renderContact}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xl }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={64} color={colors.border} />
                        <Text style={styles.emptyText}>
                            {searchQuery.trim()
                                ? 'No contacts found matching your search.'
                                : 'No contacts yet.\nScan your first business card to get started!'}
                        </Text>
                    </View>
                }
            />
        </View>
    )
}

export default function Contacts() {
    return (
        <ScreenErrorBoundary screenName="Contacts">
            <ContactsScreen />
        </ScreenErrorBoundary>
    )
}
