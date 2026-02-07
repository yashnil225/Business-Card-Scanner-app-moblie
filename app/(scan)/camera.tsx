import { ScreenErrorBoundary } from '@/src/components/error'
import { Button, Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { fontSize, spacing } from '@/src/lib/theme'
import { Ionicons } from '@expo/vector-icons'
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { Alert, Dimensions, Pressable, StyleSheet, View } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Toggle Component
function ScanModeToggle({ mode, setMode }: { mode: 'card' | 'qr', setMode: (m: 'card' | 'qr') => void }) {
    const colors = useColors()
    return (
        <View style={styles.toggleContainer}>
            <Pressable
                style={[styles.toggleOption, mode === 'card' && styles.toggleOptionActive]}
                onPress={() => setMode('card')}
            >
                <Text style={[styles.toggleText, mode === 'card' && styles.toggleTextActive]}>
                    Business card
                </Text>
            </Pressable>
            <Pressable
                style={[styles.toggleOption, mode === 'qr' && styles.toggleOptionActive]}
                onPress={() => setMode('qr')}
            >
                <Text style={[styles.toggleText, mode === 'qr' && styles.toggleTextActive]}>
                    QR code
                </Text>
            </Pressable>
        </View>
    )
}

function CameraScreen() {
    const colors = useColors()
    const router = useRouter()
    const cameraRef = useRef<CameraView>(null)
    const [facing, setFacing] = useState<CameraType>('back')
    const [flash, setFlash] = useState(false)
    const [permission, requestPermission] = useCameraPermissions()
    const [mode, setMode] = useState<'card' | 'qr'>('card')

    if (!permission) {
        return <View style={styles.container} />
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={64} color={colors.text} style={{ marginBottom: spacing.lg }} />
                <Text style={styles.permissionText}>
                    Camera permission is required to scan business cards
                </Text>
                <Button onPress={requestPermission}>Grant Permission</Button>
            </View>
        )
    }

    const handleCapture = async () => {
        if (!cameraRef.current) return

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
            })

            if (photo?.uri) {
                router.push({
                    pathname: '/(scan)/processing',
                    params: { imageUri: photo.uri },
                })
            }
        } catch (error) {
            console.error('Error taking picture:', error)
            Alert.alert('Error', 'Failed to capture image. Please try again.')
        }
    }

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: mode === 'card' ? [16, 10] : [1, 1],
                quality: 0.8,
            })

            if (!result.canceled && result.assets[0]) {
                router.push({
                    pathname: '/(scan)/processing',
                    params: { imageUri: result.assets[0].uri },
                })
            }
        } catch (error) {
            console.error('Error picking image:', error)
            Alert.alert('Error', 'Failed to pick image. Please try again.')
        }
    }

    // Calculate frame dimensions
    const frameWidth = SCREEN_WIDTH * 0.85
    const frameHeight = mode === 'card' ? frameWidth * 0.63 : frameWidth // Business card ratio vs Square for QR
    const frameTop = SCREEN_HEIGHT * 0.25

    return (
        <View style={styles.container}>
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                enableTorch={flash}
            >
                {/* Grey Overlay with Cutout */}
                <View style={styles.overlayContainer}>
                    {/* Top overlay */}
                    <View style={[styles.overlay, { height: frameTop }]} />
                    
                    {/* Middle section with frame cutout */}
                    <View style={styles.middleSection}>
                        {/* Left overlay */}
                        <View style={styles.sideOverlay} />
                        
                        {/* Frame */}
                        <View 
                            style={[
                                styles.frame, 
                                { 
                                    width: frameWidth, 
                                    height: frameHeight,
                                }
                            ]}
                        >
                            {/* Corner brackets */}
                            <View style={[styles.corner, styles.cornerTopLeft]} />
                            <View style={[styles.corner, styles.cornerTopRight]} />
                            <View style={[styles.corner, styles.cornerBottomLeft]} />
                            <View style={[styles.corner, styles.cornerBottomRight]} />
                        </View>
                        
                        {/* Right overlay */}
                        <View style={styles.sideOverlay} />
                    </View>
                    
                    {/* Bottom overlay */}
                    <View style={[styles.overlay, { flex: 1 }]} />
                </View>

                {/* Top Bar - Flash */}
                <View style={styles.topBar}>
                    <Pressable style={styles.iconButton} onPress={() => setFlash(!flash)}>
                        <Ionicons
                            name={flash ? 'flash' : 'flash-off'}
                            size={24}
                            color="#fff"
                        />
                    </Pressable>
                </View>

                {/* Bottom Controls */}
                <View style={styles.bottomSection}>
                    {/* Toggle */}
                    <ScanModeToggle mode={mode} setMode={setMode} />

                    {/* Controls */}
                    <View style={styles.controlsBar}>
                        <Pressable onPress={() => router.back()}>
                            <Text style={styles.controlText}>Cancel</Text>
                        </Pressable>

                        <Pressable style={styles.captureButtonOuter} onPress={handleCapture}>
                            <View style={styles.captureButtonInner} />
                        </Pressable>

                        <Pressable onPress={handlePickImage}>
                            <Text style={styles.controlText}>Photos</Text>
                        </Pressable>
                    </View>
                </View>
            </CameraView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    // Grey overlay system
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'column',
    },
    overlay: {
        backgroundColor: 'rgba(128, 128, 128, 0.6)', // Semi-transparent grey
        width: '100%',
    },
    middleSection: {
        flexDirection: 'row',
        height: 'auto',
    },
    sideOverlay: {
        flex: 1,
        backgroundColor: 'rgba(128, 128, 128, 0.6)', // Semi-transparent grey
    },
    // Frame
    frame: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#fff',
        borderWidth: 3,
    },
    cornerTopLeft: {
        top: -2,
        left: -2,
        borderBottomWidth: 0,
        borderRightWidth: 0,
        borderTopLeftRadius: 12,
    },
    cornerTopRight: {
        top: -2,
        right: -2,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderTopRightRadius: 12,
    },
    cornerBottomLeft: {
        bottom: -2,
        left: -2,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomLeftRadius: 12,
    },
    cornerBottomRight: {
        bottom: -2,
        right: -2,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderBottomRightRadius: 12,
    },
    // Top bar
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: spacing.xl + 40,
        paddingHorizontal: spacing.lg,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Bottom section
    bottomSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: spacing.xl + 20,
        backgroundColor: '#000', // Solid black bottom bar
    },
    // Toggle
    toggleContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        backgroundColor: 'rgba(128, 128, 128, 0.7)', // Grey background
        borderRadius: 24,
        padding: 4,
        marginBottom: spacing.xl,
    },
    toggleOption: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    toggleOptionActive: {
        backgroundColor: '#fff',
    },
    toggleText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },
    toggleTextActive: {
        color: '#000',
    },
    // Controls
    controlsBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
    },
    controlText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '400',
        minWidth: 70,
        textAlign: 'center',
    },
    captureButtonOuter: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 4,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    captureButtonInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#fff',
    },
    // Permission
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: '#fff',
    },
    permissionText: {
        fontSize: fontSize.lg,
        color: '#000',
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
})

export default function Camera() {
    return (
        <ScreenErrorBoundary screenName="Camera">
            <CameraScreen />
        </ScreenErrorBoundary>
    )
}
