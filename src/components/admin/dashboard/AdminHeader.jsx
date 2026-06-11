import { Bell, Search, Wallet, ChevronDown, ShieldCheck } from 'lucide-react';
import React from 'react';

const AdminHeader = () => {
  return (
    <header className="h-20 flex-shrink-0 border-b border-slate-200/60 bg-white/80 backdrop-blur-2xl px-8 z-40 sticky top-0 transition-all flex items-center justify-between">
      <div className="flex h-full items-center gap-6">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
            Bảng điều khiển Admin
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Hệ thống ổn định
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="hidden lg:flex h-10 w-72 items-center rounded-full border border-slate-200/80 bg-slate-50/50 px-4 transition-all hover:bg-white focus-within:bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
          <Search className="h-4 w-4 text-slate-400 mr-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm ID, tên công ty..."
            className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400 placeholder:font-medium"
          />
        </div>

        {/* Admin Wallet */}
        <div className="hidden lg:flex items-center gap-3 rounded-full border border-slate-200/60 bg-white px-1.5 py-1.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer pr-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">Ví Hệ thống</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-black text-slate-900 tracking-tight leading-none">125.000.000 đ</p>
            </div>
          </div>
        </div>

        {/* Notification bell */}
        <button className="relative rounded-full p-2.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 border border-transparent hover:border-slate-200">
          <Bell className="w-5 h-5" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 animate-pulse"></span>
        </button>

        <div className="h-8 w-px bg-slate-200/80 hidden sm:block"></div>

        {/* Profile */}
        <div className="flex cursor-pointer items-center gap-3 group">
          <div className="hidden text-right sm:block group-hover:opacity-80 transition-opacity">
            <p className="text-sm font-extrabold text-slate-900 tracking-tight">Quản trị viên</p>
            <p className="text-[10px] font-bold text-slate-500">Toàn quyền</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-100 group-hover:border-primary/50 shadow-sm group-hover:shadow-md transition-all overflow-hidden bg-gradient-to-br from-primary to-blue-700 font-black text-white p-0.5">
              SA
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
