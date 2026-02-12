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
import { springBounce } from '../ui/motion';
import { hapticMedium, hapticSelection } from '../utils/haptics';

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (!isActive) {
      hapticMedium();
    } else {
      hapticSelection();
    }
    scale.value = withSequence(
      withTiming(0.8, { duration: 60 }),
      withSpring(1, springBounce),
    );
    onToggle();
  };

  return (
    <View style={styles.dayCell}>
      <AnimatedPressable
        style={[
          styles.dayContent,
          isActive && {
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: 0.4,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
          },
          day.isToday && !isActive && styles.todayBorder,
          day.isToday && isActive && { borderColor: '#fff', borderWidth: 2 },
          animatedStyle,
        ]}
        onPress={handlePress}
        disabled={!day.isCurrentMonth}
        accessibilityRole="button"
        accessibilityLabel={`${format(day.date, 'MMMM d')}${isActive ? ', completed' : ''}`}
      >
        <Text
          style={[
            styles.dayText,
            !day.isCurrentMonth && styles.dayTextMuted,
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
    borderWidth: 2,
    borderColor: colors.accentB,
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
});
