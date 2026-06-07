import { Eye, Unlock, Ban, AlertTriangle, X, Users, CheckCircle2, Clock, SearchX, Search } from 'lucide-react';
import  { useState } from 'react';

const MOCK_USERS = [
  {
    _id: 'u1',
    fullName: 'Nguyễn Văn Minh',
    email: 'minh.nguyen@email.com',
    role: 'JOBSEEKER',
    accountStatus: 'ACTIVE',
    phone: '0901234567',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    _id: 'u2',
    fullName: 'Trần Thị Lan',
    email: 'lan.tran@company.com',
    role: 'EMPLOYER',
    accountStatus: 'ACTIVE',
    phone: '0912345678',
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    _id: 'u3',
    fullName: 'Lê Hoàng Nam',
    email: 'nam.le@startup.vn',
    role: 'EMPLOYER',
    accountStatus: 'UNVERIFIED',
    phone: '0923456789',
    createdAt: '2024-03-10T09:15:00Z',
  },
  {
    _id: 'u4',
    fullName: 'Phạm Quốc Khánh',
    email: 'khanh.pham@mail.com',
    role: 'JOBSEEKER',
    accountStatus: 'BANNED',
    banReason: 'Spam nhiều lần',
    bannedAt: '2024-03-25T16:00:00Z',
    createdAt: '2024-01-20T11:45:00Z',
  },
  {
    _id: 'u5',
    fullName: 'Công ty TNHH ABC',
    email: 'hr@abc-corp.vn',
    role: 'EMPLOYER',
    accountStatus: 'ACTIVE',
    phone: '0934567890',
    createdAt: '2024-03-05T08:00:00Z',
  },
  {
    _id: 'u6',
    fullName: 'Đỗ Minh Tuấn',
    email: 'tuan.dodm@mail.com',
    role: 'JOBSEEKER',
    accountStatus: 'ACTIVE',
    phone: '0945678901',
    createdAt: '2024-03-18T13:20:00Z',
  },
];

const roleConfig = {
  JOBSEEKER: { label: 'Ứng viên', bg: 'bg-blue-50 ring-blue-100', text: 'text-blue-700' },
  EMPLOYER: { label: 'Nhà tuyển dụng', bg: 'bg-blue-100 ring-blue-200', text: 'text-[#004491]' },
  ADMIN: { label: 'Quản trị', bg: 'bg-blue-50 ring-blue-100', text: 'text-primary' },
};

const statusConfig = {
  ACTIVE: { label: 'Hoạt động', bg: 'bg-blue-50 ring-blue-100', text: 'text-blue-700' },
  UNVERIFIED: { label: 'Chưa xác minh', bg: 'bg-blue-100 ring-blue-200', text: 'text-blue-800' },
  BANNED: { label: 'Bị khóa', bg: 'bg-blue-50 ring-blue-200', text: 'text-[#001a40]' },
};

