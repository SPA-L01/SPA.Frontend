import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { mockParkingLots } from '@/constants/mockData';
import { parkingService } from '@/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TIME_OPTIONS = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '10:00 - 14:00',
  '12:00 - 16:00',
  '14:00 - 18:00',
  '16:00 - 20:00',
  '18:00 - 22:00',
];

// ── Normalize a backend slot to the internal shape ──────────────────
interface ApiSlot {
  id: string;
  slotNumber: string;
  vehicleType: 'car' | 'motorbike' | 'bicycle';
  status: 'available' | 'occupied' | 'reserved' | 'blocked';
}

interface DisplaySlot extends ApiSlot {
  isOccupied: boolean;
  isSelected: boolean;
}

function toDisplaySlot(s: ApiSlot): DisplaySlot {
  return {
    ...s,
    isOccupied: s.status !== 'available',
    isSelected: false,
  };
}

// ── Slot Cell ───────────────────────────────────────────────────────
function SlotCell({
  slot,
  onPress,
}: {
  slot: DisplaySlot;
  onPress: (slot: DisplaySlot) => void;
}) {
  if (slot.isOccupied) {
    return (
      <View style={[styles.slotCell, styles.slotOccupied]}>
        <View style={styles.carTop}>
          <View style={styles.carBody}>
            <View style={styles.carRoof} />
            <View style={styles.carWheelRow}>
              <View style={styles.carWheel} />
              <View style={styles.carWheel} />
            </View>
            <View style={styles.carWheelRow}>
              <View style={styles.carWheel} />
              <View style={styles.carWheel} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (slot.isSelected) {
    return (
      <TouchableOpacity
        style={[styles.slotCell, styles.slotSelected]}
        onPress={() => onPress(slot)}
        activeOpacity={0.8}
      >
        <View style={styles.selectedBadge}>
          <Ionicons name="checkmark" size={12} color={palette.white} />
          <Text style={styles.selectedCode}>{slot.slotNumber}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.slotCell, styles.slotAvailable]}
      onPress={() => onPress(slot)}
      activeOpacity={0.7}
    >
      <Text style={styles.slotCode}>{slot.slotNumber}</Text>
    </TouchableOpacity>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────
export default function ParkingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Parking lot info — from API, fallback to mock
  const [lot, setLot] = useState<any>(
    mockParkingLots.find((l) => l.id === id) ?? mockParkingLots[2]
  );
  const [lotLoading, setLotLoading] = useState(true);

  // Slots from API
  const [allSlots, setAllSlots] = useState<DisplaySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  // Vehicle type filter
  const [vehicleFilter, setVehicleFilter] = useState<'car' | 'motorbike' | 'bicycle'>('car');
  const [selectedSlot, setSelectedSlot] = useState<DisplaySlot | null>(null);
  const [selectedTime, setSelectedTime] = useState('10:00 - 14:00');
  const [showTimeModal, setShowTimeModal] = useState(false);

  // Load lot detail
  useEffect(() => {
    if (!id) return;
    parkingService.getLocationDetail(id)
      .then((data) => setLot(data))
      .catch(() => {/* keep mock */})
      .finally(() => setLotLoading(false));
  }, [id]);

  // Load slots
  useEffect(() => {
    if (!id) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    parkingService.getSlots(id)
      .then((data: ApiSlot[]) => setAllSlots(data.map(toDisplaySlot)))
      .catch(() => setAllSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [id]);

  const handleSlotPress = useCallback((slot: DisplaySlot) => {
    setAllSlots((prev) =>
      prev.map((s) => ({
        ...s,
        isSelected: s.id === slot.id ? !s.isSelected : false,
      }))
    );
    setSelectedSlot((prev) => (prev?.id === slot.id ? null : slot));
  }, []);

  // Filter slots by vehicle type
  const filteredSlots = allSlots.filter((s) => s.vehicleType === vehicleFilter);
  const leftSlots = filteredSlots.filter((_, i) => i % 2 === 0);
  const rightSlots = filteredSlots.filter((_, i) => i % 2 === 1);

  const availableCount = filteredSlots.filter((s) => !s.isOccupied).length;

  // Price calc
  const [startH, endH] = selectedTime
    .split(' - ')
    .map((t) => parseInt(t.split(':')[0], 10));
  const hours = endH - startH;
  const hourlyRate = lot?.price ?? Number(lot?.hourlyRate ?? 0);
  const totalPrice = hours * hourlyRate;

  const lotName = lot?.name ?? '—';
  const lotAddress = lot?.address ?? '';
  const lotImage = lot?.imageUrl || `https://picsum.photos/seed/${id}/800/400`;
  const is24h = lot?.is24h ?? false;
  const openHours = is24h ? '24/7' : `${lot?.openTime ?? '07:00'} – ${lot?.closeTime ?? '22:00'}`;

  const VEHICLE_TABS: { key: 'car' | 'motorbike' | 'bicycle'; label: string; icon: string }[] = [
    { key: 'car', label: 'Xe hơi', icon: 'car' },
    { key: 'motorbike', label: 'Moto', icon: 'bicycle' },
    { key: 'bicycle', label: 'Xe đạp', icon: 'bicycle-outline' as any },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Header Image ── */}
      <View style={styles.headerImg}>
        <Image source={{ uri: lotImage }} style={StyleSheet.absoluteFillObject} />
        <View style={styles.headerOverlay} />
        <SafeAreaView>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={palette.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.lotName}>{lotName}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={palette.white} />
              <Text style={styles.lotAddress} numberOfLines={1}>{lotAddress}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color={palette.white} />
              <Text style={styles.lotAddress}>{openHours}</Text>
              <View style={styles.rateChip}>
                <Text style={styles.rateChipText}>{Number(hourlyRate).toLocaleString()}đ/h</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ── Vehicle Type Filter ── */}
      <View style={styles.vehicleRow}>
        {VEHICLE_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.vehicleTab, vehicleFilter === tab.key && styles.vehicleTabActive]}
            onPress={() => { setVehicleFilter(tab.key); setSelectedSlot(null); }}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={vehicleFilter === tab.key ? palette.white : palette.textSecondary}
            />
            <Text style={[styles.vehicleLabel, vehicleFilter === tab.key && styles.vehicleLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.availableBadge}>
          <Text style={styles.availableText}>{availableCount} trống</Text>
        </View>
      </View>

      {/* ── Time Selector ── */}
      <TouchableOpacity style={styles.timeSelector} onPress={() => setShowTimeModal(true)}>
        <Ionicons name="time-outline" size={18} color={palette.textPrimary} />
        <Text style={styles.timeSelectorText}>{selectedTime}</Text>
        <Ionicons name="chevron-down" size={16} color={palette.textSecondary} />
      </TouchableOpacity>

      {/* ── Slot Grid ── */}
      {slotsLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={palette.darkBg} />
          <Text style={styles.loadingText}>Đang tải chỗ đỗ xe...</Text>
        </View>
      ) : filteredSlots.length === 0 ? (
        <View style={styles.loadingWrap}>
          <Ionicons name="car-outline" size={40} color={palette.textSecondary} />
          <Text style={styles.loadingText}>Không có dữ liệu chỗ đỗ</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.gridScroll}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.entryArrow}>
            <View style={styles.arrowLine} />
            <View style={styles.arrowHead} />
          </View>
          <View style={styles.gridWrapper}>
            <View style={styles.dashedLane} />
            <View style={styles.column}>
              {leftSlots.map((slot) => (
                <SlotCell key={slot.id} slot={slot} onPress={handleSlotPress} />
              ))}
            </View>
            <View style={styles.column}>
              {rightSlots.map((slot) => (
                <SlotCell key={slot.id} slot={slot} onPress={handleSlotPress} />
              ))}
            </View>
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* ── Footer ── */}
      <View style={styles.footerCol}>
        <TouchableOpacity
          style={styles.savedHereBtn}
          onPress={() =>
            router.push({
              pathname: '/spot/save',
              params: { parkingLocationId: lot?.id ?? id, parkingLocationName: lotName },
            })
          }
        >
          <Ionicons name="location-outline" size={16} color="#059669" />
          <Text style={styles.savedHereBtnText}>Tôi đã gửi xe ở đây</Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Tổng thanh toán</Text>
            <Text style={styles.priceValue}>
              {totalPrice.toLocaleString()}đ{' '}
              <Text style={styles.priceSub}>/ {hours} giờ</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.bookBtn, !selectedSlot && styles.bookBtnDisabled]}
            activeOpacity={0.85}
            disabled={!selectedSlot}
            onPress={() => {
              router.push({
                pathname: '/payment/checkout',
                params: {
                  lotId: lot?.id ?? id,
                  slotCode: selectedSlot?.slotNumber,
                  slotId: selectedSlot?.id,
                  price: totalPrice.toString(),
                },
              });
            }}
          >
            <Text style={styles.bookBtnText}>
              {selectedSlot ? 'Đặt chỗ ngay' : 'Chọn chỗ đỗ'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Time Modal ── */}
      <Modal transparent visible={showTimeModal} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn khung giờ</Text>
            {TIME_OPTIONS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.modalOption, selectedTime === t && styles.modalOptionSelected]}
                onPress={() => { setSelectedTime(t); setShowTimeModal(false); }}
              >
                <Text style={[styles.modalOptionText, selectedTime === t && styles.modalOptionTextSelected]}>
                  {t}
                </Text>
                {selectedTime === t && (
                  <Ionicons name="checkmark" size={18} color={palette.white} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.offWhite },

  // ── Header Image
  headerImg: {
    height: 200,
    backgroundColor: palette.darkBg,
    overflow: 'hidden',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000070',
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: 4,
  },
  lotName: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.white,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  lotAddress: {
    fontSize: 13,
    color: '#FFFFFFCC',
    flex: 1,
  },
  rateChip: {
    backgroundColor: palette.white,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 8,
  },
  rateChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.darkBg,
  },

  // ── Vehicle Tabs
  vehicleRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: palette.white,
    gap: spacing.xs,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  vehicleTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: palette.offWhite,
    borderWidth: 1,
    borderColor: palette.border,
  },
  vehicleTabActive: {
    backgroundColor: palette.darkBg,
    borderColor: palette.darkBg,
  },
  vehicleLabel: { fontSize: 12, fontWeight: '600', color: palette.textSecondary },
  vehicleLabelActive: { color: palette.white },
  availableBadge: {
    marginLeft: 'auto',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  availableText: { fontSize: 12, fontWeight: '700', color: '#065F46' },

  // ── Time Selector
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  timeSelectorText: { ...typography.body, color: palette.textPrimary, flex: 1, fontWeight: '500' },

  // ── Loading
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: { ...typography.body, color: palette.textSecondary },

  // ── Grid
  gridScroll: { flex: 1 },
  gridContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  entryArrow: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    height: 40,
    justifyContent: 'flex-end',
  },
  arrowLine: { width: 2, height: 28, backgroundColor: palette.textSecondary, marginBottom: -2 },
  arrowHead: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 12,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: palette.offWhite,
    transform: [{ rotate: '180deg' }],
  },
  gridWrapper: {
    flexDirection: 'row',
    gap: spacing.md,
    position: 'relative',
    width: '100%',
  },
  dashedLane: {
    position: 'absolute',
    left: '50%',
    top: 0, bottom: 0,
    width: 2,
    borderWidth: 1,
    borderColor: palette.textSecondary,
    borderStyle: 'dashed',
  },
  column: { flex: 1, gap: spacing.sm },

  // ── Slot Cells
  slotCell: {
    height: 80,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  slotAvailable: {
    backgroundColor: palette.white,
    borderColor: palette.border,
  },
  slotOccupied: {
    backgroundColor: palette.offWhite,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  slotSelected: {
    backgroundColor: palette.darkBg,
    borderColor: palette.darkBg,
    borderStyle: 'solid',
  },
  slotCode: { ...typography.caption, color: palette.textSecondary, fontWeight: '600' },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: palette.darkBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  selectedCode: { ...typography.caption, color: palette.white, fontWeight: '700' },
  carTop: { alignItems: 'center', justifyContent: 'center' },
  carBody: {
    width: 36, height: 58,
    backgroundColor: '#C8C8CC',
    borderRadius: 6,
    alignItems: 'center',
    padding: 4, gap: 2,
  },
  carRoof: { width: 24, height: 16, backgroundColor: '#A8A8B0', borderRadius: 4 },
  carWheelRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  carWheel: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3A3A3C' },

  // ── Footer
  footerCol: { backgroundColor: palette.white, borderTopWidth: 1, borderTopColor: palette.border, ...shadows.md },
  savedHereBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, backgroundColor: '#D1FAE5',
  },
  savedHereBtnText: { fontSize: 13, fontWeight: '700', color: '#059669' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: palette.white,
  },
  priceSection: { gap: 2 },
  priceLabel: { ...typography.caption, color: palette.textSecondary },
  priceValue: { fontSize: 22, fontWeight: '800', color: palette.textPrimary },
  priceSub: { fontSize: 14, fontWeight: '400', color: palette.textSecondary },
  bookBtn: {
    backgroundColor: palette.darkBg,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: radius.full,
    ...shadows.md,
  },
  bookBtnDisabled: { backgroundColor: palette.textSecondary },
  bookBtnText: { ...typography.body, color: palette.white, fontWeight: '700' },

  // ── Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: palette.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  modalTitle: {
    ...typography.h2,
    color: palette.textPrimary,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  modalOptionSelected: { backgroundColor: palette.darkBg },
  modalOptionText: { ...typography.body, color: palette.textPrimary },
  modalOptionTextSelected: { color: palette.white, fontWeight: '600' },
});
