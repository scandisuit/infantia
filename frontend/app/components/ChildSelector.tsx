import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  useColorScheme,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import { globalStyles } from '../constants/styles';

interface Child {
  id: number;
  first_name: string;
  last_name: string;
}

interface ChildSelectorProps {
  children: Child[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function ChildSelector({ children, selectedId, onSelect }: ChildSelectorProps) {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Single child: just show name box
  if (children.length <= 1) {
    const child = children[0];
    return (
      <View style={globalStyles.childNameBox}>
        <Text style={globalStyles.childNameText}>
          {child ? `${child.first_name} ${child.last_name}` : 'No child registered'}
        </Text>
      </View>
    );
  }

  // Multiple children: dropdown selector
  const selected = children.find(c => c.id === selectedId);

  return (
    <View>
      <TouchableOpacity
        style={globalStyles.childNameBox}
        onPress={() => setDropdownVisible(true)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
          <Text style={globalStyles.childNameText}>
            {selected ? `${selected.first_name} ${selected.last_name}` : 'Select child'}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary }}>▼</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'flex-start',
            paddingTop: 100,
            paddingHorizontal: Spacing.md,
          }}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={{
            backgroundColor: Colors.cardBackground,
            borderRadius: BorderRadius.lg,
            borderWidth: 1,
            borderColor: Colors.border,
            overflow: 'hidden',
            maxHeight: 300,
          }}>
            <View style={{
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: Colors.divider,
            }}>
              <Text style={{ ...Typography.subtitle, color: Colors.textPrimary }}>Select child</Text>
            </View>
            <FlatList
              data={children}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedId;
                return (
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: Spacing.md,
                      paddingVertical: Spacing.md,
                      backgroundColor: isSelected ? Colors.pastelGreen + '33' : 'transparent',
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.divider,
                    }}
                    onPress={() => {
                      onSelect(item.id);
                      setDropdownVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      ...Typography.body,
                      color: isSelected ? Colors.accentGreen : Colors.textPrimary,
                      fontWeight: isSelected ? '600' : '400',
                    }}>
                      {item.first_name} {item.last_name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}