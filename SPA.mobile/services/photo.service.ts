import * as FileSystem from 'expo-file-system';

export const photoService = {
  /**
   * Copy a photo URI (from camera/picker) to documentDirectory
   * so it persists across app restarts.
   */
  async copyToDocumentDirectory(uri: string): Promise<string> {
    const filename = `parking_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
    const dest = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  },

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
};
