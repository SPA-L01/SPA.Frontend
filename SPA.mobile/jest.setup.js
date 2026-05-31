import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    replace_mock: jest.fn(), // Helper for easy access
  },
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => ([]),
  Stack: ({ children }: any) => children,
  Tabs: ({ children }: any) => children,
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {},
  },
}));

jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  class MockMapView extends React.Component {
    render() {
      return React.createElement('MapView', this.props, this.props.children);
    }
  }
  class MockMarker extends React.Component {
    render() {
      return React.createElement('Marker', this.props, this.props.children);
    }
  }
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    PROVIDER_DEFAULT: 'default',
  };
});
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-location', () => ({
  __esModule: true,
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 10.7769, longitude: 106.7009 },
  }),
  Accuracy: {
    Balanced: 2,
  },
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    userId: '1',
    user: { name: 'Test User', email: 'test@example.com' },
    isLoggedIn: true,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock('@/context/WalletContext', () => ({
  useWallet: () => ({
    balance: 50000,
    transactions: [],
    loading: false,
    deduct: jest.fn().mockResolvedValue(true),
    topup: jest.fn().mockResolvedValue(undefined),
    reload: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('@/context/AppModeContext', () => ({
  useAppMode: () => ({
    mode: 'authenticated',
    isGuest: false,
    isAuthenticated: true,
  }),
}));

jest.mock('@/context/BookingContext', () => ({
  useBookings: () => ({
    bookings: [],
    addBooking: jest.fn(),
    saveCarSpot: jest.fn(),
    completeBooking: jest.fn(),
    getBooking: jest.fn(),
  }),
}));

jest.mock('@/context/FavouritesContext', () => ({
  useFavourites: () => ({
    favouriteIds: [],
    favouriteLots: [],
    loading: false,
    toggleFavourite: jest.fn(),
    isFavourite: jest.fn().mockReturnValue(false),
    refresh: jest.fn(),
  }),
}));

jest.mock('@/context/ParkingSpotContext', () => ({
  useParkingSpot: () => ({
    currentSpot: null,
    history: [],
    loading: false,
    saveSpot: jest.fn(),
    completeSpot: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

jest.mock('@/services/notification.service', () => ({
  notificationService: {
    registerForPushNotificationsAsync: jest.fn().mockResolvedValue(undefined),
    scheduleNotificationAsync: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 40, right: 0, bottom: 20, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureMessage: jest.fn(),
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
  metrics: {
    count: jest.fn(),
  },
  wrap: (c) => c,
}));

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  MediaTypeOptions: { Images: 'Images', Videos: 'Videos', All: 'All' },
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///test-documents/',
  copyAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
}));
