import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CustomColors } from '../core/colors';

interface FilterChipsProps {
  filters: string[];
  initialFilter?: string;
  onFilterChange: (filter: string) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  initialFilter = 'Todos',
  onFilterChange,
}) => {
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  const handleFilterPress = (filter: string) => {
    if (filter === activeFilter && filter !== 'Todos') {
      setActiveFilter('Todos');
      onFilterChange('Todos');
    } else {
      setActiveFilter(filter);
      onFilterChange(filter);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        style={styles.scrollView}
      >
        {filters.map((filter, index) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => handleFilterPress(filter)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 40,
    marginVertical: 8,
  },
  scrollView: {
    flexGrow: 0,
  },
  container: {
    paddingVertical: 0,
    alignItems: 'center',
    height: 40,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: CustomColors.activeColor + '33', // 20% opacity
    marginRight: 8,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: CustomColors.activeColor,
  },
  chipText: {
    color: CustomColors.black,
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: CustomColors.white,
    fontWeight: 'bold',
  },
});

export default FilterChips;


