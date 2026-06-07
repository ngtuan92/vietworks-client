import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ActionButton,
  FilterGrid,
  InputField,
  ModalShell,
  PageHeader,
  SectionCard,
  SelectField,
  SimpleTable,
  StatusBadge,
  TextAreaField,
} from '../shared/AdminPrimitives';

const USERS = [
  { id: 1, name: 'Nguyễn Minh Anh', email: 'minhanh@gmail.com', phone: '0901234123', role: 'JobSeeker', status: 'ACTIVE', registeredAt: '2026-05-10', lastLogin: '2026-05-18 09:15', hasTransaction: true, hasViolation: false },
  { id: 2, name: 'Nguyễn Văn Hải', email: 'hr@abc.com', phone: '0912345678', role: 'Employer', status: 'UNVERIFIED', registeredAt: '2026-05-14', lastLogin: '2026-05-17 18:10', hasTransaction: true, hasViolation: false },
  { id: 3, name: 'Trần Gia Huy', email: 'giahuy@gmail.com', phone: '0934567890', role: 'JobSeeker', status: 'LOCKED', registeredAt: '2026-04-20', lastLogin: '2026-05-15 11:00', hasTransaction: true, hasViolation: true },
  { id: 4, name: 'Admin Support', email: 'admin@vietworks.vn', phone: '0988111222', role: 'Admin', status: 'ACTIVE', registeredAt: '2026-03-02', lastLogin: '2026-05-18 07:45', hasTransaction: false, hasViolation: false },
];

const statusMap = {
  UNVERIFIED: 'bg-slate-100 text-slate-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  BANNED: 'bg-blue-100 text-[#001a40]',
  LOCKED: 'bg-blue-100 text-[#001a40]',
};

const UserManagement = () => {
  const [filters, setFilters] = useState({ keyword: '', role: '', status: '', transaction: '', violation: '' });
  const [lockTarget, setLockTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  const rows = useMemo(
    () =>
      USERS.filter((user) => {
        const blob = `${user.name} ${user.email} ${user.phone}`.toLowerCase();
        if (filters.keyword && !blob.includes(filters.keyword.toLowerCase())) return false;
        if (filters.role && user.role !== filters.role) return false;
        if (filters.status && user.status !== filters.status) return false;
        if (filters.transaction === 'Có' && !user.hasTransaction) return false;
        if (filters.transaction === 'Không' && user.hasTransaction) return false;
        if (filters.violation === 'Có' && !user.hasViolation) return false;
        if (filters.violation === 'Không' && user.hasViolation) return false;
        return true;
      }),
    [filters]
  );

  return (
    <div className="space-y-7 animate-rise-in">
      <PageHeader
        title="Quản lý người dùng"
        description="Admin xem toàn bộ JobSeeker, Employer và Admin; có thể khóa hoặc mở khóa tài khoản theo nghiệp vụ."
        actions={<ActionButton tone="primary">Gửi thông báo riêng</ActionButton>}
      />

      <SectionCard title="Bộ lọc người dùng" description="Lọc theo từ khóa, loại tài khoản, trạng thái, giao dịch và vi phạm.">
        <FilterGrid>
          <InputField
            label="Từ khóa"
            value={filters.keyword}
            onChange={(value) => setFilters((prev) => ({ ...prev, keyword: value }))}
            placeholder="Tên, email, số điện thoại"
          />
          <SelectField
            label="Loại tài khoản"
            value={filters.role}
            onChange={(value) => setFilters((prev) => ({ ...prev, role: value }))}
            options={['JobSeeker', 'Employer', 'Admin']}
          />
          <SelectField
            label="Trạng thái"
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={['UNVERIFIED', 'ACTIVE', 'BANNED', 'LOCKED']}
          />
          <SelectField
            label="Có giao dịch"
            value={filters.transaction}
            onChange={(value) => setFilters((prev) => ({ ...prev, transaction: value }))}
            options={['Có', 'Không']}
          />
          <SelectField
            label="Có vi phạm"
            value={filters.violation}
            onChange={(value) => setFilters((prev) => ({ ...prev, violation: value }))}
            options={['Có', 'Không']}
          />
        </FilterGrid>
      </SectionCard>

      <SimpleTable
        headers={[
          'Họ tên',
          'Email',
          'Số điện thoại',
          'Loại tài khoản',
          'Trạng thái',
          'Ngày đăng ký',
          'Lần đăng nhập gần nhất',
          'Hành động',
        ]}
      >
        {rows.map((user) => (
          <tr key={user.id} className="border-t border-slate-100">
            <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
            <td className="px-4 py-3">{user.email}</td>
            <td className="whitespace-nowrap px-4 py-3">{user.phone}</td>
            <td className="whitespace-nowrap px-4 py-3">{user.role}</td>
            <td className="whitespace-nowrap px-4 py-3">
              <StatusBadge value={user.status} map={statusMap} />
            </td>
            <td className="whitespace-nowrap px-4 py-3">{user.registeredAt}</td>
            <td className="whitespace-nowrap px-4 py-3">{user.lastLogin}</td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/admin/users/${user.id}`}
                  className="rounded-2xl border border-slate-200 px-3 py-2 font-semibold text-slate-700"
                >
                  Xem
                </Link>
                {user.status === 'LOCKED' || user.status === 'BANNED' ? (
                  <ActionButton tone="soft">Mở khóa</ActionButton>
                ) : (
                  <ActionButton tone="danger" onClick={() => setLockTarget(user)}>
                    Khóa
                  </ActionButton>
                )}
              </div>
            </td>
          </tr>
        ))}
      </SimpleTable>

      {lockTarget ? (
        <ModalShell
          title={`Khóa tài khoản: ${lockTarget.name}`}
          onClose={() => {
            setLockTarget(null);
            setReason('');
            setDuration('');
            setSendEmail(true);
          }}
          footer={
            <>
              <ActionButton onClick={() => setLockTarget(null)}>Hủy</ActionButton>
              <ActionButton tone="danger" disabled={!reason}>
                Khóa tài khoản
              </ActionButton>
            </>
          }
        >
          <TextAreaField
            label="Lý do khóa"
            required
            value={reason}
            onChange={setReason}
            placeholder="Nhập lý do để lưu log và hiển thị khi người dùng đăng nhập."
          />
          <SelectField
            label="Thời hạn khóa"
            value={duration}
            onChange={setDuration}
            options={['Vĩnh viễn', '1 ngày', '7 ngày', '30 ngày', 'Tùy chọn ngày']}
            placeholder="Chọn thời hạn"
          />
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
            Gửi email / notification cho người dùng sau khi khóa
          </label>
        </ModalShell>
      ) : null}
    </div>
  );
};

export default UserManagement;


