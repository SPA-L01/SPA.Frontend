import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, typography } from '@/constants/theme';

export default function HistoryScreen() {
  // Phase 5 sẽ implement full history
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />

      <View style={styles.header}>
        <SafeAreaView>
          <Text style={styles.headerTitle}>Lịch sử</Text>
          <Text style={styles.headerSub}>Các lần gửi xe đã qua</Text>
        </SafeAreaView>
      </View>

      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={64} color={palette.textSecondary} />
        <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
        <Text style={styles.emptySubtitle}>
          Sau khi bấm "Đã lấy xe", lịch sử sẽ xuất hiện ở đây.
        </Text>
      </View>
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
  headerTitle: { ...typography.h1, color: palette.white, marginTop: spacing.sm },
  headerSub: { ...typography.caption, color: palette.textMuted, marginTop: 2 },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: { ...typography.h2, color: palette.textPrimary, textAlign: 'center' },
  emptySubtitle: {
    ...typography.body,
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
