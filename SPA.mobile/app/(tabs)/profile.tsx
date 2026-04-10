import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { mockUser, mockSessions } from '@/constants/mockData';
import { router } from 'expo-router';

const MENU_ITEMS = [
  { icon: 'car-outline' as const, label: 'My Vehicles', chevron: true },
  { icon: 'heart-outline' as const, label: 'Saved Spots', chevron: true },
  { icon: 'card-outline' as const, label: 'Payment Methods', chevron: true },
  { icon: 'notifications-outline' as const, label: 'Notifications', chevron: true },
  { icon: 'shield-checkmark-outline' as const, label: 'Privacy & Security', chevron: true },
  { icon: 'help-circle-outline' as const, label: 'Help & Support', chevron: true },
  { icon: 'log-out-outline' as const, label: 'Sign Out', chevron: false, danger: true },
];

export default function ProfileScreen() {
  const completedSessions = mockSessions.filter((s) => s.status === 'completed').length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />

      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerInner}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.editBtn}>
              <Ionicons name="create-outline" size={20} color={palette.white} />
            </TouchableOpacity>
          </View>

          {/* Avatar & Name */}
          <View style={styles.avatarSection}>
            {mockUser.avatarUrl ? (
              <Image source={{ uri: mockUser.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={40} color={palette.textMuted} />
              </View>
            )}
            <View style={styles.nameSection}>
              <Text style={styles.userName}>{mockUser.name}</Text>
              <Text style={styles.userEmail}>{mockUser.email}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockUser.totalBookings}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockUser.savedSpots}</Text>
              <Text style={styles.statLabel}>Saved Spots</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedSessions}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Menu */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.label === 'Sign Out') {
                    router.replace('/(auth)/login');
                  }
                }}
              >
                <View style={[styles.menuIconBg, item.danger && styles.menuIconBgDanger]}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.danger ? palette.danger : palette.textPrimary}
                  />
                </View>
                <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                  {item.label}
                </Text>
                {item.chevron && (
                  <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} />
                )}
              </TouchableOpacity>
              {index < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.version}>SPA Parking v1.0.0 · Member since {mockUser.memberSince}</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  headerTitle: { ...typography.h1, color: palette.white },
  editBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.darkBg2,
    alignItems: 'center',
    justifyContent: 'center',
  },

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
  nameSection: { gap: 4 },
  userName: { ...typography.h2, color: palette.white },
  userEmail: { ...typography.caption, color: palette.textMuted },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: palette.darkBg2,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: palette.white },
  statLabel: { ...typography.caption, color: palette.textMuted },
  statDivider: { width: 1, backgroundColor: palette.borderDark },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

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
