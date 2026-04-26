import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CategoryButton } from '../components/ui/CategoryButton';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('CategoryButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <CategoryButton type="car" label="Car" isSelected={false} onPress={() => {}} />
    );
    expect(getByText('Car')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <CategoryButton type="car" label="Car" isSelected={false} onPress={onPressMock} />
    );
    fireEvent.press(getByText('Car'));
    expect(onPressMock).toHaveBeenCalled();
  });
});
