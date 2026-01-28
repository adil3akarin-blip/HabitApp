import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { generateGridCells, groupCellsByWeek, GridCell } from '../domain/grid';

const INACTIVE_CELL_COLOR = 'rgba(255,255,255,0.08)';

interface HabitGridProps {
  startISO: string;
  endISO: string;
  activeDates: Set<string>;
  color: string;
  cellSize?: number;
  cellGap?: number;
}

const GridCellView = React.memo(function GridCellView({
  isActive,
  color,
  size,
}: {
  isActive: boolean;
  color: string;
  size: number;
}) {
  return (
    <View
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: isActive ? color : INACTIVE_CELL_COLOR,
        },
      ]}
    />
  );
});

function HabitGrid({
  startISO,
  endISO,
  activeDates,
  color,
  cellSize = 10,
  cellGap = 2,
}: HabitGridProps) {
  const weeks = useMemo(() => {
    const cells = generateGridCells(startISO, endISO);
    return groupCellsByWeek(cells);
  }, [startISO, endISO]);

  return (
    <View style={styles.container}>
      <View style={[styles.grid, { gap: cellGap }]}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={[styles.column, { gap: cellGap }]}>
            {week.map((cell) => (
              <GridCellView
                key={cell.date}
                isActive={activeDates.has(cell.date)}
                color={color}
                size={cellSize}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export default React.memo(HabitGrid);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  cell: {
    borderRadius: 2,
  },
});
