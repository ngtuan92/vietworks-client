import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { PageHeader, SectionCard, StatCard, FilterGrid, InputField, SelectField, ActionButton, StatusBadge, ModalShell } from '../shared/AdminPrimitives';
import { Eye, Users, Briefcase, Key, SearchX, ChevronLeft, ChevronRight } from 'lucide-react';

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
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName} className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-sm transition-transform group-hover:scale-105" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xs font-black text-primary border border-blue-100 shadow-sm transition-transform group-hover:scale-105">
              {user.fullName.split(' ').map((name) => name[0]).join('').slice(0, 2)}
            </div>
          )}
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
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.fullName} className="flex h-16 w-16 items-center justify-center rounded-2xl object-cover shadow-sm border border-slate-200" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-primary shadow-sm border border-blue-100">
            {user.fullName.split(' ').map((name) => name[0]).join('').slice(0, 2)}
          </div>
        )}
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
  const [stats, setStats] = useState({ total: 0, totalEmployers: 0, totalAdmins: 0, totalActive: 0 });
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailModal, setDetailModal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterRole, filterStatus, search]);

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterStatus, search, page]);

  const fetchUsers = async () => {
    try {
      const params = { page, limit: 10 };
      if (filterRole !== 'all') params.role = filterRole;
      if (filterStatus !== 'all') params.accountStatus = filterStatus;
      if (search) params.search = search;
      const res = await api.get('/admin/users', { params });
      if (res.data.success) {
        setUsers(res.data.data);
        if (res.data.stats) setStats(res.data.stats);
        if (res.data.pagination) setTotalPages(res.data.pagination.pages || 1);
      }
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

  // We don't need client-side filter anymore because backend handles search
  const filteredUsers = users;

  return (
    <div className="space-y-6 pb-10 animate-rise-in">
      <PageHeader
        title="Quản lý Người dùng"
        description="Theo dõi và quản lý toàn bộ tài khoản trên hệ thống."
        actions={
          <ActionButton tone="primary">+ Thêm tài khoản</ActionButton>
        }
      />

      {/* Unified Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={<Users className="h-6 w-6" />} label="Tổng người dùng" value={stats.total} tone="blue" />
        <StatCard icon={<Briefcase className="h-6 w-6" />} label="Nhà tuyển dụng" value={stats.totalEmployers} tone="indigo" />
        <StatCard icon={<Key className="h-6 w-6" />} label="Tài khoản Admin" value={stats.totalAdmins} tone="amber" />
        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span className="text-sm font-bold text-emerald-600 uppercase">Hoạt động</span>
          </div>
          <p className="text-3xl font-black text-emerald-600">{stats.totalActive}</p>
        </div>
      </div>

      {/* Main Data Card */}
      <div className="bg-white rounded-2xl border border-[#c2c6d4]/50 shadow-sm overflow-hidden flex flex-col">
        {/* Modern Toolbar */}
        <div className="p-4 border-b border-[#c2c6d4]/50 bg-slate-50/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#5e5e62]">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/10 outline-none transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[#c2c6d4] text-sm font-bold text-slate-700 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="JOBSEEKER">Ứng viên</option>
              <option value="EMPLOYER">Nhà tuyển dụng</option>
              <option value="ADMIN">Quản trị</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[#c2c6d4] text-sm font-bold text-slate-700 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="UNVERIFIED">Chưa xác minh</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f3f3] border-b border-[#c2c6d4]">
                <th className="text-left py-3 px-6 text-xs font-bold text-[#5e5e62] uppercase tracking-wider">Người dùng</th>
                <th className="text-left py-3 px-6 text-xs font-bold text-[#5e5e62] uppercase tracking-wider">Vai trò</th>
                <th className="text-left py-3 px-6 text-xs font-bold text-[#5e5e62] uppercase tracking-wider">Trạng thái</th>
                <th className="text-left py-3 px-6 text-xs font-bold text-[#5e5e62] uppercase tracking-wider">Điện thoại</th>
                <th className="text-left py-3 px-6 text-xs font-bold text-[#5e5e62] uppercase tracking-wider">Ngày tham gia</th>
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
            <div className="text-center py-16 bg-slate-50/50">
              <span className="material-symbols-outlined text-[60px] text-[#c2c6d4] mb-3 block">search_off</span>
              <p className="text-[#5e5e62] font-bold text-lg">Không tìm thấy người dùng nào</p>
              <p className="text-slate-400 text-sm mt-1">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#c2c6d4]/50 bg-slate-50/30">
              <span className="text-sm font-medium text-slate-500">
                Trang <span className="font-bold text-slate-900">{page}</span> / {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Simply show a few pages around current page to avoid clutter
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                            page === pageNum
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {detailModal && <UserDetailModal user={detailModal} onClose={() => setDetailModal(null)} />}
    </div>
  );
};

export default AdminUsers;
