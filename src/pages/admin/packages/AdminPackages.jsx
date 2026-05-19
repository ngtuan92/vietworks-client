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
    <div className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${pkg.isActive ? 'border-[#c2c6d4]/50' : 'border-[#ba1a1a]/30 bg-[#ffdad6]/10'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-[#1b1c1c]">{pkg.name}</h3>
              {!pkg.isActive && (
                <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Tạm ngưng
                </span>
              )}
            </div>
            <p className="text-sm text-[#5e5e62]">{pkg.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(pkg)}
              className="p-2 rounded-lg hover:bg-[#f5f3f3] text-[#5e5e62] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button
              onClick={() => onToggleStatus(pkg)}
              className={`p-2 rounded-lg transition-all ${pkg.isActive ? 'hover:bg-[#ffdad6] text-[#ba1a1a]' : 'hover:bg-emerald-100 text-emerald-600'}`}
            >
              <span className="material-symbols-outlined text-[20px]">{pkg.isActive ? 'toggle_off' : 'toggle_on'}</span>
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#0056b3]">{formatPrice(pkg.price)}</span>
            {pkg.price > 0 && <span className="text-[#5e5e62] text-sm">/ {pkg.duration} ngày</span>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#f5f3f3] rounded-lg p-3 text-center">
            <p className="text-xl font-black text-[#1b1c1c]">{pkg.jobPostsAllowed}</p>
            <p className="text-[10px] font-bold text-[#5e5e62] uppercase">Tin đăng</p>
          </div>
          <div className="bg-[#f5f3f3] rounded-lg p-3 text-center">
            <p className="text-xl font-black text-[#1b1c1c]">{pkg.featuredDays}</p>
            <p className="text-[10px] font-bold text-[#5e5e62] uppercase">Ngày nổi bật</p>
          </div>
          <div className="bg-[#f5f3f3] rounded-lg p-3 text-center">
            <p className="text-xl font-black text-[#1b1c1c]">{pkg.cvAccessLimit}</p>
            <p className="text-[10px] font-bold text-[#5e5e62] uppercase">CV được xem</p>
          </div>
        </div>

        {/* Features Toggle */}
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="flex items-center gap-1 text-sm font-bold text-[#0056b3] mb-2"
        >
          <span className="material-symbols-outlined text-[18px]">feature_search</span>
          Tính năng ({pkg.features.length})
          <span className="material-symbols-outlined text-[16px]">{showFeatures ? 'expand_less' : 'expand_more'}</span>
        </button>

        {showFeatures && (
          <div className="space-y-1.5 mb-4 pl-2">
            {pkg.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-[#5e5e62]">
                <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
                {feature}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#c2c6d4]/30">
          <span className="text-[10px] text-[#727784]">
            Tạo: {new Date(pkg.createdAt).toLocaleDateString('vi-VN')}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#5e5e62]">Thứ tự: {pkg.sortOrder}</span>
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
    if (featureInput.trim()) {
      setForm({ ...form, features: [...form.features, featureInput.trim()] });
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
        <div className="p-6 border-b border-[#c2c6d4] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#0056b3]">{pkg ? 'Sửa gói dịch vụ' : 'Thêm gói dịch vụ mới'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f5f3f3] rounded-lg transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-[#5e5e62] mb-1">Tên gói</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#c2c6d4] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/10 outline-none"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-[#5e5e62] mb-1">Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#c2c6d4] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/10 outline-none resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#5e5e62] mb-1">Giá (VND)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#c2c6d4] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/10 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#5e5e62] mb-1">Thời hạn (ngày)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#c2c6d4] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/10 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#5e5e62] mb-1">Số tin được đăng</label>
              <input
                type="number"
                value={form.jobPostsAllowed}
                onChange={(e) => setForm({ ...form, jobPostsAllowed: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#c2c6d4] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/10 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#5e5e62] mb-1">Ngày nổi bật</label>
              <input
                type="number"
                value={form.featuredDays}
                onChange={(e) => setForm({ ...form, featuredDays: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#c2c6d4] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/10 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#5e5e62] mb-1">Số CV được xem</label>
              <input
                type="number"
                value={form.cvAccessLimit}
                onChange={(e) => setForm({ ...form, cvAccessLimit: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#c2c6d4] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/10 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#5e5e62] mb-1">Thứ tự hiển thị</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#c2c6d4] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/10 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-[#5e5e62] mb-1">Tính năng</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  placeholder="Nhập tính năng..."
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#c2c6d4] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/10 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2.5 bg-[#0056b3]/10 text-[#0056b3] rounded-lg font-bold hover:bg-[#0056b3]/20 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.features.map((f, i) => (
                  <span key={i} className="flex items-center gap-1 bg-[#f5f3f3] px-3 py-1 rounded-full text-sm">
                    {f}
                    <button type="button" onClick={() => handleRemoveFeature(i)} className="text-[#ba1a1a]">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-[#c2c6d4]">
            <button
              type="submit"
              className="flex-1 bg-[#0056b3] text-white py-3 rounded-xl font-bold hover:bg-[#0056b3]/90 transition-all"
            >
              {pkg ? 'Lưu thay đổi' : 'Tạo gói mới'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold border border-[#c2c6d4] hover:bg-[#f5f3f3] transition-all"
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
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0056b3] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#0056b3] rounded-full"></span>
            Quản lý Gói dịch vụ
          </h2>
          <p className="text-sm text-[#5e5e62] mt-1">Tạo và quản lý các gói dịch vụ cho nhà tuyển dụng</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[#c2c6d4] text-sm font-medium"
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
            className="bg-[#0056b3] text-white px-5 py-2 rounded-lg font-bold hover:bg-[#0056b3]/90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Thêm gói mới
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#0056b3] to-blue-800 p-5 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-200">inventory_2</span>
            <span className="text-sm font-bold text-blue-200 uppercase">Tổng gói</span>
          </div>
          <p className="text-3xl font-black">{packages.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span className="text-sm font-bold text-emerald-600 uppercase">Đang hoạt động</span>
          </div>
          <p className="text-3xl font-black text-[#1b1c1c]">{packages.filter((p) => p.isActive).length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#ba1a1a]">toggle_off</span>
            <span className="text-sm font-bold text-[#ba1a1a] uppercase">Tạm ngưng</span>
          </div>
          <p className="text-3xl font-black text-[#1b1c1c]">{packages.filter((p) => !p.isActive).length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-600">payments</span>
            <span className="text-sm font-bold text-amber-600 uppercase">Giá trung bình</span>
          </div>
          <p className="text-3xl font-black text-[#1b1c1c]">
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
        <div className="text-center py-12 bg-white rounded-xl border border-[#c2c6d4]/50">
          <span className="material-symbols-outlined text-[60px] text-[#c2c6d4]">inventory_2</span>
          <p className="text-[#5e5e62] mt-3 font-bold">Chưa có gói dịch vụ nào</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-[#0056b3] font-bold hover:underline"
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