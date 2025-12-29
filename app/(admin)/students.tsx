import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { formatRole } from '@/utils/format';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Storage } from '@/utils/storage';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

interface Student {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  [key: string]: any;
}

export default function AdminStudentsScreen() {
  const { theme } = useTheme();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Wait for user to be loaded
      if (!user) {
        throw new Error('User information not loaded. Please wait...');
      }

      const accessToken = await Storage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found. Please login again.');
      }

      // Get adminId and libraryId from user
      const adminId = user._id || user.id;
      const libraryId = user.libraryId;

      if (!adminId || !libraryId) {
        throw new Error('User information is incomplete. Please login again.');
      }

      // Use the correct API endpoint from config (port 4000) with query parameters
      const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.STUDENTS.BASE}?adminId=${encodeURIComponent(adminId)}&libraryId=${encodeURIComponent(libraryId)}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle network errors
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to fetch students (${response.status})`;
        
        try {
          const errorData = JSON.parse(errorText);
          // Handle array of error messages
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(', ');
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        // Handle 401 Unauthorized - token might be expired
        if (response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (data.success && data.data) {
        setStudents(Array.isArray(data.data) ? data.data : []);
      } else if (Array.isArray(data)) {
        setStudents(data);
      } else if (data.data && Array.isArray(data.data)) {
        setStudents(data.data);
      } else {
        setStudents([]);
      }
    } catch (err: any) {
      console.error('Error fetching students:', err);
      const errorMessage = err.message || 'Failed to load students. Please check your connection and try again.';
      setError(errorMessage);
      // Don't show alert on initial load to prevent white screen
      // Only show alert on manual refresh
      if (!isLoading) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Wait for auth to finish loading before making API call
    if (authLoading) {
      return; // Still loading auth state
    }

    // Only fetch if authenticated and user is loaded
    try {
      if (isAuthenticated && user && user._id && user.libraryId) {
        fetchStudents();
      } else if (!isAuthenticated) {
        setIsLoading(false);
        setError('Please login to view students');
      } else if (!user || !user._id || !user.libraryId) {
        setIsLoading(false);
        setError('User information is incomplete. Please login again.');
      }
    } catch (err) {
      console.error('Error in useEffect:', err);
      setIsLoading(false);
      setError('An error occurred. Please try again.');
    }
  }, [isAuthenticated, user, fetchStudents, authLoading]);

  const getInitials = (name: string) => {
    try {
      if (!name || typeof name !== 'string') return 'U';
      return name
        .split(' ')
        .filter(n => n.length > 0)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';
    } catch (err) {
      console.error('Error getting initials:', err);
      return 'U';
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    try {
      return students.filter((student) =>
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.mobile?.includes(searchQuery)
      );
    } catch (err) {
      console.error('Error filtering students:', err);
      return students;
    }
  }, [students, searchQuery]);

  const renderStudentItem = ({ item }: { item: Student }) => {
    try {
      if (!item || !item._id) {
        return null;
      }
      return (
        <TouchableOpacity
          onPress={() => {
            try {
              router.push(`/students/${item._id}`);
            } catch (err) {
              console.error('Error navigating to student:', err);
            }
          }}
          activeOpacity={0.7}
        >
          <Card style={styles.studentCard}>
            <View style={styles.studentRow}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                  {getInitials(item.name || 'U')}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                  {item.name || 'Unknown'}
                </Text>
                <Text style={[styles.studentEmail, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                  {item.email || 'No email'}
                </Text>
                {item.mobile && (
                  <Text style={[styles.studentMobile, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                    {item.mobile}
                  </Text>
                )}
              </View>
              <TouchableOpacity>
                <Icon name="more-vert" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </Card>
        </TouchableOpacity>
      );
    } catch (err) {
      console.error('Error rendering student item:', err);
      return null;
    }
  };

  // Show error state with retry button
  if (error && !isLoading) {
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
            Students (Admin)
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <EmptyState
            icon="error-outline"
            title="Error loading students"
            message={error}
          />
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={fetchStudents}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          Students (Admin)
        </Text>
        <TouchableOpacity onPress={fetchStudents} disabled={isLoading}>
          <Icon name="refresh" size={28} color={isLoading ? theme.colors.textSecondary : theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Search student..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Icon name="filter-list" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Students ({filteredStudents.length})
            </Text>
            <FlatList
              data={filteredStudents}
              renderItem={renderStudentItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              ListEmptyComponent={
                <EmptyState
                  icon="people-outline"
                  title="No students found"
                  message={searchQuery ? "Try adjusting your search" : "No students available"}
                />
              }
            />
          </View>
        )}
      </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  studentCard: {
    marginBottom: 12,
    padding: 16,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    marginBottom: 4,
    fontWeight: '600',
  },
  studentEmail: {
    marginBottom: 2,
  },
  studentMobile: {
    marginTop: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

