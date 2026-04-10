import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { mockUser, mockPaymentMethods, mockParkingLots, PaymentMethod } from '@/constants/mockData';

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const lotId = params.lotId as string;
  const slotCode = params.slotCode as string;
  const price = parseInt(params.price as string || '0', 10);

  const lot = mockParkingLots.find(l => l.id === lotId) || mockParkingLots[0];
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(mockPaymentMethods[0]); // Default to Wallet
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Success - navigate to Home or Sessions
      router.replace('/(tabs)/sessions');
    }, 2000);
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

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tóm tắt đặt chỗ</Text>
          <View style={styles.summaryCard}>
            <Image source={{ uri: lot.imageUrl }} style={styles.lotImage} />
            <View style={styles.lotInfo}>
              <Text style={styles.lotName}>{lot.name}</Text>
              <Text style={styles.lotAddress}>{lot.address}</Text>
              <View style={styles.slotBadge}>
                <Ionicons name="car-outline" size={14} color={palette.white} />
                <Text style={styles.slotText}>Vị trí: {slotCode || 'A12'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pricing Details */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Chi tiết phí</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giá thuê bãi (1 giờ)</Text>
              <Text style={styles.priceValue}>{price.toLocaleString()}đ</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Phí dịch vụ</Text>
              <Text style={styles.priceValue}>2.000đ</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{(price + 2000).toLocaleString()}đ</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Phương thức thanh toán</Text>
            <TouchableOpacity onPress={() => router.push('/wallet')}>
              <Text style={styles.manageText}>Quản lý</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.methodsCard}>
            {mockPaymentMethods.map((method, i) => (
              <TouchableOpacity 
                key={method.id}
                style={[styles.methodItem, selectedMethod.id === method.id && styles.methodItemSelected]}
                onPress={() => setSelectedMethod(method)}
              >
                <View style={[styles.methodIconBg, selectedMethod.id === method.id && { backgroundColor: palette.white + '20' }]}>
                   <Ionicons 
                     name={method.brand === 'wallet' ? 'wallet' : 'card-outline'} 
                     size={22} 
                     color={selectedMethod.id === method.id ? palette.white : palette.textPrimary} 
                   />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.methodLabel, selectedMethod.id === method.id && styles.textWhite]}>
                    {method.label}
                  </Text>
                  {method.brand === 'wallet' && (
                    <Text style={[styles.balanceText, selectedMethod.id === method.id && styles.textMutedLight]}>
                      Số dư: {mockUser.balance.toLocaleString()}đ
                    </Text>
                  )}
                </View>
                <View style={[styles.radio, selectedMethod.id === method.id && styles.radioActive]}>
                  {selectedMethod.id === method.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
         <View style={styles.footerInfo}>
             <Text style={styles.footerLabel}>Tổng cộng</Text>
             <Text style={styles.footerPrice}>{(price + 2000).toLocaleString()}đ</Text>
         </View>
         <TouchableOpacity 
           style={[styles.payBtn, loading && styles.btnDisabled]} 
           onPress={handlePayment}
           disabled={loading}
         >
           <Text style={styles.payBtnText}>{loading ? 'Đang thanh toán...' : 'Xác nhận đặt chỗ'}</Text>
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
  sectionLabel: { ...typography.label, color: palette.textSecondary, marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  manageText: { fontSize: 13, color: '#1976D2', fontWeight: '700' },

  summaryCard: { flexDirection: 'row', gap: spacing.md, backgroundColor: palette.offWhite, borderRadius: radius.lg, padding: spacing.sm },
  lotImage: { width: 80, height: 80, borderRadius: radius.md },
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
  totalValue: { fontSize: 18, fontWeight: '800', color: palette.success },

  methodsCard: { backgroundColor: palette.white, borderRadius: radius.xl, borderWidth: 1, borderColor: palette.border, overflow: 'hidden' },
  methodItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: palette.offWhite },
  methodItemSelected: { backgroundColor: palette.black },
  methodIconBg: { width: 40, height: 40, borderRadius: 10, backgroundColor: palette.offWhite, alignItems: 'center', justifyContent: 'center' },
  methodLabel: { fontSize: 15, fontWeight: '600', color: palette.textPrimary },
  balanceText: { fontSize: 11, color: palette.textSecondary, marginTop: 2 },
  textWhite: { color: palette.white },
  textMutedLight: { color: palette.white + '70' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: palette.white },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: palette.white },

  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: palette.white, flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  footerInfo: { flex: 1 },
  footerLabel: { fontSize: 12, color: palette.textSecondary },
  footerPrice: { fontSize: 20, fontWeight: '800', color: palette.textPrimary },
  payBtn: { flex: 1.5, backgroundColor: palette.black, paddingVertical: 18, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  btnDisabled: { opacity: 0.7 },
  payBtnText: { color: palette.white, fontSize: 16, fontWeight: '800' },
});
