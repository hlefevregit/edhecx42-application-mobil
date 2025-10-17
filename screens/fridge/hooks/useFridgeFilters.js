import { useState, useEffect } from 'react';
import { getItemStatus } from '../utils/fridgeHelpers';

export const useFridgeFilters = (fridgeItems) => {
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    let filtered = [...fridgeItems];
    
    switch (selectedFilter) {
      case 'expired':
        filtered = fridgeItems.filter(item => getItemStatus(item.expiryDate) === 'expired');
        break;
      case 'urgent':
        filtered = fridgeItems.filter(item => getItemStatus(item.expiryDate) === 'urgent');
        break;
      case 'soon':
        filtered = fridgeItems.filter(item => getItemStatus(item.expiryDate) === 'soon');
        break;
      case 'fresh':
        filtered = fridgeItems.filter(item => getItemStatus(item.expiryDate) === 'fresh');
        break;
      case 'all':
      default:
        filtered = fridgeItems;
    }
    
    filtered.sort((a, b) => {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });
    
    setFilteredItems(filtered);
  }, [fridgeItems, selectedFilter]);

  return {
    filteredItems,
    selectedFilter,
    setSelectedFilter
  };
};