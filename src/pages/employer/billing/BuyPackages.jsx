import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const BuyPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await api.get('/packages', { params: { isActive: true } });
      if (res.data.success) {
        setPackages(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';

  // CHỈ hiển thị gói dành cho nhà tuyển dụng (loại gói Boost CV của ứng viên).
  // Thứ tự: Mở khóa CV (lẻ) → Combo 50/100 → Tin nổi bật.
  const PACKAGE_ORDER = ['CV_UNLOCK', 'CV_UNLOCK_BUNDLE', 'PREMIUM_JOB'];
  const sortedPackages = packages
    .filter((p) => PACKAGE_ORDER.includes(p.packageType))
    .sort((a, b) => PACKAGE_ORDER.indexOf(a.packageType) - PACKAGE_ORDER.indexOf(b.packageType));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-[#003f87] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gói dịch vụ</h1>
          <p className="text-slate-600 mt-1">Mở khóa hồ sơ ứng viên hoặc đẩy tin tuyển dụng nổi bật — tất cả các gói đều có hạn 1 tháng.</p>
        </div>
        <Link to="/employer/active-packages" className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
          Gói đang sử dụng
        </Link>
      </div>

      {sortedPackages.length > 0 ? (
        // Flex + flex-1 ÉP tất cả card cùng 1 hàng (không wrap).
        // Nếu màn hình quá hẹp thì cho phép cuộn ngang thay vì rớt xuống hàng.
        <div className="flex flex-nowrap gap-3 items-stretch overflow-x-auto pb-2 -mx-1 px-1">
          {sortedPackages.map((pkg) => (
            <div
              key={pkg._id}
              className="flex-1 min-w-[200px] max-w-[280px]"
            >
              <PackageCard
                pkg={pkg}
                price={formatPrice(pkg.price)}
                isFeatured={pkg.packageType === 'PREMIUM_JOB'}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <span className="material-symbols-outlined text-[60px] text-slate-300">inventory_2</span>
          <p className="text-slate-500 mt-3 font-medium">Hiện chưa có gói dịch vụ nào</p>
        </div>
      )}
    </div>
  );
};

const categoryConfig = {
  CV_UNLOCK:        { label: 'Mở khóa CV (lẻ)',    tone: 'bg-slate-100 text-slate-700' },
  CV_UNLOCK_BUNDLE: { label: 'Gói mở khóa CV',    tone: 'bg-indigo-100 text-indigo-700' },
  PREMIUM_JOB:      { label: 'Tin nổi bật + Gấp',  tone: 'bg-amber-100 text-amber-700' },
};

const PackageCard = ({ pkg, price, isFeatured }) => {
  const cat = categoryConfig[pkg.packageType] || { label: pkg.packageType, tone: 'bg-slate-100 text-slate-700' };
  const durationLabel = pkg.durationDays ? `${pkg.durationDays} ngày` : 'Theo lượt dùng';

  return (
    <div className={`bg-white rounded-2xl p-4 flex flex-col h-full border transition-all hover:shadow-md ${
      isFeatured ? 'border-[#003f87] ring-1 ring-[#003f87]/30 shadow-sm' : 'border-slate-200'
    }`}>
      {/* Category badge */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.tone} truncate`}>{cat.label}</span>
        {isFeatured && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#003f87] text-white uppercase tracking-wider shrink-0">
            Hot
          </span>
        )}
      </div>

      <h3 className="text-base font-bold text-slate-900 line-clamp-2 min-h-[44px]">{pkg.name}</h3>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">{pkg.description}</p>

      <div className="mt-3 mb-0">
        <span className="text-xl font-black text-[#003f87]">{price}</span>
      </div>
      <p className="text-[11px] text-slate-500">/ {durationLabel}</p>

      <ul className="mt-3 space-y-1.5 text-xs text-slate-600 flex-1">
        {(pkg.benefits?.cvAccessLimit > 0) && (
          <li className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
            <span className="leading-snug">Mở khóa {pkg.benefits.cvAccessLimit} hồ sơ</span>
          </li>
        )}
        {(pkg.benefits?.featuredDays > 0) && (
          <li className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
            <span className="leading-snug">Đẩy tin lên top {pkg.benefits.featuredDays} ngày</span>
          </li>
        )}
        {(pkg.benefits?.priorityDisplay) && (
          <li className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
            <span className="leading-snug">Gắn nhãn ưu tiên</span>
          </li>
        )}
        {pkg.durationDays > 0 && (
          <li className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
            <span className="leading-snug">Hạn {pkg.durationDays} ngày</span>
          </li>
        )}
      </ul>

      {isFeatured ? (
        <Link
          to="/employer/packages/featured-job"
          className="mt-4 w-full py-2 rounded-xl text-sm font-bold text-center bg-[#003f87] text-white hover:bg-[#0b4e9f] transition-all"
        >
          Mua gói
        </Link>
      ) : (
        <Link
          to="/employer/wallet/topup"
          className="mt-4 w-full py-2 rounded-xl text-sm font-bold text-center border border-[#003f87] text-[#003f87] hover:bg-blue-50 transition-all"
        >
          Mua ngay
        </Link>
      )}
    </div>
  );
};

export default BuyPackages;
