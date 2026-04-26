import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../app/(tabs)/index';
import { router } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock native modules that might cause issues in Jest
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

describe('HomeScreen', () => {
  it('renders correctly without crashing', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Welcome back!')).toBeTruthy();
  });

  it('shows user name from mock data', () => {
    const { getByText } = render(<HomeScreen />);
    // mockUser.name is "Robert Flores" in mockData
    expect(getByText('Robert Flores')).toBeTruthy();
  });

  it('navigates to wallet when balance is pressed', () => {
    const { getByText } = render(<HomeScreen />);
    // Find the balance text or a way to identify the button
    // In index.tsx, the balance chip is an onPress={() => router.push('/wallet')}
    // It contains the balance value.
    const balanceChip = getByText(/đ/); 
    fireEvent.press(balanceChip);
    expect(router.push).toHaveBeenCalledWith('/wallet');
  });
});
