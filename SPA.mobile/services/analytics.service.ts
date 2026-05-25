import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';

// Môi trường phát triển hay production
const IS_DEV = __DEV__;

// Backend URL — đọc từ env
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? '';

export interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
  timestamp: string;
}

/** Tạo session ID đơn giản để nhóm events theo phiên làm việc */
function makeSessionId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

class AnalyticsService {
  private sessionStartTime: number | null = null;
  private currentScreen: string = 'Unknown';
  private currentUserId: string | null = null;
  private appVersion: string = Constants.expoConfig?.version || '1.0.0';
  /** Duy nhất cho mỗi lần app khởi động, nhóm events lại thành "session" */
  private readonly sessionId: string = makeSessionId();

  /** Gọi từ AuthContext sau khi đăng nhập / đăng xuất */
  setUserId(id: string | null) {
    this.currentUserId = id;
  }

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

  // Event → gửi lên Sentry Issues (nhìn thấy được trên Issues tab)
  private readonly SENTRY_TRACKED_EVENTS = new Set([
    'checkin_success',
    'checkin_failed',
    'checkout_success',
    'checkout_failed',
    'payment_blocked',
    'session_cancelled',
    'survey_submitted',
  ]);

  // Sentry Metrics — đếm và đo, hiển thị dạng chart trên Metrics tab
  // Note: API dùng "attributes" (không phải "tags")
  private trackSentryMetrics(eventName: string, params?: Record<string, any>) {
    try {
      const attrs: Record<string, string | number | boolean> = {
        screen: this.currentScreen,
        os: Platform.OS,
      };

      switch (eventName) {
        // ── Checkout funnel ──────────────────────────────────────────
        case 'checkout_started':
          Sentry.metrics.count('checkout.started', 1, { attributes: attrs });
          break;
        case 'checkout_success':
          Sentry.metrics.count('checkout.success', 1, { attributes: attrs });
          if (params?.total_fee != null) {
            Sentry.metrics.distribution('checkout.fee_vnd', Number(params.total_fee), { unit: 'vnd', attributes: attrs });
          }
          if (params?.duration_minutes != null) {
            Sentry.metrics.distribution('checkout.duration_minutes', Number(params.duration_minutes), { unit: 'minute', attributes: attrs });
          }
          break;
        case 'checkout_failed':
          Sentry.metrics.count('checkout.failed', 1, { attributes: attrs });
          break;
        case 'checkout_cancelled_by_user':
          Sentry.metrics.count('checkout.cancelled', 1, { attributes: attrs });
          break;

        // ── Check-in / Payment ───────────────────────────────────────
        case 'checkin_success':
          Sentry.metrics.count('checkin.success', 1, { attributes: attrs });
          break;
        case 'checkin_failed':
          Sentry.metrics.count('checkin.failed', 1, { attributes: attrs });
          break;
        case 'payment_blocked':
          Sentry.metrics.count('payment.blocked', 1, { attributes: attrs });
          break;

        // ── Session lifecycle ────────────────────────────────────────
        case 'session_start':
          Sentry.metrics.count('app.session.start', 1, { attributes: { os: Platform.OS } });
          break;
        case 'session_end':
          if (params?.duration_seconds != null) {
            Sentry.metrics.distribution('app.session.duration_sec', Number(params.duration_seconds), {
              unit: 'second',
              attributes: { os: Platform.OS },
            });
          }
          break;
        case 'session_cancelled':
          Sentry.metrics.count('session.cancelled', 1, { attributes: attrs });
          break;

        // ── Survey ───────────────────────────────────────────────────
        case 'survey_submitted':
          Sentry.metrics.count('survey.submitted', 1, { attributes: attrs });
          if (params?.overall_rating != null) {
            Sentry.metrics.gauge('survey.overall_rating', Number(params.overall_rating), { attributes: attrs });
          }
          break;

        // ── Navigation ───────────────────────────────────────────────
        case 'screen_view':
          Sentry.metrics.count('screen.view', 1, {
            attributes: { ...attrs, screen: params?.screen_name ?? this.currentScreen },
          });
          break;
      }
    } catch {
      // Metrics không critical — bỏ qua nếu lỗi
    }
  }

