import { ScreenErrorBoundary } from '@/src/components/error'
import { Button, Text } from '@/src/components/ui'
import { useColors } from '@/src/hooks/useColors'
import { fontSize, spacing } from '@/src/lib/theme'
import { Ionicons } from '@expo/vector-icons'
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'

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
                aspect: [16, 10],
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

    return (
        <View style={styles.container}>
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                enableTorch={flash}
            >
                <View style={styles.overlay}>
                    {/* Top Bar for Flash only */}
                    <View style={styles.topBar}>
                        <Pressable style={styles.iconButton} onPress={() => setFlash(!flash)}>
                            <Ionicons
                                name={flash ? 'flash' : 'flash-off'}
                                size={24}
                                color="#fff"
                            />
                        </Pressable>
                    </View>

                    {/* Card Frame */}
                    <View style={styles.cardFrame}>
                        <View style={styles.frameBox}>
                            <View style={[styles.frameCorner, styles.cornerTopLeft]} />
                            <View style={[styles.frameCorner, styles.cornerTopRight]} />
                            <View style={[styles.frameCorner, styles.cornerBottomLeft]} />
                            <View style={[styles.frameCorner, styles.cornerBottomRight]} />
                        </View>
                    </View>

                    {/* Bottom Section */}
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: spacing.xl + 20, // Status bar safe area
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
    cardFrame: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    frameBox: {
        width: '100%',
        aspectRatio: 1.586,
        // No full border, only corners
        backgroundColor: 'transparent',
    },
    frameCorner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#fff',
        borderWidth: 4,
    },
    cornerTopLeft: {
        top: 0,
        left: 0,
        borderBottomWidth: 0,
        borderRightWidth: 0,
        borderTopLeftRadius: 16,
    },
    cornerTopRight: {
        top: 0,
        right: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderTopRightRadius: 16,
    },
    cornerBottomLeft: {
        bottom: 0,
        left: 0,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomLeftRadius: 16,
    },
    cornerBottomRight: {
        bottom: 0,
        right: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderBottomRightRadius: 16,
    },
    bottomSection: {
        paddingBottom: spacing.xl + 20,
        backgroundColor: 'rgba(0,0,0,0.2)', // Slight scrim
    },
    toggleContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 4,
        marginBottom: spacing.xl,
    },
    toggleOption: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 16,
    },
    toggleOptionActive: {
        backgroundColor: '#fff',
    },
    toggleText: {
        color: '#ccc',
        fontSize: 13,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#000',
    },
    controlsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    controlText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    captureButtonOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
    },
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
