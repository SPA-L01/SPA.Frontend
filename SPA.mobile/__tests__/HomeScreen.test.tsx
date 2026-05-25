import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../app/(tabs)/index';
import { router } from 'expo-router';

// Mock dependencies
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: ({ children }: any) => children }));
jest.mock('react-native-maps', () => ({
  __esModule: true,
  default: (props: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, props, props.children);
  },
  PROVIDER_DEFAULT: 'default',
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: jest.fn((cb) => cb()),
}));

jest.mock('@/context/WalletContext', () => ({
  useWallet: () => ({
    balance: 50000,
    reload: jest.fn(),
  }),
}));

jest.mock('@/services/api', () => ({
  parkingService: {
    getLocations: jest.fn().mockResolvedValue([]),
  },
  userService: {
    getMe: jest.fn().mockResolvedValue({ name: 'Test User' }),
  },
}));

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Chào mừng quay trở lại!')).toBeTruthy();
  });

  it('navigates to wallet when balance chip is pressed', () => {
    const { getByText } = render(<HomeScreen />);
    const balanceText = getByText(/50,000/); 
    fireEvent.press(balanceText);
    expect(router.push).toHaveBeenCalledWith('/wallet');
  });

  it('renders categories', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Ô tô')).toBeTruthy();
  });
});
