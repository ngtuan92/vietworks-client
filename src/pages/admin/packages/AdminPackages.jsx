import { Edit, FileSearch, CheckCircle2, X, Plus, Package, ToggleLeft, CreditCard, ToggleRight, ChevronUp, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import {
  PageHeader,
  SectionCard,
  StatCard,
  ModalShell,
  ActionButton,
  InputField,
  SelectField
} from '../shared/AdminPrimitives';

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
    <SectionCard className={`h-full transition-all duration-300 ${!pkg.isActive ? 'opacity-80 grayscale-[20%]' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-black text-slate-900">{pkg.name}</h3>
            {!pkg.isActive && (
              <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tạm ngưng
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-500 line-clamp-2">{pkg.description}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(pkg)}
            className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all shadow-sm active:scale-95 bg-white"
            title="Sửa"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStatus(pkg)}
            className={`p-1.5 rounded-lg border shadow-sm transition-all active:scale-95 ${pkg.isActive ? 'border-red-200 hover:bg-red-50 text-red-600 bg-white' : 'border-emerald-200 hover:bg-emerald-50 text-emerald-600 bg-white'}`}
            title={pkg.isActive ? 'Tạm ngưng' : 'Kích hoạt'}
          >
            {pkg.isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-primary">{formatPrice(pkg.price)}</span>
          {pkg.price > 0 && <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">/ {pkg.duration} ngày</span>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 text-center shadow-sm">
          <p className="text-lg font-black text-slate-900">{pkg.jobPostsAllowed}</p>
          <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Tin đăng</p>
        </div>
        <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 text-center shadow-sm">
          <p className="text-lg font-black text-slate-900">{pkg.featuredDays}</p>
          <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Ngày nổi bật</p>
        </div>
        <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 text-center shadow-sm">
          <p className="text-lg font-black text-slate-900">{pkg.cvAccessLimit}</p>
          <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">CV được xem</p>
        </div>
      </div>

      <button
        onClick={() => setShowFeatures(!showFeatures)}
        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary mb-3 hover:text-blue-700 transition-colors"
      >
        <FileSearch className="w-4 h-4" />
        Tính năng ({pkg.features.length})
        {showFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showFeatures && (
        <div className="space-y-2 mb-5 pl-2">
          {pkg.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              {feature}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Tạo: {new Date(pkg.createdAt).toLocaleDateString('vi-VN')}
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thứ tự: {pkg.sortOrder}</span>
      </div>
    </SectionCard>
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
    <ModalShell
      title={pkg ? 'Chỉnh sửa gói dịch vụ' : 'Thêm gói dịch vụ mới'}
      onClose={onClose}
      footer={
        <>
          <ActionButton onClick={onClose}>Hủy</ActionButton>
          <ActionButton tone="primary" onClick={handleSubmit}>
            {pkg ? 'Lưu thay đổi' : 'Tạo gói mới'}
          </ActionButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <InputField
              label="Tên gói"
              required
              value={form.name}
              onChange={(val) => setForm({ ...form, name: val })}
            />
          </div>
          <div className="col-span-2">
            <InputField
              label="Mô tả"
              value={form.description}
              onChange={(val) => setForm({ ...form, description: val })}
            />
          </div>
          <div>
            <InputField
              type="number"
              label="Giá (VND)"
              required
              value={form.price}
              onChange={(val) => setForm({ ...form, price: Number(val) })}
            />
          </div>
          <div>
            <InputField
              type="number"
              label="Thời hạn (ngày)"
              required
              value={form.duration}
              onChange={(val) => setForm({ ...form, duration: Number(val) })}
            />
          </div>
          <div>
            <InputField
              type="number"
              label="Số tin được đăng"
              value={form.jobPostsAllowed}
              onChange={(val) => setForm({ ...form, jobPostsAllowed: Number(val) })}
            />
          </div>
          <div>
            <InputField
              type="number"
              label="Ngày nổi bật"
              value={form.featuredDays}
              onChange={(val) => setForm({ ...form, featuredDays: Number(val) })}
            />
          </div>
          <div>
            <InputField
              type="number"
              label="Số CV được xem"
              value={form.cvAccessLimit}
              onChange={(val) => setForm({ ...form, cvAccessLimit: Number(val) })}
            />
          </div>
          <div>
            <InputField
              type="number"
              label="Thứ tự hiển thị"
              value={form.sortOrder}
              onChange={(val) => setForm({ ...form, sortOrder: Number(val) })}
            />
          </div>

          <div className="col-span-2">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Tính năng</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                placeholder="Nhập tính năng..."
                className="flex-1 w-full min-h-[44px] rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none"
              />
              <ActionButton type="button" tone="soft" onClick={handleAddFeature}>
                <Plus className="w-5 h-5" />
              </ActionButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.features.map((f, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1 rounded-md text-[11px] font-bold text-slate-700 shadow-sm">
                  {f}
                  <button type="button" onClick={() => handleRemoveFeature(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </form>
    </ModalShell>
  );
};

const AdminPackages = () => {
  const [packages, setPackages] = useState(MOCK_PACKAGES);
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [filterActive, setFilterActive] = useState('');

  const filteredPackages = packages.filter((pkg) => {
    if (!filterActive) return true;
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
      <PageHeader
        title="Quản lý Gói dịch vụ"
        description="Tạo và quản lý các gói dịch vụ cao cấp cho nhà tuyển dụng"
        actions={
          <div className="flex items-center gap-3">
            <div className="w-48">
              <SelectField
                label=""
                value={filterActive}
                onChange={setFilterActive}
                options={[['active', 'Đang hoạt động'], ['inactive', 'Tạm ngưng']]}
                placeholder="Tất cả trạng thái"
              />
            </div>
            <ActionButton
              tone="primary"
              onClick={() => {
                setEditingPkg(null);
                setShowModal(true);
              }}
            >
              <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Thêm gói mới</span>
            </ActionButton>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Package className="w-6 h-6" />} label="Tổng gói" value={packages.length} tone="blue" />
        <StatCard icon={<CheckCircle2 className="w-6 h-6" />} label="Đang hoạt động" value={packages.filter((p) => p.isActive).length} tone="emerald" />
        <StatCard icon={<ToggleLeft className="w-6 h-6" />} label="Tạm ngưng" value={packages.filter((p) => !p.isActive).length} tone="amber" />
        <StatCard icon={<CreditCard className="w-6 h-6" />} label="Giá trung bình" value={formatPrice(Math.round(packages.filter((p) => p.price > 0).reduce((sum, p) => sum + p.price, 0) / (packages.filter((p) => p.price > 0).length || 1)))} tone="indigo" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <PackageCard key={pkg._id} pkg={pkg} onEdit={handleEdit} onToggleStatus={handleToggleStatus} />
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <SectionCard className="text-center py-16">
          <Package className="w-16 h-16 text-slate-300 mx-auto" />
          <p className="mt-4 font-black text-slate-500 text-lg">Chưa có gói dịch vụ nào</p>
          <ActionButton
            tone="soft"
            onClick={() => setShowModal(true)}
            className="mt-4"
          >
            Tạo gói đầu tiên
          </ActionButton>
        </SectionCard>
      )}

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
