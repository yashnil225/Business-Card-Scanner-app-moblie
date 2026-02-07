import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { Image } from 'expo-image'
import { useCallback, useMemo, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'

import { Button, Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { spacing, borderRadius, fontSize, type Colors, type ThemeMode } from '@/src/lib/theme'
import { useAuthStore } from '@/src/features/auth'
import { useThemeStore, useUserStore } from '@/src/stores'
import { ScreenErrorBoundary } from '@/src/components/error'
import { getInitials, getCompanyColor } from '@/src/lib/companyUtils'

const themeModeLabels: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

const themeModes: ThemeMode[] = ['light', 'dark', 'system']

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    header: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: colors.border,
    },
    avatarImage: {
      width: 100,
      height: 100,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: fontSize['3xl'],
      fontWeight: '700',
      color: '#fff',
    },
    userName: {
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    userEmail: {
      marginBottom: spacing.md,
    },
    section: {
      marginTop: spacing.sm,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    menuItemIcon: {
      marginRight: spacing.md,
    },
    menuItemContent: {
      flex: 1,
    },
    menuItemValue: {
      marginRight: spacing.sm,
    },
    themeOptions: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    themeOption: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    themeOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    logoutSection: {
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
  })

function ProfileScreen() {
  const router = useRouter()
  const { mode, setMode } = useThemeStore()
  const [showThemePicker, setShowThemePicker] = useState(false)
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  
  // Local user data
  const user = useUserStore((state) => state.user)
  const deleteUser = useUserStore((state) => state.deleteUser)
  
  // Auth store for sign out (kept for showcase)
  const { signOut, isLoading } = useAuthStore()

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      deleteUser() // Also clear local user
    } catch (error) {
      Alert.alert(
        'Sign Out Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      )
    }
  }, [signOut, deleteUser])

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteUser()
            // Redirect to get started
            router.replace('/(auth)/get-started')
          },
        },
      ]
    )
  }, [deleteUser, router])

  const handleThemeChange = useCallback(
    (themeMode: ThemeMode) => {
      setMode(themeMode)
    },
    [setMode]
  )

  const displayName = user?.name ?? 'User'
  const userEmail = user?.email
  const userPhoto = user?.photoUri
  const initials = useMemo(() => getInitials(displayName), [displayName])

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      accessibilityRole="scrollbar"
    >
      <View style={styles.header}>
        {userPhoto ? (
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: userPhoto }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          </View>
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: getCompanyColor(displayName) }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        <Text variant="h3" style={styles.userName}>
          {displayName}
        </Text>
        {userEmail && (
          <Text variant="bodySmall" color="secondary" style={styles.userEmail}>
            {userEmail}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Pressable
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/edit-profile')}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          accessibilityHint="Double tap to edit your profile settings"
        >
          <Ionicons
            name="create-outline"
            size={22}
            color={colors.text}
            style={styles.menuItemIcon}
          />
          <Text variant="body" style={styles.menuItemContent}>
            Edit Profile
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.tertiary} />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => setShowThemePicker(!showThemePicker)}
          accessibilityRole="button"
          accessibilityLabel={`Display theme: ${themeModeLabels[mode]}`}
          accessibilityHint="Double tap to change display theme"
          accessibilityState={{ expanded: showThemePicker }}
        >
          <Ionicons
            name="contrast-outline"
            size={22}
            color={colors.text}
            style={styles.menuItemIcon}
          />
          <Text variant="body" style={styles.menuItemContent}>
            Display
          </Text>
          <Text variant="bodySmall" color="secondary" style={styles.menuItemValue}>
            {themeModeLabels[mode]}
          </Text>
          <Ionicons
            name={showThemePicker ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.tertiary}
          />
        </Pressable>

        {showThemePicker && (
          <View
            style={styles.themeOptions}
            accessibilityRole="radiogroup"
            accessibilityLabel="Theme options"
          >
            {themeModes.map((themeMode) => {
              const isActive = mode === themeMode
              return (
                <Pressable
                  key={themeMode}
                  style={[styles.themeOption, isActive && styles.themeOptionActive]}
                  onPress={() => handleThemeChange(themeMode)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isActive }}
                  accessibilityLabel={`${themeModeLabels[themeMode]} theme`}
                >
                  <Text
                    variant="bodySmall"
                    weight="medium"
                    style={{ color: isActive ? colors.background : colors.text }}
                  >
                    {themeModeLabels[themeMode]}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        )}
      </View>

      <View style={styles.logoutSection}>
        <Button
          onPress={handleSignOut}
          variant="outline"
          loading={isLoading}
          fullWidth
          accessibilityLabel="Log out of your account"
          accessibilityHint="Double tap to sign out"
        >
          {isLoading ? 'Logging out...' : 'Log Out'}
        </Button>
      </View>

      <View style={styles.logoutSection}>
        <Button
          onPress={handleDeleteAccount}
          variant="danger"
          fullWidth
          accessibilityLabel="Delete your account"
          accessibilityHint="Double tap to delete your account"
        >
          Delete Account
        </Button>
      </View>

      <View style={styles.footer}>
        <Text variant="caption" color="tertiary">
          App Version {Constants.expoConfig?.version}
        </Text>
      </View>
    </ScrollView>
  )
}

export default function Profile() {
  return (
    <ScreenErrorBoundary screenName="Profile">
      <ProfileScreen />
    </ScreenErrorBoundary>
  )
}
