import React, { useState, useMemo } from 'react';
import { X, Calendar, Phone, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export default function RequestModal({ isOpen, onClose, equipment, bookedDates = [], onSuccess }) {
  const { showToast } = useToast();
  const [requestedFrom, setRequestedFrom] = useState('');
  const [requestedUntil, setRequestedUntil] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const durationDays = useMemo(() => {
    if (!requestedFrom || !requestedUntil) return 0;
    const start = new Date(requestedFrom);
    const end = new Date(requestedUntil);
    if (end < start) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [requestedFrom, requestedUntil]);

  const totalPrice = useMemo(() => {
    if (!equipment || durationDays <= 0) return 0;
    return durationDays * equipment.price_per_day;
  }, [equipment, durationDays]);

  const hasConflict = useMemo(() => {
    if (!requestedFrom || !requestedUntil || !bookedDates.length) return false;
    return bookedDates.some((b) => {
      return !(requestedUntil < b.requested_from || requestedFrom > b.requested_until);
    });
  }, [requestedFrom, requestedUntil, bookedDates]);

  if (!isOpen || !equipment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!requestedFrom || !requestedUntil) {
      setFormError('Please select both start and end rental dates.');
      return;
    }

    if (new Date(requestedUntil) < new Date(requestedFrom)) {
      setFormError('Return date cannot be earlier than start date.');
      return;
    }

    if (hasConflict) {
      setFormError('The selected dates overlap with an already accepted booking. Please choose different dates.');
      return;
    }

    if (!contactNumber || contactNumber.trim().length < 8) {
      setFormError('Please provide a valid contact phone number.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        equipment_id: equipment.id,
        requested_from: requestedFrom,
        requested_until: requestedUntil,
        duration_days: durationDays,
        contact_number: contactNumber.trim(),
        message: message.trim() || `Hello, I would like to rent your ${equipment.name}.`
      };

      const res = await api.post('/requests', payload);
      showToast(res.data.message || 'Request sent successfully.', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to submit request. Please try again.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Request Equipment</h3>
            <p className="text-xs text-slate-500 font-medium">{equipment.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-primary-50/70 border border-primary-100 rounded-xl p-3 my-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-600 font-medium">Daily Rental Rate:</span>
            <div className="text-base font-extrabold text-primary-800">
              {formatCurrency(equipment.price_per_day)} / day
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-600 font-medium">Owner:</span>
            <div className="text-xs font-bold text-slate-800">{equipment.owner_name}</div>
          </div>
        </div>

        {bookedDates.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <div className="font-semibold mb-1 flex items-center gap-1 text-amber-800">
              <Calendar className="w-3.5 h-3.5" />
              Already Booked Dates:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-700">
              {bookedDates.map((b) => (
                <li key={b.id}>
                  {formatDate(b.requested_from)} to {formatDate(b.requested_until)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                min={equipment.available_from || new Date().toISOString().split('T')[0]}
                max={equipment.available_until}
                value={requestedFrom}
                onChange={(e) => setRequestedFrom(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Return Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                min={requestedFrom || equipment.available_from || new Date().toISOString().split('T')[0]}
                max={equipment.available_until}
                value={requestedUntil}
                onChange={(e) => setRequestedUntil(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {durationDays > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Duration:</span>
                <span className="font-semibold text-slate-900">{durationDays} day(s)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Rate per day:</span>
                <span>{formatCurrency(equipment.price_per_day)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-primary-700 pt-1 border-t border-slate-200">
                <span>Estimated Total:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                placeholder="e.g. +91 98220 11234"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">The owner will use this number to coordinate handover.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message to Owner (Optional)
            </label>
            <div className="relative">
              <textarea
                rows={3}
                placeholder="Describe your farming activity or questions for the owner..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || hasConflict}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm flex items-center gap-1.5 transition-all ${
                hasConflict || submitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 shadow-primary-200'
              }`}
            >
              {submitting ? 'Sending...' : 'Send Rental Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
