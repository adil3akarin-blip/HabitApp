import * as Haptics from "expo-haptics";

export async function hapticTap(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (e) {
    // Silently fail - haptics not available
  }
}

export async function hapticSuccess(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (e) {
    // Silently fail - haptics not available
  }
}

export async function hapticWarning(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (e) {
    // Silently fail - haptics not available
  }
}

export async function hapticSelection(): Promise<void> {
  try {
    await Haptics.selectionAsync();
  } catch (e) {
    // Silently fail - haptics not available
  }
}

export async function hapticMedium(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (e) {
    // Silently fail - haptics not available
  }
}
