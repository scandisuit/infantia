/**
 * API types matching the Infantia backend Pydantic schemas.
 */

export interface User {
  id: number;
  email: string;
  display_name: string;
  is_active: boolean;
  is_admin: boolean;
}

export interface Child {
  id: number;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'other' | null;
  date_of_birth: string; // ISO datetime
  birth_weight_g: number | null;
  birth_length_cm: number | null;
  birth_head_circumference_cm: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface VaccineRecord {
  id: number;
  child_id: number;
  vaccine_name: string;
  dose_number: number | null;
  date_administered: string;
  administered_by: string;
  lot_number: string | null;
  notes: string;
  created_at: string;
}

export interface DiseaseRecord {
  id: number;
  child_id: number;
  disease_name: string;
  date_onset: string;
  date_resolved: string | null;
  severity: string;
  treatment: string;
  notes: string;
  created_at: string;
}

export interface InjuryRecord {
  id: number;
  child_id: number;
  description: string;
  location: 'daycare' | 'preschool' | 'school' | 'home' | 'other';
  date_of_incident: string;
  severity: string;
  treated_by: string;
  follow_up: string;
  notes: string;
  created_at: string;
}

export interface MedicineRecord {
  id: number;
  child_id: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  date_started: string;
  date_ended: string | null;
  prescribed_by: string;
  reason: string;
  notes: string;
  created_at: string;
}

export interface ShareLink {
  id: number;
  child_id: number;
  token: string;
  role: 'viewer' | 'editor';
  expires_at: string | null;
  max_uses: number | null;
  use_count: number;
  created_at: string;
}

// Create/update schemas
export type ChildCreate = Omit<Child, 'id' | 'created_at' | 'updated_at'>;
export type VaccineCreate = Omit<VaccineRecord, 'id' | 'child_id' | 'created_at'>;
export type DiseaseCreate = Omit<DiseaseRecord, 'id' | 'child_id' | 'created_at'>;
export type InjuryCreate = Omit<InjuryRecord, 'id' | 'child_id' | 'created_at'>;
export type MedicineCreate = Omit<MedicineRecord, 'id' | 'child_id' | 'created_at'>;