import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingScreen from '../app/onboarding';
import { router } from 'expo-router';

// Mock dependencies
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: ({ children }: any) => children }));

describe('OnboardingScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText('Welcome to SPA Parking')).toBeTruthy();
  });

  it('navigates to login when get started is pressed', () => {
    const { getByText } = render(<OnboardingScreen />);
    const button = getByText('Get Started');
    fireEvent.press(button);
    expect(router.replace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('renders subtitle', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText(/Finding a parking spot/)).toBeTruthy();
  });
});
