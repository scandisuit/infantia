import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Colors, CardConfig, CardType, Spacing, BorderRadius } from '../constants/theme';
import { cardStyles } from '../constants/styles';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SectionCardProps {
  type: CardType;
  count: number;
  summaryItems?: { label: string; value: string | number }[];
  children?: React.ReactNode;
  onAdd?: () => void;
}

export function SectionCard({ type, count, summaryItems, children, onAdd }: SectionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = CardConfig[type];
  const accentColor = config.accent;
  const accentDark = config.accentDark;

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
  }, []);

  return (
    <View style={cardStyles.wrapper}>
      <View style={cardStyles.card}>
        {/* Accent bar at top */}
        <View style={[cardStyles.accentBar, { backgroundColor: accentColor }]} />

        {/* Card header */}
        <View style={cardStyles.header}>
          <View style={cardStyles.headerLeft}>
            <Text style={cardStyles.icon}>{config.icon}</Text>
            <Text style={cardStyles.title}>{config.label}</Text>
            <Text style={cardStyles.count}>{count > 0 ? `(${count})` : ''}</Text>
          </View>
          <TouchableOpacity
            style={[cardStyles.expandButton, { backgroundColor: accentColor + '33' }]}
            onPress={toggleExpand}
            activeOpacity={0.7}
          >
            <Text style={cardStyles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>

        {/* Summary row (collapsed view) */}
        {summaryItems && summaryItems.length > 0 && (
          <View style={cardStyles.summaryRow}>
            {summaryItems.map((item, i) => (
              <View key={i} style={cardStyles.summaryItem}>
                <Text style={cardStyles.summaryValue}>{item.value}</Text>
                <Text style={cardStyles.summaryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Empty state when collapsed */}
        {!expanded && count === 0 && (
          <View style={cardStyles.emptyState}>
            <Text style={cardStyles.emptyText}>No records yet</Text>
          </View>
        )}

        {/* Expanded content */}
        {expanded && (
          <View style={cardStyles.expandedContent}>
            {children || (
              <View style={cardStyles.emptyState}>
                <Text style={cardStyles.emptyText}>No records yet</Text>
              </View>
            )}
          </View>
        )}

        {/* Add button */}
        {expanded && onAdd && (
          <TouchableOpacity
            style={[cardStyles.addButton, { backgroundColor: accentColor + '22', borderColor: accentDark }]}
            onPress={onAdd}
            activeOpacity={0.7}
          >
            <Text style={[cardStyles.addButtonText, { color: accentDark }]}>+ Add {config.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Record row (reusable inside expanded cards) ──────────────────────────────

interface RecordRowProps {
  name: string;
  detail?: string;
  date?: string;
  rightLabel?: string;
  onPress?: () => void;
}

export function RecordRow({ name, detail, date, rightLabel, onPress }: RecordRowProps) {
  return (
    <TouchableOpacity
      style={cardStyles.recordRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={cardStyles.recordLeft}>
        <Text style={cardStyles.recordName}>{name}</Text>
        {detail ? <Text style={cardStyles.recordDetail}>{detail}</Text> : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        {date ? <Text style={cardStyles.recordDate}>{date}</Text> : null}
        {rightLabel ? (
          <Text style={[cardStyles.recordDate, { color: Colors.accentGreen, fontWeight: '600' }]}>
            {rightLabel}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}