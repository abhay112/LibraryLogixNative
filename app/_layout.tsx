import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SideMenuProvider } from '@/contexts/SideMenuContext';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSideMenu } from '@/contexts/SideMenuContext';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SideMenu } from '@/components/SideMenu';
import { store } from '@/store/store';
import { formatRole } from '@/utils/format';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

function GlobalSideMenu() {
  let user;
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    // Auth context not available
    user = null;
  }
  
  const { isOpen, closeMenu } = useSideMenu();

  // Use mock user for testing if not authenticated
  const displayUser = user || {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'student' as const,
  };

  return (
    <SideMenu
      isOpen={isOpen}
      onClose={closeMenu}
      userName={displayUser.name || 'User'}
      userEmail={displayUser.email || ''}
      userRole={formatRole(displayUser.role)}
    />
  );
}

function RootLayoutNav() {
  const { theme, colorScheme } = useTheme();
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen 
          name="(tabs)" 
          options={{
            // Only accessible when authenticated
            gestureEnabled: isAuthenticated,
          }}
        />
        <Stack.Screen 
          name="(admin)" 
          options={{
            // Only accessible when authenticated as admin
            gestureEnabled: isAuthenticated && user?.role === 'admin',
          }}
        />
        <Stack.Screen 
          name="(user)" 
          options={{
            // Only accessible when authenticated as user
            gestureEnabled: isAuthenticated && user?.role !== 'admin',
          }}
        />
        <Stack.Screen 
          name="admin" 
          options={{
            // Only accessible when authenticated as admin
            gestureEnabled: isAuthenticated && user?.role === 'admin',
          }}
        />
        <Stack.Screen 
          name="student" 
          options={{
            // Only accessible when authenticated as student
            gestureEnabled: isAuthenticated && user?.role !== 'admin',
          }}
        />
      </Stack>
      
      {/* Global Side Menu - Available on all authenticated pages */}
      {isAuthenticated && <GlobalSideMenu />}
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Add custom fonts if needed
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider>
          <AuthProvider>
            <SideMenuProvider>
              <RootLayoutNav />
            </SideMenuProvider>
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

