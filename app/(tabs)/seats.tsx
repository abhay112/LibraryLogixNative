import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View } from 'react-native';

export default function SeatsScreen() {
  const { user, isLoading: authLoading } = useAuth();
  
  if (authLoading) {
    return null;
  }
  
  // Redirect to admin/student route based on role
  const routePrefix = user?.role === 'admin' ? '/admin' : '/student';
  return <Redirect href={`${routePrefix}/seats`} />;
}
