import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Tractor, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  Search, 
  ArrowRight, 
  Inbox,
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stats/dashboard');
        setStats(res.data.stats);
        setRecentActivity(res.data.recentActivity || []);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-700/60 text-primary-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-primary-300" />
            Farmer Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Namaste, {user?.name}!
          </h1>
          <p className="text-sm text-primary-200">
            {user?.village ? `Farming in ${user.village}, ${user.taluka || user.district}` : 'Welcome to your FarmShare management dashboard'}
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 flex-wrap">
          <Link
            to="/equipment/new"
            className="px-5 py-2.5 bg-white hover:bg-primary-50 text-primary-900 font-bold rounded-xl text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-primary-600" />
            List Equipment
          </Link>
          <Link
            to="/equipment"
            className="px-5 py-2.5 bg-primary-700/80 hover:bg-primary-700 text-white font-bold rounded-xl text-xs sm:text-sm border border-primary-600 flex items-center gap-1.5 transition-all"
          >
            <Search className="w-4 h-4" />
            Find Machinery
          </Link>
        </div>
      </div>

      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: My Equipment */}
        <Link
          to="/my-listings"
          className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Equipment</span>
            <div className="p-2.5 rounded-2xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
              <Tractor className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {loading ? '-' : stats?.myEquipmentCount || 0}
          </div>
          <span className="text-xs text-slate-500 block">Active listings owned</span>
        </Link>

        {/* Card 2: My Requests */}
        <Link
          to="/my-requests"
          className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Requests</span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {loading ? '-' : stats?.myRequestsCount || 0}
          </div>
          <span className="text-xs text-slate-500 block">Total requests sent</span>
        </Link>

        {/* Card 3: Pending Requests */}
        <Link
          to="/my-requests"
          className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Requests</span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {loading ? '-' : stats?.pendingSentCount || 0}
          </div>
          <span className="text-xs text-slate-500 block">Awaiting owner response</span>
        </Link>

        {/* Card 4: Accepted Requests */}
        <Link
          to="/my-requests"
          className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accepted Requests</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {loading ? '-' : stats?.acceptedSentCount || 0}
          </div>
          <span className="text-xs text-slate-500 block">Confirmed bookings</span>
        </Link>
      </div>

      {/* Incoming Requests Banner (if owner has pending inquiries) */}
      {!loading && stats?.inqPendingCount > 0 && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-sm">
                You have {stats.inqPendingCount} pending rental inquiry!
              </h3>
              <p className="text-xs text-amber-800">
                Neighbor farmers are waiting for your confirmation on your equipment.
              </p>
            </div>
          </div>
          <Link
            to="/requests-received"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1 whitespace-nowrap"
          >
            Review Requests
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
          <span className="text-xs text-slate-500">Your latest platform interactions</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No recent activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentActivity.map((act) => (
              <div key={act.id} className="py-3.5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    act.type === 'sent' ? 'bg-blue-50 text-blue-700' : 'bg-primary-50 text-primary-700'
                  }`}>
                    {act.type === 'sent' ? 'SENT' : 'RCVD'}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-slate-900 block truncate">
                      {act.equipment_name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {act.type === 'sent' ? `Owner: ${act.owner_name}` : `Requester: ${act.requester_name}`} • {formatDate(act.requested_from)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-xs text-slate-700">
                    {formatCurrency(act.total_price)}
                  </span>
                  <StatusBadge status={act.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
