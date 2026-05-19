

const EmployerHeader = () => {
  return (
    <header className="h-16 bg-white border-b border-[#c2c6d4] flex justify-between items-center px-6 flex-shrink-0 shadow-sm z-40">
      {/* Left: Company info */}
      <div className="flex items-center gap-3">
        <h1 className="font-bold text-[#0056b3] text-lg">Công ty TNHH TechViet</h1>
        <span className="bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-[#ba1a1a]/20">
          CHƯA XÁC THỰC
        </span>
      </div>

      {/* Right: Wallet, bell, profile */}
      <div className="flex items-center gap-5">
        {/* Wallet */}
        <div className="flex items-center gap-3 bg-[#f5f3f3] px-4 py-2 rounded-full border border-[#c2c6d4]">
          <span className="material-symbols-outlined text-[#0056b3] text-sm">account_balance_wallet</span>
          <span className="text-sm font-bold">5.000.000 VND</span>
          <button className="ml-1 text-[#0056b3] hover:bg-[#0056b3]/10 p-1 rounded-full transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-full hover:bg-[#e4e2e2] transition-all">
          <span className="material-symbols-outlined text-[#5e5e62]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-white"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold">Admin TechViet</p>
            <p className="text-[10px] text-[#5e5e62]">Quản trị viên</p>
          </div>
          <div className="h-10 w-10 rounded-full border-2 border-[#0056b3] overflow-hidden">
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWDAtODmZAisTOrnKjJRf2EtistnX0YaBVpEbF4st2Ma8EQcKLl36NDIpyPXLviT4O9R_CSLHJkRfzD1qdyUKGl9TBni_O27zjMoQNTnxs9GthRXI6lvdruK-X-NE0GRmhrruDsxp_apNYzI872ATu2zp1q9doBX_yyTXOTE_pOhjWCYM8c42JBW9H_DLT0mef-640fQG7A4f7vtlSWyb0jArj6Tgm5vluiP7I9siDcRPI3uruW3PXS-XV-63sYA-mR5cdvGmS-HhO"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default EmployerHeader;
