import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../services/api';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

const targetRoleLabels = {
  EMPLOYER: 'Nhà tuyển dụng',
  JOBSEEKER: 'Ứng viên',
};

// Khớp với enum ServicePackageType ở BE (vietworks-api/src/enums/paymentEnums.js)
const packageTypeLabels = {
  CV_BOOST: 'Boost CV',
  PREMIUM_JOB: 'Tin nổi bật + Gấp',
  CV_UNLOCK: 'Mở khóa CV',
};

// PackageCard cho Employer - hiển thị fields của Employer
const EmployerPackageCard = ({ pkg, onEdit, onToggleStatus }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all hover:shadow-md hover:-translate-y-1 flex flex-col h-full ${pkg.status === 'ACTIVE' ? 'border-emerald-200/50' : 'border-rose-600/30 bg-[#ffdad6]/10'}`}>
      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#003f87] shrink-0">
                {packageTypeLabels[pkg.packageType] || pkg.packageType}
              </span>
              {pkg.status === 'INACTIVE' && (
                <span className="bg-rose-600/10 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                  Tạm ngưng
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 line-clamp-2 min-h-[48px]">{pkg.name}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(pkg)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-all"
              title="Sửa"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button
              onClick={() => onToggleStatus(pkg)}
              className={`p-1.5 rounded-lg transition-all ${pkg.status === 'ACTIVE' ? 'hover:bg-emerald-100 text-emerald-600' : 'hover:bg-[#ffdad6] text-rose-600'}`}
              title={pkg.status === 'ACTIVE' ? 'Tạm ngưng' : 'Kích hoạt'}
            >
              <span className="material-symbols-outlined text-[18px]">{pkg.status === 'ACTIVE' ? 'toggle_on' : 'toggle_off'}</span>
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#003f87]">{formatPrice(pkg.price)}</span>
            {pkg.price > 0 && <span className="text-sm text-slate-500 font-medium">/ {pkg.durationDays || pkg.duration || 30} ngày</span>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-black text-slate-900">{pkg.jobPostsAllowed ?? pkg.benefits?.jobPostsAllowed ?? 0}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Tin đăng</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-black text-slate-900">{pkg.featuredDays ?? pkg.benefits?.featuredDays ?? 0}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Nổi bật</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-black text-slate-900">{pkg.cvAccessLimit ?? pkg.benefits?.cvAccessLimit ?? 0}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Lượt CV</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4 min-h-[60px]">{pkg.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 mt-auto">
          <span className="text-xs text-slate-400 font-medium">
            Tạo lúc: {pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('vi-VN') : '—'}
          </span>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Ưu tiên #{pkg.sortOrder ?? 0}</span>
        </div>
      </div>
    </div>
  );
};

// PackageCard cho Jobseeker
const JobseekerPackageCard = ({ pkg, onEdit, onToggleStatus }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all hover:shadow-md hover:-translate-y-1 flex flex-col h-full ${pkg.status === 'ACTIVE' ? 'border-emerald-200/50' : 'border-rose-600/30 bg-[#ffdad6]/10'}`}>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                pkg.benefits?.aiPremiumAccess ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {packageTypeLabels[pkg.packageType] || pkg.packageType}
              </span>
              {pkg.status === 'INACTIVE' && (
                <span className="bg-rose-600/10 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                  Tạm ngưng
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 line-clamp-2 min-h-[48px]">{pkg.name}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(pkg)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-all"
              title="Sửa"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button
              onClick={() => onToggleStatus(pkg)}
              className={`p-1.5 rounded-lg transition-all ${pkg.status === 'ACTIVE' ? 'hover:bg-emerald-100 text-emerald-600' : 'hover:bg-[#ffdad6] text-rose-600'}`}
              title={pkg.status === 'ACTIVE' ? 'Tạm ngưng' : 'Kích hoạt'}
            >
              <span className="material-symbols-outlined text-[18px]">{pkg.status === 'ACTIVE' ? 'toggle_on' : 'toggle_off'}</span>
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#003f87]">{formatPrice(pkg.price)}</span>
            {pkg.price > 0 && <span className="text-sm text-slate-500 font-medium">/ {pkg.durationDays || 30} ngày</span>}
          </div>
        </div>

        {pkg.packageType === 'CV_BOOST' && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
              <p className="text-lg font-black text-slate-900">{pkg.durationDays || 0}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Ngày boost</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
              <p className="text-lg font-black text-slate-900">
                {pkg.benefits?.aiPremiumAccess ? 'Có' : 'Không'}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">AI Premium</p>
            </div>
          </div>
        )}

        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4 min-h-[60px]">{pkg.description}</p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 mt-auto">
          <span className="text-xs text-slate-400 font-medium">
            Tạo lúc: {pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('vi-VN') : '—'}
          </span>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Ưu tiên #{pkg.sortOrder ?? 0}</span>
        </div>
      </div>
    </div>
  );
};

