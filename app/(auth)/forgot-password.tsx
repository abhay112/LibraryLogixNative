import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendResetLink = async () => {
    setLoading(true);
    // TODO: Implement password reset
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  if (sent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
            <Icon name="check-circle" size={64} color={theme.colors.success} />
          </View>
          <Text style={[styles.title, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
            Check your email
          </Text>
          <Text
            style={[
              styles.message,
              { color: theme.colors.textSecondary, ...theme.typography.body },
            ]}
          >
            We've sent a password reset link to {email}
          </Text>
          <Button
            title="Back to Login"
            onPress={() => router.push('/(auth)/login')}
            variant="primary"
            style={styles.button}
          />
        </View>
      </View>
    );
  }

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
            Forgot Password?
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary, ...theme.typography.body },
            ]}
          >
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="email"
          />

          <Button
            title="Send Reset Link"
            onPress={handleSendResetLink}
            variant="primary"
            loading={loading}
            style={styles.button}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={styles.backToLogin}
          >
            <Text style={{ color: theme.colors.primary, ...theme.typography.body }}>
              Back to Login
            </Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  button: {
    marginBottom: 24,
  },
  backToLogin: {
    alignSelf: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  message: {
    textAlign: 'center',
    marginBottom: 32,
  },
});

