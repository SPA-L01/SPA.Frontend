import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, typography, radius, shadows } from '@/constants/theme';
import { useBookings } from '@/context/BookingContext';
import { parkingService } from '@/services/api';
import { locationService } from '@/services/location.service';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getBooking, completeBooking } = useBookings();
  const booking = getBooking(id);
  const [lotCoords, setLotCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!booking?.lotId) return;
    parkingService.getLocationDetail(booking.lotId).then((lot: any) => {
      if (lot?.latitude && lot?.longitude) {
        setLotCoords({ latitude: Number(lot.latitude), longitude: Number(lot.longitude) });
      }
    }).catch(() => {});
  }, [booking?.lotId]);

  if (!booking) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.header}>
          <Text style={styles.headerTitle}>Không tìm thấy</Text>
        </SafeAreaView>
      </View>
    );
  }

  const handleComplete = async () => {
    Alert.alert('Đã lấy xe?', 'Booking này sẽ chuyển sang trạng thái đã lấy xe.', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đã lấy xe',
        style: 'destructive',
        onPress: async () => {
          await completeBooking(booking.id);
          router.back();
        },
      },
    ]);
  };

  const savedLine = [booking.savedSpot?.floor, booking.savedSpot?.zone, booking.savedSpot?.column]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={palette.white} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Chi tiết đặt chỗ</Text>
              <Text style={styles.headerSub}>Thông tin lần gửi xe này</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Booking info */}
        <View style={styles.bookingCard}>
          <View style={styles.cardHeader}>
            <View style={styles.parkingIcon}>
              <Ionicons name="car" size={26} color={palette.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.lotName}>{booking.lotName}</Text>
              <Text style={styles.address}>{booking.lotAddress}</Text>
            </View>
          </View>
          <View style={styles.infoGrid}>
            <Info label="Slot đặt" value={booking.slotCode} />
            <Info label="Thanh toán" value={`${booking.total.toLocaleString()}đ`} />
            <Info label="Trạng thái" value={booking.status === 'active' ? 'Đang gửi' : 'Đã lấy'} />
          </View>
        </View>

        {/* Saved spot (if exists) */}
        {booking.savedSpot && (
          <View style={styles.savedCard}>
            <View style={styles.savedIcon}>
              <Ionicons name="location" size={22} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.savedTitle}>Vị trí xe đã lưu</Text>
              <Text style={styles.savedText}>{savedLine || 'Có ghi chú vị trí'}</Text>
              {!!booking.savedSpot.note && <Text style={styles.savedNote}>{booking.savedSpot.note}</Text>}
            </View>
          </View>
        )}

        {/* Single CTA */}
        <TouchableOpacity
          style={styles.newSpotBtn}
          onPress={() =>
            router.push({
              pathname: '/spot/save',
              params: { parkingLocationId: booking.lotId ?? booking.id, parkingLocationName: booking.lotName },
            })
          }
        >
          <Ionicons name="location-outline" size={20} color={palette.white} />
          <Text style={styles.newSpotBtnText}>📍  Lưu vị trí xe (GPS + ảnh)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mapBtn, !lotCoords && styles.mapBtnDisabled]}
          activeOpacity={0.85}
          onPress={() => {
            if (lotCoords) {
              locationService.openMapsNavigation(lotCoords.latitude, lotCoords.longitude, booking?.lotName);
            } else {
              Alert.alert('Không có GPS', 'Bãi đỗ xe này chưa có tọa độ GPS.');
            }
          }}
        >
          <Ionicons name="navigate-outline" size={20} color={lotCoords ? palette.textPrimary : palette.textSecondary} />
          <Text style={[styles.mapBtnText, !lotCoords && { color: palette.textSecondary }]}>
            {lotCoords ? 'Mở bản đồ chỉ đường tới bãi' : 'Đang tải vị trí...'}
          </Text>
        </TouchableOpacity>

        {booking.status === 'active' && (
          <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
            <Ionicons name="checkmark-done-outline" size={20} color={palette.white} />
            <Text style={styles.completeBtnText}>Đã lấy xe</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.offWhite },
  header: { backgroundColor: palette.darkBg, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.sm },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF20', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h2, color: palette.white },
  headerSub: { ...typography.caption, color: palette.textMuted, marginTop: 2 },
  content: { padding: spacing.md, gap: spacing.md },
  bookingCard: { backgroundColor: palette.white, borderRadius: radius.xl, padding: spacing.md, ...shadows.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  parkingIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: palette.darkBg, alignItems: 'center', justifyContent: 'center' },
  lotName: { fontSize: 17, fontWeight: '900', color: palette.textPrimary },
  address: { fontSize: 12, color: palette.textSecondary, marginTop: 3 },
  infoGrid: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  infoItem: { flex: 1, backgroundColor: palette.offWhite, borderRadius: radius.md, padding: spacing.sm },
  infoLabel: { fontSize: 10, color: palette.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 12, fontWeight: '800', color: palette.textPrimary },
  savedCard: { flexDirection: 'row', gap: spacing.md, backgroundColor: '#ECFDF5', borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: '#A7F3D0' },
  savedIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' },
  savedTitle: { fontSize: 15, fontWeight: '800', color: '#065F46' },
  savedText: { fontSize: 14, color: '#047857', marginTop: 2, fontWeight: '700' },
  savedNote: { fontSize: 12, color: '#059669', marginTop: 4 },
  newSpotBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#059669', borderRadius: radius.full, paddingVertical: 16, ...shadows.md },
  newSpotBtnText: { color: palette.white, fontSize: 15, fontWeight: '800' },
  mapBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: palette.white, borderRadius: radius.full, paddingVertical: 15, borderWidth: 1, borderColor: palette.border },
  mapBtnDisabled: { opacity: 0.5 },
  mapBtnText: { color: palette.textPrimary, fontSize: 14, fontWeight: '800' },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#111827', borderRadius: radius.full, paddingVertical: 16, ...shadows.md },
  completeBtnText: { color: palette.white, fontSize: 15, fontWeight: '900' },
});
