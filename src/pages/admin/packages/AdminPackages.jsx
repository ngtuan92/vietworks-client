import { Edit, FileSearch, CheckCircle2, X, Plus, Package, ToggleLeft, CreditCard, ToggleRight, ChevronUp, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

const MOCK_PACKAGES = [
  {
    _id: 'pkg1',
    name: 'Gói Cơ Bản',
    description: 'Dành cho doanh nghiệp nhỏ, đăng tối đa 5 tin tuyển dụng',
    price: 990000,
    currency: 'VND',
    duration: 30,
    jobPostsAllowed: 5,
    featuredDays: 0,
    cvAccessLimit: 10,
    features: ['Đăng 5 tin tuyển dụng', 'Hiển thị trong 30 ngày', 'Xem 10 CV'],
    isActive: true,
    sortOrder: 1,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    _id: 'pkg2',
    name: 'Gói Pro',
    description: 'Dành cho doanh nghiệp vừa, đăng tối đa 20 tin và nổi bật',
    price: 2990000,
    currency: 'VND',
    duration: 30,
    jobPostsAllowed: 20,
    featuredDays: 7,
    cvAccessLimit: 50,
    features: ['Đăng 20 tin tuyển dụng', '7 ngày nổi bật', 'Xem 50 CV', 'Hỗ trợ ưu tiên'],
    isActive: true,
    sortOrder: 2,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    _id: 'pkg3',
    name: 'Gói Premium',
    description: 'Giải pháp toàn diện cho doanh nghiệp lớn',
    price: 5990000,
    currency: 'VND',
    duration: 90,
    jobPostsAllowed: 100,
    featuredDays: 30,
    cvAccessLimit: 999,
    features: ['Đăng 100 tin tuyển dụng', '30 ngày nổi bật', 'Xem CV không giới hạn', 'Dashboard quản lý', 'Hỗ trợ 24/7'],
    isActive: true,
    sortOrder: 3,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    _id: 'pkg4',
    name: 'Gói Trial',
    description: 'Dùng thử miễn phí cho doanh nghiệp mới',
    price: 0,
    currency: 'VND',
    duration: 7,
    jobPostsAllowed: 3,
    featuredDays: 0,
    cvAccessLimit: 5,
    features: ['Đăng 3 tin tuyển dụng', 'Hiển thị trong 7 ngày', 'Xem 5 CV'],
    isActive: false,
    sortOrder: 0,
    createdAt: '2024-03-01T10:00:00Z',
  },
];

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

const PackageCard = ({ pkg, onEdit, onToggleStatus }) => {
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <div className={`vw-card rounded-[1.5rem] border transition-all hover:shadow-glow hover:-translate-y-0.5 ${pkg.isActive ? 'border-slate-200' : 'border-blue-300/50 bg-blue-50/10'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
              {!pkg.isActive && (
                <span className="bg-[#0056B3]/10 text-[#001a40] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Tạm ngưng
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">{pkg.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(pkg)}
              className="p-2 rounded-lg hover:bg-slate-50 text-slate-500 transition-all"
            >
              <Edit className="w-5 h-5 " />
            </button>
            <button
              onClick={() => onToggleStatus(pkg)}
              className={`p-2 rounded-lg transition-all ${pkg.isActive ? 'hover:bg-blue-50 text-[#001a40]' : 'hover:bg-blue-100 text-blue-700'}`}
            >
              {pkg.isActive ? <ToggleLeft className="w-5 h-5 " /> : <ToggleRight className="w-5 h-5 " />}
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-primary">{formatPrice(pkg.price)}</span>
            {pkg.price > 0 && <span className="text-slate-500 text-sm">/ {pkg.duration} ngày</span>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xl font-black text-slate-900">{pkg.jobPostsAllowed}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Tin đăng</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xl font-black text-slate-900">{pkg.featuredDays}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Ngày nổi bật</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xl font-black text-slate-900">{pkg.cvAccessLimit}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">CV được xem</p>
          </div>
        </div>

        {/* Features Toggle */}
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="flex items-center gap-1 text-sm font-bold text-primary mb-2"
        >
          <FileSearch className="w-5 h-5 " />
          Tính năng ({pkg.features.length})
          {showFeatures ? <ChevronUp className="w-4 h-4 " /> : <ChevronDown className="w-4 h-4 " />}
        </button>

        {showFeatures && (
          <div className="space-y-1.5 mb-4 pl-2">
            {pkg.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                {feature}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-[10px] text-[#727784]">
            Tạo: {new Date(pkg.createdAt).toLocaleDateString('vi-VN')}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500">Thứ tự: {pkg.sortOrder}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PackageModal = ({ pkg, onSave, onClose }) => {
  const [form, setForm] = useState(pkg || {
    name: '',
    description: '',
    price: 0,
    currency: 'VND',
    duration: 30,
    jobPostsAllowed: 1,
    featuredDays: 0,
    cvAccessLimit: 0,
    features: [],
    isActive: true,
    sortOrder: 0,
  });
  const [featureInput, setFeatureInput] = useState('');

  const handleAddFeature = () => {
    if (featureInput) {
      setForm({ ...form, features: [...form.features, featureInput] });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx) => {
    setForm({ ...form, features: form.features.filter((_, i) => i !== idx) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">{pkg ? 'Sửa gói dịch vụ' : 'Thêm gói dịch vụ mới'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg transition-all">
            <X className="w-5 h-5 " />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-500 mb-1">Tên gói</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200/80 focus:border-primary focus:ring-2 focus:ring-blue-50 outline-none"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-500 mb-1">Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200/80 focus:border-primary focus:ring-2 focus:ring-blue-50 outline-none resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Giá (VND)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200/80 focus:border-primary focus:ring-2 focus:ring-blue-50 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Thời hạn (ngày)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200/80 focus:border-primary focus:ring-2 focus:ring-blue-50 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Số tin được đăng</label>
              <input
                type="number"
                value={form.jobPostsAllowed}
                onChange={(e) => setForm({ ...form, jobPostsAllowed: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200/80 focus:border-primary focus:ring-2 focus:ring-blue-50 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Ngày nổi bật</label>
              <input
                type="number"
                value={form.featuredDays}
                onChange={(e) => setForm({ ...form, featuredDays: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200/80 focus:border-primary focus:ring-2 focus:ring-blue-50 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Số CV được xem</label>
              <input
                type="number"
                value={form.cvAccessLimit}
                onChange={(e) => setForm({ ...form, cvAccessLimit: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200/80 focus:border-primary focus:ring-2 focus:ring-blue-50 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Thứ tự hiển thị</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200/80 focus:border-primary focus:ring-2 focus:ring-blue-50 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-500 mb-1">Tính năng</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  placeholder="Nhập tính năng..."
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200/80 focus:border-primary focus:ring-2 focus:ring-blue-50 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2.5 bg-blue-50 text-primary rounded-full font-black hover:bg-primary/20 transition-all"
                >
                  <Plus className="w-5 h-5 " />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.features.map((f, i) => (
                  <span key={i} className="flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full text-sm">
                    {f}
                    <button type="button" onClick={() => handleRemoveFeature(i)} className="text-[#001a40]">
                      <X className="w-5 h-5 " />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all"
            >
              {pkg ? 'Lưu thay đổi' : 'Tạo gói mới'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminPackages = () => {
  const [packages, setPackages] = useState(MOCK_PACKAGES);
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [filterActive, setFilterActive] = useState('all');

  const filteredPackages = packages.filter((pkg) => {
    if (filterActive === 'all') return true;
    if (filterActive === 'active') return pkg.isActive;
    if (filterActive === 'inactive') return !pkg.isActive;
    return true;
  });

  const handleEdit = (pkg) => {
    setEditingPkg(pkg);
    setShowModal(true);
  };

  const handleToggleStatus = (pkg) => {
    setPackages(packages.map((p) => (p._id === pkg._id ? { ...p, isActive: !p.isActive } : p)));
  };

  const handleSave = (form) => {
    if (editingPkg) {
      setPackages(packages.map((p) => (p._id === editingPkg._id ? { ...p, ...form } : p)));
    } else {
      setPackages([...packages, { ...form, _id: `pkg${Date.now()}`, createdAt: new Date().toISOString() }]);
    }
    setShowModal(false);
    setEditingPkg(null);
  };

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            Quản lý Gói dịch vụ
          </h2>
          <p className="text-sm text-slate-500 mt-1">Tạo và quản lý các gói dịch vụ cho nhà tuyển dụng</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-slate-200/80 text-sm font-medium"
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm ngưng</option>
          </select>
          <button
            onClick={() => {
              setEditingPkg(null);
              setShowModal(true);
            }}
            className="vw-btn-primary !min-h-0 px-5 py-2 rounded-full font-black hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5 " />
            Thêm gói mới
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#0056b3] to-blue-800 p-5 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-200" />
            <span className="text-sm font-bold text-blue-200 uppercase">Tổng gói</span>
          </div>
          <p className="text-3xl font-black">{packages.length}</p>
        </div>
        <div className="vw-card p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-blue-700" />
            <span className="text-sm font-bold text-blue-700 uppercase">Đang hoạt động</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{packages.filter((p) => p.isActive).length}</p>
        </div>
        <div className="vw-card p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-2 mb-2">
            <ToggleLeft className="w-5 h-5 text-[#001a40]" />
            <span className="text-sm font-bold text-[#001a40] uppercase">Tạm ngưng</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{packages.filter((p) => !p.isActive).length}</p>
        </div>
        <div className="vw-card p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-blue-800" />
            <span className="text-sm font-bold text-blue-800 uppercase">Giá trung bình</span>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {formatPrice(Math.round(packages.filter((p) => p.price > 0).reduce((sum, p) => sum + p.price, 0) / packages.filter((p) => p.price > 0).length))}
          </p>
        </div>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <PackageCard key={pkg._id} pkg={pkg} onEdit={handleEdit} onToggleStatus={handleToggleStatus} />
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <div className="text-center py-12 vw-card rounded-[1.5rem]">
          <Package className="w-16 h-16 text-slate-300" />
          <p className="text-slate-500 mt-3 font-bold">Chưa có gói dịch vụ nào</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-primary font-bold hover:underline"
          >
            Tạo gói đầu tiên
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <PackageModal
          pkg={editingPkg}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingPkg(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPackages;


