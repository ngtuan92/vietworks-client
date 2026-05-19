import React, { useState } from 'react';

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
  JOBSEEKER: { label: 'Ứng viên', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  EMPLOYER: { label: 'Nhà tuyển dụng', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  ADMIN: { label: 'Quản trị', bg: 'bg-[#0056b3]/10', text: 'text-[#0056b3]' },
};

const statusConfig = {
  ACTIVE: { label: 'Hoạt động', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  UNVERIFIED: { label: 'Chưa xác minh', bg: 'bg-amber-100', text: 'text-amber-700' },
  BANNED: { label: 'Bị khóa', bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]' },
};

const UserRow = ({ user, onBan, onUnban, onView }) => {
  const role = roleConfig[user.role] || roleConfig.JOBSEEKER;
  const status = statusConfig[user.accountStatus] || statusConfig.UNVERIFIED;

  return (
    <tr className="border-b border-[#c2c6d4]/30 hover:bg-[#f5f3f3]/50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0056b3]/10 flex items-center justify-center text-[#0056b3] font-black text-sm">
            {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-[#1b1c1c]">{user.fullName}</p>
            <p className="text-xs text-[#5e5e62]">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${role.bg} ${role.text}`}>
          {role.label}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </td>
      <td className="py-4 px-4 text-sm text-[#5e5e62]">{user.phone || '—'}</td>
      <td className="py-4 px-4 text-sm text-[#5e5e62]">
        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(user)}
            className="p-2 rounded-lg hover:bg-[#0056b3]/10 text-[#5e5e62] transition-all"
            title="Xem chi tiết"
          >
            <span className="material-symbols-outlined text-[20px]">visibility</span>
          </button>
          {user.accountStatus === 'BANNED' ? (
            <button
              onClick={() => onUnban(user._id)}
              className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-all"
              title="Mở khóa"
            >
              <span className="material-symbols-outlined text-[20px]">lock_open</span>
            </button>
          ) : user.role !== 'ADMIN' ? (
            <button
              onClick={() => onBan(user._id)}
              className="p-2 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a] transition-all"
              title="Khóa tài khoản"
            >
              <span className="material-symbols-outlined text-[20px]">block</span>
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
        <div className="p-6 border-b border-[#c2c6d4]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#ba1a1a] text-[24px]">warning</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#ba1a1a]">Khóa tài khoản</h2>
              <p className="text-sm text-[#5e5e62]">{user?.fullName}</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#5e5e62] mb-1">Lý do khóa</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do khóa tài khoản..."
              className="w-full px-4 py-2.5 rounded-lg border border-[#c2c6d4] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/10 outline-none resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onConfirm(user._id, reason)}
              className="flex-1 bg-[#ba1a1a] text-white py-3 rounded-xl font-bold hover:bg-[#ba1a1a]/90 transition-all"
            >
              Xác nhận khóa
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold border border-[#c2c6d4] hover:bg-[#f5f3f3] transition-all"
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
        <div className="p-6 border-b border-[#c2c6d4] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0056b3]">Chi tiết người dùng</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f5f3f3] rounded-lg transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#0056b3]/10 flex items-center justify-center text-[#0056b3] font-black text-2xl">
              {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-xl font-bold text-[#1b1c1c]">{user.fullName}</p>
              <p className="text-sm text-[#5e5e62]">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#f5f3f3] rounded-xl p-4">
              <p className="text-xs font-bold text-[#5e5e62] uppercase mb-1">Vai trò</p>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${role.bg} ${role.text}`}>
                {role.label}
              </span>
            </div>
            <div className="bg-[#f5f3f3] rounded-xl p-4">
              <p className="text-xs font-bold text-[#5e5e62] uppercase mb-1">Trạng thái</p>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <div className="bg-[#f5f3f3] rounded-xl p-4">
              <p className="text-xs font-bold text-[#5e5e62] uppercase mb-1">Số điện thoại</p>
              <p className="text-sm font-bold text-[#1b1c1c]">{user.phone || '—'}</p>
            </div>
            <div className="bg-[#f5f3f3] rounded-xl p-4">
              <p className="text-xs font-bold text-[#5e5e62] uppercase mb-1">Ngày tham gia</p>
              <p className="text-sm font-bold text-[#1b1c1c]">
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          {user.accountStatus === 'BANNED' && (
            <div className="bg-[#ffdad6] rounded-xl p-4">
              <p className="text-xs font-bold text-[#ba1a1a] uppercase mb-1">Lý do khóa</p>
              <p className="text-sm font-bold text-[#ba1a1a]">{user.banReason || 'Không xác định'}</p>
              <p className="text-xs text-[#ba1a1a] mt-1">
                Ngày khóa: {user.bannedAt ? new Date(user.bannedAt).toLocaleDateString('vi-VN') : '—'}
              </p>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-[#c2c6d4]">
          <button onClick={onClose} className="w-full py-3 rounded-xl font-bold border border-[#c2c6d4] hover:bg-[#f5f3f3] transition-all">
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
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0056b3] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#0056b3] rounded-full"></span>
            Quản lý Người dùng
          </h2>
          <p className="text-sm text-[#5e5e62] mt-1">Tổng cộng {users.length} người dùng trong hệ thống</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#c2c6d4]/50 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#5e5e62]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#c2c6d4] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/10 outline-none"
            />
          </div>
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-[#c2c6d4] text-sm font-medium"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="JOBSEEKER">Ứng viên</option>
          <option value="EMPLOYER">Nhà tuyển dụng</option>
          <option value="ADMIN">Quản trị</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-[#c2c6d4] text-sm font-medium"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="UNVERIFIED">Chưa xác minh</option>
          <option value="BANNED">Bị khóa</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#0056b3]">group</span>
            <span className="text-sm font-bold text-[#5e5e62] uppercase">Tổng cộng</span>
          </div>
          <p className="text-3xl font-black text-[#1b1c1c]">{users.length}</p>
        </div>
        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span className="text-sm font-bold text-emerald-600 uppercase">Hoạt động</span>
          </div>
          <p className="text-3xl font-black text-emerald-600">{users.filter((u) => u.accountStatus === 'ACTIVE').length}</p>
        </div>
        <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-600">pending</span>
            <span className="text-sm font-bold text-amber-600 uppercase">Chưa xác minh</span>
          </div>
          <p className="text-3xl font-black text-amber-600">{users.filter((u) => u.accountStatus === 'UNVERIFIED').length}</p>
        </div>
        <div className="bg-red-50 p-5 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#ba1a1a]">block</span>
            <span className="text-sm font-bold text-[#ba1a1a] uppercase">Bị khóa</span>
          </div>
          <p className="text-3xl font-black text-[#ba1a1a]">{users.filter((u) => u.accountStatus === 'BANNED').length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#c2c6d4]/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f5f3f3] border-b border-[#c2c6d4]">
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Người dùng</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Vai trò</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Trạng thái</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Điện thoại</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Ngày tham gia</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Thao tác</th>
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[60px] text-[#c2c6d4]">search_off</span>
            <p className="text-[#5e5e62] mt-3 font-bold">Không tìm thấy người dùng nào</p>
          </div>
        )}
      </div>

      {banModal && <BanModal user={banModal} onConfirm={handleBan} onClose={() => setBanModal(null)} />}
      {detailModal && <UserDetailModal user={detailModal} onClose={() => setDetailModal(null)} />}
    </div>
  );
};

export default AdminUsers;