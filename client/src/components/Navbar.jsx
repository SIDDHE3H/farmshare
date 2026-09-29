import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Tractor, 
  Menu, 
  X, 
  PlusCircle, 
  Search, 
  LayoutDashboard, 
  ClipboardList, 
  Inbox, 
  User, 
  LogOut
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="flex items-center gap-2 group text-primary-700 hover:text-primary-800 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <div className="bg-primary-600 text-white p-2 rounded-xl shadow-md group-hover:bg-primary-700 transition-all">
                <Tractor className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
                  Farm<span className="text-primary-600">Share</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                  Agricultural Equipment, Within Reach
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/equipment"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/equipment')
                  ? 'bg-primary-50 text-primary-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4 text-primary-600" />
              Find Equipment
            </Link>

            <Link
              to="/equipment/new"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/equipment/new')
                  ? 'bg-primary-50 text-primary-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-primary-600" />
              List Equipment
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/dashboard')
                      ? 'bg-primary-50 text-primary-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  to="/my-listings"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive('/my-listings')
                      ? 'bg-primary-50 text-primary-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  My Listings
                </Link>

                <Link
                  to="/my-requests"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive('/my-requests')
                      ? 'bg-primary-50 text-primary-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  My Requests
                </Link>

                <Link
                  to="/requests-received"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive('/requests-received')
                      ? 'bg-primary-50 text-primary-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Requests Received
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full border border-slate-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all text-sm font-medium text-slate-700"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                    {user && user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold text-xs leading-none text-slate-900">{user && user.name}</span>
                    <span className="text-[10px] text-slate-500 leading-none">{user && user.village ? user.village : 'Farmer'}</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary-700 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl">
          <Link
            to="/equipment"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-primary-50 hover:text-primary-700"
          >
            <Search className="w-5 h-5 text-primary-600" />
            Find Equipment
          </Link>

          <Link
            to="/equipment/new"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-primary-50 hover:text-primary-700"
          >
            <PlusCircle className="w-5 h-5 text-primary-600" />
            List Equipment
          </Link>

          {isAuthenticated ? (
            <>
              <div className="pt-2 pb-1 border-t border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider px-3">
                Farmer Workspace
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-primary-50 hover:text-primary-700"
              >
                <LayoutDashboard className="w-5 h-5 text-slate-500" />
                Dashboard
              </Link>
              <Link
                to="/my-listings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-primary-50 hover:text-primary-700"
              >
                <Tractor className="w-5 h-5 text-slate-500" />
                My Listings
              </Link>
              <Link
                to="/my-requests"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-primary-50 hover:text-primary-700"
              >
                <ClipboardList className="w-5 h-5 text-slate-500" />
                My Requests
              </Link>
              <Link
                to="/requests-received"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-primary-50 hover:text-primary-700"
              >
                <Inbox className="w-5 h-5 text-slate-500" />
                Requests Received
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-primary-50 hover:text-primary-700"
              >
                <User className="w-5 h-5 text-slate-500" />
                My Profile ({user && user.name})
              </Link>
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-base font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center px-4 py-2.5 text-base font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center px-4 py-2.5 text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
