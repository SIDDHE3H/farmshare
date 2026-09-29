import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES, CONDITIONS } from '../utils/formatters';
import { getMediaUrl } from '../utils/media';

export default function EditEquipment() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get(`/equipment/${id}`);
        const item = res.data.equipment;

        // Check ownership
        if (user && item.owner_id !== user.id) {
          showToast('You can only edit your own equipment listings.', 'error');
          navigate('/my-listings');
          return;
        }

        setFormData({
          name: item.name,
          category: item.category,
          description: item.description,
          village: item.village,
          taluka: item.taluka,
          district: item.district,
          state: item.state,
          price_per_day: item.price_per_day,
          price_per_hour: item.price_per_hour || '',
          available_from: item.available_from,
          available_until: item.available_until,
          condition: item.condition,
          image_url: item.image_url,
          status: item.status
        });

        setPreviewUrl(getMediaUrl(item.image_url));
      } catch (err) {
        console.error('Error fetching equipment for edit:', err);
        setError('Equipment not found or access denied.');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });

      if (selectedFile) {
        submitData.append('image', selectedFile);
      }

      const res = await api.put(`/equipment/${id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast(res.data.message || 'Equipment updated successfully.', 'success');
      navigate('/my-listings');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update equipment.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading equipment details...</p>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Error</h2>
        <p className="text-sm text-slate-500">{error || 'Unable to edit equipment.'}</p>
        <button
          onClick={() => navigate('/my-listings')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold"
        >
          Back to My Listings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/my-listings')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Listings
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Edit Equipment Listing
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update pricing, dates, condition, or details for your machinery
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
              <div className="grid grid-cols-3 gap-2">
                {CONDITIONS.map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, condition: cond }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center ${
                      formData.condition === cond
                        ? 'bg-primary-50 border-primary-600 text-primary-700'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Listing Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="available">Available</option>
                <option value="rented">Rented / In Use</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Village</label>
              <input
                type="text"
                name="village"
                required
                value={formData.village}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Taluka</label>
              <input
                type="text"
                name="taluka"
                required
                value={formData.taluka}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
              <input
                type="text"
                name="district"
                required
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Pricing & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price per Day (₹)</label>
              <input
                type="number"
                name="price_per_day"
                required
                value={formData.price_per_day}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price per Hour (Optional ₹)</label>
              <input
                type="number"
                name="price_per_hour"
                value={formData.price_per_hour}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Available From</label>
              <input
                type="date"
                name="available_from"
                required
                value={formData.available_from}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Available Until</label>
              <input
                type="date"
                name="available_until"
                required
                value={formData.available_until}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Update Photo</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary-600" />
                <span>Upload New Photo</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {selectedFile && <span className="text-xs text-emerald-600 font-medium">{selectedFile.name}</span>}
            </div>
            <div className="pt-2">
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={(e) => {
                  handleChange(e);
                  setPreviewUrl(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Or paste image URL"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/my-listings')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
