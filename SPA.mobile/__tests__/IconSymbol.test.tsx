import React from 'react';
import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';

// Import the base file specifically
import { IconSymbol } from '../components/ui/icon-symbol';

describe('IconSymbol', () => {
  it('covers android and ios branches', () => {
    Platform.OS = 'android';
    render(<IconSymbol name="car" color="#000" />);
    
    Platform.OS = 'ios';
    render(<IconSymbol name="car" color="#000" />);
  });
});
