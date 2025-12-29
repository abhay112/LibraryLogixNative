import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { formatRole } from '@/utils/format';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [editedPhone, setEditedPhone] = useState(user?.phone || '');

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!editedEmail.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    try {
      updateUser({
        name: editedName.trim(),
        email: editedEmail.trim(),
        phone: editedPhone.trim(),
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setEditedEmail(user?.email || '');
    setEditedPhone(user?.phone || '');
    setIsEditing(false);
  };

  const profileMenuItems = [
    {
      icon: 'person',
      label: 'Personal Information',
      onPress: () => setIsEditing(true),
    },
    {
      icon: 'lock',
      label: 'Change Password',
      onPress: () => router.push('/(auth)/forgot-password'),
    },
    {
      icon: 'notifications',
      label: 'Notification Settings',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon'),
    },
    {
      icon: 'privacy-tip',
      label: 'Privacy & Security',
      onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon'),
    },
    {
      icon: 'help-outline',
      label: 'Help & Support',
      onPress: () => router.push('/queries/submit'),
    },
    {
      icon: 'info',
      label: 'About',
      onPress: () => Alert.alert('About', 'LibraryLogix Mobile App v1.0.0'),
    },
  ];

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
          User information not available
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DashboardHeader
        userName={user.name}
        userRole={formatRole(user.role)}
        notificationCount={3}
        onNotificationPress={() => router.push('/notifications')}
        onProfilePress={() => {}}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatarLarge, { backgroundColor: theme.colors.primary + '20' }]}>
              {user.profilePicture ? (
                <Text>Image</Text>
              ) : (
                <Text style={[styles.avatarTextLarge, { color: theme.colors.primary }]}>
                  {getInitials(user.name)}
                </Text>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                {user.name}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                {user.email}
              </Text>
              <View style={styles.roleBadge}>
                <Text style={[styles.roleText, { color: theme.colors.primary }]}>
                  {formatRole(user.role)}
                </Text>
              </View>
            </View>
            {!isEditing && (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
              >
                <Icon name="edit" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Edit Form */}
        {isEditing && (
          <Card style={styles.editCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Edit Profile
            </Text>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
                Full Name
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
                Email
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                value={editedEmail}
                onChangeText={setEditedEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
                Phone Number
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                value={editedPhone}
                onChangeText={setEditedPhone}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.buttonRow}>
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="outline"
                style={styles.button}
              />
              <Button
                title="Save"
                onPress={handleSave}
                style={styles.button}
              />
            </View>
          </Card>
        )}

        {/* Profile Menu */}
        <Card style={styles.menuCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
            Settings
          </Text>
          {profileMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Icon name={item.icon as any} size={20} color={theme.colors.primary} />
                </View>
                <Text style={[styles.menuLabel, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
                  {item.label}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Account Info */}
        <Card style={styles.infoCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
            Account Information
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
              User ID
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
              {user._id || user.id || 'N/A'}
            </Text>
          </View>
          {user.libraryId && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                Library ID
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
                {user.libraryId}
              </Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
              Membership Status
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: user.membershipStatus === 'active' ? theme.colors.success + '20' : theme.colors.error + '20' }]}>
              <Text style={[styles.statusText, { color: user.membershipStatus === 'active' ? theme.colors.success : theme.colors.error }]}>
                {user.membershipStatus || 'Active'}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextLarge: {
    fontSize: 32,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    marginBottom: 4,
    fontWeight: '700',
  },
  profileEmail: {
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  menuCard: {
    marginBottom: 16,
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
  },
  infoCard: {
    marginBottom: 16,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    flex: 1,
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

