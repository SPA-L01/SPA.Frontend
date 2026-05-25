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
    expect(getByText('Chào mừng đến với SPA Parking')).toBeTruthy();
  });

  it('navigates to login when get started is pressed', () => {
    const { getByText } = render(<OnboardingScreen />);
    const button = getByText('Bắt đầu ngay');
    fireEvent.press(button);
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
  });

  it('renders subtitle', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText(/Tìm kiếm chỗ đỗ xe chưa bao giờ dễ dàng đến thế/)).toBeTruthy();
  });
});