const UserRow = ({ user, onBan, onUnban, onView }) => {
  const role = roleConfig[user.role] || roleConfig.JOBSEEKER;
  const status = statusConfig[user.accountStatus] || statusConfig.UNVERIFIED;

  return (
    <tr className="group border-b border-slate-100 transition-colors hover:bg-blue-50/35">
      <td className="py-4 px-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-white ring-1 ring-blue-100 flex items-center justify-center text-primary font-black text-sm shadow-insetLight transition-transform group-hover:scale-105">
            {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{user.fullName}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-5">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${role.bg} ${role.text}`}>
          {role.label}
        </span>
      </td>
      <td className="py-4 px-5">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </td>
      <td className="py-4 px-5 text-sm font-semibold text-slate-500">{user.phone || '—'}</td>
      <td className="py-4 px-5 text-sm font-semibold text-slate-500">
        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
      </td>
      <td className="py-4 px-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(user)}
            className="p-2 rounded-xl border border-transparent text-slate-500 transition-all hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:text-[#0056B3] hover:shadow-soft"
            title="Xem chi tiết"
          >
            <Eye className="w-5 h-5 " />
          </button>
          {user.accountStatus === 'BANNED' ? (
            <button
              onClick={() => onUnban(user._id)}
              className="p-2 rounded-xl border border-transparent text-blue-700 transition-all hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:shadow-soft"
              title="Mở khóa"
            >
              <Unlock className="w-5 h-5 " />
            </button>
          ) : user.role !== 'ADMIN' ? (
            <button
              onClick={() => onBan(user._id)}
              className="p-2 rounded-xl border border-transparent text-[#001a40] transition-all hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:text-[#0056B3] hover:shadow-soft"
              title="Khóa tài khoản"
            >
              <Ban className="w-5 h-5 " />
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
};

const BanModal = ({ user, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[#001a40]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#001a40]">Khóa tài khoản</h2>
              <p className="text-sm text-slate-500">{user?.fullName}</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-1">Lý do khóa</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do khóa tài khoản..."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200/80 focus:border-primary focus:ring-2 focus:ring-blue-50 outline-none resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onConfirm(user._id, reason)}
              className="flex-1 bg-[#0056B3] text-white py-3 rounded-xl font-bold hover:bg-[#004491] transition-all"
            >
              Xác nhận khóa
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;
  const role = roleConfig[user.role] || roleConfig.JOBSEEKER;
  const status = statusConfig[user.accountStatus] || statusConfig.UNVERIFIED;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">Chi tiết người dùng</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg transition-all">
            <X className="w-5 h-5 " />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-primary font-black text-2xl">
              {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{user.fullName}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Vai trò</p>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${role.bg} ${role.text}`}>
                {role.label}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Trạng thái</p>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Số điện thoại</p>
              <p className="text-sm font-bold text-slate-900">{user.phone || '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Ngày tham gia</p>
              <p className="text-sm font-bold text-slate-900">
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          {user.accountStatus === 'BANNED' && (
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs font-bold text-[#001a40] uppercase mb-1">Lý do khóa</p>
              <p className="text-sm font-bold text-[#001a40]">{user.banReason || 'Không xác định'}</p>
              <p className="text-xs text-[#001a40] mt-1">
                Ngày khóa: {user.bannedAt ? new Date(user.bannedAt).toLocaleDateString('vi-VN') : '—'}
              </p>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-slate-200">
          <button onClick={onClose} className="w-full py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [banModal, setBanModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      !search ||
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
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

  const handleBan = (userId, reason) => {
    setUsers(
      users.map((u) =>
        u._id === userId
          ? { ...u, accountStatus: 'BANNED', banReason: reason, bannedAt: new Date().toISOString() }
          : u
      )
    );
    setBanModal(null);
  };

  const handleUnban = (userId) => {
    setUsers(
      users.map((u) =>
        u._id === userId
          ? { ...u, accountStatus: 'ACTIVE', banReason: null, bannedAt: null }
          : u
      )
    );
  };

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            Quản lý Người dùng
          </h2>
          <p className="text-sm text-slate-500 mt-1">Tổng cộng {users.length} người dùng trong hệ thống</p>
        </div>
      </div>

      {/* Filters */}
      <section className="vw-card overflow-hidden rounded-[1.75rem]">
        <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black text-slate-950">Bộ lọc người dùng</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Đang hiển thị <span className="font-black text-[#0056B3]">{filteredUsers.length}</span> / {users.length} tài khoản
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-[#0056B3] ring-1 ring-blue-100">
                {activeFilterCount} bộ lọc đang bật
              </span>
            ) : null}
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-[#0056B3]"
            >
              Xóa lọc
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[1.3fr_.85fr_.85fr] lg:items-end">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">Tìm kiếm nhanh</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0056B3]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, email hoặc số điện thoại..."
                className="vw-input h-12 pl-11 pr-4 text-sm font-semibold placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">Vai trò</label>
            <div className="relative">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="vw-input h-12 appearance-none cursor-pointer pr-10 text-sm font-bold text-slate-700"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="JOBSEEKER">Ứng viên</option>
                <option value="EMPLOYER">Nhà tuyển dụng</option>
                <option value="ADMIN">Quản trị</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0056B3]">⌄</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">Trạng thái</label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="vw-input h-12 appearance-none cursor-pointer pr-10 text-sm font-bold text-slate-700"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="UNVERIFIED">Chưa xác minh</option>
                <option value="BANNED">Bị khóa</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0056B3]">⌄</span>
            </div>
          </div>
        </div>
      </section>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="vw-card vw-card-3d p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-slate-500 uppercase">Tổng cộng</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{users.length}</p>
        </div>
        <div className="vw-card vw-card-3d p-5 rounded-[1.5rem] border-blue-200 bg-blue-50/70">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-blue-700" />
            <span className="text-sm font-bold text-blue-700 uppercase">Hoạt động</span>
          </div>
          <p className="text-3xl font-black text-blue-700">{users.filter((u) => u.accountStatus === 'ACTIVE').length}</p>
        </div>
        <div className="vw-card vw-card-3d p-5 rounded-[1.5rem] border-blue-200 bg-blue-50/70">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-800" />
            <span className="text-sm font-bold text-blue-800 uppercase">Chưa xác minh</span>
          </div>
          <p className="text-3xl font-black text-blue-800">{users.filter((u) => u.accountStatus === 'UNVERIFIED').length}</p>
        </div>
        <div className="vw-card vw-card-3d p-5 rounded-[1.5rem] border-blue-200 bg-blue-50/70">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="w-5 h-5 text-[#001a40]" />
            <span className="text-sm font-bold text-[#001a40] uppercase">Bị khóa</span>
          </div>
          <p className="text-3xl font-black text-[#001a40]">{users.filter((u) => u.accountStatus === 'BANNED').length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="vw-card overflow-hidden rounded-[1.75rem]">
        <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/70 to-white px-5 py-4">
          <p className="text-sm font-black text-slate-950">Danh sách tài khoản</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Theo dõi vai trò, trạng thái và thao tác nhanh trên từng người dùng.</p>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[920px]">
          <thead>
            <tr className="bg-blue-50/60 border-b border-slate-100">
              <th className="text-left py-4 px-5 text-xs font-black text-slate-500 uppercase tracking-wider">Người dùng</th>
              <th className="text-left py-4 px-5 text-xs font-black text-slate-500 uppercase tracking-wider">Vai trò</th>
              <th className="text-left py-4 px-5 text-xs font-black text-slate-500 uppercase tracking-wider">Trạng thái</th>
              <th className="text-left py-4 px-5 text-xs font-black text-slate-500 uppercase tracking-wider">Điện thoại</th>
              <th className="text-left py-4 px-5 text-xs font-black text-slate-500 uppercase tracking-wider">Ngày tham gia</th>
              <th className="text-left py-4 px-5 text-xs font-black text-slate-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <UserRow
                key={user._id}
                user={user}
                onBan={setBanModal}
                onUnban={handleUnban}
                onView={setDetailModal}
              />
            ))}
          </tbody>
        </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <SearchX className="w-16 h-16 text-slate-300" />
            <p className="text-slate-500 mt-3 font-bold">Không tìm thấy người dùng nào</p>
          </div>
        )}
      </div>

      {banModal && <BanModal user={banModal} onConfirm={handleBan} onClose={() => setBanModal(null)} />}
      {detailModal && <UserDetailModal user={detailModal} onClose={() => setDetailModal(null)} />}
    </div>
  );
};

export default AdminUsers;



