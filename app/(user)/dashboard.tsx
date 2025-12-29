import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { formatRole } from '@/utils/format';
import { Card } from '@/components/Card';
import { useRouter } from 'expo-router';

export default function UserDashboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {user && (
        <DashboardHeader
          userName={user.name}
          userRole={formatRole(user.role)}
          notificationCount={3}
          onNotificationPress={() => router.push('/notifications')}
          onProfilePress={() => router.push('/(tabs)')}
        />
      )}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
          User Dashboard
        </Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
            Welcome, {user?.name || 'User'}!
          </Text>
          <Text style={[styles.cardText, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
            This is your user dashboard. You can access your profile, attendance, fees, and more from the tabs below.
          </Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 20,
  },
  cardTitle: {
    marginBottom: 12,
  },
  cardText: {
    lineHeight: 22,
  },
});

