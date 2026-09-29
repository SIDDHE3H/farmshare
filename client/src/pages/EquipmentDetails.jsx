import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Tag, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Phone, 
  User, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatLocation } from '../utils/formatters';
import RequestModal from '../components/RequestModal';
import { getMediaUrl } from '../utils/media';

export default function EquipmentDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/equipment/${id}`);
      setEquipment(res.data.equipment);
      setBookedDates(res.data.bookedDates || []);
    } catch (err) {
      console.error('Error fetching equipment details:', err);
      setError('Unable to load equipment details. It may have been removed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">Loading equipment details...</p>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Equipment Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'This listing does not exist.'}</p>
        <Link
          to="/equipment"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Find Equipment
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === equipment.owner_id;
  const imageUrl = getMediaUrl(equipment.image_url);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/equipment"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all equipment
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery & Description */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Large Image */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm aspect-video">
            <img
              src={imageUrl}
              alt={equipment.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-900 font-bold text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary-600" />
              {equipment.category}
            </div>
            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white font-semibold text-xs px-3 py-1.5 rounded-xl shadow-md">
              Condition: {equipment.condition}
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">About this Equipment</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {equipment.description}
            </p>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Condition</span>
                <span className="font-bold text-slate-800 text-sm">{equipment.condition}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Listing Status</span>
                <span className="font-bold text-emerald-600 text-sm capitalize">{equipment.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Available From</span>
                <span className="font-bold text-slate-800 text-sm">{formatDate(equipment.available_from)}</span>
              </div>
            </div>
          </div>

          {/* Booked Dates Calendar Card */}
          {bookedDates.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-700" />
                Existing Confirmed Bookings
              </h3>
              <p className="text-xs text-amber-800">
                This machinery is reserved on the following dates and cannot be double-booked:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {bookedDates.map((b) => (
                  <div key={b.id} className="bg-white/80 border border-amber-200 rounded-xl px-3 py-2 text-xs font-semibold text-amber-950 flex items-center justify-between">
                    <span>{formatDate(b.requested_from)} → {formatDate(b.requested_until)}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Reserved</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing, Location, Action Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-primary-700 font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                Verified Farmer Listing
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {equipment.name}
              </h1>
            </div>

            {/* Price Banner */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-primary-700">
                  {formatCurrency(equipment.price_per_day)}
                </span>
                <span className="text-sm text-slate-500 font-medium"> / day</span>
              </div>
              {equipment.price_per_hour && (
                <div className="text-right">
                  <span className="text-base font-bold text-slate-700">
                    {formatCurrency(equipment.price_per_hour)}
                  </span>
                  <span className="text-xs text-slate-500"> / hr</span>
                </div>
              )}
            </div>

            {/* Location Hierarchy Box */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Equipment Location
              </span>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-900 text-sm">Village: {equipment.village}</span>
                </div>
                <div className="pl-6 grid grid-cols-2 gap-2 text-slate-600">
                  <div><span className="text-slate-400">Taluka:</span> {equipment.taluka}</div>
                  <div><span className="text-slate-400">District:</span> {equipment.district}</div>
                  <div><span className="text-slate-400">State:</span> {equipment.state}</div>
                </div>
              </div>
            </div>

            {/* Owner Profile Card */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Equipment Owner
              </span>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-100 bg-slate-50">
                <div className="w-11 h-11 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {equipment.owner_name ? equipment.owner_name[0].toUpperCase() : 'O'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{equipment.owner_name}</h4>
                  <p className="text-xs text-slate-500 truncate">{equipment.owner_village}, {equipment.owner_district}</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              {isOwner ? (
                <div className="space-y-2">
                  <div className="p-3 bg-primary-50 text-primary-800 text-xs rounded-xl font-medium text-center">
                    You are the owner of this equipment listing.
                  </div>
                  <Link
                    to={`/equipment/${equipment.id}/edit`}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Listing
                  </Link>
                </div>
              ) : isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(true)}
                  className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 flex items-center justify-center gap-2 text-sm transition-all transform hover:-translate-y-0.5"
                >
                  <Calendar className="w-4 h-4" />
                  Request Equipment
                </button>
              ) : (
                <Link
                  to="/login"
                  state={{ from: { pathname: `/equipment/${equipment.id}` } }}
                  className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 flex items-center justify-center gap-2 text-sm transition-all"
                >
                  Login to Request
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Request Modal */}
      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        equipment={equipment}
        bookedDates={bookedDates}
        onSuccess={() => {
          fetchDetails();
          navigate('/my-requests');
        }}
      />
    </div>
  );
}
