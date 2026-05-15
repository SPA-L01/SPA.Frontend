import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, Image, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { parkingSpotService } from '@/services/parking-spot.service';
import { locationService } from '@/services/location.service';
import { ParkingSpot } from '@/types/parking-spot';

function formatDatetime(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}  ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

function formatDuration(ms?: number): string {
  if (!ms) return '—';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} phút`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}p` : `${h} giờ`;
}

export default function SpotHistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parkingSpotService.getHistoryItem(id).then((s) => {
      setSpot(s);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.textSecondary} />
      </View>
    );
  }

  if (!spot) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Không tìm thấy</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: '#1976D2', fontWeight: '700', marginTop: 12 }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasLocation = spot.latitude != null && spot.longitude != null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết vị trí xe</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Completed badge */}
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#059669" />
          <Text style={styles.completedText}>Đã lấy xe · {formatDuration(spot.durationMs)}</Text>
        </View>

        {spot.parkingLocationName ? (
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color={palette.textSecondary} />
            <Text style={styles.infoValue}>{spot.parkingLocationName}</Text>
          </View>
        ) : null}

        <View style={styles.detailCard}>
          {spot.floor ? <DetailRow icon="layers-outline" label="Tầng" value={spot.floor} /> : null}
          {spot.zone ? <DetailRow icon="grid-outline" label="Khu / Ô" value={spot.zone} /> : null}
          {spot.column ? <DetailRow icon="barcode-outline" label="Số cột" value={spot.column} /> : null}
        </View>

        {spot.note ? (
          <View style={styles.noteCard}>
            <Ionicons name="create-outline" size={16} color={palette.textSecondary} />
            <Text style={styles.noteText}>{spot.note}</Text>
          </View>
        ) : null}

        <View style={styles.timeGrid}>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Gửi lúc</Text>
            <Text style={styles.timeValue}>{formatDatetime(spot.createdAt)}</Text>
          </View>
          {spot.completedAt ? (
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Lấy lúc</Text>
              <Text style={styles.timeValue}>{formatDatetime(spot.completedAt)}</Text>
            </View>
          ) : null}
        </View>

        {spot.photos.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Ảnh đã chụp</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
              {spot.photos.map((p, i) => (
                <Image key={i} source={{ uri: p.uri }} style={styles.photoThumb} />
              ))}
            </ScrollView>
          </>
        ) : null}

        {hasLocation ? (
          <TouchableOpacity
            style={styles.navigateBtn}
            onPress={() => locationService.openMapsNavigation(spot.latitude!, spot.longitude!, 'Vị trí xe cũ')}
          >
            <Ionicons name="navigate-outline" size={20} color={palette.white} />
            <Text style={styles.navigateBtnText}>Xem vị trí trên bản đồ</Text>
          </TouchableOpacity>
        ) : null}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color={palette.textSecondary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.offWhite },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.offWhite },
  emptyTitle: { ...typography.h2, color: palette.textPrimary },
  safeArea: { backgroundColor: palette.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: palette.white, borderBottomWidth: 1, borderBottomColor: palette.border },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h2, color: palette.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#D1FAE5', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: spacing.md },
  completedText: { fontSize: 13, fontWeight: '700', color: '#065F46' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md, backgroundColor: palette.white, borderRadius: radius.lg, padding: spacing.md, ...shadows.sm },
  infoValue: { fontSize: 15, fontWeight: '700', color: palette.textPrimary, flex: 1 },
  detailCard: { backgroundColor: palette.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm, gap: spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { fontSize: 13, color: palette.textSecondary, fontWeight: '600', width: 70 },
  detailValue: { fontSize: 15, fontWeight: '800', color: palette.textPrimary },
  noteCard: { flexDirection: 'row', gap: 8, backgroundColor: '#FFFBEB', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: '#FDE68A' },
  noteText: { flex: 1, fontSize: 14, color: '#92400E', fontWeight: '500' },
  timeGrid: { backgroundColor: palette.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, ...shadows.sm, gap: spacing.sm },
  timeItem: { gap: 2 },
  timeLabel: { fontSize: 11, color: palette.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  timeValue: { fontSize: 14, fontWeight: '700', color: palette.textPrimary },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: palette.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  photoThumb: { width: 120, height: 120, borderRadius: radius.md, marginRight: spacing.sm },
  navigateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1976D2', borderRadius: radius.full, paddingVertical: 14 },
  navigateBtnText: { color: palette.white, fontSize: 15, fontWeight: '800' },
});
