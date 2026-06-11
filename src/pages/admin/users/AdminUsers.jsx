import { Eye, Users, CheckCircle2, Clock, SearchX, Briefcase, Key } from 'lucide-react';
import { useState } from 'react';
import {
  PageHeader,
  SectionCard,
  SimpleTable,
  StatusBadge,
  FilterGrid,
  InputField,
  SelectField,
  ModalShell,
  ActionButton,
  StatCard,
} from '../shared/AdminPrimitives';

const MOCK_USERS = [
  { _id: 'u1', fullName: 'Nguyễn Văn Minh', email: 'minh.nguyen@email.com', role: 'JOBSEEKER', accountStatus: 'ACTIVE', phone: '0901234567', createdAt: '2024-01-15T10:00:00Z' },
  { _id: 'u2', fullName: 'Trần Thị Lan', email: 'lan.tran@company.com', role: 'EMPLOYER', accountStatus: 'ACTIVE', phone: '0912345678', createdAt: '2024-02-20T14:30:00Z' },
  { _id: 'u3', fullName: 'Lê Hoàng Nam', email: 'nam.le@startup.vn', role: 'EMPLOYER', accountStatus: 'UNVERIFIED', phone: '0923456789', createdAt: '2024-03-10T09:15:00Z' },
  { _id: 'u4', fullName: 'Phạm Quốc Khánh', email: 'khanh.pham@mail.com', role: 'JOBSEEKER', accountStatus: 'ACTIVE', phone: '0956789012', createdAt: '2024-01-20T11:45:00Z' },
  { _id: 'u5', fullName: 'Công ty TNHH ABC', email: 'hr@abc-corp.vn', role: 'EMPLOYER', accountStatus: 'ACTIVE', phone: '0934567890', createdAt: '2024-03-05T08:00:00Z' },
  { _id: 'u6', fullName: 'Đỗ Minh Tuấn', email: 'tuan.dodm@mail.com', role: 'JOBSEEKER', accountStatus: 'ACTIVE', phone: '0945678901', createdAt: '2024-03-18T13:20:00Z' },
];

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
  const [users] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();
    const matchSearch = !search || user.fullName.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword) || user.phone?.includes(search);
    const matchRole = !filterRole || user.role === filterRole;
    const matchStatus = !filterStatus || user.accountStatus === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const activeFilterCount = [search, filterRole, filterStatus].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setFilterRole('');
    setFilterStatus('');
  };

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

      <SectionCard 
        title="Danh sách tài khoản" 
        description="Quản lý và tra cứu thông tin người dùng"
        right={activeFilterCount > 0 && (
          <ActionButton tone="soft" onClick={clearFilters}>Xóa bộ lọc ({activeFilterCount})</ActionButton>
        )}
      >
        <div className="mb-6">
          <FilterGrid>
            <InputField label="Tìm kiếm" value={search} onChange={setSearch} placeholder="Tên, email hoặc số điện thoại..." />
            <SelectField label="Vai trò" value={filterRole} onChange={setFilterRole} options={[['JOBSEEKER', 'Ứng viên'], ['EMPLOYER', 'Nhà tuyển dụng'], ['ADMIN', 'Quản trị']]} placeholder="Tất cả vai trò" />
            <SelectField label="Trạng thái" value={filterStatus} onChange={setFilterStatus} options={[['ACTIVE', 'Hoạt động'], ['UNVERIFIED', 'Chưa xác minh'], ['BANNED', 'Đã khóa']]} placeholder="Tất cả trạng thái" />
          </FilterGrid>
        </div>

        <SimpleTable headers={['Người dùng', 'Vai trò', 'Trạng thái', 'Điện thoại', 'Ngày đăng ký', 'Thao tác']}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => <UserRow key={user._id} user={user} onView={setDetailModal} />)
          ) : (
            <tr>
              <td colSpan={6} className="py-12 text-center">
                <SearchX className="mx-auto h-16 w-16 text-slate-300" />
                <p className="mt-3 font-bold text-slate-500">Không tìm thấy người dùng nào</p>
              </td>
            </tr>
          )}
        </SimpleTable>
      </SectionCard>

      {detailModal && <UserDetailModal user={detailModal} onClose={() => setDetailModal(null)} />}
    </div>
  );
};

export default AdminUsers;
