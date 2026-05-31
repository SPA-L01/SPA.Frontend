import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { mockPaymentMethods, mockParkingLots, PaymentMethod } from '@/constants/mockData';
import { parkingService, sessionsService } from '@/services/api';
import { useWallet } from '@/context/WalletContext';
import { analyticsService } from '@/services/analytics.service';
import { notificationService } from '@/services/notification.service';
import * as Sentry from '@sentry/react-native';

const SERVICE_FEE = 2000;

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const lotId = params.lotId as string;
  const slotCode = params.slotCode as string;
  const slotId = params.slotId as string | undefined;
  const price = parseInt(params.price as string || '0', 10);
  const total = price + SERVICE_FEE;

  const { balance, reload } = useWallet();

  // Load lot info (from API first, fallback mock)
  const [lot, setLot] = useState<any>(null);
  useEffect(() => {
    if (!lotId) return;
    parkingService.getLocationDetail(lotId)
      .then((data) => setLot(data))
      .catch(() => {/* keep mock */});
  }, [lotId]);

  const walletMethod = mockPaymentMethods.find((m) => m.brand === 'wallet')!;
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(walletMethod);
  const [loading, setLoading] = useState(false);

  const lotName = lot?.name ?? 'Bãi đỗ xe';
  const lotAddress = lot?.address ?? '';
  const lotImage = lot?.imageUrl || `https://picsum.photos/seed/${lotId}/400/240`;

  const canPay = selectedMethod.brand === 'wallet'
    ? balance >= total
    : true; // card/momo luôn "giả" thành công

  const handlePayment = async () => {
    Sentry.addBreadcrumb({
      category: 'user.action',
      message: 'User pressed checkout button',
      level: 'info',
      data: { screen: 'CheckoutScreen', method: selectedMethod.brand },
    });

    if (!canPay) {
      // Track: người dùng bị chặn vì không đủ tiền → điểm rơi (drop-off)
      analyticsService.logEvent('payment_blocked', {
        reason: 'insufficient_balance',
        required: total,
        available: balance,
        lot_id: lotId,
        lot_name: lotName,
        payment_method: selectedMethod.brand,
      });
      Alert.alert(
        'Số dư không đủ',
        `Ví hiện có ${balance.toLocaleString()}đ, cần ${total.toLocaleString()}đ.\nBạn có muốn nạp thêm tiền?`,
        [
          { text: 'Nạp tiền', onPress: () => router.push('/wallet/top-up') },
          { text: 'Huỷ', style: 'cancel' },
        ]
      );
      return;
    }

    // Track: bắt đầu thanh toán
    analyticsService.logEvent('payment_initiated', {
      lot_id: lotId,
      lot_name: lotName,
      total_amount: total,
      payment_method: selectedMethod.brand,
    });

    setLoading(true);

    // Sentry Performance Transaction: đo thời gian hoàn thành luồng thanh toán
    const transaction = Sentry.startInactiveSpan({
      name: 'checkout_payment',
      op: 'user.action',
      attributes: {
        lot_id: lotId,
        payment_method: selectedMethod.brand,
        total_amount: total,
      },
    });

    try {
      // Create session on backend — this marks slot occupied and deducts wallet server-side
      await sessionsService.checkIn({
        parkingLocationId: lotId,
        vehicleType: 'car',
        slotId: slotId || undefined,
      });

      // Notify user (UX)
      notificationService.scheduleSessionReminder(15, lotName);

      // Refresh wallet balance from BE
      await reload();

      // Track: check-in thành công
      analyticsService.logEvent('checkin_success', {
        lot_id: lotId,
        lot_name: lotName,
        total_amount: total,
        payment_method: selectedMethod.brand,
      });

      transaction?.end();

      router.replace({
        pathname: '/payment/success',
        params: {
          lotId,
          lotName,
          lotAddress,
          slotCode: slotCode || '—',
          total: total.toString(),
          method: selectedMethod.label,
        },
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Thanh toán thất bại. Vui lòng thử lại.';

      // Track: thanh toán thất bại
      analyticsService.logEvent('checkin_failed', {
        lot_id: lotId,
        error_message: msg,
        payment_method: selectedMethod.brand,
      });
      analyticsService.captureError(e, {
        action: 'checkin',
        lot_id: lotId,
        payment_method: selectedMethod.brand,
      });

      transaction?.end();
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác nhận đặt chỗ</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Booking Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TÓM TẮT ĐẶT CHỖ</Text>
          <View style={styles.summaryCard}>
            <Image source={{ uri: lotImage }} style={styles.lotImage} />
            <View style={styles.lotInfo}>
              <Text style={styles.lotName} numberOfLines={1}>{lotName}</Text>
              <Text style={styles.lotAddress} numberOfLines={1}>{lotAddress}</Text>
              <View style={styles.slotBadge}>
                <Ionicons name="car-outline" size={13} color={palette.white} />
                <Text style={styles.slotText}>Vị trí: {slotCode || '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CHI TIẾT PHÍ</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giá thuê bãi</Text>
              <Text style={styles.priceValue}>{price.toLocaleString()}đ</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Phí dịch vụ</Text>
              <Text style={styles.priceValue}>{SERVICE_FEE.toLocaleString()}đ</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{total.toLocaleString()}đ</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>PHƯƠNG THỨC THANH TOÁN</Text>
            <TouchableOpacity onPress={() => router.push('/wallet')}>
              <Text style={styles.manageText}>Quản lý ví</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.methodsCard}>
            {mockPaymentMethods.map((method) => {
              const isSelected = selectedMethod.id === method.id;
              const isWallet = method.brand === 'wallet';
              const insufficientBalance = isWallet && balance < total;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.methodItem, isSelected && styles.methodItemSelected]}
                  onPress={() => setSelectedMethod(method)}
                >
                  <View style={[styles.methodIconBg, isSelected && styles.methodIconBgSelected]}>
                    <Ionicons
                      name={isWallet ? 'wallet' : 'card-outline'}
                      size={22}
                      color={isSelected ? palette.white : palette.textPrimary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.methodLabel, isSelected && styles.textWhite]}>
                      {method.label}
                    </Text>
                    {isWallet && (
                      <Text style={[
                        styles.balanceText,
                        isSelected && styles.textMutedLight,
                        insufficientBalance && styles.textDanger,
                      ]}>
                        Số dư: {balance.toLocaleString()}đ
                        {insufficientBalance ? ' (không đủ)' : ''}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.radio, isSelected && styles.radioActive]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Tổng cộng</Text>
          <Text style={styles.footerPrice}>{total.toLocaleString()}đ</Text>
        </View>
        <TouchableOpacity
          style={[styles.payBtn, (loading || !canPay) && styles.btnDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={palette.white} />
          ) : (
            <Text style={styles.payBtnText}>
              {!canPay ? 'Số dư không đủ' : 'Xác nhận đặt chỗ'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.white },
  safeArea: { backgroundColor: palette.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h2, color: palette.textPrimary },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

  section: { marginBottom: spacing.xl },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: palette.textSecondary, letterSpacing: 0.8, marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  manageText: { fontSize: 13, color: '#1976D2', fontWeight: '700' },

  summaryCard: { flexDirection: 'row', gap: spacing.md, backgroundColor: palette.offWhite, borderRadius: radius.lg, padding: spacing.sm },
  lotImage: { width: 80, height: 80, borderRadius: radius.md, backgroundColor: palette.border },
  lotInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  lotName: { fontSize: 16, fontWeight: '700', color: palette.textPrimary },
  lotAddress: { fontSize: 12, color: palette.textSecondary },
  slotBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.darkBg, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, marginTop: 4 },
  slotText: { color: palette.white, fontSize: 11, fontWeight: '700' },

  priceCard: { backgroundColor: palette.white, borderRadius: radius.lg, borderWidth: 1, borderColor: palette.border, padding: spacing.md, gap: spacing.sm },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { fontSize: 14, color: palette.textSecondary },
  priceValue: { fontSize: 14, fontWeight: '600', color: palette.textPrimary },
  divider: { height: 1, backgroundColor: palette.border, marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: palette.textPrimary },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#30D158' },

  methodsCard: { backgroundColor: palette.white, borderRadius: radius.xl, borderWidth: 1, borderColor: palette.border, overflow: 'hidden' },
  methodItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: palette.offWhite },
  methodItemSelected: { backgroundColor: palette.darkBg },
  methodIconBg: { width: 40, height: 40, borderRadius: 10, backgroundColor: palette.offWhite, alignItems: 'center', justifyContent: 'center' },
  methodIconBgSelected: { backgroundColor: '#FFFFFF20' },
  methodLabel: { fontSize: 15, fontWeight: '600', color: palette.textPrimary },
  balanceText: { fontSize: 11, color: palette.textSecondary, marginTop: 2 },
  textWhite: { color: palette.white },
  textMutedLight: { color: '#FFFFFF80' },
  textDanger: { color: '#FF3B30' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: palette.white },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: palette.white },

  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: palette.white, flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  footerInfo: { flex: 1 },
  footerLabel: { fontSize: 12, color: palette.textSecondary },
  footerPrice: { fontSize: 20, fontWeight: '800', color: palette.textPrimary },
  payBtn: { flex: 1.5, backgroundColor: palette.darkBg, paddingVertical: 18, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  btnDisabled: { opacity: 0.55 },
  payBtnText: { color: palette.white, fontSize: 16, fontWeight: '800' },
});
