import React from 'react';
import { View, Text } from 'react-native';
import { SectionCard } from './SectionCard';
import { CardConfig } from '../constants/theme';
import { Typography, Colors, Spacing } from '../constants/theme';
import type { Child } from '../constants/types';

interface MasterDataCardProps {
  child: Child;
  onAdd?: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function computeAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  if (months < 1) {
    const days = Math.floor((now.getTime() - birth.getTime()) / 86400000);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  if (months < 24) return `${months} month${months !== 1 ? 's' : ''}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem ? `${years}y ${rem}m` : `${years} year${years !== 1 ? 's' : ''}`;
}

export function MasterDataCard({ child, onAdd }: MasterDataCardProps) {
  const config = CardConfig.master;

  const summaryItems = [
    { label: 'Age', value: computeAge(child.date_of_birth) },
    { label: 'Born', value: formatDate(child.date_of_birth) },
    { label: 'Gender', value: child.gender ?? '—' },
  ];

  return (
    <SectionCard type="master" count={1} summaryItems={summaryItems} onAdd={onAdd}>
      {/* Expanded child details */}
      <View style={{ gap: Spacing.sm }}>
        <DetailRow label="First name" value={child.first_name} />
        <DetailRow label="Last name" value={child.last_name} />
        <DetailRow label="Date of birth" value={formatDate(child.date_of_birth)} />
        <DetailRow label="Gender" value={child.gender ?? '—'} />
        <DetailRow label="Birth weight" value={child.birth_weight_g ? `${child.birth_weight_g}g` : '—'} />
        <DetailRow label="Birth length" value={child.birth_length_cm ? `${child.birth_length_cm}cm` : '—'} />
        <DetailRow label="Head circumference" value={child.birth_head_circumference_cm ? `${child.birth_head_circumference_cm}cm` : '—'} />
        {child.notes ? <DetailRow label="Notes" value={child.notes} /> : null}
      </View>
    </SectionCard>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ ...Typography.caption, color: Colors.textSecondary }}>{label}</Text>
      <Text style={{ ...Typography.body, color: Colors.textPrimary, fontWeight: '500', textAlign: 'right', maxWidth: '60%' }}>
        {value}
      </Text>
    </View>
  );
}