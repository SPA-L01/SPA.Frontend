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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';

export default function AddCardScreen() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleAddCard = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 1500);
  };

  const getCardBrand = (number: string) => {
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5')) return 'mastercard';
    return null;
  };

  const cardBrand = getCardBrand(cardNumber.replace(/ /g, ''));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thêm thẻ mới</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card Preview */}
          <View style={styles.cardPreview}>
            <View style={styles.cardPreviewHeader}>
              <View style={styles.chip} />
              {cardBrand && (
                <View style={styles.brandIconWrapper}>
                   <Ionicons 
                     name={cardBrand === 'visa' ? 'logo-venmo' : 'logo-mastercard' as any} 
                     size={32} 
                     color={palette.white} 
                   />
                </View>
              )}
            </View>
            
            <View style={styles.cardPreviewBody}>
               <Text style={styles.previewNumber}>
                 {cardNumber || '•••• •••• •••• ••••'}
               </Text>
            </View>

            <View style={styles.cardPreviewFooter}>
              <View>
                <Text style={styles.previewLabel}>CHỦ THẺ</Text>
                <Text style={styles.previewValue}>{cardHolder.toUpperCase() || 'NGÔ HOÀNG HẢI'}</Text>
              </View>
              <View>
                <Text style={styles.previewLabel}>HẾT HẠN</Text>
                <Text style={styles.previewValue}>{expiry || 'MM/YY'}</Text>
              </View>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số thẻ</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="card-outline" size={20} color={palette.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Hết hạn</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    value={expiry}
                    onChangeText={(t) => setExpiry(formatExpiry(t))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>CVV</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={3}
                  />
                  <Ionicons name="information-circle-outline" size={18} color={palette.textMuted} />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên trên thẻ</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="NGÔ HOÀNG HẢI"
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.secureRow}>
               <Ionicons name="shield-checkmark" size={16} color={palette.success} />
               <Text style={styles.secureText}>Thông tin của bạn được bảo mật theo tiêu chuẩn quốc tế</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.footer}>
           <TouchableOpacity 
             style={[styles.confirmBtn, loading && styles.btnDisabled]} 
             onPress={handleAddCard}
             disabled={loading}
           >
             <Text style={styles.confirmBtnText}>{loading ? 'Đang lưu...' : 'Lưu thẻ ngay'}</Text>
           </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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

  cardPreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#1E1E24',
    borderRadius: radius.xl,
    padding: spacing.lg,
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
    ...shadows.lg,
  },
  cardPreviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: { width: 40, height: 30, backgroundColor: '#D4AF37', borderRadius: 6 },
  brandIconWrapper: { opacity: 0.9 },
  cardPreviewBody: { marginTop: spacing.md },
  previewNumber: { fontSize: 20, color: palette.white, fontWeight: '700', letterSpacing: 2 },
  cardPreviewFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  previewLabel: { fontSize: 8, color: palette.white + '60', fontWeight: '500', marginBottom: 2 },
  previewValue: { fontSize: 13, color: palette.white, fontWeight: '700', letterSpacing: 1 },

  form: { gap: spacing.lg },
  inputGroup: { gap: spacing.xs },
  label: { fontSize: 13, color: palette.textSecondary, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: spacing.md },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.offWhite,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: palette.border,
  },
  input: { flex: 1, fontSize: 15, color: palette.textPrimary, fontWeight: '500' },

  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: spacing.sm },
  secureText: { fontSize: 11, color: palette.textSecondary },

  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: palette.white },
  confirmBtn: { backgroundColor: palette.black, paddingVertical: 18, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  btnDisabled: { opacity: 0.7 },
  confirmBtnText: { color: palette.white, fontSize: 16, fontWeight: '800' },
});
