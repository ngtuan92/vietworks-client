import { Eye, MessageCircle, Download } from 'lucide-react';


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

      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all overflow-hidden">
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
                      <button 
                        title="Xem CV"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-800 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        title="Chat"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button 
                        title="Tải CV"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-200 hover:text-slate-900 hover:shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
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