const AdminPackages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState('all');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'jobseeker' ? 'JOBSEEKER' : 'EMPLOYER');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await api.get('/admin/packages');
      if (res.data.success) {
        const transformedData = res.data.data.map(pkg => ({
          ...pkg,
          // Map benefits to features array
          features: pkg.benefits ? [
            pkg.benefits.jobPostsAllowed > 0 ? `Đăng ${pkg.benefits.jobPostsAllowed} tin tuyển dụng` : null,
            pkg.durationDays > 0 ? `Hiển thị trong ${pkg.durationDays} ngày` : null,
            pkg.benefits.cvAccessLimit > 0 ? `Xem ${pkg.benefits.cvAccessLimit} CV` : null,
            pkg.benefits.aiPremiumAccess ? 'Truy cập AI Premium' : null,
            pkg.benefits.priorityDisplay ? 'Hiển thị ưu tiên' : null,
          ].filter(Boolean) : [],
          // Map benefits to top-level fields for card display
          jobPostsAllowed: pkg.benefits?.jobPostsAllowed || 0,
          featuredDays: pkg.benefits?.featuredDays || 0,
          cvAccessLimit: pkg.benefits?.cvAccessLimit || 0,
        }));
        setPackages(transformedData);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentTabPackages = packages.filter((p) => p.targetRole === activeTab);

  const [sortPrice, setSortPrice] = useState('default');

  const filteredPackages = useMemo(() => {
    let result = currentTabPackages.filter((pkg) => {
      if (filterActive === 'all') return true;
      if (filterActive === 'active') return pkg.status === 'ACTIVE';
      if (filterActive === 'inactive') return pkg.status === 'INACTIVE';
      return true;
    });

    if (sortPrice === 'asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortPrice === 'desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [currentTabPackages, filterActive, sortPrice]);

  const handleEdit = (pkg) => {
    navigate(`/admin/packages/${pkg._id}/edit`);
  };

  const handleToggleStatus = async (pkg) => {
    try {
      const newStatus = pkg.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await api.patch(`/admin/packages/${pkg._id}/status`, {
        status: newStatus
      }, { withCredentials: true });
      if (res.data.success) {
        setPackages(packages.map((p) =>
          p._id === pkg._id ? { ...p, status: newStatus } : p
        ));
      }
    } catch (error) {
      console.error('Error toggling package status:', error);
    }
  };

  const handleAddNew = () => {
    navigate('/admin/packages/create');
  };

  const tabCounts = {
    EMPLOYER: packages.filter((p) => p.targetRole === 'EMPLOYER').length,
    JOBSEEKER: packages.filter((p) => p.targetRole === 'JOBSEEKER').length,
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#003f87] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#003f87] rounded-full"></span>
            Quản lý Gói dịch vụ
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tạo và quản lý các gói dịch vụ cho nhà tuyển dụng và ứng viên
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-1 inline-flex">
        <button
          onClick={() => setActiveTab('EMPLOYER')}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'EMPLOYER'
              ? 'bg-[#003f87] text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">apartment</span>
          Gói Nhà tuyển dụng
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'EMPLOYER' ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-500'
          }`}>
            {tabCounts.EMPLOYER}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('JOBSEEKER')}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'JOBSEEKER'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
          Gói Ứng viên
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'JOBSEEKER' ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-500'
          }`}>
            {tabCounts.JOBSEEKER}
          </span>
        </button>
      </div>

      {/* Stats Summary - theo tab hiện tại */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#003f87] to-[#0b4e9f] p-5 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-200">inventory_2</span>
            <span className="text-sm font-bold text-blue-200 uppercase">Tổng gói</span>
          </div>
          <p className="text-3xl font-black">{currentTabPackages.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span className="text-sm font-bold text-emerald-600 uppercase">Đang hoạt động</span>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {currentTabPackages.filter((p) => p.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-rose-600">toggle_off</span>
            <span className="text-sm font-bold text-rose-600 uppercase">Tạm ngưng</span>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {currentTabPackages.filter((p) => p.status !== 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-600">payments</span>
            <span className="text-sm font-bold text-amber-600 uppercase">Giá TB</span>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {formatPrice(
              Math.round(
                currentTabPackages.filter((p) => p.price > 0).reduce((sum, p) => sum + p.price, 0) /
                  currentTabPackages.filter((p) => p.price > 0).length || 0
              )
            )}
          </p>
        </div>
      </div>

      {/* Actions - filter + sort + add */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium"
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm ngưng</option>
          </select>
          <select
            value={sortPrice}
            onChange={(e) => setSortPrice(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium"
          >
            <option value="default">Mặc định</option>
            <option value="asc">Giá: Thấp → Cao</option>
            <option value="desc">Giá: Cao → Thấp</option>
          </select>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-[#003f87] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#0b4e9f] transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm gói mới
        </button>
      </div>

      {/* Package Grid */}
      {activeTab === 'EMPLOYER' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPackages.map((pkg) => (
            <EmployerPackageCard
              key={pkg._id}
              pkg={pkg}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPackages.map((pkg) => (
            <JobseekerPackageCard
              key={pkg._id}
              pkg={pkg}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[#003f87] border-t-transparent rounded-full"></div>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200/50">
          <span className="material-symbols-outlined text-[60px] text-slate-200">inventory_2</span>
          <p className="text-slate-500 mt-3 font-bold">Chưa có gói dịch vụ nào</p>
          <button
            onClick={handleAddNew}
            className="mt-4 text-[#003f87] font-bold hover:underline"
          >
            Tạo gói đầu tiên
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default AdminPackages;
