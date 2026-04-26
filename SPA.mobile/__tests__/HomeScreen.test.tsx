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

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Welcome back!')).toBeTruthy();
  });

  it('navigates to wallet when balance chip is pressed', () => {
    const { getByText } = render(<HomeScreen />);
    const balanceText = getByText(/đ/); 
    fireEvent.press(balanceText);
    expect(router.push).toHaveBeenCalledWith('/wallet');
  });

  it('renders categories', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Car')).toBeTruthy();
  });
});
