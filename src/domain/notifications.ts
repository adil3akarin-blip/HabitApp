import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Habit Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

export async function scheduleHabitReminder(
  habitId: string,
  habitName: string,
  timeString: string,
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return null;
  }

  const [hours, minutes] = timeString.split(":").map(Number);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Habit Reminder",
      body: `Time to complete: ${habitName}`,
      data: { habitId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });

  return notificationId;
}

export async function cancelHabitReminder(
  notificationId: string,
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.warn("Failed to cancel notification:", e);
  }
}

export async function updateHabitReminder(
  habitId: string,
  habitName: string,
  timeString: string,
  existingNotifId: string | null,
): Promise<string | null> {
  if (existingNotifId) {
    await cancelHabitReminder(existingNotifId);
  }
  return scheduleHabitReminder(habitId, habitName, timeString);
}
