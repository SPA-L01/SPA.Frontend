import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useAppMode } from '@/context/AppModeContext';
import { userService } from '@/services/api';

export default function ProfileScreen() {
  const { isLoggedIn, logout, userId } = useAuth();
  const { isGuest } = useAppMode();
  const [profile, setProfile] = useState<any>(null);

  const loadProfile = async () => {
    if (isGuest) return;
    try {
      const data = await userService.getMe();
      setProfile(data);
    } catch (e) {}
  };

  useFocusEffect(React.useCallback(() => {
    loadProfile();
  }, [isGuest]));

  const handleLogout = async () => {
    await logout();
  };

  const displayName = profile 
    ? `${profile.lastName || ''} ${profile.firstName || ''}`.trim() || 'Người dùng'
    : 'Đang tải...';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />

      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerInner}>
            <Text style={styles.headerTitle}>Cá nhân</Text>
          </View>

          {/* Avatar & Info */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person" size={40} color={palette.textMuted} />
              )}
            </View>
            <View style={styles.nameSection}>
              {isGuest ? (
                <>
                  <Text style={styles.userName}>Khách</Text>
                  <Text style={styles.userEmail}>Chưa đăng nhập</Text>
                </>
              ) : (
                <>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{displayName}</Text>
                    <TouchableOpacity 
                      style={styles.editIconBtn}
                      onPress={() => router.push('/profile/edit')}
                    >
                      <Ionicons name="create-outline" size={18} color={palette.white} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.userEmail} numberOfLines={1}>{profile?.email || userId}</Text>
                </>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Guest: Login & Register CTA */}
        {isGuest && (
          <View style={styles.authCard}>
            <Ionicons name="cloud-upload-outline" size={32} color={palette.textSecondary} style={{ marginBottom: spacing.sm }} />
            <Text style={styles.authCardTitle}>Đồng bộ dữ liệu</Text>
            <Text style={styles.authCardSub}>
              Đăng nhập để backup lịch sử gửi xe trên nhiều thiết bị.
            </Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>Đăng nhập</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.85}
            >
              <Text style={styles.registerBtnText}>Tạo tài khoản</Text>
            </TouchableOpacity>
          </View>
        )}

  const [syncTime, setSyncTime] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const loadSyncStatus = async () => {
    const time = await syncService.getLastSyncedAt();
    setSyncTime(time);
  };

  useEffect(() => {
    loadSyncStatus();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    await syncService.pushLocalToCloud();
    await syncService.pullFromCloud();
    await loadSyncStatus();
    setSyncing(false);
  };

  // ... (inside the menu section)
        {/* Authenticated: Menu */}
        {!isGuest && (
          <View style={styles.menuCard}>
            <MenuItem
              icon={syncing ? "refresh-circle" : "sync-outline"}
              label={syncing ? "Đang đồng bộ..." : "Đồng bộ dữ liệu"}
              subLabel={syncTime ? `Lần cuối: ${new Date(syncTime).toLocaleString('vi-VN')}` : "Chưa đồng bộ"}
              onPress={handleSync}
              disabled={syncing}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="log-out-outline"
              label="Đăng xuất"
              danger
              onPress={handleLogout}
            />
          </View>
        )}

        {/* App info */}
        <Text style={styles.version}>Find My Car v1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  subLabel,
  onPress,
  danger,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subLabel?: string;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity 
      style={[styles.menuItem, disabled && { opacity: 0.5 }]} 
      activeOpacity={0.7} 
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.menuIconBg, danger && styles.menuIconBgDanger]}>
        <Ionicons name={icon} size={20} color={danger ? palette.danger : palette.textPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
        {!!subLabel && <Text style={styles.menuSubLabel}>{subLabel}</Text>}
      </View>
      {!danger && <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.offWhite },

  header: {
    backgroundColor: palette.darkBg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerInner: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  headerTitle: { ...typography.h1, color: palette.white },

  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: palette.white + '44',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.darkBg2,
  },
  nameSection: { gap: 4, flex: 1 },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: { ...typography.h2, color: palette.white },
  userEmail: { ...typography.caption, color: palette.textMuted },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

  authCard: {
    backgroundColor: palette.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  authCardTitle: { ...typography.h3, color: palette.textPrimary, marginBottom: spacing.xs },
  authCardSub: {
    ...typography.body,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  loginBtn: {
    backgroundColor: palette.darkBg,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  loginBtnText: { ...typography.body, color: palette.white, fontWeight: '700' },
  registerBtn: {
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  registerBtnText: { ...typography.body, color: palette.textPrimary, fontWeight: '600' },

  menuCard: {
    backgroundColor: palette.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: palette.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconBgDanger: { backgroundColor: '#FF453A22' },
  menuLabel: { flex: 1, ...typography.body, color: palette.textPrimary },
  menuSubLabel: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  menuLabelDanger: { color: palette.danger },
  menuDivider: {
    height: 1,
    backgroundColor: palette.border,
    marginLeft: spacing.md + 38 + spacing.md,
  },

  version: {
    ...typography.caption,
    color: palette.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
