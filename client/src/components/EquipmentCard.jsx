import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Tag, User } from 'lucide-react';
import { formatCurrency, formatLocation } from '../utils/formatters';
import { getMediaUrl } from '../utils/media';

export default function EquipmentCard({ item }) {
  const imageUrl = getMediaUrl(item.image_url);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 font-semibold text-xs px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
          <Tag className="w-3 h-3 text-primary-600" />
          {item.category}
        </div>
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
          {item.condition}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
            <span className="truncate">{formatLocation(item)}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
            {item.name}
          </h3>
          <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xl font-extrabold text-primary-700">
                {formatCurrency(item.price_per_day)}
              </span>
              <span className="text-xs text-slate-500 font-medium"> / day</span>
              {item.price_per_hour && (
                <div className="text-[11px] text-slate-500">
                  {formatCurrency(item.price_per_hour)} / hr
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-[11px] text-slate-600 justify-end">
                <User className="w-3 h-3 text-slate-400" />
                <span className="font-medium truncate max-w-[100px]">{item.owner_name}</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                Available Now
              </span>
            </div>
          </div>

          <Link
            to={`/equipment/${item.id}`}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1 transition-all shadow-sm group-hover:shadow"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
