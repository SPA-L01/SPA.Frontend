import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing, typography, shadows } from '@/constants/theme';
import { ParkingLot } from '@/constants/mockData';
import { useFavourites } from '@/context/FavouritesContext';

interface ParkingCardProps {
  lot: ParkingLot;
  variant?: 'default' | 'compact';
}

export function ParkingCard({ lot, variant = 'default' }: ParkingCardProps) {
  const { isFavourite, toggleFavourite } = useFavourites();
  const imageUrl = lot.imageUrl || 'https://picsum.photos/seed/spa-parking/400/240';
  const price = lot.price ?? Number(lot.hourlyRate ?? 0);
  const freeSlots = lot.freeSlots ?? lot.availableSlots ?? 0;
  const distance = typeof lot.distance === 'number' ? lot.distance : null;

  const isFav = isFavourite(lot.id);

  return (
    <TouchableOpacity
      style={[styles.card, variant === 'compact' && styles.cardCompact]}
      activeOpacity={0.75}
      onPress={() => router.push(`/parking/${lot.id}`)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <TouchableOpacity 
          style={styles.heartBtn} 
          onPress={() => toggleFavourite(lot.id)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isFav ? 'heart' : 'heart-outline'} 
            size={18} 
            color={isFav ? '#FF453A' : palette.textSecondary} 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{lot.name}</Text>
        <Text style={styles.address} numberOfLines={1}>{lot.address}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>
            <Text style={styles.priceBold}>{Number(price).toLocaleString()}đ</Text>
            {' '}/ {freeSlots} free
          </Text>
        </View>
      </View>
      <View style={styles.distanceBadge}>
        <Text style={styles.distanceText}>{distance !== null ? `${distance.toFixed(1)} km` : '— km'}</Text>
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
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: palette.offWhite,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
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
