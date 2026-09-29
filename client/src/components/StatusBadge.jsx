import React from 'react';

export default function StatusBadge({ status }) {
  const styles = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    Completed: 'bg-slate-100 text-slate-700 border-slate-200',
    Cancelled: 'bg-gray-100 text-gray-600 border-gray-200'
  };

  const icons = {
    Pending: '🟡',
    Accepted: '🟢',
    Rejected: '🔴',
    Completed: '⚪',
    Cancelled: '🔘'
  };

  const currentStyle = styles[status] || styles.Pending;
  const currentIcon = icons[status] || '🟡';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStyle}`}>
      <span>{currentIcon}</span>
      <span>{status}</span>
    </span>
  );
}
