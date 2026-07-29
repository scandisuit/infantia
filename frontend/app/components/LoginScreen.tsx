import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import * as api from '../services/api';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      await api.login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      Alert.alert('Login failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await api.setupAdmin(email, displayName, password);
      onLoginSuccess();
    } catch (err: any) {
      Alert.alert('Setup failed', err.message || 'Could not create admin account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{
      flex: 1,
      backgroundColor: Colors.background,
      justifyContent: 'center',
      paddingHorizontal: Spacing.lg,
    }}>
      {/* Logo / Title */}
      <View style={{ alignItems: 'center', marginBottom: Spacing.xxl }}>
        <Text style={{
          ...Typography.title,
          color: Colors.accentGreen,
          fontSize: 32,
        }}>
          👶 Infantia
        </Text>
        <Text style={{
          ...Typography.caption,
          color: Colors.textSecondary,
          marginTop: Spacing.xs,
        }}>
          Privacy-first child health tracker
        </Text>
      </View>

      {/* Toggle Login / Setup */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
      }}>
        <TouchableOpacity
          onPress={() => setIsSetup(false)}
          style={{
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm,
            borderBottomWidth: 2,
            borderBottomColor: !isSetup ? Colors.accentGreen : 'transparent',
          }}
        >
          <Text style={{
            ...Typography.body,
            color: !isSetup ? Colors.accentGreen : Colors.textSecondary,
            fontWeight: !isSetup ? '600' : '400',
          }}>
            Log In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsSetup(true)}
          style={{
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm,
            borderBottomWidth: 2,
            borderBottomColor: isSetup ? Colors.accentGreen : 'transparent',
          }}
        >
          <Text style={{
            ...Typography.body,
            color: isSetup ? Colors.accentGreen : Colors.textSecondary,
            fontWeight: isSetup ? '600' : '400',
          }}>
            First-time Setup
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={{
        backgroundColor: Colors.cardBackground,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Platform.select({
          web: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
          default: { elevation: 2 },
        }),
      }}>
        {isSetup && (
          <View style={{ marginBottom: Spacing.md }}>
            <Text style={{ ...Typography.caption, color: Colors.textSecondary, marginBottom: 4 }}>
              Display Name
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              autoCapitalize="words"
              style={{
                backgroundColor: Colors.background,
                borderWidth: 1,
                borderColor: Colors.divider,
                borderRadius: BorderRadius.md,
                padding: Spacing.md,
                ...Typography.body,
                color: Colors.textPrimary,
              }}
            />
          </View>
        )}

        <View style={{ marginBottom: Spacing.md }}>
          <Text style={{ ...Typography.caption, color: Colors.textSecondary, marginBottom: 4 }}>
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: Colors.background,
              borderWidth: 1,
              borderColor: Colors.divider,
              borderRadius: BorderRadius.md,
              padding: Spacing.md,
              ...Typography.body,
              color: Colors.textPrimary,
            }}
          />
        </View>

        <View style={{ marginBottom: Spacing.lg }}>
          <Text style={{ ...Typography.caption, color: Colors.textSecondary, marginBottom: 4 }}>
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            style={{
              backgroundColor: Colors.background,
              borderWidth: 1,
              borderColor: Colors.divider,
              borderRadius: BorderRadius.md,
              padding: Spacing.md,
              ...Typography.body,
              color: Colors.textPrimary,
            }}
          />
        </View>

        <TouchableOpacity
          onPress={isSetup ? handleSetup : handleLogin}
          disabled={loading}
          style={{
            backgroundColor: Colors.accentGreen,
            borderRadius: BorderRadius.md,
            paddingVertical: Spacing.md,
            alignItems: 'center',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{
              ...Typography.body,
              color: '#fff',
              fontWeight: '600',
            }}>
              {isSetup ? 'Create Account' : 'Log In'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={{
        ...Typography.caption,
        color: Colors.textTertiary,
        textAlign: 'center',
        marginTop: Spacing.lg,
      }}>
        {isSetup
          ? 'Creates the admin account for your family.'
          : 'Demo: demo@infantia.io / demo123'}
      </Text>
    </View>
  );
}