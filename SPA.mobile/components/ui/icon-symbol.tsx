import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';

// This is a bridge, so we can use different icons on different platforms
const MAPPING = {
  'home': 'home',
  'home-outline': 'home-outline',
  'map': 'map',
  'map-outline': 'map-outline',
  'star': 'star',
  'star-outline': 'star-outline',
  'person': 'person',
  'person-outline': 'person-outline',
  'car': 'car',
  'car-outline': 'car-outline',
} as const;

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  // On iOS we could use SFSymbols (expo-symbols)
  // But for now, we use Ionicons for both to simplify coverage and maintain consistency
  return <Ionicons color={color} size={size} name={MAPPING[name]} style={style} />;
}
