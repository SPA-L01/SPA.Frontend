import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
  TextInput,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList, BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';

import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { ParkingCard } from '@/components/ui/ParkingCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { mockParkingLots, DEFAULT_LOCATION } from '@/constants/mockData';

// react-native-maps is native-only
let MapView: any = null;
let Marker: any = null;
let PROVIDER_DEFAULT: any = null;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_DEFAULT = Maps.PROVIDER_DEFAULT;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MapScreen() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  // Bottom Sheet logic
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['18%', '50%', '90%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const filteredLots = mockParkingLots.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.address.toLowerCase().includes(search.toLowerCase())
  );

  const onMarkerPress = (lot: any) => {
    setSelectedId(lot.id);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    bottomSheetRef.current?.snapToIndex(1); // Mở lên mức trung bình
    
    mapRef.current?.animateToRegion({
      ...lot.coordinate,
      latitude: lot.coordinate.latitude - 0.004, // Bù trừ để điểm không bị che bởi BottomSheet
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    }, 500);
  };

  const recenter = () => {
    mapRef.current?.animateToRegion(DEFAULT_LOCATION, 500);
  };

  return (
    <View style={styles.root}>
      {/* ── Full-screen Map ─────────────────────────────── */}
      {MapView ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={DEFAULT_LOCATION}
          showsUserLocation
          showsMyLocationButton={false}
          onPress={() => {
            setSelectedId(null);
            Keyboard.dismiss();
          }}
        >
          {Marker && mockParkingLots.map((lot) => (
            <Marker
              key={lot.id}
              coordinate={lot.coordinate}
              onPress={() => onMarkerPress(lot)}
            >
              <View
                style={[
                  styles.markerContainer,
                  selectedId === lot.id && styles.markerSelected,
                ]}
              >
                <View style={[styles.markerPContent, selectedId === lot.id && styles.markerPContentSelected]}>
                   <Text style={[styles.markerP, selectedId === lot.id && styles.markerPSelected]}>P</Text>
                </View>
                {selectedId === lot.id && (
                  <View style={styles.markerInfo}>
                    <Text style={styles.markerPriceText}>
                      {lot.price.toLocaleString()}đ
                    </Text>
                    <Text style={styles.markerFreeText}>
                      {lot.freeSlots} trống
                    </Text>
                  </View>
                )}
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={[styles.map, styles.mapPlaceholder]}>
          <Ionicons name="map-outline" size={48} color={palette.textSecondary} />
          <Text style={{ color: palette.textSecondary, marginTop: 8 }}>
            Bản đồ khả dụng trên thiết bị di động
          </Text>
        </View>
      )}

      {/* ── Top Overlays ─────────────────────────────────── */}
      <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity style={styles.actionFab} onPress={recenter}>
            <Ionicons name="navigate" size={20} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── Enhanced Bottom Sheet ────────────────────────── */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Bãi xe khu vực Hồ Chí Minh</Text>
          <View style={styles.localSearchWrapper}>
            <Ionicons name="search-outline" size={20} color={palette.textSecondary} />
            <BottomSheetTextInput
              style={styles.localSearchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm kiếm bãi xe..."
              placeholderTextColor={palette.textSecondary}
            />
          </View>
        </BottomSheetView>

        <BottomSheetFlatList
          data={filteredLots}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ParkingCard lot={item} variant="default" />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.offWhite,
  },

  // ── Map ──────────────────────────────────────────────
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    backgroundColor: '#E8E8EA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Top Overlay ───────────────────────────────────────
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  actionFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },

  // ── Marker ───────────────────────────────────────────
  markerContainer: {
    flexDirection: 'row',
    backgroundColor: palette.white,
    borderRadius: radius.full,
    padding: 3,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.white,
    ...shadows.md,
  },
  markerSelected: {
    borderColor: palette.darkBg,
    paddingRight: 12,
  },
  markerPContent: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: palette.darkBg,
      alignItems: 'center',
      justifyContent: 'center',
  },
  markerPContentSelected: {
      backgroundColor: palette.darkBg,
  },
  markerP: {
    color: palette.white,
    fontWeight: '800',
    fontSize: 16,
  },
  markerPSelected: {
      color: palette.white,
  },
  markerInfo: {
      marginLeft: 8,
  },
  markerPriceText: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  markerFreeText: {
    color: palette.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },

  // ── Bottom Sheet ──────────────────────────────────────
  sheetBackground: {
    backgroundColor: palette.white,
    borderRadius: radius.xl * 2,
    ...shadows.lg,
  },
  handleIndicator: {
    backgroundColor: palette.border,
    width: 40,
  },
  sheetHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.h2,
    color: palette.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  searchWrapper: {
    marginBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
  localSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.offWhite,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
    marginTop: spacing.sm,
  },
  localSearchInput: {
    flex: 1,
    ...typography.body,
    color: palette.textPrimary,
  },
});
