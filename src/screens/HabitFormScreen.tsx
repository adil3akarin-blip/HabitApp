import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { HomeStackParamList } from '../app/navigation/HomeStack';
import AnimatedSection from '../components/AnimatedSection';
import ColorPicker, { COLORS } from '../components/ColorPicker';
import IconPicker, { ICONS } from '../components/IconPicker';
import AnimatedPressable from '../components/ui/AnimatedPressable';
import GlassSurface from '../components/ui/GlassSurface';
import * as habitsRepo from '../db/habitsRepo';
import { GoalPeriod } from '../domain/models';
import {
  cancelHabitReminder,
  requestNotificationPermissions,
  scheduleHabitReminder,
} from '../domain/notifications';
import { useHabitsStore } from '../state/useHabitsStore';
import { colors, radii } from '../theme/tokens';
import PressFeedback from '../ui/press/PressFeedback';
import { hapticSuccess } from '../utils/haptics';

type HabitFormScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'HabitForm'>;
  route: RouteProp<HomeStackParamList, 'HabitForm'>;
};

const GOAL_PERIODS: { value: GoalPeriod; label: string }[] = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];

export default function HabitFormScreen({ navigation, route }: HabitFormScreenProps) {
  const habitId = route.params?.habitId;
  const isEditMode = !!habitId;

  const { habits, createHabit, updateHabit } = useHabitsStore();
  const existingHabit = isEditMode ? habits.find((h) => h.id === habitId) : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<string>(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [goalPeriod, setGoalPeriod] = useState<GoalPeriod>('day');
  const [goalTarget, setGoalTarget] = useState('1');
  const [nameError, setNameError] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState('09');
  const [reminderMinute, setReminderMinute] = useState('00');

  useEffect(() => {
    if (existingHabit) {
      setName(existingHabit.name);
      setDescription(existingHabit.description || '');
      setIcon(existingHabit.icon);
      setColor(existingHabit.color);
      setGoalPeriod(existingHabit.goalPeriod);
      setGoalTarget(existingHabit.goalTarget.toString());
      setReminderEnabled(existingHabit.reminderEnabled);
      if (existingHabit.reminderTime) {
        const [h, m] = existingHabit.reminderTime.split(':');
        setReminderHour(h);
        setReminderMinute(m);
      }
    }
  }, [existingHabit]);

  const handleReminderToggle = async (value: boolean) => {
    if (value) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to use reminders.'
        );
        return;
      }
    }
    setReminderEnabled(value);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Habit' : 'New Habit',
      headerStyle: { backgroundColor: colors.bg },
      headerTintColor: colors.text,
      headerTitleStyle: { color: colors.text, fontWeight: '600' },
      headerShadowVisible: false,
    });
  }, [navigation, isEditMode]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Name is required');
      return;
    }

    const target = parseInt(goalTarget, 10);
    if (isNaN(target) || target < 1) {
      Alert.alert('Invalid Goal', 'Goal target must be at least 1');
      return;
    }

    try {
      const reminderTime = `${reminderHour}:${reminderMinute}`;
      
      if (isEditMode && habitId) {
        // Handle reminder updates
        let reminderNotifId = existingHabit?.reminderNotifId || null;
        
        if (reminderEnabled && existingHabit) {
          // Cancel old notification if exists
          if (existingHabit.reminderNotifId) {
            await cancelHabitReminder(existingHabit.reminderNotifId);
          }
          // Schedule new notification
          reminderNotifId = await scheduleHabitReminder(habitId, trimmedName, reminderTime);
        } else if (!reminderEnabled && existingHabit?.reminderNotifId) {
          // Cancel notification if disabled
          await cancelHabitReminder(existingHabit.reminderNotifId);
          reminderNotifId = null;
        }

        await updateHabit(habitId, {
          name: trimmedName,
          description: description.trim() || undefined,
          icon,
          color,
          goalPeriod,
          goalTarget: target,
          reminderEnabled,
          reminderTime: reminderEnabled ? reminderTime : undefined,
          reminderNotifId,
        });
      } else {
        // Create new habit
        await createHabit({
          name: trimmedName,
          description: description.trim() || undefined,
          icon,
          color,
          goalPeriod,
          goalTarget: target,
          reminderEnabled,
          reminderTime: reminderEnabled ? reminderTime : undefined,
        });

        // Schedule notification for new habit if enabled
        if (reminderEnabled) {
          // Get the newly created habit to get its ID
          const habits = await habitsRepo.listActive();
          const newHabit = habits.find(h => h.name === trimmedName);
          if (newHabit) {
            const notifId = await scheduleHabitReminder(newHabit.id, trimmedName, reminderTime);
            if (notifId) {
              await habitsRepo.update(newHabit.id, { reminderNotifId: notifId });
            }
          }
        }
      }
      navigation.goBack();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save habit');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <AnimatedSection index={0}>
        <View style={styles.previewCard}>
          <View style={[styles.previewIcon, { backgroundColor: color + '18' }]}>
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={color}
            />
          </View>
          <Text style={styles.previewName} numberOfLines={1}>
            {name || 'Your habit'}
          </Text>
        </View>
        </AnimatedSection>

        <AnimatedSection index={1}>
        <GlassSurface style={styles.section}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (nameError) setNameError('');
            }}
            placeholder="e.g., Morning Exercise"
            placeholderTextColor={colors.textFaint}
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        </GlassSurface>
        </AnimatedSection>

        <AnimatedSection index={2}>
        <GlassSurface style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description..."
            placeholderTextColor={colors.textFaint}
            multiline
            numberOfLines={3}
          />
        </GlassSurface>
        </AnimatedSection>

        <AnimatedSection index={3}>
        <GlassSurface style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <ColorPicker selectedColor={color} onSelect={setColor} />
        </GlassSurface>
        </AnimatedSection>

        <AnimatedSection index={4}>
        <GlassSurface style={styles.section}>
          <Text style={styles.label}>Icon</Text>
          <IconPicker selectedIcon={icon} onSelect={setIcon} color={color} />
        </GlassSurface>
        </AnimatedSection>

        <AnimatedSection index={5}>
        <GlassSurface style={styles.section}>
          <Text style={styles.label}>Goal Period</Text>
          <View style={styles.periodContainer}>
            {GOAL_PERIODS.map((period) => (
              <PressFeedback
                key={period.value}
                style={[
                  styles.periodButton,
                  goalPeriod === period.value && { backgroundColor: color },
                ]}
                onPress={() => setGoalPeriod(period.value)}
                depth={0.92}
                haptic
              >
                <Text
                  style={[
                    styles.periodText,
                    goalPeriod === period.value && styles.periodTextSelected,
                  ]}
                >
                  {period.label}
                </Text>
              </PressFeedback>
            ))}
          </View>
        </GlassSurface>
        </AnimatedSection>

        <AnimatedSection index={6}>
        <GlassSurface style={styles.section}>
          <Text style={styles.label}>Goal Target</Text>
          <View style={styles.targetContainer}>
            <PressFeedback
              style={styles.targetButton}
              onPress={() => {
                const current = parseInt(goalTarget, 10) || 1;
                if (current > 1) setGoalTarget((current - 1).toString());
              }}
              depth={0.85}
              haptic
            >
              <Text style={styles.targetButtonText}>−</Text>
            </PressFeedback>
            <TextInput
              style={styles.targetInput}
              value={goalTarget}
              onChangeText={setGoalTarget}
              keyboardType="number-pad"
              textAlign="center"
            />
            <PressFeedback
              style={styles.targetButton}
              onPress={() => {
                const current = parseInt(goalTarget, 10) || 0;
                setGoalTarget((current + 1).toString());
              }}
              depth={0.85}
              haptic
            >
              <Text style={styles.targetButtonText}>+</Text>
            </PressFeedback>
            <Text style={styles.targetLabel}>
              times per {goalPeriod}
            </Text>
          </View>
        </GlassSurface>
        </AnimatedSection>

        <AnimatedSection index={7}>
        <GlassSurface style={styles.section}>
          <Text style={styles.label}>Daily Reminder</Text>
          <View style={styles.reminderRow}>
            <View style={styles.reminderInfo}>
              <Ionicons name="notifications-outline" size={22} color={colors.textMuted} />
              <Text style={styles.reminderLabel}>Enable reminder</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={handleReminderToggle}
              trackColor={{ false: colors.glass, true: color }}
            />
          </View>
          {reminderEnabled && (
            <View style={styles.timePickerRow}>
              <Text style={styles.timeLabel}>Remind at:</Text>
              <View style={styles.timePicker}>
                <TextInput
                  style={styles.timeInput}
                  value={reminderHour}
                  onChangeText={(t) => setReminderHour(t.replace(/[^0-9]/g, '').slice(0, 2))}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="09"
                  placeholderTextColor={colors.textFaint}
                />
                <Text style={styles.timeColon}>:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={reminderMinute}
                  onChangeText={(t) => setReminderMinute(t.replace(/[^0-9]/g, '').slice(0, 2))}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="00"
                  placeholderTextColor={colors.textFaint}
                />
              </View>
            </View>
          )}
        </GlassSurface>
        </AnimatedSection>

        <AnimatedSection index={8}>
        <AnimatedPressable
          style={[styles.saveButton, { backgroundColor: color }]}
          onPress={async () => {
            await handleSave();
            hapticSuccess();
          }}
          scaleValue={0.98}
        >
          <Text style={styles.saveButtonText}>
            {isEditMode ? 'Save Changes' : 'Create Habit'}
          </Text>
        </AnimatedPressable>
        </AnimatedSection>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  previewName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
    flex: 1,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.glassStrong,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.card,
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  periodTextSelected: {
    color: '#fff',
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  targetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetButtonText: {
    fontSize: 24,
    color: colors.text,
  },
  targetInput: {
    width: 60,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.glassStrong,
  },
  targetLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  saveButton: {
    marginTop: 10,
    marginBottom: 40,
    borderRadius: radii.button,
    backgroundColor: colors.accentA,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reminderLabel: {
    fontSize: 16,
    color: colors.text,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    width: 50,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: colors.glassStrong,
    color: colors.text,
  },
  timeColon: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 8,
    color: colors.text,
  },
});
