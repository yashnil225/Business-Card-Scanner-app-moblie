import { ScreenErrorBoundary } from '@/src/components/error'
import { Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { spacing } from '@/src/lib/theme'
import { useContactsStore } from '@/src/stores/contactsStore'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'

// Empty State Component matching reference
function EmptyState({ onScan }: { onScan: () => void }) {
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <View style={styles.illustrationContainer}>
          <Image
            source={require('@/assets/images/dashboard-illustration.png')}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
          />
        </View>

        <Text style={[styles.heroTitle, { color: colors.text }]}>
          Scan a card, experience{'\n'}true accuracy
        </Text>

        <Text style={[styles.heroSubtitle, { color: colors.secondary }]}>
          Trusted by 2 million professionals
        </Text>

        {/* Logos Placeholder - keeping it text based for now to avoid asset issues */}
        <View style={styles.logosContainer}>
          <Text style={[styles.logoText, { color: colors.tertiary }]}>PwC  DELTA  EY  Cartier</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.mainButton, { backgroundColor: colors.accent }]}
          onPress={onScan}
        >
          <Ionicons name="scan" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.mainButtonText}>Open camera</Text>
        </Pressable>
      </View>
    </View>
  )
}

function HomeScreen() {
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  const router = useRouter()
  const contacts = useContactsStore((state) => state.contacts)

  // Sort contacts by newest first
  const sortedContacts = useMemo(() => [...contacts].reverse(), [contacts])


  const handleScanCard = () => {
    router.push('/(scan)/camera')
  }

  if (contacts.length === 0) {
    return <EmptyState onScan={handleScanCard} />
  }

  return (
    <View style={styles.container}>
      {/* Scrollable Dashboard */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Dashboard Header - Greeting & Stats (Ref Image 2) */}
        <View style={styles.dashboardHeader}>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.username}>Yash</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{contacts.length}</Text>
            <Text style={styles.statLabel}>scans</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={[styles.statValue, { color: '#2E7D32' }]}>{contacts.length * 15}m</Text>
            <Text style={styles.statLabel}>saved</Text>
          </View>
          {/* Add Button inline with stats for quick action? Or keep FAB? Ref has specific layout. */}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
        </View>

        {/* Recent Scans (Ref Image 3) - Horizontal Scroll if strictly following "Recent" logic, 
            but for now using the main list as a vertical feed which works well. 
            Ref Image 3 shows "Recent Scans" as a vertical list item? 
            Let's stick to the main clean list but with the Dashboard headers above it.
        */}

        {sortedContacts.map((contact) => (
          <Pressable
            key={contact.id}
            style={styles.contactCard}
            onPress={() => router.push(`/(tabs)/contact-detail?id=${contact.id}`)}
          >
            <View style={styles.avatarContainer}>
              {contact.imageUri ? (
                <Image source={{ uri: contact.imageUri }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
                  <Text style={{ fontSize: 20, fontWeight: '600', color: colors.secondary }}>
                    {contact.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactDetails} numberOfLines={1}>
                {contact.title && contact.company
                  ? `${contact.title} at ${contact.company}`
                  : contact.title || contact.company || 'No details'}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.tertiary} />
          </Pressable>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Scan Button */}
      <Pressable style={[styles.fab, { backgroundColor: colors.accent }]} onPress={handleScanCard}>
        <Ionicons name="camera" size={28} color="#fff" />
      </Pressable>
    </View>
  )
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Ensure white background for dashboard
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  illustrationContainer: {
    marginBottom: spacing.xl,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F5FF',
    borderRadius: 60,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.xl * 2,
  },
  logosContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl + 20, // Bottom safe area approximation
  },
  mainButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  // Dashboard Styles
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl + 20, // Add top padding here instead of header view
  },
  dashboardHeader: {
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  username: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  // List Styles
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactDetails: {
    fontSize: 14,
    color: '#888',
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  }
})

export default function Home() {
  return (
    <ScreenErrorBoundary screenName="Home">
      <HomeScreen />
    </ScreenErrorBoundary>
  )
}
