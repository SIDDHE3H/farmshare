import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Calendar, MapPin, User, XCircle, Search, Clock } from 'lucide-react';
import api from '../api/client';
import { formatCurrency, formatDate, formatLocation } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { getMediaUrl } from '../utils/media';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const { showToast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests/my-requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Error fetching sent requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;

    try {
      await api.put(`/requests/${cancelTarget.id}/cancel`);
      showToast('Rental request cancelled.', 'info');
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to cancel request.';
      showToast(msg, 'error');
    } finally {
      setCancelTarget(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Equipment Requests
          </h1>
          <p className="text-sm text-slate-500">
            Track rental requests you have submitted to equipment owners
          </p>
        </div>

        <Link
          to="/equipment"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm text-xs transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          Browse More Equipment
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm max-w-lg mx-auto my-12">
          <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Requests Yet</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your equipment requests will appear here. Find tractors, harvesters, or pumps available near your village and send rental requests.
          </p>
          <Link
            to="/equipment"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md text-sm transition-all"
          >
            Find Equipment
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const imageUrl = getMediaUrl(req.equipment_image);

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Thumbnail & Equipment Info */}
                <div className="flex items-start gap-4">
                  <img
                    src={imageUrl}
                    alt={req.equipment_name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-100 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                        {req.equipment_category}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>

                    <Link
                      to={`/equipment/${req.equipment_id}`}
                      className="font-bold text-slate-900 text-base hover:text-primary-700 transition-colors block truncate"
                    >
                      {req.equipment_name}
                    </Link>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Owner: <strong className="text-slate-700">{req.owner_name}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {req.equipment_village}, {req.equipment_district}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 italic line-clamp-1 pt-1">
                      "{req.message}"
                    </div>
                  </div>
                </div>

                {/* Right: Dates, Total Cost, Action */}
                <div className="flex flex-row md:flex-col md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 gap-3">
                  <div className="text-left md:text-right space-y-1">
                    <div className="text-xs font-semibold text-slate-700 flex items-center md:justify-end gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary-600" />
                      {formatDate(req.requested_from)} → {formatDate(req.requested_until)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Duration: <span className="font-semibold text-slate-800">{req.duration_days} day(s)</span>
                    </div>
                    <div className="text-lg font-extrabold text-primary-700">
                      {formatCurrency(req.total_price)}
                    </div>
                  </div>

                  {req.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(req)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={!!cancelTarget}
        title="Cancel Equipment Request?"
        message={`Are you sure you want to cancel your rental inquiry for "${cancelTarget?.equipment_name}"?`}
        confirmText="Yes, Cancel"
        cancelText="No, Keep Request"
        isDangerous={true}
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
