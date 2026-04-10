import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing, typography } from '@/constants/theme';

type Category = 'car' | 'truck' | 'motor' | 'bicycle';

interface CategoryButtonProps {
  type: Category;
  label: string;
  isSelected?: boolean;
  onPress?: () => void;
}

const iconMap: Record<Category, keyof typeof Ionicons.glyphMap> = {
  car: 'car-outline',
  truck: 'bus-outline',
  motor: 'bicycle-outline',
  bicycle: 'bicycle-outline',
};

const iconMapSelected: Record<Category, keyof typeof Ionicons.glyphMap> = {
  car: 'car',
  truck: 'bus',
  motor: 'bicycle',
  bicycle: 'bicycle',
};

export function CategoryButton({ type, label, isSelected, onPress }: CategoryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.btn, isSelected && styles.btnSelected]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Ionicons
        name={isSelected ? iconMapSelected[type] : iconMap[type]}
        size={26}
        color={isSelected ? palette.textPrimary : palette.textSecondary}
      />
      <Text style={[styles.label, isSelected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: palette.white,
    gap: 6,
    minWidth: 72,
  },
  btnSelected: {
    borderColor: palette.black,
    backgroundColor: palette.white,
  },
  label: {
    ...typography.label,
    color: palette.textSecondary,
  },
  labelSelected: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
});
