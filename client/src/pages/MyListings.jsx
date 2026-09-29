import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit3, Trash2, Eye, MapPin, AlertCircle, Tractor, Inbox } from 'lucide-react';
import api from '../api/client';
import { formatCurrency, formatLocation, formatDate } from '../utils/formatters';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

export default function MyListings() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  const fetchMyEquipment = async () => {
    setLoading(true);
    try {
      const res = await api.get('/equipment/my');
      setEquipment(res.data.equipment || []);
    } catch (err) {
      console.error('Error fetching user equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEquipment();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/equipment/${deleteTarget.id}`);
      showToast('Equipment listing deleted successfully.', 'success');
      setEquipment((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete equipment.';
      showToast(msg, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Equipment Listings
          </h1>
          <p className="text-sm text-slate-500">
            Manage your machinery, track availability, and view rental inquiries
          </p>
        </div>

        <Link
          to="/equipment/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-sm text-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          List New Equipment
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : equipment.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm max-w-lg mx-auto my-12">
          <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto">
            <Tractor className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Equipment Listed</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            You haven't listed any agricultural equipment yet. Earn extra income by sharing your idle tractors, pumps, or tillers with neighbor farmers.
          </p>
          <Link
            to="/equipment/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md text-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            List Equipment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((item) => {
            const imageUrl = item.image_url.startsWith('/uploads')
              ? `http://localhost:5000${item.image_url}`
              : item.image_url;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                      {item.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                      {item.condition}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                        <MapPin className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                        <span className="truncate">{formatLocation(item)}</span>
                      </div>
                      <span className="text-[11px] font-bold capitalize text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {item.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                      {item.name}
                    </h3>

                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold text-primary-700">
                        {formatCurrency(item.price_per_day)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ day</span>
                    </div>

                    {/* Inquiry Badge */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Inquiries Received:</span>
                      <span className={`font-bold px-2 py-0.5 rounded-md ${
                        item.pending_requests > 0
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.total_requests || 0} ({item.pending_requests || 0} pending)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/equipment/${item.id}`}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                    title="View Public Details"
                  >
                    <Eye className="w-4 h-4 text-slate-500" />
                    View
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/equipment/${item.id}/edit`}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete equipment listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Equipment Listing?"
        message={`Are you sure you want to permanently remove "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Keep Listing"
        isDangerous={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
