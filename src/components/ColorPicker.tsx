import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = [
  '#007AFF',
  '#34C759',
  '#FF3B30',
  '#FF9500',
  '#FFCC00',
  '#AF52DE',
  '#5856D6',
  '#00C7BE',
  '#FF2D55',
  '#A2845E',
  '#8E8E93',
  '#30B0C7',
  '#32ADE6',
  '#64D2FF',
  '#BF5AF2',
  '#FF6482',
];

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

function ColorPicker({ selectedColor, onSelect }: ColorPickerProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {COLORS.map((color) => {
        const isSelected = selectedColor === color;
        return (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              isSelected && styles.selected,
            ]}
            onPress={() => onSelect(color)}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default React.memo(ColorPicker);

export { COLORS };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 8,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
