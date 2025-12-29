import { Tabs, Redirect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Tab configuration constant - Order: Home (index) -> Students -> Seats -> Attendance -> Fees
const tabScreens = [
  {
    name: 'index',
    title: 'Home',
    icon: 'home',
  },
  {
    name: 'students',
    title: 'Students',
    icon: 'people',
  },
  {
    name: 'seats',
    title: 'Seats',
    icon: 'event-seat',
  },
  {
    name: 'attendance',
    title: 'Attendance',
    icon: 'event',
  },
  {
    name: 'fees',
    title: 'Fees',
    icon: 'account-balance-wallet',
  },
];

export default function StudentLayout() {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Tab bar screen options configuration
  const screenOptions = {
    headerShown: false,
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#8E8E93',
    tabBarStyle: {
      backgroundColor: '#FFFFFF',
      borderTopColor: '#E5E5EA',
      borderTopWidth: 0.5,
      height: 83,
      paddingBottom: 20,
      paddingTop: 8,
    },
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: '400' as const,
      marginTop: 4,
    },
  };

  // Show loading state
  if (isLoading) {
    return null;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect admin users
  if (user?.role === 'admin') {
    return <Redirect href="/admin/" />;
  }

  // Show tabs for student users
  return (
    <Tabs 
      screenOptions={screenOptions}
      initialRouteName="index"
    >
      {tabScreens.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size, focused }) => (
              <Icon 
                name={tab.icon as any} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

