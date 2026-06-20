import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { PageHeader, SectionCard, StatCard, FilterGrid, InputField, SelectField, ActionButton, StatusBadge, ModalShell } from '../shared/AdminPrimitives';
import { Eye, Users, Briefcase, Key, SearchX } from 'lucide-react';

const roleMap = {
  JOBSEEKER: 'bg-blue-50 text-blue-700 border-blue-200/60',
  EMPLOYER: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  ADMIN: 'bg-slate-800 text-white border-slate-700',
};

const statusMap = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  UNVERIFIED: 'bg-slate-50 text-slate-700 border-slate-200',
  BANNED: 'bg-red-50 text-red-700 border-red-200/60',
};

const roleLabel = {
  JOBSEEKER: 'Ứng viên',
  EMPLOYER: 'Nhà tuyển dụng',
  ADMIN: 'Quản trị',
};

const UserRow = ({ user, onView }) => {
  return (
    <tr className="group border-t border-slate-100 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xs font-black text-primary border border-blue-100 shadow-sm transition-transform group-hover:scale-105">
            {user.fullName.split(' ').map((name) => name[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{user.fullName}</p>
            <p className="text-xs text-slate-500 font-medium">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleMap[user.role]}`}>{roleLabel[user.role]}</span>
      </td>
      <td className="px-6 py-4">
        <StatusBadge value={user.accountStatus} map={statusMap} />
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-slate-600">{user.phone || '—'}</td>
      <td className="px-6 py-4 text-sm font-semibold text-slate-600">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
      <td className="px-6 py-4">
        <button
          onClick={() => onView(user)}
          className="rounded-xl border border-transparent p-2 text-slate-400 transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-sm"
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

  return (
    <ModalShell
      title="Chi tiết tài khoản"
      onClose={onClose}
      footer={<ActionButton onClick={onClose}>Đóng</ActionButton>}
    >
      <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-primary shadow-sm">
          {user.fullName.split(' ').map((name) => name[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="text-xl font-black text-slate-900">{user.fullName}</p>
          <p className="text-sm font-medium text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Vai trò</p>
          <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-1 ${roleMap[user.role]}`}>{roleLabel[user.role]}</span>
        </div>
        <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Trạng thái</p>
          <div className="mt-1"><StatusBadge value={user.accountStatus} map={statusMap} /></div>
        </div>
        <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Số điện thoại</p>
          <p className="text-sm font-black text-slate-900 mt-1">{user.phone || '—'}</p>
        </div>
        <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Ngày đăng ký</p>
          <p className="text-sm font-black text-slate-900 mt-1">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
        </div>
      </div>
    </ModalShell>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterStatus, search]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (filterRole !== 'all') params.role = filterRole;
      if (filterStatus !== 'all') params.accountStatus = filterStatus;
      if (search) params.search = search;
      const res = await api.get('/admin/users', { params });
      if (res.data.success) setUsers(res.data.data);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  const fetchUserDetail = async (userId) => {
    setDetailLoading(true);
    try {
      const res = await api.get('/admin/users/' + userId);
      if (res.data.success) setDetailModal(res.data.data);
    } catch (error) {
      console.error('Fetch user detail error:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      !search ||
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      <PageHeader
        title="Tài khoản Admin nội bộ"
        description={`Tổng cộng ${users.length} người dùng trong hệ thống`}
        actions={
          <ActionButton tone="primary">+ Thêm tài khoản</ActionButton>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<Users className="h-6 w-6" />} label="Tổng người dùng" value={users.length} tone="blue" />
        <StatCard icon={<Briefcase className="h-6 w-6" />} label="Nhà tuyển dụng" value={users.filter((user) => user.role === 'EMPLOYER').length} tone="indigo" />
        <StatCard icon={<Key className="h-6 w-6" />} label="Tài khoản Admin" value={users.filter((user) => user.role === 'ADMIN').length} tone="amber" />
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
                onView={fetchUserDetail}
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

      {detailModal && <UserDetailModal user={detailModal} onClose={() => setDetailModal(null)} />}
    </div>
  );
};

export default AdminUsers;
