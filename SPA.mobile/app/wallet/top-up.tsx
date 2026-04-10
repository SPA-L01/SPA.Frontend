import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { mockPaymentMethods, PaymentMethod } from '@/constants/mockData';

const TOP_UP_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function TopUpScreen() {
  const [amount, setAmount] = useState('100000');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(mockPaymentMethods[1]); // Default to Visa
  const [loading, setLoading] = useState(false);

  const handleTopUp = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 1500);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nạp tiền vào ví</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nhập số tiền cần nạp</Text>
          <View style={styles.inputWrapper}>
             <Text style={styles.currencyPrefix}>đ</Text>
             <TextInput
               style={styles.amountInput}
               value={parseInt(amount || '0', 10).toLocaleString('vi-VN')}
               onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
               keyboardType="numeric"
               placeholder="0"
             />
          </View>
          
          <View style={styles.quickAmountGrid}>
            {TOP_UP_AMOUNTS.map((amt) => (
              <TouchableOpacity 
                key={amt}
                style={[styles.quickAmountBtn, amount === amt.toString() && styles.quickAmountBtnActive]}
                onPress={() => setAmount(amt.toString())}
              >
                <Text style={[styles.quickAmountText, amount === amt.toString() && styles.quickAmountTextActive]}>
                  {amt >= 1000000 ? `${amt / 1000000}Tr` : `${amt / 1000}K`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Chọn phương thức nạp tiền</Text>
            <TouchableOpacity onPress={() => router.push('/wallet/add-card')}>
              <Text style={styles.addCardText}>+ Thêm thẻ mới</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.methodsCard}>
            {mockPaymentMethods.filter(m => m.brand !== 'wallet').map((method, i) => (
              <TouchableOpacity 
                key={method.id}
                style={[styles.methodItem, selectedMethod.id === method.id && styles.methodItemSelected]}
                onPress={() => setSelectedMethod(method)}
              >
                <View style={styles.methodIconWrapper}>
                   <Ionicons 
                     name={method.brand === 'momo' ? 'wallet-outline' : 'card-outline'} 
                     size={24} 
                     color={selectedMethod.id === method.id ? palette.white : palette.textPrimary} 
                   />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.methodLabel, selectedMethod.id === method.id && styles.textWhite]}>
                    {method.label}
                  </Text>
                  {method.expiry && (
                    <Text style={[styles.methodExpiry, selectedMethod.id === method.id && styles.textMutedLight]}>
                      Hết hạn: {method.expiry}
                    </Text>
                  )}
                </View>
                {selectedMethod.id === method.id && (
                  <Ionicons name="checkmark-circle" size={24} color={palette.white} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
         <TouchableOpacity 
           style={[styles.confirmBtn, loading && styles.btnDisabled]} 
           onPress={handleTopUp}
           disabled={loading}
          >
           <Text style={styles.confirmBtnText}>{loading ? 'Đang xử lý...' : 'Nạp tiền ngay'}</Text>
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
  addCardText: { fontSize: 13, color: '#1976D2', fontWeight: '700' },

  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: palette.black, paddingVertical: spacing.sm, marginBottom: spacing.lg },
  currencyPrefix: { fontSize: 24, fontWeight: '700', color: palette.textPrimary, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 36, fontWeight: '800', color: palette.textPrimary },

  quickAmountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickAmountBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.md, backgroundColor: palette.offWhite, borderWidth: 1, borderColor: palette.border },
  quickAmountBtnActive: { backgroundColor: palette.black, borderColor: palette.black },
  quickAmountText: { fontSize: 14, fontWeight: '700', color: palette.textPrimary },
  quickAmountTextActive: { color: palette.white },

  methodsCard: { backgroundColor: palette.white, borderRadius: radius.xl, borderWidth: 1, borderColor: palette.border, overflow: 'hidden' },
  methodItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: palette.offWhite },
  methodItemSelected: { backgroundColor: palette.black },
  methodIconWrapper: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: palette.offWhite + '50', alignItems: 'center', justifyContent: 'center' },
  methodLabel: { fontSize: 15, fontWeight: '600', color: palette.textPrimary },
  methodExpiry: { fontSize: 11, color: palette.textSecondary, marginTop: 2 },
  textWhite: { color: palette.white },
  textMutedLight: { color: palette.white + '70' },

  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: palette.white },
  confirmBtn: { backgroundColor: palette.black, paddingVertical: 18, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  btnDisabled: { opacity: 0.7 },
  confirmBtnText: { color: palette.white, fontSize: 16, fontWeight: '800' },
});
