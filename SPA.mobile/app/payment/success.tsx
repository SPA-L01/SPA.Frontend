import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { useWallet } from '@/context/WalletContext';
import { useBookings } from '@/context/BookingContext';

export default function PaymentSuccessScreen() {
  const params = useLocalSearchParams();
  const { balance } = useWallet();

  const lotName = params.lotName as string;
  const lotAddress = params.lotAddress as string;
  const slotCode = params.slotCode as string;
  const total = parseInt(params.total as string || '0', 10);
  const method = params.method as string;
  const bookingId = useMemo(() => `SPA-${Date.now().toString().slice(-6)}`, []);
  const lotId = params.lotId as string;
  const { addBooking } = useBookings();

  useEffect(() => {
    addBooking({
      id: bookingId,
      lotId: lotId || '',
      lotName: lotName || 'Bãi đỗ xe',
      lotAddress: lotAddress || '—',
      slotCode: slotCode || '—',
      total,
      method: method || 'Ví SPA',
    });
  }, [bookingId, lotId, lotName, lotAddress, slotCode, total, method]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={48} color={palette.white} />
          </View>
          <Text style={styles.title}>Đặt chỗ thành công</Text>
          <Text style={styles.subtitle}>Vị trí đỗ xe của bạn đã được giữ chỗ</Text>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketLabel}>MÃ ĐẶT CHỖ</Text>
            <Text style={styles.ticketId}>{bookingId}</Text>
          </View>
          <View style={styles.divider} />

          <InfoRow icon="business-outline" label="Bãi đỗ" value={lotName || '—'} />
          <InfoRow icon="location-outline" label="Địa chỉ" value={lotAddress || '—'} />
          <InfoRow icon="car-outline" label="Vị trí" value={slotCode || '—'} />
          <InfoRow icon="wallet-outline" label="Thanh toán" value={method || 'Ví SPA'} />
          <InfoRow icon="cash-outline" label="Đã thanh toán" value={`${total.toLocaleString()}đ`} strong />
          <InfoRow icon="card-outline" label="Số dư còn lại" value={`${balance.toLocaleString()}đ`} />
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={20} color="#1976D2" />
          <Text style={styles.noteText}>
            Khi đến bãi, đưa mã đặt chỗ này cho nhân viên hoặc quét tại cổng vào.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace('/wallet')}
        >
          <Text style={styles.secondaryText}>Xem ví</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/(tabs)/history')}
        >
          <Text style={styles.primaryText}>Xem lịch sử</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value, strong }: { icon: any; label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={palette.textPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, strong && styles.infoValueStrong]} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.offWhite },
  safe: { backgroundColor: palette.darkBg },
  hero: {
    backgroundColor: palette.darkBg,
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: 44,
    paddingHorizontal: spacing.md,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#30D158',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  title: { fontSize: 26, fontWeight: '900', color: palette.white, letterSpacing: -0.4 },
  subtitle: { ...typography.body, color: '#FFFFFFAA', marginTop: 6, textAlign: 'center' },
  content: { flex: 1, padding: spacing.md, marginTop: -28 },
  ticketCard: {
    backgroundColor: palette.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.lg,
  },
  ticketHeader: { alignItems: 'center', paddingVertical: spacing.sm },
  ticketLabel: { fontSize: 11, fontWeight: '800', color: palette.textSecondary, letterSpacing: 1 },
  ticketId: { fontSize: 24, fontWeight: '900', color: palette.textPrimary, marginTop: 4 },
  divider: { height: 1, backgroundColor: palette.border, marginVertical: spacing.md },
  infoRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md, alignItems: 'center' },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: palette.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { fontSize: 12, color: palette.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '600', color: palette.textPrimary },
  infoValueStrong: { fontSize: 17, fontWeight: '900', color: '#30D158' },
  noteCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#E3F2FD',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noteText: { flex: 1, fontSize: 13, color: '#0D47A1', lineHeight: 19 },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryText: { fontSize: 15, fontWeight: '800', color: palette.textPrimary },
  primaryBtn: {
    flex: 1.4,
    backgroundColor: palette.darkBg,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadows.md,
  },
  primaryText: { fontSize: 15, fontWeight: '800', color: palette.white },
});
