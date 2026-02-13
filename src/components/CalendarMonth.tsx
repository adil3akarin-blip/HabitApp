import {
    addDays,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    startOfMonth,
    startOfWeek,
} from 'date-fns';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { toISODate } from '../domain/dates';
import { colors } from '../theme/tokens';
import { hapticTap } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarMonthProps {
  month: Date;
  activeDates: Set<string>;
  color: string;
  onToggleDate: (dateISO: string) => void;
}

interface DayCell {
  date: Date;
  dateISO: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
}

interface DayCellComponentProps {
  day: DayCell;
  isActive: boolean;
  color: string;
  onToggle: () => void;
}

const DayCellComponent = React.memo(function DayCellComponent({
  day,
  isActive,
  color,
  onToggle,
}: DayCellComponentProps) {
  const scale = useSharedValue(1);
  const isDisabled = !day.isCurrentMonth || day.isFuture;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (isDisabled) return;
    hapticTap();
    scale.value = withSequence(
      withTiming(0.85, { duration: 60 }),
      withSpring(1, { damping: 12, stiffness: 400 })
    );
    onToggle();
  };

  return (
    <View style={styles.dayCell}>
      <AnimatedPressable
        style={[
          styles.dayContent,
          isActive && { backgroundColor: color },
          day.isToday && !isActive && styles.todayBorder,
          day.isToday && isActive && { borderColor: colors.text, borderWidth: 1.5 },
          day.isFuture && day.isCurrentMonth && styles.dayContentFuture,
          animatedStyle,
        ]}
        onPress={handlePress}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.dayText,
            !day.isCurrentMonth && styles.dayTextMuted,
            day.isFuture && day.isCurrentMonth && styles.dayTextFuture,
            isActive && styles.dayTextActive,
          ]}
        >
          {format(day.date, 'd')}
        </Text>
      </AnimatedPressable>
    </View>
  );
});

function CalendarMonth({ month, activeDates, color, onToggleDate }: CalendarMonthProps) {
  const today = new Date();

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: DayCell[] = [];
    let currentDate = calendarStart;

    while (currentDate <= calendarEnd) {
      days.push({
        date: currentDate,
        dateISO: toISODate(currentDate),
        isCurrentMonth: isSameMonth(currentDate, month),
        isToday: isSameDay(currentDate, today),
        isFuture: currentDate > today,
      });
      currentDate = addDays(currentDate, 1);
    }

    const weeksArray: DayCell[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksArray.push(days.slice(i, i + 7));
    }

    return weeksArray;
  }, [month, today]);

  return (
    <View style={styles.container}>
      <View style={styles.weekdayHeader}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((day) => (
            <DayCellComponent
              key={day.dateISO}
              day={day}
              isActive={activeDates.has(day.dateISO)}
              color={color}
              onToggle={() => onToggleDate(day.dateISO)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default React.memo(CalendarMonth);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textFaint,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    padding: 2,
  },
  dayContent: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayBorder: {
    borderWidth: 1.5,
    borderColor: colors.accentA,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  dayTextMuted: {
    color: colors.textFaint,
  },
  dayTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  dayContentFuture: {
    opacity: 0.4,
  },
  dayTextFuture: {
    color: colors.textFaint,
  },
});
