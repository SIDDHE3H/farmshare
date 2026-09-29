import React from 'react';
import { Link } from 'react-router-dom';
import { Tractor, MapPin, ShieldCheck, PhoneCall } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="bg-primary-600 p-1.5 rounded-lg">
                <Tractor className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight">FarmShare</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Agricultural Equipment, Within Reach. Connecting rural farmers with machinery owners to make mechanization accessible and affordable.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/equipment" className="hover:text-primary-400 transition-colors">Find Equipment</Link></li>
              <li><Link to="/equipment/new" className="hover:text-primary-400 transition-colors">List Your Equipment</Link></li>
              <li><Link to="/equipment?category=Tractor" className="hover:text-primary-400 transition-colors">Rent Tractors</Link></li>
              <li><Link to="/equipment?category=Harvester" className="hover:text-primary-400 transition-colors">Rent Harvesters</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Popular Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/equipment?category=Rotavator" className="hover:text-primary-400 transition-colors">Rotavators & Tillers</Link></li>
              <li><Link to="/equipment?category=Water+Pump" className="hover:text-primary-400 transition-colors">Diesel Water Pumps</Link></li>
              <li><Link to="/equipment?category=Sprayer" className="hover:text-primary-400 transition-colors">HTP Power Sprayers</Link></li>
              <li><Link to="/equipment?category=Seed+Drill" className="hover:text-primary-400 transition-colors">Seed & Fertilizer Drills</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-1">Community Trust</h4>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-primary-400 flex-shrink-0" />
              <span>Verified local farmer equipment</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
              <span>Direct village & taluka coordination</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <PhoneCall className="w-4 h-4 text-primary-400 flex-shrink-0" />
              <span>Direct contact between farmers</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FarmShare. Built for farming communities.</p>
          <p className="flex items-center gap-1">
            Empowering smallholder farmers with shared technology.
          </p>
        </div>
      </div>
    </footer>
  );
}
