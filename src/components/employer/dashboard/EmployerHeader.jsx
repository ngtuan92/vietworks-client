import { Wallet, Plus, Bell, ShieldAlert } from 'lucide-react';

const EmployerHeader = () => {
  return (
    <header className="h-16 flex-shrink-0 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl px-6 z-40 sticky top-0 transition-all">
      <div className="flex h-full items-center justify-between gap-4">
        {/* Left: Company info */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent tracking-tight">Công ty TNHH TechViet</h1>
          <span className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase text-red-600 shadow-sm">
            <ShieldAlert className="w-3 h-3 text-red-600" />
            CHƯA XÁC THỰC
          </span>
        </div>

        {/* Right: Wallet, bell, profile */}
        <div className="flex items-center gap-5">
          {/* Wallet */}
          <div className="hidden lg:flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white px-4 py-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-primary">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Số dư khả dụng</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-slate-900 tracking-tight">5.000.000 VNĐ</p>
                <button className="text-primary hover:bg-blue-100 p-0.5 rounded-full transition-all bg-blue-50">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Notification bell */}
          <button className="relative rounded-2xl p-2.5 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95">
            <Bell className="w-5 h-5" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500"></span>
          </button>

          {/* Profile */}
          <div className="flex cursor-pointer items-center gap-3 border-l border-slate-200 pl-4 group">
            <div className="hidden text-right sm:block group-hover:opacity-80 transition-opacity">
              <p className="text-sm font-bold text-slate-900 tracking-tight">Admin TechViet</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Quản trị viên</p>
            </div>
            <div className="h-10 w-10 rounded-2xl border-2 border-transparent group-hover:border-primary/20 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all overflow-hidden">
              <img
                alt="Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWDAtODmZAisTOrnKjJRf2EtistnX0YaBVpEbF4st2Ma8EQcKLl36NDIpyPXLviT4O9R_CSLHJkRfzD1qdyUKGl9TBni_O27zjMoQNTnxs9GthRXI6lvdruK-X-NE0GRmhrruDsxp_apNYzI872ATu2zp1q9doBX_yyTXOTE_pOhjWCYM8c42JBW9H_DLT0mef-640fQG7A4f7vtlSWyb0jArj6Tgm5vluiP7I9siDcRPI3uruW3PXS-XV-63sYA-mR5cdvGmS-HhO"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EmployerHeader;
