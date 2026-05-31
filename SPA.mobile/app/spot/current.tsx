import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Image, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { useParkingSpot } from '@/context/ParkingSpotContext';
import { locationService } from '@/services/location.service';

let MapView: any = null;
let Marker: any = null;
if (require('react-native').Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} phút`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}p` : `${h} giờ`;
}

function formatDatetime(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}  ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

export default function CurrentSpotScreen() {
  const { currentSpot, completeSpot, loading } = useParkingSpot();
  const [lightboxUri, setLightboxUri] = React.useState<string | null>(null);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.textSecondary} />
      </View>
    );
  }

  if (!currentSpot) {
    return (
      <View style={styles.centered}>
        <Ionicons name="car-outline" size={64} color={palette.textSecondary} />
        <Text style={styles.emptyTitle}>Chưa lưu vị trí xe</Text>
        <Text style={styles.emptySub}>Bấm &quot;Tôi đã gửi xe ở đây&quot; từ bãi đỗ để lưu vị trí.</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={() => router.push('/spot/save')}>
          <Text style={styles.saveBtnText}>Lưu ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasLocation = currentSpot.latitude != null && currentSpot.longitude != null;
  const locationDetails = [currentSpot.floor, currentSpot.zone, currentSpot.column].filter(Boolean);
  const elapsed = Date.now() - new Date(currentSpot.createdAt).getTime();

  const handleComplete = () => {
    Alert.alert(
      'Đã lấy xe?',
      'Vị trí này sẽ được chuyển vào lịch sử.',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đã lấy xe ✓', style: 'destructive', onPress: async () => {
            await completeSpot();
            router.replace('/(tabs)/history');
          }
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />

      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={palette.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Xe của tôi</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Active badge */}
        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeBadgeText}>Đang gửi xe · {formatDuration(elapsed)}</Text>
        </View>

        {/* Map preview */}
        {hasLocation && MapView ? (
          <View style={styles.mapCard}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: currentSpot.latitude!,
                longitude: currentSpot.longitude!,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker coordinate={{ latitude: currentSpot.latitude!, longitude: currentSpot.longitude! }} title="Xe của tôi" />
            </MapView>
          </View>
        ) : null}

        {/* Location name */}
        {currentSpot.parkingLocationName ? (
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color={palette.textSecondary} />
            <Text style={styles.infoValue}>{currentSpot.parkingLocationName}</Text>
          </View>
        ) : null}

        {/* Detail grid */}
        {locationDetails.length > 0 && (
          <View style={styles.detailCard}>
            {currentSpot.floor ? <DetailItem label="Tầng" value={currentSpot.floor} icon="layers-outline" /> : null}
            {currentSpot.zone ? <DetailItem label="Khu / Ô" value={currentSpot.zone} icon="grid-outline" /> : null}
            {currentSpot.column ? <DetailItem label="Số cột" value={currentSpot.column} icon="barcode-outline" /> : null}
          </View>
        )}

        {currentSpot.note ? (
          <View style={styles.noteCard}>
            <Ionicons name="create-outline" size={16} color={palette.textSecondary} />
            <Text style={styles.noteText}>{currentSpot.note}</Text>
          </View>
        ) : null}

        {/* Timestamps */}
        <View style={styles.timeCard}>
          <Ionicons name="time-outline" size={16} color={palette.textSecondary} />
          <Text style={styles.timeText}>Lưu lúc {formatDatetime(currentSpot.createdAt)}</Text>
        </View>

        {/* Photos */}
        {currentSpot.photos.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Ảnh đã chụp</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              {currentSpot.photos.map((p, i) => (
                <TouchableOpacity key={i} onPress={() => setLightboxUri(p.uri)} activeOpacity={0.85}>
                  <Image source={{ uri: p.uri }} style={styles.photoThumb} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Lightbox */}
        <Modal visible={lightboxUri !== null} transparent animationType="fade" onRequestClose={() => setLightboxUri(null)}>
          <View style={styles.lightboxOverlay}>
            <TouchableOpacity style={styles.lightboxClose} onPress={() => setLightboxUri(null)}>
              <Ionicons name="close-circle" size={36} color="white" />
            </TouchableOpacity>
            {lightboxUri && (
              <Image source={{ uri: lightboxUri }} style={styles.lightboxImage} resizeMode="contain" />
            )}
          </View>
        </Modal>

        {/* Navigate button */}
        {hasLocation && (
          <TouchableOpacity
            style={styles.navigateBtn}
            onPress={() => locationService.openMapsNavigation(currentSpot.latitude!, currentSpot.longitude!, 'Xe của tôi')}
          >
            <Ionicons name="navigate-outline" size={20} color={palette.white} />
            <Text style={styles.navigateBtnText}>Chỉ đường tới xe</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer: complete button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
          <Ionicons name="checkmark-circle-outline" size={22} color={palette.white} />
          <Text style={styles.completeBtnText}>Đã lấy xe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DetailItem({ label, value, icon }: { label: string; value: string; icon: any }) {
  return (
    <View style={styles.detailItem}>
      <Ionicons name={icon} size={16} color={palette.textSecondary} />
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.offWhite },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md, backgroundColor: palette.offWhite },
  emptyTitle: { ...typography.h2, color: palette.textPrimary, textAlign: 'center' },
  emptySub: { ...typography.body, color: palette.textSecondary, textAlign: 'center' },
  saveBtn: { marginTop: spacing.md, backgroundColor: palette.darkBg, paddingHorizontal: 28, paddingVertical: 14, borderRadius: radius.full },
  saveBtnText: { color: palette.white, fontWeight: '800', fontSize: 15 },

  header: { backgroundColor: palette.darkBg, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h2, color: palette.white },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#D1FAE5', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: spacing.md },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#059669' },
  activeBadgeText: { fontSize: 13, fontWeight: '700', color: '#065F46' },

  mapCard: { height: 180, borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.md, ...shadows.sm },
  map: { flex: 1 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md, backgroundColor: palette.white, borderRadius: radius.lg, padding: spacing.md, ...shadows.sm },
  infoValue: { fontSize: 15, fontWeight: '700', color: palette.textPrimary, flex: 1 },

  detailCard: { backgroundColor: palette.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: '40%' },
  detailLabel: { fontSize: 10, color: palette.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  detailValue: { fontSize: 18, fontWeight: '900', color: palette.textPrimary },

  noteCard: { flexDirection: 'row', gap: 8, backgroundColor: '#FFFBEB', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: '#FDE68A' },
  noteText: { flex: 1, fontSize: 14, color: '#92400E', fontWeight: '500' },

  timeCard: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: spacing.lg },
  timeText: { fontSize: 12, color: palette.textSecondary },

  sectionLabel: { fontSize: 12, fontWeight: '700', color: palette.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  photoScroll: { marginBottom: spacing.lg },
  photoThumb: { width: 120, height: 120, borderRadius: radius.md, marginRight: spacing.sm },
  lightboxOverlay: { flex: 1, backgroundColor: '#000000EE', justifyContent: 'center', alignItems: 'center' },
  lightboxImage: { width: '100%', height: '80%' },
  lightboxClose: { position: 'absolute', top: 48, right: 20, zIndex: 10 },

  navigateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1976D2', borderRadius: radius.full, paddingVertical: 14, marginBottom: spacing.md },
  navigateBtnText: { color: palette.white, fontSize: 15, fontWeight: '800' },

  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: palette.white },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#059669', paddingVertical: 18, borderRadius: radius.full, ...shadows.md },
  completeBtnText: { color: palette.white, fontSize: 16, fontWeight: '800' },
});
