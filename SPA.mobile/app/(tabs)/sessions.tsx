import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { sessionsService } from '@/services/api';
import { useWallet } from '@/context/WalletContext';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#30D158',
  COMPLETED: '#8E8E93',
  CANCELLED: '#FF453A',
};
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Đang gửi',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

function formatDuration(minutes?: number | null) {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}p` : `${h} giờ`;
}

function SessionCard({ session, onCheckOut, onCancel }: { session: any; onCheckOut: (id: string) => void; onCancel: (id: string) => void }) {
  const color = STATUS_COLORS[session.status] ?? '#8E8E93';
  const label = STATUS_LABELS[session.status] ?? session.status;
  const locationName = session.parkingLocation?.name ?? '—';
  const locationAddress = session.parkingLocation?.address ?? '';

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.locationName} numberOfLines={1}>{locationName}</Text>
          <Text style={styles.locationAddress} numberOfLines={1}>{locationAddress}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={[styles.statusText, { color }]}>{label}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        <MetaItem icon="car-outline" label="Loại xe" value={session.vehicleType ?? '—'} />
        <MetaItem icon="time-outline" label="Check-in" value={formatDate(session.checkInAt)} />
        {session.durationMinutes != null && (
          <MetaItem icon="hourglass-outline" label="Thời gian" value={formatDuration(session.durationMinutes)} />
        )}
        {session.totalFee != null && (
          <MetaItem icon="cash-outline" label="Phí" value={`${Number(session.totalFee).toLocaleString()}đ`} highlight />
        )}
      </View>

      {session.status === 'ACTIVE' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => onCheckOut(session.id)}>
            <Ionicons name="exit-outline" size={16} color={palette.white} />
            <Text style={styles.checkoutBtnText}>Check-out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(session.id)}>
            <Ionicons name="close-outline" size={16} color="#FF453A" />
            <Text style={styles.cancelBtnText}>Huỷ</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function MetaItem({ icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={14} color={palette.textSecondary} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, highlight && styles.metaValueHighlight]}>{value}</Text>
    </View>
  );
}

export default function SessionsScreen() {
  const { reload } = useWallet();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sessionsService.getMySessions();
      setSessions(Array.isArray(data) ? data : data?.data ?? []);
    } catch {
      // Network error — show empty
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadSessions(); }, [loadSessions]));

  const handleCheckOut = (sessionId: string) => {
    Alert.alert('Check-out?', 'Xác nhận trả chỗ và tính phí thực tế?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Check-out',
        style: 'destructive',
        onPress: async () => {
          try {
            await sessionsService.checkOut(sessionId);
            await reload(); 
            loadSessions();
          } catch (e: any) {
            Alert.alert('Lỗi', e?.response?.data?.message ?? 'Không thể check-out');
          }
        },
      },
    ]);
  };

  const handleCancel = (sessionId: string) => {
    Alert.alert('Huỷ phiên?', 'Phí ước tính sẽ được hoàn lại vào ví.', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Huỷ phiên',
        style: 'destructive',
        onPress: async () => {
          try {
            await sessionsService.cancelSession(sessionId);
            await reload(); 
            loadSessions();
          } catch (e: any) {
            Alert.alert('Lỗi', e?.response?.data?.message ?? 'Không thể huỷ');
          }
        },
      },
    ]);
  };

  const FILTERS = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'ACTIVE', label: 'Đang gửi' },
    { key: 'COMPLETED', label: 'Xong' },
    { key: 'CANCELLED', label: 'Đã huỷ' },
  ] as const;

  const filtered = filter === 'ALL' ? sessions : sessions.filter((s) => s.status === filter);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />

      <View style={styles.header}>
        <SafeAreaView>
          <Text style={styles.headerTitle}>Phiên gửi xe</Text>
          <Text style={styles.headerSub}>{sessions.length} phiên</Text>
          <View style={styles.filterRow}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[styles.filterPillText, filter === f.key && styles.filterPillTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={palette.textSecondary} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color={palette.textSecondary} />
              <Text style={styles.emptyText}>Không có phiên nào</Text>
            </View>
          ) : (
            filtered.map((s) => (
              <SessionCard key={s.id} session={s} onCheckOut={handleCheckOut} onCancel={handleCancel} />
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.offWhite },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: palette.darkBg, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  headerTitle: { ...typography.h1, color: palette.white, marginTop: spacing.sm },
  headerSub: { ...typography.caption, color: palette.textMuted, marginTop: 2, marginBottom: spacing.md },
  filterRow: { flexDirection: 'row', gap: spacing.sm, paddingBottom: 2 },
  filterPill: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.full, backgroundColor: '#FFFFFF22' },
  filterPillActive: { backgroundColor: palette.white },
  filterPillText: { ...typography.label, color: palette.textMuted },
  filterPillTextActive: { color: palette.darkBg, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  card: { backgroundColor: palette.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  locationName: { ...typography.h3, color: palette.textPrimary },
  locationAddress: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  divider: { height: 1, backgroundColor: palette.border, marginBottom: spacing.md },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  metaItem: { alignItems: 'center', gap: 2, minWidth: 60 },
  metaLabel: { ...typography.caption, color: palette.textSecondary },
  metaValue: { ...typography.label, color: palette.textPrimary, fontWeight: '600' },
  metaValueHighlight: { color: palette.darkBg, fontWeight: '800' },
  actionRow: { marginTop: spacing.md, flexDirection: 'row', gap: spacing.sm },
  checkoutBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#059669', borderRadius: radius.full, paddingVertical: 10, ...shadows.sm },
  checkoutBtnText: { color: palette.white, fontWeight: '800', fontSize: 14 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#FF453A22', borderRadius: radius.full, paddingVertical: 10, paddingHorizontal: 18, borderWidth: 1, borderColor: '#FF453A44' },
  cancelBtnText: { color: '#FF453A', fontWeight: '700', fontSize: 14 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: spacing.md },
  emptyText: { ...typography.body, color: palette.textSecondary },
});
