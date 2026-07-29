import React from 'react';
import { SectionCard, RecordRow } from './SectionCard';
import type { MedicineRecord } from '../constants/types';

interface MedicineCardProps {
  records: MedicineRecord[];
  onAdd?: () => void;
  onRecordPress?: (id: number) => void;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

export function MedicineCard({ records, onAdd, onRecordPress }: MedicineCardProps) {
  const active = records.filter(r => !r.date_ended).length;
  const total = records.length;

  const summaryItems = [
    { label: 'Active', value: active },
    { label: 'Total', value: total },
  ];

  return (
    <SectionCard type="medicines" count={total} summaryItems={summaryItems} onAdd={onAdd}>
      {records.map(r => (
        <RecordRow
          key={r.id}
          name={r.medicine_name}
          detail={[r.dosage, r.frequency].filter(Boolean).join(' · ') || undefined}
          date={r.date_ended ? `Ended ${fmtDate(r.date_ended)}` : `Since ${fmtDate(r.date_started)}`}
          rightLabel={r.date_ended ? undefined : 'Active'}
          onPress={onRecordPress ? () => onRecordPress(r.id) : undefined}
        />
      ))}
    </SectionCard>
  );
}