import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  async registerForPushNotificationsAsync() {
    if (!Device.isDevice) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return (await Notifications.getExpoPushTokenAsync()).data;
  },

  async scheduleSessionReminder(minutesRemaining: number, locationName: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Sắp hết giờ gửi xe!',
        body: `Phiên gửi xe tại ${locationName} còn khoảng ${minutesRemaining} phút nữa là hết hạn ước tính.`,
        data: { screen: 'history' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2, // For demo, we show it almost immediately or after a short delay
        channelId: 'default',
      },
    });
  },

  async scheduleCarSpotReminder(spotInfo: string) {
    // Schedule a reminder after 3 hours as per Phase 6.3
    // For demo/testing, let's also allow a short delay
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Ghi nhớ vị trí xe',
        body: `Xe của bạn đang ở: ${spotInfo}. Chúc bạn một ngày tốt lành!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3 * 3600, // 3 hours
        channelId: 'default',
      },
    });
  },

  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
};
