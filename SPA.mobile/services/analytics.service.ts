import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Môi trường phát triển hay production
const IS_DEV = __DEV__;

export interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
  timestamp: string;
}

class AnalyticsService {
  private sessionStartTime: number | null = null;
  private currentScreen: string = 'Unknown';
  private appVersion: string = Constants.expoConfig?.version || '1.0.0';

  /**
   * Khởi động phiên làm việc mới, ghi lại timestamp bắt đầu
   */
  async startSession() {
    this.sessionStartTime = Date.now();
    await this.logEvent('session_start', {
      device_os: Platform.OS,
      app_version: this.appVersion,
    });
  }

  /**
   * Kết thúc phiên hoạt động và trả về thời lượng phiên hoạt động (bằng giây)
   */
  async endSession(): Promise<number> {
    if (!this.sessionStartTime) return 0;
    const durationSeconds = Math.round((Date.now() - this.sessionStartTime) / 1000);
    
    await this.logEvent('session_end', {
      duration_seconds: durationSeconds,
      device_os: Platform.OS,
      app_version: this.appVersion,
    });
    
    this.sessionStartTime = null;
    return durationSeconds;
  }

  /**
   * Lấy thời lượng phiên hoạt động hiện tại (không reset phiên)
   */
  getCurrentSessionDuration(): number {
    if (!this.sessionStartTime) return 0;
    return Math.round((Date.now() - this.sessionStartTime) / 1000);
  }

  /**
   * Ghi nhận việc người dùng xem màn hình nào đó
   */
  async logScreenView(screenName: string) {
    this.currentScreen = screenName;
    await this.logEvent('screen_view', {
      screen_name: screenName,
    });
  }

  /**
   * Lấy màn hình hiện tại người dùng đang dừng chân
   */
  getCurrentScreen(): string {
    return this.currentScreen;
  }

  /**
   * Ghi nhận một sự kiện bất kỳ (Custom Event)
   */
  async logEvent(eventName: string, params?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    
    // In log trong môi trường development để dễ debug
    if (IS_DEV) {
      console.log(`[Analytics Service] Event logged: "${eventName}"`, {
        ...params,
        timestamp,
      });
    }

    // Nếu cấu hình Firebase Analytics thực tế được thiết lập (khi build production):
    // import analytics from '@react-native-firebase/analytics';
    // try {
    //   await analytics().logEvent(eventName, params);
    // } catch (e) {
    //   console.error('Failed to log to Firebase:', e);
    // }

    // Lưu cục bộ danh sách sự kiện offline nếu cần
    try {
      const historyJson = await AsyncStorage.getItem('spa_analytics_history');
      const history: AnalyticsEvent[] = historyJson ? JSON.parse(historyJson) : [];
      history.push({ name: eventName, params, timestamp });
      
      // Giới hạn lưu trữ 100 sự kiện gần nhất
      if (history.length > 100) {
        history.shift();
      }
      await AsyncStorage.setItem('spa_analytics_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving analytics history:', error);
    }
  }

  /**
   * Lấy danh sách lịch sử hành vi người dùng đã thực hiện (dùng để gửi phân tích lên backend hoặc đối chiếu)
   */
  async getLocalHistory(): Promise<AnalyticsEvent[]> {
    try {
      const historyJson = await AsyncStorage.getItem('spa_analytics_history');
      return historyJson ? JSON.parse(historyJson) : [];
    } catch {
      return [];
    }
  }

  /**
   * Xóa lịch sử lưu cục bộ
   */
  async clearLocalHistory() {
    await AsyncStorage.removeItem('spa_analytics_history');
  }
}

export const analyticsService = new AnalyticsService();
