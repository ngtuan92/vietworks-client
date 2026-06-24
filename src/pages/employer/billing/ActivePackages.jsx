import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gói đang sử dụng</h1>
          <p className="text-slate-600 mt-1">Các gói "Tin nổi bật" (PREMIUM_JOB) đang active.</p>
        </div>
        <Link
          to="/employer/my-subscriptions"
          className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 transition-all inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
          Xem tất cả gói của tôi
        </Link>
      </div>

      {/* Banner gợi ý dùng MySubscriptions */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm flex items-start gap-3">
        <span className="material-symbols-outlined text-primary mt-0.5">info</span>
        <div className="flex-1">
          <div className="font-bold text-slate-900">Trang "Gói của tôi" mới đã có!</div>
          <div className="text-slate-700 text-xs mt-0.5">
            Trang này chỉ liệt kê gói PREMIUM_JOB. Để xem <b>toàn bộ</b> gói đang dùng (cả CV_UNLOCK, lịch sử),{' '}
            <Link to="/employer/my-subscriptions" className="text-primary font-bold hover:underline">
              chuyển sang Gói của tôi →
            </Link>
          </div>
        </div>
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
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    <div className="space-y-2">
                      <div>Chưa có gói Tin nổi bật đang hoạt động.</div>
                      <Link to="/employer/packages" className="inline-block text-primary font-bold hover:underline">
                        Mua gói ngay →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => {
                  const now = Date.now();
                  const expired = pkg.endAt ? new Date(pkg.endAt).getTime() : null;
                  const daysRemaining = expired ? Math.max(0, Math.ceil((expired - now) / (1000 * 60 * 60 * 24))) : null;
                  return (
                    <tr key={pkg._id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${pkg.labelType === 'URGENT' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                          {pkg.packageId?.name || 'Boost Job'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{pkg.jobId?.title || '—'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(pkg.startAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>{new Date(pkg.endAt).toLocaleDateString('vi-VN')}</div>
                        {daysRemaining !== null && pkg.status === 'ACTIVE' && (
                          <div className={`text-[11px] mt-0.5 font-bold ${daysRemaining <= 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            Còn {daysRemaining} ngày
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${pkg.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                          {pkg.status === 'ACTIVE' ? 'Đang dùng' : pkg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{pkg.packageId?.price?.toLocaleString('vi-VN') || '—'} VNĐ</td>
                      <td className="px-4 py-3">
                        <Link
                          to="/employer/my-subscriptions"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 inline-block"
                        >
                          Xem chi tiết
                        </Link>
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

export default ActivePackages;