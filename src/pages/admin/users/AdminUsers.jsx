import { Eye, X, Users, CheckCircle2, Clock, SearchX, Search } from 'lucide-react';
import { useState } from 'react';

const MOCK_USERS = [
  { _id: 'u1', fullName: 'Nguyễn Văn Minh', email: 'minh.nguyen@email.com', role: 'JOBSEEKER', accountStatus: 'ACTIVE', phone: '0901234567', createdAt: '2024-01-15T10:00:00Z' },
  { _id: 'u2', fullName: 'Trần Thị Lan', email: 'lan.tran@company.com', role: 'EMPLOYER', accountStatus: 'ACTIVE', phone: '0912345678', createdAt: '2024-02-20T14:30:00Z' },
  { _id: 'u3', fullName: 'Lê Hoàng Nam', email: 'nam.le@startup.vn', role: 'EMPLOYER', accountStatus: 'UNVERIFIED', phone: '0923456789', createdAt: '2024-03-10T09:15:00Z' },
  { _id: 'u4', fullName: 'Phạm Quốc Khánh', email: 'khanh.pham@mail.com', role: 'JOBSEEKER', accountStatus: 'ACTIVE', phone: '0956789012', createdAt: '2024-01-20T11:45:00Z' },
  { _id: 'u5', fullName: 'Công ty TNHH ABC', email: 'hr@abc-corp.vn', role: 'EMPLOYER', accountStatus: 'ACTIVE', phone: '0934567890', createdAt: '2024-03-05T08:00:00Z' },
  { _id: 'u6', fullName: 'Đỗ Minh Tuấn', email: 'tuan.dodm@mail.com', role: 'JOBSEEKER', accountStatus: 'ACTIVE', phone: '0945678901', createdAt: '2024-03-18T13:20:00Z' },
];

const roleConfig = {
  JOBSEEKER: { label: 'Ứng viên', bg: 'bg-blue-50 ring-blue-100', text: 'text-blue-700' },
  EMPLOYER: { label: 'Nhà tuyển dụng', bg: 'bg-blue-100 ring-blue-200', text: 'text-[#004491]' },
  ADMIN: { label: 'Quản trị', bg: 'bg-blue-50 ring-blue-100', text: 'text-primary' },
};

const statusConfig = {
  ACTIVE: { label: 'Hoạt động', bg: 'bg-blue-50 ring-blue-100', text: 'text-blue-700' },
  UNVERIFIED: { label: 'Chưa xác minh', bg: 'bg-blue-100 ring-blue-200', text: 'text-blue-800' },
};

