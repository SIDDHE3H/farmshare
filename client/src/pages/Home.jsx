import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, Tractor, ArrowRight, ShieldCheck, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import EquipmentCard from '../components/EquipmentCard';
import { CATEGORIES } from '../utils/formatters';

export default function Home() {
  const [featuredEquipment, setFeaturedEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get('/equipment');
        setFeaturedEquipment(res.data.equipment?.slice(0, 4) || []);
      } catch (err) {
        console.error('Error loading featured equipment:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(`/equipment?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-900 via-primary-800 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-700/80 border border-primary-500/50 text-primary-200 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary-300" />
            Agricultural Equipment, Within Reach
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Rent and Share Farming Machinery <br className="hidden sm:inline" />
            <span className="text-primary-400">Right in Your Village</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            Find the equipment you need from nearby farmers. Share your equipment when you're not using it.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/equipment"
              className="w-full sm:w-auto px-8 py-4 bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 text-base"
            >
              <Search className="w-5 h-5" />
              Find Equipment
            </Link>

            <Link
              to="/equipment/new"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl backdrop-blur-sm flex items-center justify-center gap-2 transition-all text-base"
            >
              <PlusCircle className="w-5 h-5 text-primary-400" />
              List Your Equipment
            </Link>
          </div>
        </div>
      </section>

      {/* Equipment Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Equipment Categories
          </h2>
          <p className="text-sm text-slate-500">
            Browse commonly shared agricultural machinery for soil prep, planting, irrigation, and harvesting
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-400 hover:bg-primary-50/30 transition-all text-center group flex flex-col items-center justify-center gap-2"
            >
              <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="font-bold text-sm text-slate-800 group-hover:text-primary-700">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* How FarmShare Works */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-primary-700 tracking-wider uppercase">Simple & Transparent</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How FarmShare Works</h2>
            <p className="text-sm text-slate-500">A community model designed for rural convenience and trust</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-800 font-extrabold flex items-center justify-center text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Find</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Find equipment available near your village. Search by location, category, or daily budget.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-800 font-extrabold flex items-center justify-center text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Request</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Send a request to the equipment owner with your required dates, duration, and phone number.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-800 font-extrabold flex items-center justify-center text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Share</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Equipment owners can earn by sharing machinery when it is not in use, helping neighbor farmers thrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Machinery Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Recently Listed</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Available Near You</h2>
          </div>
          <Link
            to="/equipment"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-700 hover:text-primary-800"
          >
            Browse all equipment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEquipment.map((item) => (
              <EquipmentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
