import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingScreen from '../app/onboarding';
import { router } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  return {
    LinearGradient: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('OnboardingScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText('Welcome to SPA Parking')).toBeTruthy();
  });

  it('contains the get started button', () => {
    const { getByTestID } = render(<OnboardingScreen />);
    const button = getByTestID('get-started-button');
    expect(button).toBeTruthy();
  });

  it('navigates to login when get started is pressed', () => {
    const { getByTestID } = render(<OnboardingScreen />);
    const button = getByTestID('get-started-button');
    fireEvent.press(button);
    expect(router.replace).toHaveBeenCalledWith('/(auth)/login');
  });
});
