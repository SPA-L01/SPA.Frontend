export interface ParkingSpotPhoto {
  uri: string;
  takenAt: string;
}

export interface ParkingSpot {
  id: string;
  status: 'ACTIVE' | 'COMPLETED';
  // Reference to a parking location (optional)
  parkingLocationId?: string;
  parkingLocationName?: string;
  // Detail info
  floor?: string;
  zone?: string;
  column?: string;
  note?: string;
  // GPS
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  addressLabel?: string;
  // Photos
  photos: ParkingSpotPhoto[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  durationMs?: number;
}
