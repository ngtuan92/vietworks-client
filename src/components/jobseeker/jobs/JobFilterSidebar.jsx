

const JobFilterSidebar = () => {
  return (
    <aside className="w-full lg:w-1/4 space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-black">Bộ lọc</h3>
          <button className="text-[#003f87] text-sm font-semibold hover:underline">Xóa tất cả</button>
        </div>

        {/* Industry Filter */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ngành nghề</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <input className="rounded border-gray-300 text-[#003f87] focus:ring-[#003f87] h-5 w-5" id="it" type="checkbox" />
              <label className="text-sm text-gray-700 cursor-pointer" htmlFor="it">Công nghệ thông tin</label>
            </li>
            <li className="flex items-center gap-3">
              <input className="rounded border-gray-300 text-[#003f87] focus:ring-[#003f87] h-5 w-5" id="marketing" type="checkbox" />
              <label className="text-sm text-gray-700 cursor-pointer" htmlFor="marketing">Marketing / PR</label>
            </li>
            <li className="flex items-center gap-3">
              <input className="rounded border-gray-300 text-[#003f87] focus:ring-[#003f87] h-5 w-5" id="sales" type="checkbox" />
              <label className="text-sm text-gray-700 cursor-pointer" htmlFor="sales">Bán hàng / Phát triển KD</label>
            </li>
          </ul>
        </div>

        {/* Experience Filter */}
        <div className="mb-6 pt-6 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Kinh nghiệm</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <input className="border-gray-300 text-[#003f87] focus:ring-[#003f87] h-5 w-5" id="entry" name="exp" type="radio" />
              <label className="text-sm text-gray-700 cursor-pointer" htmlFor="entry">Mới tốt nghiệp / Entry</label>
            </li>
            <li className="flex items-center gap-3">
              <input className="border-gray-300 text-[#003f87] focus:ring-[#003f87] h-5 w-5" id="mid" name="exp" type="radio" />
              <label className="text-sm text-gray-700 cursor-pointer" htmlFor="mid">Nhân viên (2-5 năm)</label>
            </li>
            <li className="flex items-center gap-3">
              <input className="border-gray-300 text-[#003f87] focus:ring-[#003f87] h-5 w-5" id="senior" name="exp" type="radio" />
              <label className="text-sm text-gray-700 cursor-pointer" htmlFor="senior">Chuyên viên (5+ năm)</label>
            </li>
          </ul>
        </div>

        {/* Salary Filter */}
        <div className="pt-6 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Mức lương mong muốn</h4>
          <div className="flex items-center gap-2 mb-2">
            <input className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#003f87] outline-none" placeholder="Từ" type="text" />
            <span className="text-gray-400">-</span>
            <input className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#003f87] outline-none" placeholder="Đến" type="text" />
          </div>
          <p className="text-[10px] text-gray-400">VD: 15,000,000 VND</p>
        </div>
      </div>

      <div className="bg-[#d9e3f2] p-6 rounded-xl flex flex-col items-center text-center">
        <span className="material-symbols-outlined text-5xl text-[#131c27] mb-2">verified_user</span>
        <h4 className="text-lg font-bold text-[#131c27] mb-2">Tạo CV Của Bạn</h4>
        <p className="text-sm text-[#3e4853] mb-6">Nổi bật trước nhà tuyển dụng với CV chuyên nghiệp được hỗ trợ bởi AI.</p>
        <button className="w-full py-2 bg-[#131c27] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">Bắt đầu ngay</button>
      </div>
    </aside>
  );
};

export default JobFilterSidebar;
