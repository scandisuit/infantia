import React from 'react';
import { SectionCard, RecordRow } from './SectionCard';
import type { DiseaseRecord } from '../constants/types';

interface DiseaseCardProps {
  records: DiseaseRecord[];
  onAdd?: () => void;
  onRecordPress?: (id: number) => void;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

export function DiseaseCard({ records, onAdd, onRecordPress }: DiseaseCardProps) {
  const active = records.filter(r => !r.date_resolved).length;
  const total = records.length;

  const summaryItems = [
    { label: 'Active', value: active },
    { label: 'Total', value: total },
  ];

  return (
    <SectionCard type="diseases" count={total} summaryItems={summaryItems} onAdd={onAdd}>
      {records.map(r => (
        <RecordRow
          key={r.id}
          name={r.disease_name}
          detail={r.severity ?? undefined}
          date={r.date_resolved ? `Resolved ${fmtDate(r.date_resolved)}` : fmtDate(r.date_onset)}
          rightLabel={r.date_resolved ? undefined : 'Active'}
          onPress={onRecordPress ? () => onRecordPress(r.id) : undefined}
        />
      ))}
    </SectionCard>
  );
}