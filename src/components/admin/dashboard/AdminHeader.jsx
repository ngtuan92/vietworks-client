import { Bell, Search, Wallet } from 'lucide-react';

const AdminHeader = () => {
  return (
    <header className="sticky top-0 z-40 h-16 flex-shrink-0 border-b border-white/70 bg-white/82 px-4 shadow-[0_10px_30px_rgba(15,23,42,.06)] backdrop-blur-2xl transition-all md:px-6">
      <div className="flex h-full items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="bg-gradient-to-r from-[#001a40] via-[#004491] to-[#0056B3] bg-clip-text text-lg font-black tracking-tight text-transparent md:text-xl">
              Bảng điều khiển Admin
            </h1>
            <p className="hidden text-xs font-semibold text-slate-500 sm:block">Trung tâm vận hành VietWorks</p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700 shadow-sm sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
            </span>
            Đang hoạt động
          </span>
        </div>

        <div className="flex items-center gap-2.5 lg:gap-4">
          <div className="group hidden h-11 w-72 items-center rounded-full border border-slate-200/80 bg-white/90 px-3 shadow-[0_8px_20px_rgba(15,23,42,.05)] transition-all hover:bg-white focus-within:border-[#0056B3] focus-within:ring-4 focus-within:ring-blue-500/10 md:flex">
            <div className="mr-2 grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-[#0056B3] transition-colors group-focus-within:bg-blue-100">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Tìm ID, email hoặc tên..."
              className="!w-full !border-0 !bg-transparent !p-0 text-sm font-medium text-slate-700 !shadow-none outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="hidden cursor-pointer items-center gap-3 rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 to-white px-3.5 py-2 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow lg:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-insetLight">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-blue-700">Ví Admin</p>
              <p className="text-sm font-black tracking-tight text-blue-950">125.000.000 VNĐ</p>
            </div>
          </div>

          <button className="relative rounded-2xl border border-slate-200/70 bg-white/85 p-2.5 text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-50 hover:text-[#0056B3] active:scale-95">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-500" />
          </button>

          <div className="group flex cursor-pointer items-center gap-3 border-l border-slate-200 pl-3 md:pl-4">
            <div className="hidden text-right transition-opacity group-hover:opacity-80 sm:block">
              <p className="text-sm font-bold tracking-tight text-slate-900">Quản trị viên</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Toàn quyền</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#004491] to-[#0056B3] font-black text-white shadow-glow transition-all group-hover:-translate-y-0.5 group-hover:rotate-3">
              SA
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;


