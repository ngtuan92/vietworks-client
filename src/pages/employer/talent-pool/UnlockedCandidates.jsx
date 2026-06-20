import { useState, useEffect } from 'react';
import api from '../../../services/api';

const UnlockedCandidates = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/employer/unlocked-candidates')
      .then(r => { if (r.data.success) setRows(r.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">Đang tải...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">Chưa có ứng viên nào được mở khóa.</td>
                </tr>
              ) : (
                rows.map((r) => {
                  const candidate = r.candidateId || {};
                  const cv = r.cvId || {};
                  return (
                    <tr key={r._id} className="border-t border-slate-100">
                      <td className="px-4 py-4 font-semibold text-slate-900">{candidate.fullName || '—'}</td>
                      <td className="px-4 py-4">{cv.title || '—'}</td>
                      <td className="px-4 py-4">
                        <div className="text-sm">{candidate.email || '—'}</div>
                        <div className="text-xs text-slate-500">{candidate.phone || '—'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {r.unlockedAt ? new Date(r.unlockedAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {r.amountCharged ? `${Number(r.amountCharged).toLocaleString('vi-VN')} VNĐ` : '—'}
                      </td>
                      <td className="px-4 py-4">—</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">Xem CV</button>
                          <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">Chat</button>
                          <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">Tải CV</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UnlockedCandidates;