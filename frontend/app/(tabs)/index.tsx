import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginScreen } from '../components/LoginScreen';
import { ChildSelector } from '../components/ChildSelector';
import { BellIcon } from '../components/BellIcon';
import { MasterDataCard } from '../components/MasterDataCard';
import { VaccineCard } from '../components/VaccineCard';
import { DiseaseCard } from '../components/DiseaseCard';
import { InjuryCard } from '../components/InjuryCard';
import { MedicineCard } from '../components/MedicineCard';
import { Colors, Spacing, Typography } from '../constants/theme';
import { globalStyles } from '../constants/styles';
import * as api from '../services/api';
import type {
  Child,
  VaccineRecord,
  DiseaseRecord,
  InjuryRecord,
  MedicineRecord,
} from '../constants/types';

export default function HomeScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [diseases, setDiseases] = useState<DiseaseRecord[]>([]);
  const [injuries, setInjuries] = useState<InjuryRecord[]>([]);
  const [medicines, setMedicines] = useState<MedicineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedChild = children.find(c => c.id === selectedChildId) ?? children[0] ?? null;

  // Check for existing auth token on mount
  useEffect(() => {
    (async () => {
      const token = await api.getAuthToken();
      if (token) {
        setIsLoggedIn(true);
      } else {
        setLoading(false);
      }
    })();
  }, []);

  const loadChildren = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getChildren();
      setChildren(data);
      if (data.length > 0 && !selectedChildId) {
        setSelectedChildId(data[0].id);
      }
    } catch (err: any) {
      if (err.message?.includes('401')) {
        setIsLoggedIn(false);
        await api.setAuthToken(null);
      } else {
        setError(err.message || 'Failed to load children');
      }
    }
  }, [selectedChildId]);

  const loadChildData = useCallback(async () => {
    if (!selectedChildId) return;
    try {
      const [v, d, i, m] = await Promise.all([
        api.getVaccines(selectedChildId),
        api.getDiseases(selectedChildId),
        api.getInjuries(selectedChildId),
        api.getMedicines(selectedChildId),
      ]);
      setVaccines(v);
      setDiseases(d);
      setInjuries(i);
      setMedicines(m);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    }
  }, [selectedChildId]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await loadChildren();
    if (selectedChildId) await loadChildData();
    setLoading(false);
  }, [loadChildren, loadChildData, selectedChildId]);

  useEffect(() => {
    if (isLoggedIn) loadAll();
  }, [isLoggedIn]);

  useEffect(() => {
    if (selectedChildId) loadChildData();
  }, [selectedChildId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChildren();
    if (selectedChildId) await loadChildData();
    setRefreshing(false);
  }, [loadChildren, loadChildData, selectedChildId]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // ── Not logged in: show login screen ──
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // ── Loading ──
  if (loading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.accentGreen} />
          <Text style={{ ...Typography.caption, color: Colors.textSecondary, marginTop: Spacing.md }}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error with no data ──
  if (error && children.length === 0) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.lg }}>
          <Text style={{ ...Typography.subtitle, color: Colors.textPrimary, textAlign: 'center' }}>
            Something went wrong
          </Text>
          <Text style={{ ...Typography.body, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm }}>
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main app ──
  return (
    <SafeAreaView style={globalStyles.container}>
      {/* ── Header ── */}
      <View style={globalStyles.header}>
        <View style={globalStyles.childSelector}>
          <ChildSelector
            children={children}
            selectedId={selectedChildId}
            onSelect={setSelectedChildId}
          />
        </View>
        <BellIcon count={0} onPress={() => { /* TODO: reminders */ }} />
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={globalStyles.content}
        contentContainerStyle={globalStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accentGreen} />}
      >
        {selectedChild ? (
          <>
            <MasterDataCard child={selectedChild} />
            <VaccineCard records={vaccines} onAdd={() => {}} />
            <DiseaseCard records={diseases} onAdd={() => {}} />
            <InjuryCard records={injuries} onAdd={() => {}} />
            <MedicineCard records={medicines} onAdd={() => {}} />
          </>
        ) : (
          <View style={{ alignItems: 'center', marginTop: Spacing.xxl }}>
            <Text style={{ ...Typography.body, color: Colors.textSecondary, textAlign: 'center' }}>
              No child registered yet.{'\n'}Add your first child to get started.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}