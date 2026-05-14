import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, typography, radius, shadows } from '@/constants/theme';
import { useBookings } from '@/context/BookingContext';

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} · ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function HistoryScreen() {
  const { bookings } = useBookings();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />

      <View style={styles.header}>
        <SafeAreaView>
          <Text style={styles.headerTitle}>Lịch sử đặt xe</Text>
          <Text style={styles.headerSub}>Bấm vào một lần đặt để lưu / xem vị trí xe</Text>
        </SafeAreaView>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color={palette.textSecondary} />
          <Text style={styles.emptyTitle}>Chưa có lịch sử đặt xe</Text>
          <Text style={styles.emptySubtitle}>
            Sau khi đặt chỗ thành công, thông tin sẽ xuất hiện ở đây.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {bookings.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/booking/${item.id}`)}
            >
              <View style={styles.cardTop}>
                <View style={styles.iconBox}>
                  <Ionicons name="car" size={22} color={palette.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lotName} numberOfLines={1}>{item.lotName}</Text>
                  <Text style={styles.address} numberOfLines={1}>{item.lotAddress}</Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'completed' && styles.statusBadgeDone]}>
                  <Text style={styles.statusText}>{item.status === 'active' ? 'Đang gửi' : 'Đã lấy'}</Text>
                </View>
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Vị trí đặt</Text>
                  <Text style={styles.metaValue}>{item.slotCode}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Thanh toán</Text>
                  <Text style={styles.metaValue}>{item.total.toLocaleString()}đ</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Thời gian</Text>
                  <Text style={styles.metaValue}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>

              <View style={styles.findCarRow}>
                <Ionicons
                  name={item.savedSpot ? 'location' : 'location-outline'}
                  size={16}
                  color={item.savedSpot ? '#30D158' : palette.textSecondary}
                />
                <Text style={[styles.findCarText, item.savedSpot && styles.findCarTextSaved]}>
                  {item.savedSpot
                    ? `Đã lưu: ${[item.savedSpot.floor, item.savedSpot.zone, item.savedSpot.column].filter(Boolean).join(' · ')}`
                    : 'Chưa lưu vị trí xe — bấm để lưu'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={palette.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
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
  listContent: { padding: spacing.md, gap: spacing.md },
  card: { backgroundColor: palette.white, borderRadius: radius.xl, padding: spacing.md, ...shadows.sm, borderWidth: 1, borderColor: palette.border },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: palette.darkBg, alignItems: 'center', justifyContent: 'center' },
  lotName: { fontSize: 16, fontWeight: '800', color: palette.textPrimary },
  address: { fontSize: 12, color: palette.textSecondary, marginTop: 2 },
  statusBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.full },
  statusBadgeDone: { backgroundColor: palette.offWhite },
  statusText: { fontSize: 11, fontWeight: '800', color: '#065F46' },
  metaGrid: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm },
  metaItem: { flex: 1, backgroundColor: palette.offWhite, borderRadius: radius.md, padding: spacing.sm },
  metaLabel: { fontSize: 10, color: palette.textSecondary, marginBottom: 2 },
  metaValue: { fontSize: 12, fontWeight: '800', color: palette.textPrimary },
  findCarRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: palette.border },
  findCarText: { flex: 1, fontSize: 13, color: palette.textSecondary, fontWeight: '600' },
  findCarTextSaved: { color: '#059669' },
});
