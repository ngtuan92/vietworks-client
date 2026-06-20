import { useEffect, useState } from 'react';
import api from '../../../services/api';

const ActivePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/employer/active-packages').then(res => {
      if (res.data.success) setPackages(res.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gói đang sử dụng</h1>
        <p className="text-slate-600 mt-1">Theo dõi các gói dịch vụ đang active hoặc đã hết hạn.</p>
      </div>

      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {['Tên gói', 'Áp dụng cho', 'Ngày bắt đầu', 'Ngày hết hạn', 'Trạng thái', 'Chi phí', 'Hành động'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">Đang tải...</td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">Chưa có gói đang hoạt động.</td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg._id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${pkg.labelType === 'URGENT' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                        {pkg.packageId?.name || 'Boost Job'}
                      </div>
                    </td>
                    <td className="px-4 py-3">{pkg.jobId?.title || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(pkg.startAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(pkg.endAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${pkg.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{pkg.packageId?.price?.toLocaleString('vi-VN') || '—'} VNĐ</td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">Xem chi tiết</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ActivePackages;