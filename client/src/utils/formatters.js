export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatLocation = (item) => {
  if (!item) return '';
  const parts = [item.village, item.taluka, item.district].filter(Boolean);
  return parts.join(', ') || item.state || '';
};

export const CATEGORIES = [
  { name: 'Tractor', icon: '🚜', description: 'Ploughing, haulage, land leveling' },
  { name: 'Rotavator', icon: '🌱', description: 'Soil pulverization & seedbed preparation' },
  { name: 'Harvester', icon: '🌾', description: 'Grain cutting, threshing, & cleaning' },
  { name: 'Water Pump', icon: '💧', description: 'Field inundation & drip pumping' },
  { name: 'Sprayer', icon: '🌿', description: 'Crop protection & fertilizer misting' },
  { name: 'Seed Drill', icon: '🌱', description: 'Precise line sowing & fertilizer placement' }
];

export const CONDITIONS = ['Excellent', 'Good', 'Fair'];
