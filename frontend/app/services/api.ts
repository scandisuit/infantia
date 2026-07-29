/**
 * Infantia API client — connects to the FastAPI backend.
 */

import * as SecureStore from 'expo-secure-store';
import type {
  Child,
  VaccineRecord,
  DiseaseRecord,
  InjuryRecord,
  MedicineRecord,
  User,
} from '../constants/types';

// In development/static export, hit local backend.
// In production, point to the deployed API.
// For remote testing via tunnel, use the Cloudflare tunnel URL.
const API_BASE = 'https://temperature-fit-upgrades-fri.trycloudflare.com';

let authToken: string | null = null;

export async function getAuthToken(): Promise<string | null> {
  if (authToken) return authToken;
  try {
    authToken = await SecureStore.getItemAsync('auth_token');
  } catch {
    // SecureStore may not be available on web
    authToken = localStorage?.getItem('auth_token') ?? null;
  }
  return authToken;
}

export async function setAuthToken(token: string | null) {
  authToken = token;
  try {
    if (token) {
      await SecureStore.setItemAsync('auth_token', token);
    } else {
      await SecureStore.deleteItemAsync('auth_token');
    }
  } catch {
    if (token) localStorage?.setItem('auth_token', token);
    else localStorage?.removeItem('auth_token');
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return null as T;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const res = await request<{ access_token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await setAuthToken(res.access_token);
  return res;
}

export async function setupAdmin(email: string, displayName: string, password: string) {
  const data = await request<{ access_token: string; api_key: string }>('/api/auth/setup', {
    method: 'POST',
    body: JSON.stringify({ email, display_name: displayName, password }),
  });
  await setAuthToken(data.access_token);
  return data;
}

export async function getMe() {
  return request<User>('/api/auth/me');
}

// ── Children ─────────────────────────────────────────────────────────────────

export async function getChildren() {
  return request<Child[]>('/api/children');
}

export async function getChild(id: number) {
  return request<Child>(`/api/children/${id}`);
}

export async function createChild(data: Partial<Child>) {
  return request<Child>('/api/children', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateChild(id: number, data: Partial<Child>) {
  return request<Child>(`/api/children/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteChild(id: number) {
  return request<void>(`/api/children/${id}`, { method: 'DELETE' });
}

// ── Vaccines ─────────────────────────────────────────────────────────────────

export async function getVaccines(childId: number) {
  return request<VaccineRecord[]>(`/api/children/${childId}/vaccines`);
}

export async function createVaccine(childId: number, data: Partial<VaccineRecord>) {
  return request<VaccineRecord>(`/api/children/${childId}/vaccines`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteVaccine(childId: number, id: number) {
  return request<void>(`/api/children/${childId}/vaccines/${id}`, { method: 'DELETE' });
}

// ── Diseases ─────────────────────────────────────────────────────────────────

export async function getDiseases(childId: number) {
  return request<DiseaseRecord[]>(`/api/children/${childId}/diseases`);
}

export async function createDisease(childId: number, data: Partial<DiseaseRecord>) {
  return request<DiseaseRecord>(`/api/children/${childId}/diseases`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteDisease(childId: number, id: number) {
  return request<void>(`/api/children/${childId}/diseases/${id}`, { method: 'DELETE' });
}

// ── Injuries ─────────────────────────────────────────────────────────────────

export async function getInjuries(childId: number) {
  return request<InjuryRecord[]>(`/api/children/${childId}/injuries`);
}

export async function createInjury(childId: number, data: Partial<InjuryRecord>) {
  return request<InjuryRecord>(`/api/children/${childId}/injuries`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteInjury(childId: number, id: number) {
  return request<void>(`/api/children/${childId}/injuries/${id}`, { method: 'DELETE' });
}

// ── Medicines ─────────────────────────────────────────────────────────────────

export async function getMedicines(childId: number) {
  return request<MedicineRecord[]>(`/api/children/${childId}/medicines`);
}

export async function createMedicine(childId: number, data: Partial<MedicineRecord>) {
  return request<MedicineRecord>(`/api/children/${childId}/medicines`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteMedicine(childId: number, id: number) {
  return request<void>(`/api/children/${childId}/medicines/${id}`, { method: 'DELETE' });
}