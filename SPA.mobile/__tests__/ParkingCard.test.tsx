import React from 'react';
import { render } from '@testing-library/react-native';
import { ParkingCard } from '../components/ui/ParkingCard';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const mockLot = {
  id: '1',
  name: 'Central Parking',
  address: '123 Main St',
  price: 15000,
  freeSlots: 10,
  image: null,
};

describe('ParkingCard', () => {
  it('renders correctly with lot data', () => {
    const { getByText } = render(<ParkingCard lot={mockLot} />);
    expect(getByText('Central Parking')).toBeTruthy();
    expect(getByText('123 Main St')).toBeTruthy();
  });
});
