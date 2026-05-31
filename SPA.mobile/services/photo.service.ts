import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export const photoService = {
  /**
   * Request camera permission. Returns true if granted.
   */
  async requestCameraPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Cần quyền Camera',
        'Vui lòng cho phép ứng dụng sử dụng camera trong Cài đặt.',
        [{ text: 'Đồng ý' }]
      );
      return false;
    }
    return true;
  },

  /**
   * Request media library permission. Returns true if granted.
   */
  async requestMediaLibraryPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Cần quyền Thư viện ảnh',
        'Vui lòng cho phép ứng dụng truy cập thư viện ảnh trong Cài đặt.',
        [{ text: 'Đồng ý' }]
      );
      return false;
    }
    return true;
  },

  /**
   * Launch camera and return the persisted file URI, or null if cancelled/denied.
   */
  async launchCamera(): Promise<string | null> {
    const granted = await this.requestCameraPermission();
    if (!granted) return null;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.75,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets[0]) return null;
    return this.copyToDocumentDirectory(result.assets[0].uri);
  },

  /**
   * Launch image library picker and return the persisted file URI, or null.
   */
  async launchLibrary(): Promise<string | null> {
    const granted = await this.requestMediaLibraryPermission();
    if (!granted) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.75,
      allowsEditing: true,
      aspect: [4, 3],
      allowsMultipleSelection: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (result.canceled || !result.assets[0]) return null;
    return this.copyToDocumentDirectory(result.assets[0].uri);
  },

  /**
   * Copy a photo URI (from camera/picker) to documentDirectory
   * so it persists across app restarts.
   */
  async copyToDocumentDirectory(uri: string): Promise<string> {
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `parking_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const dest = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  },

  /**
   * Delete a persisted photo file.
   */
  async deletePhoto(uri: string): Promise<void> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch {
      // Silently ignore
    }
  },

  /**
   * Check if a persisted photo file still exists on disk.
   */
  async photoExists(uri: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      return info.exists;
    } catch {
      return false;
    }
  },
};
