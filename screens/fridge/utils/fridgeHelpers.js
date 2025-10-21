// Calculer le statut d'expiration
export function getExpiryStatus(expiryDate) {
  if (!expiryDate) return 'fresh';
  
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'expiringSoon';
  return 'fresh';
}

// Obtenir l'icône selon la catégorie
export function getCategoryIcon(category) {
  const icons = {
    vegetables: 'leaf',
    fruits: 'nutrition',
    meat: 'restaurant',
    fish: 'fish',
    dairy: 'water',
    frozen: 'snow',
    drinks: 'beer',
    condiments: 'flask',
    other: 'cube',
  };
  return icons[category] || 'cube-outline';
}

// Compter les aliments par statut
export function getStatusCounts(items) {
  const counts = {
    fresh: 0,
    expiringSoon: 0,
    expired: 0,
    total: items.length,
  };

  items.forEach((item) => {
    const status = getExpiryStatus(item.expiryDate);
    counts[status]++;
  });

  return counts;
}

// Trier les aliments par date d'expiration
export function sortByExpiry(items) {
  return [...items].sort((a, b) => {
    if (!a.expiryDate) return 1;
    if (!b.expiryDate) return -1;
    return new Date(a.expiryDate) - new Date(b.expiryDate);
  });
}

// Filtrer par zone (fridge, freezer, pantry)
export function filterByZone(items, zone) {
  if (!zone || zone === 'all') return items;
  return items.filter((item) => item.zone === zone);
}

// Filtrer par catégorie
export function filterByCategory(items, category) {
  if (!category || category === 'all') return items;
  return items.filter((item) => item.category === category);
}

// Suggérer une date d'expiration selon la catégorie
export function suggestExpiryDate(category) {
  const daysMap = {
    vegetables: 7,
    fruits: 5,
    meat: 3,
    fish: 2,
    dairy: 7,
    frozen: 90,
    drinks: 30,
    condiments: 180,
    other: 14,
  };

  const days = daysMap[category] || 7;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}