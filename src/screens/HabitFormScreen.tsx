import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../app/navigation/HomeStack';
import { useHabitsStore } from '../state/useHabitsStore';
import { GoalPeriod } from '../domain/models';
import IconPicker, { ICONS } from '../components/IconPicker';
import ColorPicker, { COLORS } from '../components/ColorPicker';

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

  useEffect(() => {
    if (existingHabit) {
      setName(existingHabit.name);
      setDescription(existingHabit.description || '');
      setIcon(existingHabit.icon);
      setColor(existingHabit.color);
      setGoalPeriod(existingHabit.goalPeriod);
      setGoalTarget(existingHabit.goalTarget.toString());
    }
  }, [existingHabit]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Habit' : 'New Habit',
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
      if (isEditMode && habitId) {
        await updateHabit(habitId, {
          name: trimmedName,
          description: description.trim() || undefined,
          icon,
          color,
          goalPeriod,
          goalTarget: target,
        });
      } else {
        await createHabit({
          name: trimmedName,
          description: description.trim() || undefined,
          icon,
          color,
          goalPeriod,
          goalTarget: target,
        });
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save habit');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (nameError) setNameError('');
            }}
            placeholder="e.g., Morning Exercise"
            placeholderTextColor="#999"
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <ColorPicker selectedColor={color} onSelect={setColor} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Icon</Text>
          <IconPicker selectedIcon={icon} onSelect={setIcon} color={color} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Goal Period</Text>
          <View style={styles.periodContainer}>
            {GOAL_PERIODS.map((period) => (
              <TouchableOpacity
                key={period.value}
                style={[
                  styles.periodButton,
                  goalPeriod === period.value && { backgroundColor: color },
                ]}
                onPress={() => setGoalPeriod(period.value)}
              >
                <Text
                  style={[
                    styles.periodText,
                    goalPeriod === period.value && styles.periodTextSelected,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Goal Target</Text>
          <View style={styles.targetContainer}>
            <TouchableOpacity
              style={styles.targetButton}
              onPress={() => {
                const current = parseInt(goalTarget, 10) || 1;
                if (current > 1) setGoalTarget((current - 1).toString());
              }}
            >
              <Text style={styles.targetButtonText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.targetInput}
              value={goalTarget}
              onChangeText={setGoalTarget}
              keyboardType="number-pad"
              textAlign="center"
            />
            <TouchableOpacity
              style={styles.targetButton}
              onPress={() => {
                const current = parseInt(goalTarget, 10) || 0;
                setGoalTarget((current + 1).toString());
              }}
            >
              <Text style={styles.targetButtonText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.targetLabel}>
              times per {goalPeriod}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: color }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {isEditMode ? 'Save Changes' : 'Create Habit'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF3B30',
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
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
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
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetButtonText: {
    fontSize: 24,
    color: '#333',
  },
  targetInput: {
    width: 60,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  targetLabel: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
