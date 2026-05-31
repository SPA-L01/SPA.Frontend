import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, TextInput, Image, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { useParkingSpot } from '@/context/ParkingSpotContext';
import { locationService } from '@/services/location.service';
import { photoService } from '@/services/photo.service';
import { notificationService } from '@/services/notification.service';
import { ParkingSpot, ParkingSpotPhoto } from '@/types/parking-spot';
import * as Sentry from '@sentry/react-native';

const MAX_PHOTOS = 3;

export default function SaveSpotScreen() {
  const { parkingLocationId, parkingLocationName } = useLocalSearchParams<{
    parkingLocationId?: string;
    parkingLocationName?: string;
  }>();

  const { currentSpot, saveSpot } = useParkingSpot();

  const [floor, setFloor] = useState('');
  const [zone, setZone] = useState('');
  const [column, setColumn] = useState('');
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<ParkingSpotPhoto[]>([]);
  const [locating, setLocating] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gps, setGps] = useState<{ latitude: number; longitude: number; accuracy: number | null } | null>(null);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const loc = await locationService.getCurrentLocation();
      setGps(loc);
      setLocating(false);
    })();
  }, []);

  const pickPhoto = async (useCamera: boolean) => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Tối đa 3 ảnh', 'Xoá một ảnh để thêm ảnh mới.');
      return;
    }

    Sentry.addBreadcrumb({
      category: 'user.action',
      message: useCamera ? 'User opened camera' : 'User opened photo library',
      level: 'info',
      data: { screen: 'SaveSpotScreen' },
    });

    const persistedUri = useCamera
      ? await photoService.launchCamera()
      : await photoService.launchLibrary();

    if (persistedUri) {
      setPhotos((prev) => [...prev, { uri: persistedUri, takenAt: new Date().toISOString() }]);
      Sentry.addBreadcrumb({
        category: 'user.action',
        message: 'User added a photo',
        level: 'info',
        data: { screen: 'SaveSpotScreen' },
      });
    }
  };

  const removePhoto = async (index: number) => {
    const photo = photos[index];
    await photoService.deletePhoto(photo.uri);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    Sentry.addBreadcrumb({
      category: 'user.action',
      message: 'User removed a photo',
      level: 'info',
      data: { screen: 'SaveSpotScreen' },
    });
  };

  const handleSave = async () => {
    Sentry.addBreadcrumb({
      category: 'user.action',
      message: 'User pressed save spot button',
      level: 'info',
      data: { screen: 'SaveSpotScreen', hasLocation: !!gps },
    });

    const doSave = async () => {
      setSaving(true);
      const now = new Date().toISOString();
      const spot: ParkingSpot = {
        id: `spot_${Date.now()}`,
        status: 'ACTIVE',
        parkingLocationId: parkingLocationId ?? undefined,
        parkingLocationName: parkingLocationName ?? undefined,
        floor: floor.trim() || undefined,
        zone: zone.trim() || undefined,
        column: column.trim() || undefined,
        note: note.trim() || undefined,
        latitude: gps?.latitude,
        longitude: gps?.longitude,
        accuracy: gps?.accuracy ?? undefined,
        photos,
        createdAt: now,
        updatedAt: now,
      };
      await saveSpot(spot);
      
      const spotDesc = [floor, zone, column].filter(Boolean).join(' - ');
      notificationService.scheduleCarSpotReminder(spotDesc || 'Vị trí đã lưu');
      
      setSaving(false);
      router.replace('/spot/current');
    };

    if (currentSpot) {
      Alert.alert(
        'Đang có vị trí xe khác',
        'Bạn có muốn thay thế vị trí hiện tại không?',
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Thay thế', style: 'destructive', onPress: doSave },
        ]
      );
    } else {
      await doSave();
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lưu vị trí xe</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Parking location label */}
        {parkingLocationName ? (
          <View style={styles.locationLabel}>
            <Ionicons name="business-outline" size={16} color={palette.textSecondary} />
            <Text style={styles.locationLabelText} numberOfLines={1}>{parkingLocationName}</Text>
          </View>
        ) : null}

        {/* GPS Status */}
        <View style={styles.gpsRow}>
          <Ionicons
            name={gps ? 'location' : locating ? 'location-outline' : 'location-outline'}
            size={18}
            color={gps ? '#30D158' : palette.textSecondary}
          />
          {locating ? (
            <ActivityIndicator size="small" color={palette.textSecondary} />
          ) : (
            <Text style={[styles.gpsText, gps && styles.gpsTextActive]}>
              {gps
                ? `GPS: ${gps.latitude.toFixed(5)}, ${gps.longitude.toFixed(5)}${gps.accuracy ? ` (±${Math.round(gps.accuracy)}m)` : ''}`
                : 'Không lấy được GPS — vẫn có thể lưu text'}
            </Text>
          )}
        </View>

        {/* Form fields */}
        <View style={styles.formCard}>
          <FormField label="Tầng" placeholder="Vd: B1, P2, Tầng 3..." value={floor} onChangeText={setFloor} icon="layers-outline" />
          <View style={styles.fieldDivider} />
          <FormField label="Khu / Ô" placeholder="Vd: A, Khu B..." value={zone} onChangeText={setZone} icon="grid-outline" />
          <View style={styles.fieldDivider} />
          <FormField label="Số cột / Ký hiệu" placeholder="Vd: C23, P-45..." value={column} onChangeText={setColumn} icon="barcode-outline" />
          <View style={styles.fieldDivider} />
          <FormField label="Ghi chú" placeholder="Gần cầu thang, cạnh cột đỏ..." value={note} onChangeText={setNote} icon="create-outline" multiline />
        </View>

        {/* Photos */}
        <Text style={styles.sectionLabel}>Ảnh ({photos.length}/{MAX_PHOTOS})</Text>
        <View style={styles.photoRow}>
          {photos.map((p, i) => (
            <View key={i} style={styles.photoWrapper}>
              <TouchableOpacity onPress={() => setLightboxUri(p.uri)} activeOpacity={0.85}>
                <Image source={{ uri: p.uri }} style={styles.photoThumb} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoDelete} onPress={() => removePhoto(i)}>
                <Ionicons name="close-circle" size={22} color="#FF453A" />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < MAX_PHOTOS && (
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoAddBtn} onPress={() => pickPhoto(true)}>
                <Ionicons name="camera-outline" size={24} color={palette.textSecondary} />
                <Text style={styles.photoAddText}>Chụp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoAddBtn} onPress={() => pickPhoto(false)}>
                <Ionicons name="image-outline" size={24} color={palette.textSecondary} />
                <Text style={styles.photoAddText}>Thư viện</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Lightbox */}
        <Modal visible={lightboxUri !== null} transparent animationType="fade" onRequestClose={() => setLightboxUri(null)}>
          <View style={styles.lightboxOverlay}>
            <TouchableOpacity style={styles.lightboxClose} onPress={() => setLightboxUri(null)}>
              <Ionicons name="close-circle" size={36} color={palette.white} />
            </TouchableOpacity>
            {lightboxUri && (
              <Image source={{ uri: lightboxUri }} style={styles.lightboxImage} resizeMode="contain" />
            )}
          </View>
        </Modal>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveBtn, saving && styles.btnDisabled]} onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator color={palette.white} />
            : <Text style={styles.saveBtnText}>📍  Lưu vị trí xe</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FormField({
  label, placeholder, value, onChangeText, icon, multiline,
}: {
  label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; icon: any; multiline?: boolean;
}) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldIconBox}>
        <Ionicons name={icon} size={18} color={palette.textSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
          placeholder={placeholder}
          placeholderTextColor={palette.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={multiline ? 2 : 1}
        />
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

  locationLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.offWhite, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md },
  locationLabelText: { fontSize: 13, fontWeight: '600', color: palette.textSecondary, flex: 1 },

  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.lg, padding: spacing.sm, backgroundColor: palette.offWhite, borderRadius: radius.md },
  gpsText: { fontSize: 12, color: palette.textSecondary, flex: 1 },
  gpsTextActive: { color: '#059669' },

  formCard: { backgroundColor: palette.white, borderRadius: radius.xl, borderWidth: 1, borderColor: palette.border, marginBottom: spacing.xl, overflow: 'hidden', ...shadows.sm },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.md, gap: spacing.md },
  fieldIconBox: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: palette.offWhite, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: palette.textSecondary, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: { fontSize: 15, fontWeight: '600', color: palette.textPrimary, paddingVertical: 4 },
  fieldInputMulti: { minHeight: 48 },
  fieldDivider: { height: 1, backgroundColor: palette.border, marginHorizontal: spacing.md },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: palette.textSecondary, marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  photoRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  photoWrapper: { width: 88, height: 88, borderRadius: radius.md, overflow: 'hidden', position: 'relative' },
  photoThumb: { width: '100%', height: '100%', borderRadius: radius.md },
  photoDelete: { position: 'absolute', top: 2, right: 2 },
  photoActions: { flexDirection: 'row', gap: spacing.sm },
  photoAddBtn: { width: 88, height: 88, borderRadius: radius.md, backgroundColor: palette.offWhite, borderWidth: 1.5, borderColor: palette.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoAddText: { fontSize: 11, fontWeight: '600', color: palette.textSecondary },
  lightboxOverlay: { flex: 1, backgroundColor: '#000000EE', justifyContent: 'center', alignItems: 'center' },
  lightboxImage: { width: '100%', height: '80%' },
  lightboxClose: { position: 'absolute', top: 48, right: 20, zIndex: 10 },

  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: palette.white },
  saveBtn: { backgroundColor: palette.darkBg, paddingVertical: 18, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: palette.white, fontSize: 16, fontWeight: '800' },
});
