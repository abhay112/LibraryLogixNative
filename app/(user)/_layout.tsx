import { Stack, Redirect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function UserLayout() {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect admin users to admin routes
  if (user?.role === 'admin') {
    return <Redirect href="/(admin)/students" />;
  }

  return (
    <ProtectedRoute allowedRoles={['student', 'parent']}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen name="dashboard" />
      </Stack>
    </ProtectedRoute>
  );
}

