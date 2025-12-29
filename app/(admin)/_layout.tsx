import { Stack, Redirect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminLayout() {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect non-admin users
  if (user?.role !== 'admin') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen name="students" />
      </Stack>
    </ProtectedRoute>
  );
}

