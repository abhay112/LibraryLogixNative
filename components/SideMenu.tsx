import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  userRole: string;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  userRole,
}) => {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();

  const menuItems = [
    { label: 'My Profile', icon: 'person', route: '/(tabs)/profile', danger: false },
    { label: 'Attendance History', icon: 'event', route: '/(tabs)/attendance', danger: false },
    { label: 'Exam Results', icon: 'quiz', route: '/exams', danger: false },
    { label: 'Fee Payments', icon: 'payment', route: '/fees', danger: false },
    { label: 'Settings', icon: 'settings', route: '/(tabs)/profile', danger: false },
    { label: 'Help & Support', icon: 'help-outline', route: '/(tabs)/queries', danger: false },
    { label: 'Logout', icon: 'logout', route: '/(auth)/login', danger: true },
  ];

  const handleMenuItemPress = async (route: string) => {
    onClose();
    if (route === '/(auth)/login') {
      // Call logout API before redirecting
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
        // Continue with redirect even if logout fails
      }
      router.replace(route);
    } else {
      router.push(route as any);
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

  const slideAnim = React.useRef(new Animated.Value(-320)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  // Native driver is not supported on web
  const useNativeDriver = Platform.OS !== 'web';

  React.useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: useNativeDriver,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: useNativeDriver,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -320,
          duration: 300,
          useNativeDriver: useNativeDriver,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: useNativeDriver,
        }),
      ]).start();
    }
  }, [isOpen, useNativeDriver]);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: opacity,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.menu,
            {
              backgroundColor: theme.colors.background,
              borderRightColor: theme.colors.border,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <ScrollView style={styles.scrollView}>
            {/* Header */}
            <View
              style={[
                styles.header,
                { borderBottomColor: theme.colors.border },
              ]}
            >
              <View style={styles.headerTop}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text style={styles.avatarText}>{getInitials(userName)}</Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.closeButton,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <Icon name="close" size={20} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <Text
                style={[
                  styles.userName,
                  { color: theme.colors.textPrimary, ...theme.typography.h3 },
                ]}
              >
                {userName}
              </Text>
              <Text
                style={[
                  styles.userEmail,
                  { color: theme.colors.textSecondary, ...theme.typography.body },
                ]}
              >
                {userEmail}
              </Text>
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: theme.colors.primary + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    { color: theme.colors.primary, ...theme.typography.caption },
                  ]}
                >
                  {userRole}
                </Text>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleMenuItemPress(item.route)}
                  style={[
                    styles.menuItem,
                    { borderBottomColor: theme.colors.border },
                  ]}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={item.icon}
                    size={24}
                    color={
                      item.danger
                        ? theme.colors.error
                        : theme.colors.textPrimary
                    }
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      {
                        color: item.danger
                          ? theme.colors.error
                          : theme.colors.textPrimary,
                        ...theme.typography.body,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Icon
                    name="chevron-right"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    width: '100%',
    height: '100%',
    borderRightWidth: 1,
    paddingTop: 36, // Add this line
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    marginBottom: 4,
    fontWeight: '600',
  },
  userEmail: {
    marginBottom: 12,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontWeight: '600',
  },
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 16,
  },
  menuItemText: {
    flex: 1,
    fontWeight: '500',
  },
});

