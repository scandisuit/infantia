import React from 'react';
import { SectionCard, RecordRow } from './SectionCard';
import type { InjuryRecord } from '../constants/types';

interface InjuryCardProps {
  records: InjuryRecord[];
  onAdd?: () => void;
  onRecordPress?: (id: number) => void;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

const LOCATION_LABELS: Record<string, string> = {
  daycare: 'Daycare',
  preschool: 'Preschool',
  school: 'School',
  home: 'Home',
  other: 'Other',
};

export function InjuryCard({ records, onAdd, onRecordPress }: InjuryCardProps) {
  const total = records.length;

  const summaryItems = [
    { label: 'Total', value: total },
  ];

  return (
    <SectionCard type="injuries" count={total} summaryItems={summaryItems} onAdd={onAdd}>
      {records.map(r => (
        <RecordRow
          key={r.id}
          name={r.description}
          detail={[LOCATION_LABELS[r.location] ?? r.location, r.severity].filter(Boolean).join(' · ')}
          date={fmtDate(r.date_of_incident)}
          onPress={onRecordPress ? () => onRecordPress(r.id) : undefined}
        />
      ))}
    </SectionCard>
  );
}