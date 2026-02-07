import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

import { Button, Input, Text } from '@/src/components/ui'
import { ScreenErrorBoundary } from '@/src/components/error'
import { useUserStore } from '@/src/stores'
import { useColors } from '@/src/hooks/useColors'
import { borderRadius, spacing, fontSize, type Colors } from '@/src/lib/theme'
import { getInitials, getCompanyColor } from '@/src/lib/companyUtils'

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.xl,
    },
    photoSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    photoContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    photoImage: {
      width: 120,
      height: 120,
    },
    photoPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    photoPlaceholderText: {
      fontSize: fontSize['3xl'],
      fontWeight: '700',
      color: '#fff',
    },
    photoEditButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    section: {
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.md,
      shadowColor: colors.text,
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
    sectionTitle: {
      marginBottom: spacing.xs,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    dangerSection: {
      borderColor: colors.danger,
    },
    dangerTitle: {
      color: colors.danger,
    },
  })

function EditProfileScreen() {
  const router = useRouter()
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  
  // Local user data
  const user = useUserStore((state) => state.user)
  const updateUser = useUserStore((state) => state.updateUser)
  const deleteUser = useUserStore((state) => state.deleteUser)
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [photoUri, setPhotoUri] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email || '')
      setPhotoUri(user.photoUri)
    }
  }, [user])

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

  const handleSaveProfile = useCallback(async () => {
    const trimmedName = name.trim()
    
    if (!trimmedName) {
      Alert.alert('Name Required', 'Please enter your name.')
      return
    }

    setIsLoading(true)

    try {
      updateUser({
        name: trimmedName,
        email: email.trim() || null,
        photoUri,
      })
      Alert.alert('Profile Updated', 'Your profile has been updated successfully.')
    } catch (error) {
      Alert.alert(
        'Profile Update Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      )
    } finally {
      setIsLoading(false)
    }
  }, [name, email, photoUri, updateUser])

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteUser()
            router.replace('/(auth)/get-started')
          },
        },
      ]
    )
  }, [deleteUser, router])

  const initials = useMemo(() => getInitials(name), [name])

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>User not found</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      accessibilityRole="scrollbar"
    >
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
            <View style={[styles.photoPlaceholder, { backgroundColor: getCompanyColor(name) }]}>
              <Text style={styles.photoPlaceholderText}>{initials}</Text>
            </View>
          )}
          <View style={styles.photoEditButton}>
            <Ionicons name="camera" size={18} color="#fff" />
          </View>
        </Pressable>
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="h3" style={styles.sectionTitle}>
            Profile
          </Text>
          <Button
            onPress={handleSaveProfile}
            loading={isLoading}
            size="sm"
            variant="outline"
            accessibilityLabel="Save profile"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </View>
        <Input
          placeholder="Full Name"
          accessibilityLabel="Full name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          returnKeyType="done"
        />
        <Input
          placeholder="Email (optional)"
          accessibilityLabel="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="done"
        />
      </View>

      {/* Danger Zone */}
      <View style={[styles.section, styles.dangerSection]}>
        <Text variant="h3" style={[styles.sectionTitle, styles.dangerTitle]}>
          Danger Zone
        </Text>
        <Button
          onPress={handleDeleteAccount}
          variant="danger"
          size="md"
          accessibilityLabel="Delete your account"
        >
          Delete Account
        </Button>
      </View>
    </ScrollView>
  )
}

export default function EditProfile() {
  return (
    <ScreenErrorBoundary screenName="Edit Profile">
      <EditProfileScreen />
    </ScreenErrorBoundary>
  )
}
