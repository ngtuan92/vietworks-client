const AdminHeader = () => {
  return (
    <header className="h-16 flex-shrink-0 border-b border-[#c2c6d4] bg-white px-6 shadow-sm z-40">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-[#0056b3]">Bảng điều khiển Admin</h1>
          <span className="flex items-center gap-1 rounded-full border border-[#ba1a1a]/20 bg-[#ffdad6] px-2.5 py-1 text-[10px] font-black uppercase text-[#ba1a1a]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ba1a1a]"></span>
            Hệ thống đang hoạt động
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center rounded-full border border-[#c2c6d4] bg-[#f5f3f3] px-4 py-1.5 transition-all focus-within:border-[#0056b3] focus-within:ring-2 focus-within:ring-[#0056b3]/10 md:flex">
            <span className="material-symbols-outlined text-[18px] text-[#5e5e62]">search</span>
            <input
              type="text"
              placeholder="Tìm ID người dùng, công ty, job..."
              className="w-48 border-none bg-transparent py-0.5 text-sm text-[#5e5e62] placeholder-[#727784] outline-none"
            />
          </div>

          <div className="hidden lg:flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Ví Admin</p>
              <p className="text-sm font-black text-emerald-900">125.000.000 VNĐ</p>
            </div>
          </div>

          <button className="relative rounded-full p-2 text-[#5e5e62] transition-all hover:bg-[#e4e2e2]">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-[#ba1a1a]"></span>
          </button>

          <div className="flex cursor-pointer items-center gap-3 border-l border-[#c2c6d4] pl-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-gray-800">Quản trị viên</p>
              <p className="text-[10px] text-[#5e5e62]">Toàn quyền hệ thống</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0056b3]/20 bg-[#0056b3]/10 font-black text-[#0056b3]">
              SA
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
