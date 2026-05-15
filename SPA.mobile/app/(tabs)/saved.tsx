import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, typography, radius } from '@/constants/theme';
import { useFavourites } from '@/context/FavouritesContext';
import { ParkingCard } from '@/components/ui/ParkingCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SavedScreen() {
  const { favouriteLots, loading } = useFavourites();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />
      
      <View style={styles.header}>
        <SafeAreaView>
          <Text style={styles.headerTitle}>Yêu thích</Text>
          <Text style={styles.headerSub}>{favouriteLots.length} địa điểm đã lưu</Text>
        </SafeAreaView>
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading && favouriteLots.length === 0 ? (
          <View style={styles.list}>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} height={120} style={{ marginBottom: spacing.md, borderRadius: radius.xl }} />
            ))}
          </View>
        ) : favouriteLots.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={64} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có yêu thích</Text>
            <Text style={styles.emptyText}>
              Nhấn vào biểu tượng trái tim ở bất kỳ bãi đỗ nào để lưu lại đây.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {favouriteLots.map((lot) => (
              <ParkingCard key={lot.id} lot={lot} />
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.offWhite,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: palette.darkBg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h1,
    color: palette.white,
    marginTop: spacing.sm,
  },
  headerSub: {
    ...typography.caption,
    color: palette.textMuted,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  list: {
    gap: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
