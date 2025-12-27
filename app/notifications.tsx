import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

// Mock data
const mockNotifications = [
  {
    id: '1',
    title: 'New Book Available',
    message: 'The book "Introduction to React Native" is now available for borrowing',
    type: 'info' as const,
    read: false,
    createdAt: new Date().toISOString(),
    link: '/books/123',
  },
  {
    id: '2',
    title: 'Payment Reminder',
    message: 'Your library membership fee is due on October 15, 2024',
    type: 'warning' as const,
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    link: '/fees',
  },
  {
    id: '3',
    title: 'Exam Scheduled',
    message: 'Mathematics Midterm exam is scheduled for October 20, 2024',
    type: 'info' as const,
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    link: '/exams/1',
  },
  {
    id: '4',
    title: 'Query Answered',
    message: 'Your query about library hours has been answered',
    type: 'success' as const,
    read: true,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    link: '/queries/1',
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'check-circle';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'info';
  }
};

const getNotificationColor = (type: string, theme: any) => {
  switch (type) {
    case 'success':
      return theme.colors.success;
    case 'warning':
      return theme.colors.warning;
    case 'error':
      return theme.colors.error;
    default:
      return theme.colors.info;
  }
};

const formatNotificationDate = (date: string) => {
  const notificationDate = new Date(date);
  if (isToday(notificationDate)) {
    return 'Today';
  } else if (isYesterday(notificationDate)) {
    return 'Yesterday';
  } else if (isThisWeek(notificationDate)) {
    return 'This Week';
  } else {
    return format(notificationDate, 'MMMM yyyy');
  }
};

const groupNotificationsByDate = (notifications: typeof mockNotifications) => {
  const grouped: { [key: string]: typeof mockNotifications } = {};
  notifications.forEach((notification) => {
    const dateGroup = formatNotificationDate(notification.createdAt);
    if (!grouped[dateGroup]) {
      grouped[dateGroup] = [];
    }
    grouped[dateGroup].push(notification);
  });
  return grouped;
};

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockNotifications);
  const groupedNotifications = groupNotificationsByDate(notifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const renderNotificationItem = ({ item }: { item: typeof mockNotifications[0] }) => {
    const iconColor = getNotificationColor(item.type, theme);
    const iconName = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        onPress={() => {
          handleMarkAsRead(item.id);
          if (item.link) {
            router.push(item.link);
          }
        }}
        activeOpacity={0.7}
      >
        <Card
          style={[
            styles.notificationCard,
            !item.read && { backgroundColor: theme.colors.primary + '05' },
          ]}
        >
          <View style={styles.notificationContent}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
              <Icon name={iconName} size={24} color={iconColor} />
            </View>
            <View style={styles.notificationText}>
              <View style={styles.notificationHeader}>
                <Text style={[styles.notificationTitle, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                  {item.title}
                </Text>
                {!item.read && (
                  <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
                )}
              </View>
              <Text
                style={[styles.notificationMessage, { color: theme.colors.textSecondary, ...theme.typography.body }]}
                numberOfLines={2}
              >
                {item.message}
              </Text>
              <Text style={[styles.notificationTime, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                {format(new Date(item.createdAt), 'MMM dd, yyyy • hh:mm a')}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderSection = (dateGroup: string, items: typeof mockNotifications) => (
    <View key={dateGroup} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
        {dateGroup}
      </Text>
      {items.map((item) => (
        <View key={item.id}>{renderNotificationItem({ item })}</View>
      ))}
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Badge label={unreadCount.toString()} variant="error" size="small" />
            )}
          </View>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.headerButton}>
                <Icon name="done-all" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClearAll} style={styles.headerButton}>
              <Icon name="delete-outline" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

      {Object.keys(groupedNotifications).length > 0 ? (
        <FlatList
          data={Object.entries(groupedNotifications)}
          renderItem={({ item }) => renderSection(item[0], item[1])}
          keyExtractor={(item) => item[0]}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.empty}>
          <Icon name="notifications-off" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
            No notifications
          </Text>
        </View>
      )}
    </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  list: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '700',
  },
  notificationCard: {
    marginBottom: 12,
    padding: 16,
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    marginTop: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
  },
});