const UserRow = ({ user, onView }) => {
  const role = roleConfig[user.role] || roleConfig.JOBSEEKER;
  const status = statusConfig[user.accountStatus] || statusConfig.UNVERIFIED;

  return (
    <tr className="group border-b border-slate-100 transition-colors hover:bg-blue-50/35">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-white text-sm font-black text-primary ring-1 ring-blue-100 shadow-insetLight transition-transform group-hover:scale-105">
            {user.fullName.split(' ').map((name) => name[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{user.fullName}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${role.bg} ${role.text}`}>{role.label}</span>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${status.bg} ${status.text}`}>{status.label}</span>
      </td>
      <td className="px-5 py-4 text-sm font-semibold text-slate-500">{user.phone || '—'}</td>
      <td className="px-5 py-4 text-sm font-semibold text-slate-500">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
      <td className="px-5 py-4">
        <button
          onClick={() => onView(user)}
          className="rounded-xl border border-transparent p-2 text-slate-500 transition-all hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:text-[#0056B3] hover:shadow-soft"
          title="Xem chi tiết"
        >
          <Eye className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
};

const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;
  const role = roleConfig[user.role] || roleConfig.JOBSEEKER;
  const status = statusConfig[user.accountStatus] || statusConfig.UNVERIFIED;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/95 shadow-lift animate-rise-in">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white p-6">
          <h2 className="text-lg font-black text-primary">Chi tiết người dùng</h2>
          <button onClick={onClose} className="rounded-xl p-2 transition-all hover:bg-blue-50 hover:text-[#0056B3]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-2xl font-black text-primary ring-1 ring-blue-100">
              {user.fullName.split(' ').map((name) => name[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{user.fullName}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoCard label="Vai trò"><span className={`rounded-full px-3 py-1 text-sm font-black ring-1 ${role.bg} ${role.text}`}>{role.label}</span></InfoCard>
            <InfoCard label="Trạng thái"><span className={`rounded-full px-3 py-1 text-sm font-black ring-1 ${status.bg} ${status.text}`}>{status.label}</span></InfoCard>
            <InfoCard label="Số điện thoại"><p className="text-sm font-bold text-slate-900">{user.phone || '—'}</p></InfoCard>
            <InfoCard label="Ngày tham gia"><p className="text-sm font-bold text-slate-900">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p></InfoCard>
          </div>
        </div>
        <div className="border-t border-slate-100 p-6">
          <button onClick={onClose} className="w-full rounded-full border border-slate-200 py-3 font-black transition-all hover:bg-blue-50 hover:text-[#0056B3]">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ label, children }) => (
  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
    <p className="mb-1 text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
    {children}
  </div>
);

const AdminUsers = () => {
  const [users] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [detailModal, setDetailModal] = useState(null);

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();
    const matchSearch = !search || user.fullName.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword) || user.phone?.includes(search);
    const matchRole = filterRole === 'all' || user.role === filterRole;
    const matchStatus = filterStatus === 'all' || user.accountStatus === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const activeFilterCount = [search, filterRole !== 'all', filterStatus !== 'all'].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setFilterRole('all');
    setFilterStatus('all');
  };

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-primary">
            <span className="h-6 w-1.5 rounded-full bg-primary" />
            Quản lý Người dùng
          </h2>
          <p className="mt-1 text-sm text-slate-500">Tổng cộng {users.length} người dùng trong hệ thống</p>
        </div>
      </div>

      <section className="vw-card overflow-hidden rounded-[1.75rem]">
        <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black text-slate-950">Bộ lọc người dùng</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Đang hiển thị <span className="font-black text-[#0056B3]">{filteredUsers.length}</span> / {users.length} tài khoản</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeFilterCount > 0 ? <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-[#0056B3] ring-1 ring-blue-100">{activeFilterCount} bộ lọc đang bật</span> : null}
            <button type="button" onClick={clearFilters} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-[#0056B3]">Xóa lọc</button>
          </div>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[1.3fr_.85fr_.85fr] lg:items-end">
          <FilterSearch value={search} onChange={setSearch} />
          <FilterSelect label="Vai trò" value={filterRole} onChange={setFilterRole} options={[['all', 'Tất cả vai trò'], ['JOBSEEKER', 'Ứng viên'], ['EMPLOYER', 'Nhà tuyển dụng'], ['ADMIN', 'Quản trị']]} />
          <FilterSelect label="Trạng thái" value={filterStatus} onChange={setFilterStatus} options={[['all', 'Tất cả trạng thái'], ['ACTIVE', 'Hoạt động'], ['UNVERIFIED', 'Chưa xác minh']]} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={<Users className="h-5 w-5 text-primary" />} label="Tổng cộng" value={users.length} />
        <SummaryCard icon={<CheckCircle2 className="h-5 w-5 text-blue-700" />} label="Hoạt động" value={users.filter((user) => user.accountStatus === 'ACTIVE').length} />
        <SummaryCard icon={<Clock className="h-5 w-5 text-blue-800" />} label="Chưa xác minh" value={users.filter((user) => user.accountStatus === 'UNVERIFIED').length} />
      </div>

      <div className="vw-card overflow-hidden rounded-[1.75rem]">
        <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/70 to-white px-5 py-4">
          <p className="text-sm font-black text-slate-950">Danh sách tài khoản</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Theo dõi vai trò, trạng thái và thông tin cơ bản của người dùng.</p>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="border-b border-slate-100 bg-blue-50/60">
                <TableHead>Người dùng</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Điện thoại</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead>Thao tác</TableHead>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => <UserRow key={user._id} user={user} onView={setDetailModal} />)}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <SearchX className="mx-auto h-16 w-16 text-slate-300" />
            <p className="mt-3 font-bold text-slate-500">Không tìm thấy người dùng nào</p>
          </div>
        )}
      </div>

      {detailModal && <UserDetailModal user={detailModal} onClose={() => setDetailModal(null)} />}
    </div>
  );
};

const FilterSearch = ({ value, onChange }) => (
  <div>
    <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">Tìm kiếm nhanh</label>
    <div className="relative">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0056B3]" />
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Tìm theo tên, email hoặc số điện thoại..." className="vw-input h-12 pl-11 pr-4 text-sm font-semibold placeholder:text-slate-400" />
    </div>
  </div>
);

const FilterSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</label>
    <div className="relative">
      <select value={value} onChange={(event) => onChange(event.target.value)} className="vw-input h-12 appearance-none cursor-pointer pr-10 text-sm font-bold text-slate-700">
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0056B3]">⌄</span>
    </div>
  </div>
);

const SummaryCard = ({ icon, label, value }) => (
  <div className="vw-card vw-card-3d rounded-[1.5rem] p-5">
    <div className="mb-2 flex items-center gap-2">
      {icon}
      <span className="text-sm font-bold uppercase text-slate-500">{label}</span>
    </div>
    <p className="text-3xl font-black text-slate-900">{value}</p>
  </div>
);

const TableHead = ({ children }) => <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">{children}</th>;

export default AdminUsers;
