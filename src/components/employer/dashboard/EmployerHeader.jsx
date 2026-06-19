import { Wallet, Plus, Bell, ShieldAlert, ChevronDown } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmployerHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="h-20 flex-shrink-0 border-b border-slate-200/60 bg-white/80 backdrop-blur-2xl px-8 z-40 sticky top-0 transition-all flex items-center justify-between">
      {/* Left: Company info */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
            Công ty TNHH TechViet
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              <ShieldAlert className="w-3 h-3 text-amber-500" />
              Chưa xác thực ĐKKD
            </span>
          </div>
        </div>
      </div>

      {/* Right: Wallet, bell, profile */}
      <div className="flex items-center gap-6">
        {/* Wallet Button */}
        <div className="hidden lg:flex items-center gap-3 rounded-full border border-slate-200/60 bg-white px-1.5 py-1.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer pr-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">Số dư ví</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-black text-slate-900 tracking-tight leading-none">5.000.000 đ</p>
              <button className="text-[10px] font-bold text-white bg-slate-900 hover:bg-primary px-2 py-0.5 rounded-full transition-colors flex items-center gap-0.5 shadow-sm">
                <Plus className="w-3 h-3" /> Nạp
              </button>
            </div>
          </div>
        </div>

        {/* Notification bell */}
        <button type="button" onClick={() => navigate('/employer/notifications')} className="relative rounded-full p-2.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 border border-transparent hover:border-slate-200">
          <Bell className="w-5 h-5" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 animate-pulse"></span>
        </button>

        <div className="h-8 w-px bg-slate-200/80 hidden sm:block"></div>

        {/* Profile */}
        <div className="flex cursor-pointer items-center gap-3 group">
          <div className="hidden text-right sm:block group-hover:opacity-80 transition-opacity">
            <p className="text-sm font-extrabold text-slate-900 tracking-tight">Admin TechViet</p>
            <p className="text-[10px] font-bold text-slate-500">Quản trị viên</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full border-2 border-slate-100 group-hover:border-primary/50 shadow-sm group-hover:shadow-md transition-all overflow-hidden p-0.5">
              <img
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWDAtODmZAisTOrnKjJRf2EtistnX0YaBVpEbF4st2Ma8EQcKLl36NDIpyPXLviT4O9R_CSLHJkRfzD1qdyUKGl9TBni_O27zjMoQNTnxs9GthRXI6lvdruK-X-NE0GRmhrruDsxp_apNYzI872ATu2zp1q9doBX_yyTXOTE_pOhjWCYM8c42JBW9H_DLT0mef-640fQG7A4f7vtlSWyb0jArj6Tgm5vluiP7I9siDcRPI3uruW3PXS-XV-63sYA-mR5cdvGmS-HhO"
              />
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default EmployerHeader;

