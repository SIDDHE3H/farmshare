import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, CheckCircle2, XCircle, Phone, Calendar, User, AlertTriangle, Clock } from 'lucide-react';
import api from '../api/client';
import { formatCurrency, formatDate } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { getMediaUrl } from '../utils/media';

export default function RequestsReceived() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const { showToast } = useToast();

  const fetchReceivedRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests/received');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Error fetching incoming requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivedRequests();
  }, []);

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      setActionLoadingId(requestId);
      const res = await api.put(`/requests/${requestId}/status`, { status: newStatus });
      showToast(res.data.message || `Request ${newStatus.toLowerCase()} successfully.`, 'success');
      fetchReceivedRequests();
    } catch (err) {
      const msg = err.response?.data?.message || `Unable to ${newStatus.toLowerCase()} request.`;
      showToast(msg, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Requests Received
          </h1>
          <p className="text-sm text-slate-500">
            Review and respond to rental inquiries submitted for your listed machinery
          </p>
        </div>

        <Link
          to="/my-listings"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
        >
          View My Machinery
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm max-w-lg mx-auto my-12">
          <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Inquiries Received</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            You don't have any incoming equipment rental requests yet. Ensure your listings have attractive photos and clear daily rental rates.
          </p>
          <Link
            to="/equipment/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md text-sm transition-all"
          >
            List Another Machine
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isActing = actionLoadingId === req.id;
            const imageUrl = getMediaUrl(req.equipment_image);

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Requester & Equipment info */}
                <div className="flex items-start gap-4">
                  <img
                    src={imageUrl}
                    alt={req.equipment_name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-100 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {req.equipment_name}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>

                    {/* Requester Contact Pill */}
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-primary-600" />
                        Farmer: {req.requester_name}
                      </span>
                      <span className="text-slate-500">
                        Village: <strong>{req.requester_village}, {req.requester_taluka}</strong>
                      </span>
                      <a
                        href={`tel:${req.requester_phone}`}
                        className="inline-flex items-center gap-1 font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {req.requester_phone}
                      </a>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                      "{req.message}"
                    </p>
                  </div>
                </div>

                {/* Right: Booking Window, Financials, and Decisions */}
                <div className="flex flex-row md:flex-col md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 gap-4">
                  <div className="text-left md:text-right space-y-1">
                    <div className="text-xs font-bold text-slate-700 flex items-center md:justify-end gap-1">
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

                  {req.status === 'Pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleUpdateStatus(req.id, 'Accepted')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-200 text-xs flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Accept
                      </button>

                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 text-xs flex items-center gap-1.5 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">
                      Decision Recorded
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
