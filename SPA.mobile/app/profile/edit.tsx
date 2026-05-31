import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, TextInput, ActivityIndicator, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { userService } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';
import * as Sentry from '@sentry/react-native';

export default function ProfileEditScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phoneNo: '',
    avatarUrl: '',
    email: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userService.getMe();
      setProfile({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNo: data.phoneNo || '',
        avatarUrl: data.avatarUrl || '',
        email: data.email || '',
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    Sentry.addBreadcrumb({ category: 'user.action', message: 'User saved profile', level: 'info', data: { screen: 'ProfileEditScreen' } });
    setSaving(true);
    try {
      await userService.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNo: profile.phoneNo,
        avatarUrl: profile.avatarUrl,
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      Sentry.addBreadcrumb({ category: 'user.action', message: 'User changed avatar', level: 'info', data: { screen: 'ProfileEditScreen' } });
      // In a real app, you'd upload this to S3/Cloudinary. 
      // For now, we'll just set the local URI (it won't persist across devices but works for demo).
      setProfile({ ...profile, avatarUrl: result.assets[0].uri });
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.textSecondary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={saving}
            style={styles.saveBtnTop}
          >
            {saving ? (
              <ActivityIndicator size="small" color={palette.darkBg} />
            ) : (
              <Text style={styles.saveTextTop}>Lưu</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            {profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={palette.textMuted} />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color={palette.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Thay đổi ảnh đại diện</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (Không thể thay đổi)</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={profile.email}
              editable={false}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Họ</Text>
              <TextInput
                style={styles.input}
                value={profile.lastName}
                onChangeText={(t) => setProfile({ ...profile, lastName: t })}
                placeholder="Vd: Nguyễn"
              />
            </View>
            <View style={{ width: spacing.md }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Tên</Text>
              <TextInput
                style={styles.input}
                value={profile.firstName}
                onChangeText={(t) => setProfile({ ...profile, firstName: t })}
                placeholder="Vd: Văn A"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={profile.phoneNo}
              onChangeText={(t) => setProfile({ ...profile, phoneNo: t })}
              placeholder="09xx xxx xxx"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.white },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safeArea: { backgroundColor: palette.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3, color: palette.textPrimary },
  saveBtnTop: { paddingHorizontal: spacing.md, paddingVertical: 8 },
  saveTextTop: { fontSize: 16, fontWeight: '700', color: palette.darkBg },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg },

  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'relative',
    ...shadows.md,
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: palette.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: palette.darkBg,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.white,
  },
  avatarHint: { ...typography.caption, color: palette.textSecondary, marginTop: spacing.sm },

  form: { gap: spacing.lg },
  inputGroup: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: palette.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: palette.offWhite,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.border,
  },
  inputDisabled: { opacity: 0.6, backgroundColor: '#f0f0f0' },
  row: { flexDirection: 'row' },
});
