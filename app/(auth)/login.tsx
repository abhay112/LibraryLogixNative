import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ButtonGroup } from '@/components/ButtonGroup';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { login: authLogin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'student'>('admin');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      await authLogin(email, password, role);
      // Navigation will be handled by ProtectedRoute in _layout
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error?.data?.message || error?.message || 'Invalid email or password. Please try again.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Icon name="menu-book" size={48} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.textPrimary, ...theme.typography.h1 }]}>
            LibraryLogix
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary, ...theme.typography.body },
            ]}
          >
            Welcome back! Please login to continue.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.roleSelector}>
            <Text style={[styles.roleLabel, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
              Login as:
            </Text>
            <ButtonGroup
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'student', label: 'Student' },
              ]}
              selectedValue={role}
              onSelect={(value) => setRole(value as 'admin' | 'student')}
            />
          </View>

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="email"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon="lock"
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotPassword}
          >
            <Text style={{ color: theme.colors.primary, ...theme.typography.body }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button
            title="Login"
            onPress={handleLogin}
            variant="primary"
            loading={authLoading}
            style={styles.loginButton}
          />

          <View style={styles.signupContainer}>
            <Text style={{ color: theme.colors.textSecondary, ...theme.typography.body }}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={{ color: theme.colors.primary, ...theme.typography.body, fontWeight: '600' }}>
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  roleSelector: {
    marginBottom: 24,
  },
  roleLabel: {
    marginBottom: 12,
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

