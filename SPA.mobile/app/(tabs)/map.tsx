import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  TextInput,
  Keyboard,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { mockParkingLots, DEFAULT_LOCATION } from '@/constants/mockData';
import { parkingService } from '@/services/api';

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

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

function normalizeParkingLot(lot: any) {
  const latitude = Number(lot.latitude ?? lot.coordinate?.latitude ?? DEFAULT_LOCATION.latitude);
  const longitude = Number(lot.longitude ?? lot.coordinate?.longitude ?? DEFAULT_LOCATION.longitude);
  return {
    ...lot,
    coordinate: lot.coordinate ?? { latitude, longitude },
    price: lot.price ?? Number(lot.hourlyRate ?? 0),
    freeSlots: lot.freeSlots ?? lot.availableSlots ?? 0,
    distance: typeof lot.distance === 'number' ? lot.distance : null,
    imageUrl: lot.imageUrl || `https://picsum.photos/seed/${lot.slug ?? lot.id}/400/240`,
  };
}

export default function MapScreen() {
  const [search, setSearch] = useState('');
  const [selectedLot, setSelectedLot] = useState<any | null>(null);
  const [parkingLots, setParkingLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const mapRef = useRef<any>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['18%', '45%', '85%'], []);

  const fetchLots = useCallback(async (lat = DEFAULT_LOCATION.latitude, lng = DEFAULT_LOCATION.longitude, searchQuery = '') => {
    setLoading(true);
    try {
      let data;
      if (searchQuery) {
        data = await parkingService.getLocations({ search: searchQuery, limit: 20 });
        data = Array.isArray(data) ? data : data?.data ?? [];
      } else {
        data = await parkingService.getNearbyLocations(lat, lng, 10);
      }
      
      if (data && data.length > 0) {
        setParkingLots(data.slice(0, 50).map(normalizeParkingLot)); // Giới hạn tối đa 50 bãi gần nhất để tránh map bị lag/crash do quá nhiều Marker
      } else {
        setParkingLots([]);
      }
    } catch (error) {
      console.error('Failed to fetch parking locations:', error);
      setParkingLots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial GPS Init
  useEffect(() => {
    const initGps = async () => {
      if (Platform.OS === 'web') {
        fetchLots();
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationDenied(true);
        fetchLots();
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setCurrentLocation(coords);
      fetchLots(coords.latitude, coords.longitude);

      requestAnimationFrame(() => {
        mapRef.current?.animateToRegion({
          ...coords,
          latitudeDelta: 0.018,
          longitudeDelta: 0.018,
        }, 600);
      });
    };

    initGps();
  }, [fetchLots]);

  // Search logic (debounced)
  useEffect(() => {
    if (search.length === 0) {
      if (currentLocation) fetchLots(currentLocation.latitude, currentLocation.longitude);
      else fetchLots();
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchLots(currentLocation?.latitude, currentLocation?.longitude, search);
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [search, currentLocation, fetchLots]);

  const filteredLots = useMemo(() =>
    parkingLots.filter((l) =>
      (l.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (l.address ?? '').toLowerCase().includes(search.toLowerCase())
    ),
    [parkingLots, search]
  );

  const handleSheetChanges = useCallback((index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const onMarkerPress = (lot: any) => {
    setSelectedLot(lot);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    bottomSheetRef.current?.snapToIndex(1);
    mapRef.current?.animateToRegion({
      latitude: lot.coordinate.latitude - 0.005,
      longitude: lot.coordinate.longitude,
      latitudeDelta: 0.018,
      longitudeDelta: 0.018,
    }, 500);
  };

  const onDismissSelected = () => {
    setSelectedLot(null);
    Keyboard.dismiss();
  };

  const recenter = async () => {
    setSelectedLot(null);

    if (currentLocation) {
      mapRef.current?.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.018,
        longitudeDelta: 0.018,
      }, 500);
      return;
    }

    if (locationDenied) {
      Alert.alert('Chưa bật GPS', 'Bạn cần cấp quyền vị trí để app biết bạn đang ở đâu trên bản đồ.');
      mapRef.current?.animateToRegion(DEFAULT_LOCATION, 500);
      return;
    }

    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setCurrentLocation(coords);
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.018, longitudeDelta: 0.018 }, 500);
    } catch {
      mapRef.current?.animateToRegion(DEFAULT_LOCATION, 500);
    }
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
          onPress={onDismissSelected}
        >
          {Marker && currentLocation && (
            <Marker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.userMarkerOuter}>
                <View style={styles.userMarkerPulse} />
                <View style={styles.userMarkerDot} />
              </View>
            </Marker>
          )}

          {Marker && parkingLots.map((lot) => (
            <Marker
              key={lot.id}
              coordinate={lot.coordinate}
              onPress={(e: any) => { e.stopPropagation?.(); onMarkerPress(lot); }}
            >
              <View style={[styles.markerContainer, selectedLot?.id === lot.id && styles.markerSelected]}>
                <View style={[styles.markerPContent, selectedLot?.id === lot.id && styles.markerPContentSelected]}>
                  <Text style={[styles.markerP, selectedLot?.id === lot.id && styles.markerPSelected]}>P</Text>
                </View>
                {selectedLot?.id === lot.id && (
                  <View style={styles.markerInfo}>
                    <Text style={styles.markerPriceText}>{Number(lot.price).toLocaleString()}đ</Text>
                    <Text style={styles.markerFreeText}>{lot.freeSlots} trống</Text>
                  </View>
                )}
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={[styles.map, styles.mapPlaceholder]}>
          <Ionicons name="map-outline" size={48} color={palette.textSecondary} />
          <Text style={{ color: palette.textSecondary, marginTop: 8 }}>Bản đồ khả dụng trên thiết bị di động</Text>
        </View>
      )}

      {/* ── Top Overlay ─────────────────────────────────── */}
      <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.fabBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.fabBtn} onPress={recenter}>
            <Ionicons name="navigate" size={20} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── Selected Lot Info Card (over map) ──────────── */}
      {selectedLot && (
        <View style={styles.infoCard} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.infoCardInner}
            activeOpacity={0.95}
            onPress={() => router.push(`/parking/${selectedLot.id}`)}
          >
            <Image source={{ uri: selectedLot.imageUrl }} style={styles.infoCardImage} />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardName} numberOfLines={1}>{selectedLot.name}</Text>
              <Text style={styles.infoCardAddress} numberOfLines={1}>{selectedLot.address}</Text>
              <View style={styles.infoCardRow}>
                <View style={styles.infoCardBadge}>
                  <Ionicons name="car-outline" size={12} color={palette.white} />
                  <Text style={styles.infoCardBadgeText}>{selectedLot.freeSlots} trống</Text>
                </View>
                <Text style={styles.infoCardPrice}>
                  {Number(selectedLot.price).toLocaleString()}đ/giờ
                </Text>
              </View>
            </View>
            <View style={styles.infoCardAction}>
              <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoCardClose} onPress={onDismissSelected}>
            <Ionicons name="close" size={16} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Bottom Sheet ─────────────────────────────────── */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.sheetHeader}>
          <View style={styles.sheetTitleRow}>
            <Text style={styles.sheetTitle}>
              {loading ? 'Đang tải...' : `${filteredLots.length} bãi xe khu vực HCM`}
            </Text>
          </View>

          {/* Search box - dùng TextInput thường trong BottomSheetView */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={palette.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm tên hoặc địa chỉ bãi xe..."
              placeholderTextColor={palette.textSecondary}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={palette.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </BottomSheetView>

        <BottomSheetFlatList
          data={filteredLots}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listCard}
              activeOpacity={0.85}
              onPress={() => {
                onMarkerPress(item);
                router.push(`/parking/${item.id}`);
              }}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.listCardImage} />
              <View style={styles.listCardContent}>
                <Text style={styles.listCardName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.listCardAddress} numberOfLines={1}>{item.address}</Text>
                <View style={styles.listCardFooter}>
                  <View style={styles.slotBadge}>
                    <View style={[styles.slotDot, item.freeSlots > 10 ? styles.slotDotGreen : styles.slotDotOrange]} />
                    <Text style={styles.slotText}>{item.freeSlots} chỗ trống</Text>
                  </View>
                  <Text style={styles.priceText}>{Number(item.price).toLocaleString()}đ/h</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color={palette.textSecondary} />
              <Text style={styles.emptyText}>Không tìm thấy bãi xe</Text>
            </View>
          }
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.offWhite },

  // ── Map
  map: { flex: 1 },
  mapPlaceholder: {
    backgroundColor: '#E8E8EA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Top Overlay
  topOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  fabBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },

  // ── Marker
  userMarkerOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#007AFF33',
    borderWidth: 1,
    borderColor: '#007AFF66',
  },
  userMarkerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: palette.white,
    ...shadows.md,
  },
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
    paddingRight: 10,
  },
  markerPContent: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPContentSelected: { backgroundColor: palette.darkBg },
  markerP: { color: palette.white, fontWeight: '800', fontSize: 15 },
  markerPSelected: { color: palette.white },
  markerInfo: { marginLeft: 6 },
  markerPriceText: { color: palette.textPrimary, fontSize: 12, fontWeight: '800' },
  markerFreeText: { color: palette.textSecondary, fontSize: 10, fontWeight: '500' },

  // ── Info Card (overlay above bottom sheet)
  infoCard: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.47,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: palette.white,
    borderRadius: radius.xl,
    ...shadows.lg,
    zIndex: 20,
  },
  infoCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  infoCardImage: {
    width: 68,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: palette.offWhite,
  },
  infoCardContent: { flex: 1, gap: 3 },
  infoCardName: {
    ...typography.h3,
    color: palette.textPrimary,
    fontWeight: '700',
  },
  infoCardAddress: {
    ...typography.caption,
    color: palette.textSecondary,
  },
  infoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  infoCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  infoCardBadgeText: {
    color: palette.white,
    fontSize: 11,
    fontWeight: '700',
  },
  infoCardPrice: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  infoCardAction: { paddingRight: spacing.xs },
  infoCardClose: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: palette.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    ...shadows.sm,
  },

  // ── Bottom Sheet
  sheetBackground: {
    backgroundColor: palette.white,
    borderRadius: 24,
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
    gap: spacing.sm,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    ...typography.h3,
    color: palette.textPrimary,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.offWhite,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: palette.textPrimary,
    paddingVertical: 0,
  },

  // ── List Card
  listCard: {
    flexDirection: 'row',
    backgroundColor: palette.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.border,
    ...shadows.sm,
  },
  listCardImage: {
    width: 80,
    height: 88,
    backgroundColor: palette.offWhite,
  },
  listCardContent: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  listCardName: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  listCardAddress: {
    ...typography.caption,
    color: palette.textSecondary,
    marginTop: 2,
  },
  listCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  slotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  slotDotGreen: { backgroundColor: '#34C759' },
  slotDotOrange: { backgroundColor: '#FF9F0A' },
  slotText: {
    ...typography.caption,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  priceText: {
    ...typography.caption,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  listContent: {
    paddingBottom: 40,
    paddingTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: palette.textSecondary,
  },
});
