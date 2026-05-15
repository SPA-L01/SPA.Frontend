import * as Location from 'expo-location';

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export const locationService = {
  async requestPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  async getCurrentLocation(): Promise<LocationResult | null> {
    try {
      const granted = await this.requestPermission();
      if (!granted) return null;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
      };
    } catch {
      return null;
    }
  },

  /**
   * Open native maps app for navigation to given coords.
   */
  openMapsNavigation(latitude: number, longitude: number, label?: string): void {
    const { Linking, Platform } = require('react-native');
    const encodedLabel = encodeURIComponent(label ?? 'Xe của tôi');

    let url: string;
    if (Platform.OS === 'ios') {
      url = `maps://?q=${encodedLabel}&ll=${latitude},${longitude}`;
    } else {
      url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`;
    }

    Linking.canOpenURL(url).then((can: boolean) => {
      if (can) {
        Linking.openURL(url);
      } else {
        // Fallback to Google Maps web
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
        );
      }
    });
  },
};
