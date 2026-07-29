import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { globalStyles } from '../constants/styles';

interface BellIconProps {
  count?: number;
  onPress?: () => void;
}

export function BellIcon({ count = 0, onPress }: BellIconProps) {
  return (
    <TouchableOpacity style={globalStyles.bellButton} onPress={onPress} activeOpacity={0.7}>
      {/* Bell icon using text (works cross-platform without icon fonts) */}
      <Text style={{ fontSize: 20, color: Colors.textSecondary }}>🔔</Text>
      {count > 0 && (
        <View style={{
          position: 'absolute',
          top: 4,
          right: 4,
          backgroundColor: Colors.danger,
          borderRadius: BorderRadius.full,
          minWidth: 16,
          height: 16,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{
            fontSize: 10,
            color: '#FFF',
            fontWeight: '700',
          }}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}