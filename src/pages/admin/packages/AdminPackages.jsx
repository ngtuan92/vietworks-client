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
  CV_UNLOCK: 'Mở khóa CV (lẻ)',
  CV_UNLOCK_BUNDLE: 'Gói mở khóa CV',
  CV_BOOST: 'Boost CV',
  PREMIUM_JOB: 'Tin nổi bật + Gấp',
};

// PackageCard cho Employer - hiển thị fields của Employer (compact cho 4 cột)
const EmployerPackageCard = ({ pkg, onEdit, onToggleStatus }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md flex flex-col h-full ${pkg.status === 'ACTIVE' ? 'border-emerald-200/50' : 'border-[#ba1a1a]/30 bg-[#ffdad6]/10'}`}>
      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 shrink-0">
                {packageTypeLabels[pkg.packageType] || pkg.packageType}
              </span>
              {pkg.status === 'INACTIVE' && (
                <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Tạm ngưng
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-[#1b1c1c] line-clamp-2 min-h-[36px]">{pkg.name}</h3>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => onEdit(pkg)}
              className="p-1 rounded-lg hover:bg-[#f5f3f3] text-[#5e5e62] transition-all"
              title="Sửa"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button
              onClick={() => onToggleStatus(pkg)}
              className={`p-1 rounded-lg transition-all ${pkg.status === 'ACTIVE' ? 'hover:bg-emerald-100 text-emerald-600' : 'hover:bg-[#ffdad6] text-[#ba1a1a]'}`}
              title={pkg.status === 'ACTIVE' ? 'Tạm ngưng' : 'Kích hoạt'}
            >
              <span className="material-symbols-outlined text-[16px]">{pkg.status === 'ACTIVE' ? 'toggle_on' : 'toggle_off'}</span>
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-[#0056b3]">{formatPrice(pkg.price)}</span>
            {pkg.price > 0 && <span className="text-[11px] text-[#5e5e62]">/ {pkg.durationDays || pkg.duration || 30} ngày</span>}
          </div>
        </div>

        {/* Stats - compact */}
        <div className="flex gap-1.5 mb-2">
          <div className="flex-1 bg-[#f5f3f3] rounded-md p-1.5 text-center min-w-0">
            <p className="text-sm font-black text-[#1b1c1c] truncate">{pkg.jobPostsAllowed ?? pkg.benefits?.jobPostsAllowed ?? 0}</p>
            <p className="text-[9px] font-bold text-[#5e5e62] uppercase truncate">Tin</p>
          </div>
          <div className="flex-1 bg-[#f5f3f3] rounded-md p-1.5 text-center min-w-0">
            <p className="text-sm font-black text-[#1b1c1c] truncate">{pkg.featuredDays ?? pkg.benefits?.featuredDays ?? 0}</p>
            <p className="text-[9px] font-bold text-[#5e5e62] uppercase truncate">Nổi bật</p>
          </div>
          <div className="flex-1 bg-[#f5f3f3] rounded-md p-1.5 text-center min-w-0">
            <p className="text-sm font-black text-[#1b1c1c] truncate">{pkg.cvAccessLimit ?? pkg.benefits?.cvAccessLimit ?? 0}</p>
            <p className="text-[9px] font-bold text-[#5e5e62] uppercase truncate">CV</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-[#5e5e62] line-clamp-2 leading-snug mb-2 min-h-[28px]">{pkg.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#c2c6d4]/30 mt-auto">
          <span className="text-[9px] text-[#727784]">
            {pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('vi-VN') : '—'}
          </span>
          <span className="text-[9px] font-bold text-[#5e5e62]">#{pkg.sortOrder ?? 0}</span>
        </div>
      </div>
    </div>
  );
};

// PackageCard cho Jobseeker - compact
const JobseekerPackageCard = ({ pkg, onEdit, onToggleStatus }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md flex flex-col h-full ${pkg.status === 'ACTIVE' ? 'border-emerald-200/50' : 'border-[#ba1a1a]/30 bg-[#ffdad6]/10'}`}>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                pkg.benefits?.aiPremiumAccess ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {packageTypeLabels[pkg.packageType] || pkg.packageType}
              </span>
              {pkg.status === 'INACTIVE' && (
                <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Tạm ngưng
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-[#1b1c1c] line-clamp-2 min-h-[36px]">{pkg.name}</h3>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => onEdit(pkg)}
              className="p-1 rounded-lg hover:bg-[#f5f3f3] text-[#5e5e62]"
              title="Sửa"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button
              onClick={() => onToggleStatus(pkg)}
              className={`p-1 rounded-lg transition-all ${pkg.status === 'ACTIVE' ? 'hover:bg-emerald-100 text-emerald-600' : 'hover:bg-[#ffdad6] text-[#ba1a1a]'}`}
              title={pkg.status === 'ACTIVE' ? 'Tạm ngưng' : 'Kích hoạt'}
            >
              <span className="material-symbols-outlined text-[16px]">{pkg.status === 'ACTIVE' ? 'toggle_on' : 'toggle_off'}</span>
            </button>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-[#0056b3]">{formatPrice(pkg.price)}</span>
            {pkg.price > 0 && <span className="text-[11px] text-[#5e5e62]">/ {pkg.durationDays || 30} ngày</span>}
          </div>
        </div>

        {pkg.packageType === 'CV_BOOST' && (
          <div className="flex gap-1.5 mb-2">
            <div className="flex-1 bg-[#f5f3f3] rounded-md p-1.5 text-center min-w-0">
              <p className="text-sm font-black text-[#1b1c1c] truncate">{pkg.durationDays || 0}</p>
              <p className="text-[9px] font-bold text-[#5e5e62] uppercase truncate">Ngày boost</p>
            </div>
            <div className="flex-1 bg-[#f5f3f3] rounded-md p-1.5 text-center min-w-0">
              <p className="text-sm font-black text-[#1b1c1c] truncate">
                {pkg.benefits?.aiPremiumAccess ? 'Có' : 'Không'}
              </p>
              <p className="text-[9px] font-bold text-[#5e5e62] uppercase truncate">AI Premium</p>
            </div>
          </div>
        )}

        <p className="text-[11px] text-[#5e5e62] line-clamp-2 leading-snug mb-2 min-h-[28px]">{pkg.description}</p>

        <div className="flex items-center justify-between pt-2 border-t border-[#c2c6d4]/30 mt-auto">
          <span className="text-[9px] text-[#727784]">
            {pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('vi-VN') : '—'}
          </span>
          <span className="text-[9px] font-bold text-[#5e5e62]">#{pkg.sortOrder ?? 0}</span>
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
          <h2 className="text-xl font-bold text-[#0056b3] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#0056b3] rounded-full"></span>
            Quản lý Gói dịch vụ
          </h2>
          <p className="text-sm text-[#5e5e62] mt-1">
            Tạo và quản lý các gói dịch vụ cho nhà tuyển dụng và ứng viên
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-[#c2c6d4]/50 p-1 inline-flex">
        <button
          onClick={() => setActiveTab('EMPLOYER')}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'EMPLOYER'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-[#5e5e62] hover:bg-[#f5f3f3]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">apartment</span>
          Gói Nhà tuyển dụng
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'EMPLOYER' ? 'bg-white/20 text-white' : 'bg-[#f5f3f3] text-[#5e5e62]'
          }`}>
            {tabCounts.EMPLOYER}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('JOBSEEKER')}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'JOBSEEKER'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-[#5e5e62] hover:bg-[#f5f3f3]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
          Gói Ứng viên
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'JOBSEEKER' ? 'bg-white/20 text-white' : 'bg-[#f5f3f3] text-[#5e5e62]'
          }`}>
            {tabCounts.JOBSEEKER}
          </span>
        </button>
      </div>

      {/* Stats Summary - theo tab hiện tại */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#0056b3] to-blue-800 p-5 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-200">inventory_2</span>
            <span className="text-sm font-bold text-blue-200 uppercase">Tổng gói</span>
          </div>
          <p className="text-3xl font-black">{currentTabPackages.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span className="text-sm font-bold text-emerald-600 uppercase">Đang hoạt động</span>
          </div>
          <p className="text-3xl font-black text-[#1b1c1c]">
            {currentTabPackages.filter((p) => p.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#ba1a1a]">toggle_off</span>
            <span className="text-sm font-bold text-[#ba1a1a] uppercase">Tạm ngưng</span>
          </div>
          <p className="text-3xl font-black text-[#1b1c1c]">
            {currentTabPackages.filter((p) => p.status !== 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-600">payments</span>
            <span className="text-sm font-bold text-amber-600 uppercase">Giá TB</span>
          </div>
          <p className="text-3xl font-black text-[#1b1c1c]">
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
            className="px-4 py-2.5 rounded-lg border border-[#c2c6d4] text-sm font-medium"
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm ngưng</option>
          </select>
          <select
            value={sortPrice}
            onChange={(e) => setSortPrice(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-[#c2c6d4] text-sm font-medium"
          >
            <option value="default">Mặc định</option>
            <option value="asc">Giá: Thấp → Cao</option>
            <option value="desc">Giá: Cao → Thấp</option>
          </select>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-[#0056b3] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#0056b3]/90 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm gói mới
        </button>
      </div>

      {/* Package Grid */}
      {activeTab === 'EMPLOYER' ? (
        // 4 gói nhà tuyển dụng — flex-1 ÉP cùng 1 hàng, có thể cuộn ngang nếu chật
        <div className="flex flex-nowrap gap-4 items-stretch overflow-x-auto pb-2 -mx-1 px-1">
          {filteredPackages.map((pkg) => (
            <div key={pkg._id} className="flex-1 min-w-[220px] max-w-[320px]">
              <EmployerPackageCard
                pkg={pkg}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
              />
            </div>
          ))}
        </div>
      ) : (
        // 2 gói ứng viên → 2 cột, đặt cạnh nhau cho cân đối
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          <div className="animate-spin w-8 h-8 border-4 border-[#0056b3] border-t-transparent rounded-full"></div>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-[#c2c6d4]/50">
          <span className="material-symbols-outlined text-[60px] text-[#c2c6d4]">inventory_2</span>
          <p className="text-[#5e5e62] mt-3 font-bold">Chưa có gói dịch vụ nào</p>
          <button
            onClick={handleAddNew}
            className="mt-4 text-[#0056b3] font-bold hover:underline"
          >
            Tạo gói đầu tiên
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default AdminPackages;
