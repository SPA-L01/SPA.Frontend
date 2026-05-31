import React from 'react';
import {
  View, Text, StyleSheet, StatusBar,
  ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing, typography, radius, shadows } from '@/constants/theme';
import { useBookings } from '@/context/BookingContext';
import { useParkingSpot } from '@/context/ParkingSpotContext';
import { ParkingSpot } from '@/types/parking-spot';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Sentry from '@sentry/react-native';

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} · ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function formatDuration(ms?: number) {
  if (!ms) return '';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} phút`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}p` : `${h} giờ`;
}

function CurrentSpotCard({ spot }: { spot: ParkingSpot }) {
  const elapsed = Date.now() - new Date(spot.createdAt).getTime();
  const locationParts = [spot.floor, spot.zone, spot.column].filter(Boolean);

  return (
    <TouchableOpacity style={styles.currentCard} onPress={() => {
      Sentry.addBreadcrumb({ category: 'user.action', message: 'User pressed current spot', level: 'info', data: { screen: 'HistoryScreen' } });
      router.push('/spot/current');
    }} activeOpacity={0.85}>
      <View style={styles.currentCardTop}>
        <View style={styles.activePulse}>
          <View style={styles.activeDot} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.currentCardTitle}>
            {spot.parkingLocationName ?? 'Vị trí xe hiện tại'}
          </Text>
          {locationParts.length > 0 && (
            <Text style={styles.currentCardSub}>{locationParts.join(' · ')}</Text>
          )}
        </View>
        <Text style={styles.elapsedText}>{formatDuration(elapsed)}</Text>
        <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
      </View>
      {spot.photos.length > 0 && (
        <Image source={{ uri: spot.photos[0].uri }} style={styles.currentCardPhoto} />
      )}
      <View style={styles.currentCardActions}>
        <TouchableOpacity style={styles.currentCardBtn} onPress={() => router.push('/spot/current')}>
          <Ionicons name="navigate-outline" size={16} color="#1976D2" />
          <Text style={[styles.currentCardBtnText, { color: '#1976D2' }]}>Chỉ đường</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.currentCardBtn, styles.currentCardBtnDone]} onPress={() => router.push('/spot/current')}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
          <Text style={[styles.currentCardBtnText, { color: '#059669' }]}>Đã lấy xe</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function SpotHistoryCard({ spot }: { spot: ParkingSpot }) {
  const locationParts = [spot.floor, spot.zone, spot.column].filter(Boolean);
  return (
    <TouchableOpacity
      style={styles.spotHistoryCard}
      onPress={() => {
        Sentry.addBreadcrumb({ category: 'user.action', message: 'User pressed history spot', level: 'info', data: { screen: 'HistoryScreen' } });
        router.push(`/spot/history/${spot.id}`);
      }}
      activeOpacity={0.85}
    >
      <View style={styles.spotHistoryIconBox}>
        <Ionicons name="location" size={20} color={palette.white} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.spotHistoryTitle} numberOfLines={1}>
          {spot.parkingLocationName ?? 'Vị trí đã lưu'}
        </Text>
        {locationParts.length > 0 && (
          <Text style={styles.spotHistorySub}>{locationParts.join(' · ')}</Text>
        )}
        <Text style={styles.spotHistoryDate}>{formatDate(spot.createdAt)} · {formatDuration(spot.durationMs)}</Text>
      </View>
      {spot.photos.length > 0 && (
        <Image source={{ uri: spot.photos[0].uri }} style={styles.spotHistoryThumb} />
      )}
      <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} />
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const { bookings, loading: loadingBookings } = useBookings();
  const { currentSpot, history, loading: loadingSpots } = useParkingSpot();
  const insets = useSafeAreaInsets();

  const loading = loadingBookings || loadingSpots;
  const hasContent = currentSpot || history.length > 0 || bookings.length > 0;

  if (loading && !hasContent) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />
        <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
          <Text style={styles.headerTitle}>Lịch sử & Vị trí xe</Text>
          <Text style={styles.headerSub}>Đang tải dữ liệu...</Text>
        </View>
        <ScrollView contentContainerStyle={styles.listContent}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} height={100} style={{ marginBottom: spacing.md, borderRadius: radius.xl }} />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />

      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <Text style={styles.headerTitle}>Lịch sử & Vị trí xe</Text>
        <Text style={styles.headerSub}>Lưu vị trí xe của bạn để tìm lại dễ dàng</Text>
      </View>

      {!hasContent ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="car-sport-outline" size={64} color="#CBD5E1" />
          </View>
          <Text style={styles.emptyTitle}>Lịch sử trống</Text>
          <Text style={styles.emptySubtitle}>
            Bạn chưa có dữ liệu gửi xe nào. Hãy bắt đầu bằng cách tìm một bãi đỗ gần nhất!
          </Text>
          <TouchableOpacity 
            style={styles.exploreBtn} 
            onPress={() => {
              Sentry.addBreadcrumb({ category: 'user.action', message: 'User navigated to map from empty history', level: 'info', data: { screen: 'HistoryScreen' } });
              router.push('/(tabs)/map');
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="search" size={18} color={palette.white} style={{ marginRight: 8 }} />
            <Text style={styles.exploreBtnText}>Tìm bãi đỗ ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>

          {/* Active spot */}
          {currentSpot && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚗  Xe đang gửi</Text>
              <CurrentSpotCard spot={currentSpot} />
            </View>
          )}

          {/* Save spot CTA if no current spot */}
          {!currentSpot && (
            <TouchableOpacity style={styles.saveCta} onPress={() => router.push('/spot/save')}>
              <Ionicons name="add-circle-outline" size={20} color="#1976D2" />
              <Text style={styles.saveCtaText}>Lưu vị trí xe mới</Text>
            </TouchableOpacity>
          )}

          {/* Spot history */}
          {history.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍  Lịch sử vị trí xe</Text>
              <View style={styles.card}>
                {history.map((spot, i) => (
                  <React.Fragment key={spot.id}>
                    <SpotHistoryCard spot={spot} />
                    {i < history.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </View>
            </View>
          )}

          {/* Booking history */}
          {bookings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎫  Lịch sử đặt chỗ</Text>
              <View style={styles.card}>
                {bookings.map((item, i) => (
                  <React.Fragment key={item.id}>
                    <TouchableOpacity
                      style={styles.bookingItem}
                      activeOpacity={0.85}
                      onPress={() => {
                        Sentry.addBreadcrumb({ category: 'user.action', message: 'User pressed booking item', level: 'info', data: { screen: 'HistoryScreen' } });
                        router.push(`/booking/${item.id}`);
                      }}
                    >
                      <View style={styles.bookingIconBox}>
                        <Ionicons name="car" size={18} color={palette.white} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bookingName} numberOfLines={1}>{item.lotName}</Text>
                        <Text style={styles.bookingAddress} numberOfLines={1}>{item.lotAddress}</Text>
                      </View>
                      <View style={styles.bookingMeta}>
                        <Text style={styles.bookingTotal}>{item.total.toLocaleString()}đ</Text>
                        <View style={[styles.statusBadge, item.status === 'completed' && styles.statusDone]}>
                          <Text style={styles.statusText}>{item.status === 'active' ? 'Đang gửi' : 'Đã lấy'}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    {i < bookings.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.offWhite },
  header: { backgroundColor: palette.darkBg, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  headerTitle: { ...typography.h1, color: palette.white, marginTop: spacing.sm },
  headerSub: { ...typography.caption, color: palette.textMuted, marginTop: 2 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  emptyTitle: { ...typography.h2, color: palette.textPrimary, textAlign: 'center' },
  emptySubtitle: { ...typography.body, color: palette.textSecondary, textAlign: 'center', lineHeight: 22 },
  saveNowBtn: { backgroundColor: palette.darkBg, paddingHorizontal: 24, paddingVertical: 14, borderRadius: radius.full, marginTop: spacing.sm },
  saveNowBtnText: { color: palette.white, fontWeight: '800', fontSize: 15 },

  listContent: { padding: spacing.md, gap: spacing.md },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: palette.textPrimary },

  card: { backgroundColor: palette.white, borderRadius: radius.xl, overflow: 'hidden', ...shadows.sm, borderWidth: 1, borderColor: palette.border },
  divider: { height: 1, backgroundColor: palette.border, marginHorizontal: spacing.md },

  // Current spot card
  currentCard: { backgroundColor: palette.white, borderRadius: radius.xl, padding: spacing.md, ...shadows.md, borderWidth: 1.5, borderColor: '#34D399' },
  currentCardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  activePulse: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#059669' },
  currentCardTitle: { fontSize: 15, fontWeight: '800', color: palette.textPrimary },
  currentCardSub: { fontSize: 12, color: palette.textSecondary, marginTop: 1 },
  elapsedText: { fontSize: 12, fontWeight: '700', color: '#059669' },
  currentCardPhoto: { width: '100%', height: 120, borderRadius: radius.md, marginBottom: spacing.sm },
  currentCardActions: { flexDirection: 'row', gap: spacing.sm },
  currentCardBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: radius.md, backgroundColor: '#EFF6FF' },
  currentCardBtnDone: { backgroundColor: '#D1FAE5' },
  currentCardBtnText: { fontSize: 13, fontWeight: '700' },

  // Spot history card
  spotHistoryCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  spotHistoryIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  spotHistoryTitle: { fontSize: 14, fontWeight: '700', color: palette.textPrimary },
  spotHistorySub: { fontSize: 12, color: palette.textSecondary, marginTop: 1 },
  spotHistoryDate: { fontSize: 11, color: palette.textMuted, marginTop: 2 },
  spotHistoryThumb: { width: 44, height: 44, borderRadius: radius.sm },

  // Save CTA
  saveCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#EFF6FF', borderRadius: radius.xl, paddingVertical: 14, borderWidth: 1, borderColor: '#BFDBFE', borderStyle: 'dashed' },
  saveCtaText: { fontSize: 14, fontWeight: '700', color: '#1976D2' },

  // Booking items
  bookingItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  bookingIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: palette.darkBg, alignItems: 'center', justifyContent: 'center' },
  bookingName: { fontSize: 14, fontWeight: '700', color: palette.textPrimary },
  bookingAddress: { fontSize: 11, color: palette.textSecondary, marginTop: 1 },
  bookingMeta: { alignItems: 'flex-end', gap: 4 },
  bookingTotal: { fontSize: 13, fontWeight: '800', color: palette.textPrimary },
  statusBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  statusDone: { backgroundColor: palette.offWhite },
  statusText: { fontSize: 10, fontWeight: '800', color: '#065F46' },

  // New styles for Phase 8 polish
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.darkBg,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: radius.full,
    marginTop: spacing.md,
    ...shadows.md,
  },
  exploreBtnText: {
    color: palette.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
