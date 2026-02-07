import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()

  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  return finalStatus === 'granted'
}

/**
 * Get the Expo Push Token for this device
 * Returns null if unable to get token (not a physical device, no permissions, etc.)
 */
export async function getExpoPushToken(): Promise<string | null> {
  // Must be a physical device
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device')
    return null
  }

  // Get project ID from Expo config
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId ??
    Constants?.expoConfig?.extra?.eas?.projectId

  if (!projectId) {
    console.error('Project ID not found in Expo config')
    return null
  }

  try {
    // On Android 13+, we need to create a notification channel first
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E6F4FE',
      })
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    })

    return token
  } catch (error) {
    console.error('Failed to get Expo push token:', error)
    return null
  }
}

/**
 * Register for push notifications - requests permissions and gets token
 * Returns the Expo Push Token or null if registration failed
 */
export async function registerForPushNotifications(): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions()

  if (!hasPermission) {
    console.warn('Notification permissions not granted')
    return null
  }

  return getExpoPushToken()
}

/**
 * Mock saving token (formerly to Supabase)
 */
export async function savePushTokenToDevice(userId: string, token: string): Promise<void> {
  // No-op for local storage version
  console.log('Mock saving push token for user:', userId, token)
}

/**
 * Mock removing token (formerly from Supabase)
 */
export async function removePushTokenFromDevice(userId: string, token: string): Promise<void> {
  // No-op for local storage version
  console.log('Mock removing push token for user:', userId, token)
}

/**
 * Add a listener for incoming notifications while app is foregrounded
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback)
}

/**
 * Add a listener for when a user interacts with a notification
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback)
}
