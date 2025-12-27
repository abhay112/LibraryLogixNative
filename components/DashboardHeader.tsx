import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSideMenu } from '@/contexts/SideMenuContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface DashboardHeaderProps {
  userName: string;
  userRole: string;
  avatarUrl?: string;
  onMenuClick?: () => void;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  userRole,
  avatarUrl,
  onMenuClick,
  notificationCount = 0,
  onNotificationPress,
  onProfilePress,
}) => {
  const { theme, colorScheme, toggleTheme } = useTheme();
  const sideMenuContext = useSideMenu();
  
  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    } else if (sideMenuContext) {
      sideMenuContext.openMenu();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <TouchableOpacity
          onPress={handleMenuClick}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <View style={[styles.buildingIcon, { backgroundColor: theme.colors.lightGray }]}>
            <Icon name="business" size={20} color={theme.colors.textSecondary} />
          </View>
        </TouchableOpacity>
        <View style={styles.titleSection}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary, ...theme.typography.bodyLarge },
            ]}
          >
            {userName}
          </Text>
          <TouchableOpacity onPress={onProfilePress} activeOpacity={0.7}>
            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary, ...theme.typography.caption },
              ]}
            >
              Personal {'>'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.iconButton}
        >
          <Icon name="notifications-none" size={22} color={theme.colors.textPrimary} />
          {notificationCount > 0 && (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.colors.error },
              ]}
            >
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onProfilePress} activeOpacity={0.7}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.lightGray },
            ]}
          >
            <Text style={[styles.avatarText, { color: theme.colors.textPrimary }]}>
              {getInitials(userName)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  buildingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 17,
    marginBottom: 2,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

