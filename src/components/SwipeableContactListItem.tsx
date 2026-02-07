import { Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { formatScanDate } from '@/src/lib/dateUtils'
import { getCompanyColor, getInitials } from '@/src/lib/companyUtils'
import { borderRadius, fontSize, spacing, type Colors } from '@/src/lib/theme'
import type { Contact } from '@/src/types/contact'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'

interface SwipeableContactListItemProps {
    contact: Contact
    onDelete: (id: string) => void
    showDate?: boolean
}

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            marginHorizontal: spacing.lg,
            marginBottom: spacing.md,
        },
        contactCard: {
            flexDirection: 'row',
            backgroundColor: colors.surface,
            padding: spacing.md,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border,
            gap: spacing.md,
            alignItems: 'center',
        },
        contactImage: {
            width: 56,
            height: 56,
            borderRadius: 28,
        },
        initialsContainer: {
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
        },
        initialsText: {
            fontSize: fontSize.xl,
            fontWeight: '600',
            color: '#fff',
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
        dateText: {
            fontSize: fontSize.xs,
            color: colors.tertiary,
            marginTop: 2,
        },
        deleteAction: {
            backgroundColor: '#ff3b30',
            justifyContent: 'center',
            alignItems: 'center',
            width: 80,
            height: '100%',
            borderRadius: borderRadius.md,
            marginLeft: spacing.md,
        },
    })

function DeleteAction() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
            <View
                style={{
                    backgroundColor: '#ff3b30',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 75,
                    height: '90%',
                    borderRadius: borderRadius.md,
                }}
            >
                <Ionicons name="trash-outline" size={24} color="#fff" />
            </View>
        </View>
    )
}

export function SwipeableContactListItem({
    contact,
    onDelete,
    showDate = true,
}: SwipeableContactListItemProps) {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])
    const router = useRouter()

    const handleDelete = () => {
        Alert.alert('Delete Contact', `Are you sure you want to delete ${contact.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => onDelete(contact.id),
            },
        ])
    }

    const renderRightActions = () => <DeleteAction />

    const handlePress = () => {
        router.push(`/(tabs)/contact-detail?id=${contact.id}`)
    }

    const companyColor = useMemo(() => getCompanyColor(contact.company || ''), [contact.company])
    const initials = useMemo(() => getInitials(contact.name), [contact.name])

    return (
        <View style={styles.container}>
            <Swipeable
                renderRightActions={renderRightActions}
                onSwipeableOpen={handleDelete}
                rightThreshold={40}
            >
                <Pressable style={styles.contactCard} onPress={handlePress}>
                    {contact.imageUri ? (
                        <Image
                            source={{ uri: contact.imageUri }}
                            style={styles.contactImage}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={[styles.initialsContainer, { backgroundColor: companyColor }]}>
                            <Text style={styles.initialsText}>{initials}</Text>
                        </View>
                    )}
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        {contact.title && (
                            <Text style={styles.contactDetails}>{contact.title}</Text>
                        )}
                        {contact.company && (
                            <Text style={styles.contactDetails}>{contact.company}</Text>
                        )}
                        {showDate && (
                            <Text style={styles.dateText}>
                                Scanned {formatScanDate(contact.createdAt)}
                            </Text>
                        )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.tertiary} />
                </Pressable>
            </Swipeable>
        </View>
    )
}
