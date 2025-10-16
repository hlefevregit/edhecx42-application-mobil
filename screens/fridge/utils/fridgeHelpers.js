export const getItemStatus = (expiryDate) => {
  if (!expiryDate) return 'fresh';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'urgent';
  if (diffDays <= 7) return 'soon';
  return 'fresh';
};

export const getStatusColor = (status) => {
  const colors = {
    expired: '#e74c3c',
    urgent: '#e67e22',
    soon: '#f39c12',
    fresh: '#2ecc71'
  };
  return colors[status] || colors.fresh;
};

export const getStatusLabel = (status) => {
  const labels = {
    expired: '🗑️ PÉRIMÉ',
    urgent: '⚠️ URGENT (3 jours)',
    soon: '⏰ Bientôt (7 jours)',
    fresh: '✅ Frais'
  };
  return labels[status] || labels.fresh;
};

export const getCategoryIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('lait') || lower.includes('yaourt') || lower.includes('fromage')) return '🥛';
  if (lower.includes('viande') || lower.includes('poulet')) return '🍖';
  if (lower.includes('poisson')) return '🐟';
  if (lower.includes('fruit') || lower.includes('pomme') || lower.includes('banane')) return '🍎';
  if (lower.includes('légume') || lower.includes('carotte') || lower.includes('tomate')) return '🥕';
  if (lower.includes('oeuf') || lower.includes('œuf')) return '🥚';
  return '🍽️';
};

export const getStatusCounts = (items) => {
  return {
    all: items.length,
    fresh: items.filter(item => getItemStatus(item.expiryDate) === 'fresh').length,
    soon: items.filter(item => getItemStatus(item.expiryDate) === 'soon').length,
    urgent: items.filter(item => getItemStatus(item.expiryDate) === 'urgent').length,
    expired: items.filter(item => getItemStatus(item.expiryDate) === 'expired').length,
  };
};