  /**
   * Ghi nhận một sự kiện bất kỳ (Custom Event).
   * - Lưu cục bộ vào AsyncStorage (offline buffer)
   * - Gửi lên backend NestJS để lưu vào PostgreSQL
   * - Gửi lên Sentry cho các event quan trọng
   */
  async logEvent(eventName: string, params?: Record<string, any>) {
    const timestamp = new Date().toISOString();

    // In log trong môi trường development để dễ debug
    if (IS_DEV) {
      console.log(`[Analytics] "${eventName}"`, { ...params, screen: this.currentScreen });
    }

    // ── 1. Sentry Metrics (charts trên Metrics tab) ───────────────────
    this.trackSentryMetrics(eventName, params);

    // ── 2. Sentry breadcrumb (trail đính kèm khi có lỗi) ──────────────
    Sentry.addBreadcrumb({
      category: 'user.action',
      message: eventName,
      data: { ...params, screen: this.currentScreen },
      level: 'info',
    });

    // ── 3. Sentry captureMessage cho event quan trọng ─────────────────
    if (this.SENTRY_TRACKED_EVENTS.has(eventName)) {
      const level = eventName.endsWith('_failed') || eventName.endsWith('_blocked')
        ? 'warning'
        : 'info';

      Sentry.captureMessage(eventName, {
        level,
        tags: {
          event_type: 'user_action',
          screen: this.currentScreen,
          device_os: Platform.OS,
        },
        extra: params,
      });
    }

    // ── 4. Gửi lên backend PostgreSQL (fire & forget) ─────────────────
    this.sendToBackend({
      eventName,
      params,
      screenName: this.currentScreen,
      sessionId: this.sessionId,
      userId: this.currentUserId ?? undefined,
      deviceOs: Platform.OS,
      appVersion: this.appVersion,
      clientTimestamp: timestamp,
    }).catch(() => {
      // Offline → thêm vào queue để sync sau
      this.queueOfflineEvent(eventName, params, timestamp);
    });

    // ── 5. Lưu cục bộ lịch sử gần nhất (100 events) ──────────────────
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

  /** POST một event lên backend */
  private async sendToBackend(payload: {
    eventName: string;
    params?: Record<string, any>;
    screenName?: string;
    sessionId?: string;
    userId?: string;
    deviceOs?: string;
    appVersion?: string;
    clientTimestamp?: string;
  }): Promise<void> {
    if (!API_BASE) return;
    await fetch(`${API_BASE}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  /** Thêm event vào queue offline để flush sau */
  private async queueOfflineEvent(
    eventName: string,
    params?: Record<string, any>,
    timestamp?: string,
  ) {
    try {
      const raw = await AsyncStorage.getItem('spa_analytics_offline_queue');
      const queue: any[] = raw ? JSON.parse(raw) : [];
      queue.push({
        eventName,
        params,
        screenName: this.currentScreen,
        sessionId: this.sessionId,
        userId: this.currentUserId ?? undefined,
        deviceOs: Platform.OS,
        appVersion: this.appVersion,
        clientTimestamp: timestamp ?? new Date().toISOString(),
      });
      // Giới hạn queue tối đa 200 events
      if (queue.length > 200) queue.splice(0, queue.length - 200);
      await AsyncStorage.setItem('spa_analytics_offline_queue', JSON.stringify(queue));
    } catch {
      // ignore
    }
  }

  /**
   * Gửi toàn bộ events trong offline queue lên backend.
   * Gọi khi app reconnect hoặc khi startSession().
   */
  async flushOfflineQueue() {
    if (!API_BASE) return;
    try {
      const raw = await AsyncStorage.getItem('spa_analytics_offline_queue');
      if (!raw) return;
      const queue: any[] = JSON.parse(raw);
      if (!queue.length) return;

      // Gửi từng event (đơn giản, không batch để giữ compatible)
      const sent: number[] = [];
      for (let i = 0; i < queue.length; i++) {
        try {
          await this.sendToBackend(queue[i]);
          sent.push(i);
        } catch {
          break; // Vẫn offline → dừng
        }
      }

      // Xóa những event đã gửi
      const remaining = queue.filter((_, i) => !sent.includes(i));
      await AsyncStorage.setItem('spa_analytics_offline_queue', JSON.stringify(remaining));

      if (IS_DEV && sent.length > 0) {
        console.log(`[Analytics] Flushed ${sent.length} offline events`);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Lấy danh sách lịch sử hành vi người dùng đã thực hiện
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

  /**
   * Báo cáo lỗi lên Sentry và ghi log local
   */
  captureError(error: unknown, context?: Record<string, any>) {
    if (IS_DEV) {
      console.error('[Analytics] Error captured:', error, context);
    }
    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      scope.setTag('screen', this.currentScreen);
      Sentry.captureException(error);
    });
  }
}

export const analyticsService = new AnalyticsService();
