import React, { useState } from 'react';
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
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { mockParkingLots, generateParkingSlots, ParkingSlot } from '@/constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_COLS = 2;
const SLOT_WIDTH = (SCREEN_WIDTH - spacing.md * 2 - spacing.md) / GRID_COLS;

const TIME_OPTIONS = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '10:00 - 14:00',
  '12:00 - 16:00',
  '14:00 - 18:00',
  '16:00 - 20:00',
  '18:00 - 22:00',
];

function SlotCell({
  slot,
  onPress,
}: {
  slot: ParkingSlot;
  onPress: (slot: ParkingSlot) => void;
}) {
  if (slot.isOccupied) {
    return (
      <View style={[styles.slotCell, styles.slotOccupied]}>
        {/* Car icon (top view) */}
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
          <Ionicons name="time" size={10} color={palette.white} />
          <Text style={styles.selectedCode}>{slot.code}</Text>
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
      <Text style={styles.slotCode}>{slot.code}</Text>
    </TouchableOpacity>
  );
}

export default function ParkingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lot = mockParkingLots.find((l) => l.id === id) ?? mockParkingLots[2];

  const [selectedFloor, setSelectedFloor] = useState(lot.floors[1] ?? lot.floors[0]);
  const [selectedTime, setSelectedTime] = useState('10:00 - 14:00');
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [slots, setSlots] = useState<ParkingSlot[]>(() =>
    generateParkingSlots(selectedFloor)
  );
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  const handleFloorChange = (floor: string) => {
    setSelectedFloor(floor);
    setSlots(generateParkingSlots(floor));
    setSelectedSlot(null);
    setShowFloorModal(false);
  };

  const handleSlotPress = (slot: ParkingSlot) => {
    setSlots((prev) =>
      prev.map((s) => ({
        ...s,
        isSelected: s.id === slot.id ? !s.isSelected : false,
      }))
    );
    setSelectedSlot((prev) => (prev?.id === slot.id ? null : slot));
  };

  // Calculate price
  const [startH, endH] = selectedTime
    .split(' - ')
    .map((t) => parseInt(t.split(':')[0], 10));
  const hours = endH - startH;
  const totalPrice = hours * lot.price;

  // Split into two columns
  const leftSlots = slots.filter((_, i) => i % 2 === 0);
  const rightSlots = slots.filter((_, i) => i % 2 === 1);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.offWhite} />

      {/* Header */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{lot.name}</Text>
          <View style={{ width: 42 }} />
        </View>

        {/* Selectors */}
        <View style={styles.selectorRow}>
          {/* Floor Dropdown */}
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowFloorModal(true)}
          >
            <Text style={styles.selectorText}>{selectedFloor}</Text>
            <Ionicons name="chevron-down" size={16} color={palette.textPrimary} />
          </TouchableOpacity>

          {/* Time Selector */}
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowTimeModal(true)}
          >
            <Text style={styles.selectorText}>{selectedTime}</Text>
            <Ionicons name="time-outline" size={16} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Parking Grid */}
      <ScrollView
        style={styles.gridScroll}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Entry Arrow */}
        <View style={styles.entryArrow}>
          <View style={styles.arrowLine} />
          <View style={styles.arrowHead} />
        </View>

        {/* Two-column grid */}
        <View style={styles.gridWrapper}>
          {/* Dashed lane */}
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

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>
            ${totalPrice}{' '}
            <Text style={styles.priceSub}>/ {hours} hours</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, !selectedSlot && styles.bookBtnDisabled]}
          activeOpacity={0.85}
          disabled={!selectedSlot}
        >
          <Text style={styles.bookBtnText}>Book Slot</Text>
        </TouchableOpacity>
      </View>

      {/* Floor Modal */}
      <Modal transparent visible={showFloorModal} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFloorModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Floor</Text>
            {lot.floors.map((floor) => (
              <TouchableOpacity
                key={floor}
                style={[
                  styles.modalOption,
                  selectedFloor === floor && styles.modalOptionSelected,
                ]}
                onPress={() => handleFloorChange(floor)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedFloor === floor && styles.modalOptionTextSelected,
                  ]}
                >
                  {floor}
                </Text>
                {selectedFloor === floor && (
                  <Ionicons name="checkmark" size={18} color={palette.white} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Modal */}
      <Modal transparent visible={showTimeModal} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
            {TIME_OPTIONS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.modalOption,
                  selectedTime === t && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setSelectedTime(t);
                  setShowTimeModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedTime === t && styles.modalOptionTextSelected,
                  ]}
                >
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
  safeArea: { backgroundColor: palette.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: palette.white,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.h2, color: palette.textPrimary },

  selectorRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: palette.white,
  },
  selector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.offWhite,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  selectorText: { ...typography.body, color: palette.textPrimary, fontWeight: '500' },

  // Grid
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
  arrowLine: {
    width: 2,
    height: 28,
    backgroundColor: palette.textSecondary,
    marginBottom: -2,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
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
    top: 0,
    bottom: 0,
    width: 2,
    borderWidth: 1,
    borderColor: palette.textSecondary,
    borderStyle: 'dashed',
  },
  column: {
    flex: 1,
    gap: spacing.sm,
  },

  // Slot cells
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
  slotCode: {
    ...typography.caption,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: palette.darkBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  selectedCode: {
    ...typography.caption,
    color: palette.white,
    fontWeight: '700',
  },

  // Car SVG-like drawing
  carTop: { alignItems: 'center', justifyContent: 'center' },
  carBody: {
    width: 36,
    height: 58,
    backgroundColor: '#C8C8CC',
    borderRadius: 6,
    alignItems: 'center',
    padding: 4,
    gap: 2,
  },
  carRoof: {
    width: 24,
    height: 16,
    backgroundColor: '#A8A8B0',
    borderRadius: 4,
  },
  carWheelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  carWheel: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3A3A3C',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: palette.white,
    ...shadows.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  priceSection: { gap: 2 },
  priceLabel: { ...typography.caption, color: palette.textSecondary },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  priceSub: { fontSize: 14, fontWeight: '400', color: palette.textSecondary },
  bookBtn: {
    backgroundColor: palette.darkBg,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: radius.full,
    ...shadows.md,
  },
  bookBtnDisabled: { backgroundColor: palette.textSecondary },
  bookBtnText: { ...typography.body, color: palette.white, fontWeight: '700' },

  // Modal
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
