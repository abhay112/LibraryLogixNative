import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function TabsLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state
  if (isLoading) {
    return null;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect to admin or student routes based on user role
  const routePrefix = user?.role === 'admin' ? '/admin' : '/student';
  return <Redirect href={`${routePrefix}/`} />;
}

