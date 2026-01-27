import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'star',
  'heart',
  'fitness',
  'water',
  'book',
  'musical-notes',
  'code-slash',
  'walk',
  'bicycle',
  'bed',
  'cafe',
  'restaurant',
  'leaf',
  'flash',
  'bulb',
  'trophy',
  'medal',
  'ribbon',
  'rocket',
  'airplane',
  'car',
  'home',
  'briefcase',
  'school',
  'library',
  'calculator',
  'pencil',
  'brush',
  'camera',
  'game-controller',
  'headset',
  'mic',
  'call',
  'mail',
  'chatbubble',
];

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (icon: string) => void;
  color: string;
}

function IconPicker({ selectedIcon, onSelect, color }: IconPickerProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {ICONS.map((icon) => {
        const isSelected = selectedIcon === icon;
        return (
          <TouchableOpacity
            key={icon}
            style={[
              styles.iconButton,
              isSelected && { backgroundColor: color, borderColor: color },
            ]}
            onPress={() => onSelect(icon)}
          >
            <Ionicons
              name={icon}
              size={24}
              color={isSelected ? '#fff' : '#666'}
            />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default React.memo(IconPicker);

export { ICONS };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
