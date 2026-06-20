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

  // Split packages by type for display
  const unlockCvPackages = packages.filter(p => p.packageType === 'UNLOCK_CV');
  const boostJobPackages = packages.filter(p => p.packageType === 'BOOST_JOB');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

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
          <p className="text-slate-600 mt-1">Xem và mua các gói mở khóa CV hoặc gói tin nổi bật/GẤP.</p>
        </div>
        <Link to="/employer/active-packages" className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
          Gói đang sử dụng
        </Link>
      </div>

      {unlockCvPackages.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Mở khóa CV</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {unlockCvPackages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                title={pkg.name}
                price={formatPrice(pkg.price)}
                duration={pkg.duration}
                features={pkg.features || []}
                actionLabel="Mua ngay"
              />
            ))}
          </div>
        </section>
      )}

      {boostJobPackages.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">Tin nổi bật & GẤP</h2>
            <Link to="/employer/packages/featured-job" className="px-4 py-2 rounded-xl bg-[#003f87] text-white font-semibold hover:bg-[#0b4e9f]">
              Mua gói cho Job
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {boostJobPackages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                title={pkg.name}
                price={formatPrice(pkg.price)}
                duration={pkg.duration}
                features={pkg.features || []}
                actionLabel="Chọn gói"
              />
            ))}
          </div>
        </section>
      )}

      {packages.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <span className="material-symbols-outlined text-[60px] text-slate-300">inventory_2</span>
          <p className="text-slate-500 mt-3 font-medium">Hiện chưa có gói dịch vụ nào</p>
        </div>
      )}
    </div>
  );
};

const PackageCard = ({ title, price, duration, features, actionLabel }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5">
    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    <div className="text-2xl font-bold text-[#003f87] mt-3">{price}</div>
    {duration && <p className="text-sm text-slate-500 mt-1">/{duration} ngày</p>}
    <ul className="mt-4 space-y-2 text-sm text-slate-600">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
          <span>{f}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full mt-8 px-4 py-3 rounded-2xl font-bold transition-all ${
      featured 
        ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:-translate-y-0.5' 
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
    }`}>
      {actionLabel}
    </button>
  </div>
);

export default BuyPackages;