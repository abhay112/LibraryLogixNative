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
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ButtonGroup } from '@/components/ButtonGroup';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSignupMutation } from '@/services/api/authApi';

export default function SignUpScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'student'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [signupMutation, { isLoading: loading }] = useSignupMutation();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Error', 'Please accept the Terms & Conditions');
      return;
    }

    try {
      const result = await signupMutation({ email, password, role }).unwrap();
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Account created successfully! Please login.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Signup Failed',
        error?.data?.message || error?.message || 'Failed to create account. Please try again.'
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.textPrimary, ...theme.typography.h1 }]}>
            Create Account
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary, ...theme.typography.body },
            ]}
          >
            Sign up to get started
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.roleSelector}>
            <Text style={[styles.roleLabel, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
              Sign up as:
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

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            leftIcon="lock"
          />

          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
          >
            <Icon
              name={acceptedTerms ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={acceptedTerms ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text style={{ color: theme.colors.textSecondary, ...theme.typography.body, marginLeft: 8 }}>
              I agree to the Terms & Conditions
            </Text>
          </TouchableOpacity>

          <Button
            title="Sign Up"
            onPress={handleSignUp}
            variant="primary"
            loading={loading}
            style={styles.signupButton}
          />

          <View style={styles.loginContainer}>
            <Text style={{ color: theme.colors.textSecondary, ...theme.typography.body }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={{ color: theme.colors.primary, ...theme.typography.body, fontWeight: '600' }}>
                Login
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
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  signupButton: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

