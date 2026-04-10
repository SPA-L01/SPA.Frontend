import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { palette, radius, spacing, typography, shadows } from '@/constants/theme';
import { ParkingLot } from '@/constants/mockData';

interface ParkingCardProps {
  lot: ParkingLot;
  variant?: 'default' | 'compact';
}

export function ParkingCard({ lot, variant = 'default' }: ParkingCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, variant === 'compact' && styles.cardCompact]}
      activeOpacity={0.75}
      onPress={() => router.push(`/parking/${lot.id}`)}
    >
      <Image source={{ uri: lot.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{lot.name}</Text>
        <Text style={styles.address} numberOfLines={1}>{lot.address}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>
            <Text style={styles.priceBold}>${lot.price}</Text>
            {' '}/ {lot.freeSlots} free
          </Text>
        </View>
      </View>
      <View style={styles.distanceBadge}>
        <Text style={styles.distanceText}>{lot.distance.toFixed(1)} km</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: palette.white,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    alignItems: 'center',
    ...shadows.sm,
  },
  cardCompact: {
    marginBottom: spacing.xs,
  },
  image: {
    width: 80,
    height: 80,
    backgroundColor: palette.offWhite,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  name: {
    ...typography.h3,
    color: palette.textPrimary,
  },
  address: {
    ...typography.caption,
    color: palette.textSecondary,
    marginTop: 2,
  },
  footer: {
    marginTop: 4,
  },
  price: {
    ...typography.bodyMd,
    color: palette.textSecondary,
  },
  priceBold: {
    fontWeight: '700',
    color: palette.textPrimary,
    fontSize: 14,
  },
  distanceBadge: {
    paddingRight: spacing.md,
  },
  distanceText: {
    ...typography.label,
    fontWeight: '700',
    color: palette.textPrimary,
  },
});
