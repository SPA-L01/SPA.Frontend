import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, typography } from '@/constants/theme';
import { useFavourites } from '@/context/FavouritesContext';
import { ParkingCard } from '@/components/ui/ParkingCard';

export default function SavedScreen() {
  const { favouriteLots, loading, refresh } = useFavourites();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />
      
      <View style={styles.header}>
        <SafeAreaView>
          <Text style={styles.headerTitle}>Saved Places</Text>
          <Text style={styles.headerSub}>{favouriteLots.length} locations saved</Text>
        </SafeAreaView>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={palette.textSecondary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {favouriteLots.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="heart-outline" size={48} color={palette.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No saved places yet</Text>
              <Text style={styles.emptyText}>
                Tap the heart icon on any parking lot to save it here for quick access.
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
      )}
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
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: palette.white,
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
