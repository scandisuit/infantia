import React from 'react';
import { SectionCard, RecordRow } from './SectionCard';
import { CardConfig } from '../constants/theme';
import type { VaccineRecord } from '../constants/types';

interface VaccineCardProps {
  records: VaccineRecord[];
  onAdd?: () => void;
  onRecordPress?: (id: number) => void;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

export function VaccineCard({ records, onAdd, onRecordPress }: VaccineCardProps) {
  const config = CardConfig.vaccines;
  const completed = records.length;

  const summaryItems = [
    { label: 'Total', value: completed },
  ];

  return (
    <SectionCard type="vaccines" count={completed} summaryItems={summaryItems} onAdd={onAdd}>
      {records.map(r => (
        <RecordRow
          key={r.id}
          name={r.vaccine_name}
          detail={r.dose_number ? `Dose ${r.dose_number}${r.administered_by ? ` · ${r.administered_by}` : ''}` : undefined}
          date={fmtDate(r.date_administered)}
          onPress={onRecordPress ? () => onRecordPress(r.id) : undefined}
        />
      ))}
    </SectionCard>
  );
}