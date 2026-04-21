import { useEffect, useState, createContext, useContext } from 'react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Create a simple Auth Context to share the "Logged In" status
const AuthContext = createContext({
  hasToken: false,
  checkAuth: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    setHasToken(!!token);
    setIsReady(true);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!hasToken && !inAuthGroup) {
      // If no token and not in login screen, go to login
      router.replace('/(auth)/login');
    } else if (hasToken && inAuthGroup) {
      // If has token and trying to see login screen, go home!
      router.replace('/(tabs)');
    }
  }, [hasToken, segments, isReady]);

  if (!isReady) return null;

  return (
    <AuthContext.Provider value={{ hasToken, checkAuth }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
