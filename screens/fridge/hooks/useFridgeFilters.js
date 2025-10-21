import { useMemo, useState } from 'react';
import { getExpiryStatus } from '../utils/fridgeHelpers';

export function useFridgeFilters(items) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredItems = useMemo(() => {
    if (!items) return [];
    
    if (selectedFilter === 'all') return items;

    return items.filter((item) => {
      const status = getExpiryStatus(item.expiryDate);
      return status === selectedFilter;
    });
  }, [items, selectedFilter]);

  return {
    filteredItems,
    selectedFilter,
    setSelectedFilter,
  };
}