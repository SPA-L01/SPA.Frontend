import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, typography, radius, shadows } from '@/constants/theme';
import { useBookings } from '@/context/BookingContext';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getBooking, saveCarSpot, completeBooking } = useBookings();
  const booking = getBooking(id);

  const [floor, setFloor] = useState(booking?.savedSpot?.floor ?? '');
  const [zone, setZone] = useState(booking?.savedSpot?.zone ?? '');
  const [column, setColumn] = useState(booking?.savedSpot?.column ?? '');
  const [note, setNote] = useState(booking?.savedSpot?.note ?? '');
  const [saving, setSaving] = useState(false);

  if (!booking) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.header}><Text style={styles.headerTitle}>Không tìm thấy</Text></SafeAreaView>
      </View>
    );
  }

  const handleSave = async () => {
    if (!floor.trim() && !zone.trim() && !column.trim() && !note.trim()) {
      Alert.alert('Thiếu thông tin', 'Hãy nhập ít nhất tầng, khu, cột hoặc ghi chú.');
      return;
    }
    setSaving(true);
    await saveCarSpot(booking.id, {
      floor: floor.trim(),
      zone: zone.trim(),
      column: column.trim(),
      note: note.trim(),
    });
    setSaving(false);
    Alert.alert('Đã lưu vị trí xe', 'Bạn có thể xem lại trong Lịch sử đặt xe.');
  };

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
              <Text style={styles.headerTitle}>Chi tiết đặt xe</Text>
              <Text style={styles.headerSub}>Lưu vị trí xe tại bãi này</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Lưu vị trí xe</Text>
          <Text style={styles.sectionSub}>Nhập vị trí thực tế để lát quay lại tìm xe nhanh hơn.</Text>

          <Input label="Tầng" placeholder="VD: Hầm B2" value={floor} onChangeText={setFloor} icon="layers-outline" />
          <Input label="Khu" placeholder="VD: Khu C" value={zone} onChangeText={setZone} icon="grid-outline" />
          <Input label="Số cột" placeholder="VD: Cột C12" value={column} onChangeText={setColumn} icon="pin-outline" />

          <Text style={styles.inputLabel}>Ghi chú</Text>
          <View style={[styles.inputWrap, styles.noteWrap]}>
            <Ionicons name="document-text-outline" size={18} color={palette.textSecondary} />
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="VD: gần thang máy, bên phải lối ra..."
              placeholderTextColor={palette.textSecondary}
              style={[styles.input, styles.noteInput]}
              multiline
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            <Ionicons name="save-outline" size={18} color={palette.white} />
            <Text style={styles.saveBtnText}>{saving ? 'Đang lưu...' : 'Lưu vị trí xe'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.mapBtn} activeOpacity={0.85}>
          <Ionicons name="navigate-outline" size={20} color={palette.textPrimary} />
          <Text style={styles.mapBtnText}>Mở bản đồ chỉ đường tới bãi</Text>
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

function Input({ label, icon, ...props }: { label: string; icon: any; placeholder: string; value: string; onChangeText: (t: string) => void }) {
  return (
    <>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={18} color={palette.textSecondary} />
        <TextInput {...props} placeholderTextColor={palette.textSecondary} style={styles.input} />
      </View>
    </>
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
  formCard: { backgroundColor: palette.white, borderRadius: radius.xl, padding: spacing.md, ...shadows.sm },
  sectionTitle: { ...typography.h2, color: palette.textPrimary },
  sectionSub: { ...typography.caption, color: palette.textSecondary, marginTop: 4, marginBottom: spacing.md },
  inputLabel: { fontSize: 12, fontWeight: '800', color: palette.textSecondary, marginBottom: 6, marginTop: spacing.sm },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: palette.offWhite, borderRadius: radius.md, borderWidth: 1, borderColor: palette.border, paddingHorizontal: spacing.md, minHeight: 46 },
  input: { flex: 1, color: palette.textPrimary, fontSize: 15, paddingVertical: 10 },
  noteWrap: { alignItems: 'flex-start', paddingTop: 12, minHeight: 90 },
  noteInput: { minHeight: 70, textAlignVertical: 'top' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: palette.darkBg, borderRadius: radius.full, paddingVertical: 15, marginTop: spacing.md, ...shadows.md },
  saveBtnText: { color: palette.white, fontSize: 15, fontWeight: '800' },
  mapBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: palette.white, borderRadius: radius.full, paddingVertical: 15, borderWidth: 1, borderColor: palette.border },
  mapBtnText: { color: palette.textPrimary, fontSize: 14, fontWeight: '800' },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#111827', borderRadius: radius.full, paddingVertical: 16, ...shadows.md },
  completeBtnText: { color: palette.white, fontSize: 15, fontWeight: '900' },
});
