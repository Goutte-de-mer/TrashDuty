import { useFonts } from 'expo-font'
import { Slot, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from '@/context/AuthContext'

SplashScreen.preventAutoHideAsync()

function RootLayoutNav() {
  const { isLoggedIn, isLoading, colocId } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(auth)'
    const inOnboardingGroup = segments[0] === '(onboarding)'
    const inAppGroup = segments[0] === '(app)'

    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (isLoggedIn && colocId === null && !inOnboardingGroup) {
      router.replace('/(onboarding)/welcome')
    } else if (isLoggedIn && colocId !== null && !inAppGroup) {
      router.replace('/(app)/(tabs)')
    }
  }, [isLoggedIn, isLoading, colocId, segments])

  return <Slot />
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Manrope_400Regular: require('@expo-google-fonts/manrope/400Regular/Manrope_400Regular.ttf'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Manrope_500Medium: require('@expo-google-fonts/manrope/500Medium/Manrope_500Medium.ttf'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Manrope_600SemiBold: require('@expo-google-fonts/manrope/600SemiBold/Manrope_600SemiBold.ttf'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Manrope_700Bold: require('@expo-google-fonts/manrope/700Bold/Manrope_700Bold.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}
