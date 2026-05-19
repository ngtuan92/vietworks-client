

const rows = [
  { id: 1, name: 'Lê Gia Huy', role: 'UI/UX Designer', contact: 'legiahuy@gmail.com • 0912345566', unlockedAt: '18/05/2026 14:00', cost: '20.000 VNĐ', unlockedBy: 'HR Admin' },
  { id: 2, name: 'Nguyễn Minh Anh', role: 'Backend Developer', contact: 'nguyenminhanh@gmail.com • 0901234123', unlockedAt: '17/05/2026 16:20', cost: '20.000 VNĐ', unlockedBy: 'HR Team 1' },
];

const UnlockedCandidates = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ứng viên đã mở khóa</h1>
        <p className="text-slate-600 mt-1">Quản lý danh sách ứng viên đã trả phí để xem đầy đủ thông tin.</p>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {['Ứng viên', 'Vị trí', 'Email/SĐT', 'Ngày mở khóa', 'Chi phí', 'Người mở khóa', 'Hành động'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 font-semibold text-slate-900">{r.name}</td>
                  <td className="px-4 py-4">{r.role}</td>
                  <td className="px-4 py-4">{r.contact}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{r.unlockedAt}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{r.cost}</td>
                  <td className="px-4 py-4">{r.unlockedBy}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">Xem CV</button>
                      <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">Chat</button>
                      <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">Tải CV</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UnlockedCandidates;
