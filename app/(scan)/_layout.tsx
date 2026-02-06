import { Stack } from 'expo-router'

export default function ScanLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'fade', // Smooth transitions for scan flow
            }}
        />
    )
}
