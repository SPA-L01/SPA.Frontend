// ─── Mock Data for SPA Parking App (TP. Hồ Chí Minh) ───────────────

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  price: number;
  freeSlots: number;
  totalSlots: number;
  distance: number;
  rating: number;
  imageUrl: string;
  coordinate: { latitude: number; longitude: number };
  openHours: string;
  floors: string[];
}

export interface ParkingSlot {
  id: string;
  code: string;
  isOccupied: boolean;
  isSelected?: boolean;
  isReserved?: boolean;
}

export interface BookingSession {
  id: string;
  parkingName: string;
  address: string;
  slotCode: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'active' | 'completed' | 'cancelled';
  imageUrl: string;
}

// ─── Parking Lots HCMC ───────────────────────────────────────────
export const mockParkingLots: ParkingLot[] = [
  {
    id: '1',
    name: 'Bãi xe Bitexco Financial',
    address: '2 Hải Triều, Bến Nghé, Quận 1',
    price: 15000,
    freeSlots: 45,
    totalSlots: 200,
    distance: 0.5,
    rating: 4.8,
    openHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&q=80',
    coordinate: { latitude: 10.7715, longitude: 106.7042 },
    floors: ['Hầm B1', 'Hầm B2', 'Hầm B3'],
  },
  {
    id: '2',
    name: 'Vincom Center Đồng Khởi',
    address: '72 Lê Thánh Tôn, Bến Nghé, Quận 1',
    price: 10000,
    freeSlots: 120,
    totalSlots: 500,
    distance: 0.8,
    rating: 4.7,
    openHours: '09:00 - 22:30',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&q=80',
    coordinate: { latitude: 10.7781, longitude: 106.7019 },
    floors: ['Hầm B2', 'Hầm B3', 'Hầm B4'],
  },
  {
    id: '3',
    name: 'Bãi xe ngầm Công viên Lê Lai',
    address: 'Công viên 23/9, Phạm Ngũ Lão, Quận 1',
    price: 6000,
    freeSlots: 250,
    totalSlots: 800,
    distance: 1.2,
    rating: 4.5,
    openHours: '05:00 - 00:00',
    imageUrl: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&q=80',
    coordinate: { latitude: 10.7709, longitude: 106.6948 },
    floors: ['Tầng 1', 'Tầng 2'],
  },
  {
    id: '4',
    name: 'Saigon Centre (Takashimaya)',
    address: '65 Lê Lợi, Bến Nghé, Quận 1',
    price: 20000,
    freeSlots: 15,
    totalSlots: 300,
    distance: 0.3,
    rating: 4.9,
    openHours: '09:30 - 21:30',
    imageUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&q=80',
    coordinate: { latitude: 10.7735, longitude: 106.7011 },
    floors: ['Hầm B3', 'Hầm B4', 'Hầm B5', 'Hầm B6'],
  },
  {
    id: '5',
    name: 'Diamond Plaza Parking',
    address: '34 Lê Duẩn, Bến Nghé, Quận 1',
    price: 10000,
    freeSlots: 30,
    totalSlots: 150,
    distance: 1.5,
    rating: 4.4,
    openHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=400&q=80',
    coordinate: { latitude: 10.7821, longitude: 106.6989 },
    floors: ['Hầm B1', 'Hầm B2'],
  },
];

// ─── Parking Grid Slots ────────────────────────────────────────
export const generateParkingSlots = (floor: string): ParkingSlot[] => {
  const floorPrefix = floor.includes('B1') ? 'A' : floor.includes('B2') ? 'B' : 'C';
  const slots: ParkingSlot[] = [];
  const occupiedIndices = [2, 3, 5, 8, 10, 13, 16, 18, 21, 22, 25];

  for (let i = 1; i <= 26; i++) {
    slots.push({
      id: `${floorPrefix}${i}`,
      code: `${floorPrefix}${i}`,
      isOccupied: occupiedIndices.includes(i),
      isSelected: false,
    });
  }
  return slots;
};

// ─── Sessions ───────────────────────────────────────────────────
export const mockSessions: BookingSession[] = [
  {
    id: 's1',
    parkingName: 'Bãi xe Bitexco Financial',
    address: '2 Hải Triều, Quận 1',
    slotCode: 'B12',
    date: '2026-04-10',
    startTime: '10:00',
    endTime: '14:00',
    totalPrice: 60000,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&q=80',
  },
  {
    id: 's2',
    parkingName: 'Vincom Center Đồng Khởi',
    address: '72 Lê Thánh Tôn, Quận 1',
    slotCode: 'A05',
    date: '2026-04-08',
    startTime: '09:00',
    endTime: '17:00',
    totalPrice: 80000,
    status: 'completed',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&q=80',
  },
];

// ─── User ────────────────────────────────────────────────────────
export const mockUser = {
  id: 'u1',
  name: 'Ngô Hoàng Hải',
  email: 'ngohoanghai@gmail.com',
  phone: '+84 901 234 567',
  avatarUrl: '', 
  totalBookings: 24,
  savedSpots: 7,
  memberSince: '2024',
};

// ─── Location HCMC (Bitexco Area) ────────────────────────────────
export const DEFAULT_LOCATION = {
  latitude: 10.7725,
  longitude: 106.7015,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export const CURRENT_ADDRESS = '72 Lê Thánh Tôn, Quận 1, TP. HCM';
