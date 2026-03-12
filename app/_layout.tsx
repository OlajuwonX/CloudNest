import { Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { MD3LightTheme, PaperProvider } from 'react-native-paper'
import './global.css'

// ─── react-native-paper theme ─── //

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#14532D',  // dark green   — input focus ring, active label
    secondary: '#1E3A8A',  // dark blue
    error: '#DC2626',  // danger red    — error borders / labels
    background: '#F8FAFC',
    surface: '#FFFFFF',
    outline: '#E5E7EB',  // resting input border
    onSurfaceVariant: '#6B7280',  // placeholder & floating label colour
  },
}
function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const isAuthenticated = false;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated]);

  return <>{children}</>
}


export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <RouteGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='(tabs)' />
          </ Stack>
        </RouteGuard>
      </PaperProvider>
    </GestureHandlerRootView>
  )
}
