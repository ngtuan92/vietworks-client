import { Link, useParams } from 'react-router-dom';
import { ActionButton, PageHeader, SectionCard, SimpleTable, StatusBadge } from '../shared/AdminPrimitives';

const userMap = {
  1: {
    id: 1,
    name: 'Nguyen Minh Anh',
    email: 'minhanh@gmail.com',
    phone: '0901234123',
    role: 'JobSeeker',
    status: 'ACTIVE',
    privacy: 'PUBLIC',
    cvCount: 4,
    savedJobs: 12,
    appliedJobs: 6,
    packages: 'Boost CV 30 days',
    logs: [
      ['2026-05-18 09:15', 'Login', 'Web'],
      ['2026-05-17 13:25', 'Apply Frontend Developer', 'Job #201'],
      ['2026-05-16 20:10', 'Follow company ABC', 'Company #17'],
    ],
  },
  2: {
    id: 2,
    name: 'Nguyen Van Hai',
    email: 'hr@abc.com',
    phone: '0912345678',
    role: 'Employer',
    status: 'UNVERIFIED',
    company: 'ABC Technology',
    companyStatus: 'PENDING',
    jobs: 8,
    applications: 126,
    wallet: '45,000,000 VND',
    transactions: '32 transactions',
    logs: [
      ['2026-05-18 08:10', 'Create job Senior Backend Developer', 'Job #812'],
      ['2026-05-17 15:02', 'Top up 5,000,000 VND', 'TXN #VWX283'],
      ['2026-05-16 09:40', 'Upload company license', 'Company Verify'],
    ],
  },
};

const statusMap = {
  UNVERIFIED: 'bg-slate-100 text-slate-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  BANNED: 'bg-blue-100 text-[#001a40]',
  LOCKED: 'bg-blue-100 text-[#001a40]',
  PENDING: 'bg-blue-100 text-blue-800',
  VERIFIED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-blue-100 text-[#001a40]',
};

const UserDetail = () => {
  const { id } = useParams();
  const user = userMap[id] || userMap[1];

  return (
    <div className="space-y-7 animate-rise-in">
      <PageHeader
        title="Chi tiết người dùng"
        description="Xem thông tin tài khoản, nhật ký hoạt động, giao dịch và thiết lập quyền riêng tư."
        actions={
          <>
            <ActionButton tone="soft">Gửi tin nhắn</ActionButton>
            <ActionButton tone="danger">Khóa tài khoản</ActionButton>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Thông tin tài khoản">
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Họ và tên" value={user.name} />
            <Info label="Email" value={user.email} />
            <Info label="Số điện thoại" value={user.phone} />
            <Info label="Vai trò" value={user.role} />
            <Info label="Trạng thái" value={<StatusBadge value={user.status} map={statusMap} />} />
            {user.role === 'JobSeeker' ? <Info label="Quyền riêng tư" value={user.privacy} /> : <Info label="Công ty" value={user.company} />}
            {user.role === 'Employer' ? <Info label="Trạng thái công ty" value={<StatusBadge value={user.companyStatus} map={statusMap} />} /> : null}
            {user.role === 'Employer' ? <Info label="Ví" value={user.wallet} /> : <Info label="Gói dịch vụ" value={user.packages} />}
          </div>
        </SectionCard>

        <SectionCard title="Thống kê nhanh">
          <div className="grid gap-4 sm:grid-cols-2">
            {user.role === 'JobSeeker' ? (
              <>
                <Quick title="CV" value={`${user.cvCount}`} />
                <Quick title="Job đã lưu" value={`${user.savedJobs}`} />
                <Quick title="Job đã ứng tuyển" value={`${user.appliedJobs}`} />
                <Quick title="Gói dịch vụ" value={user.packages} />
              </>
            ) : (
              <>
                <Quick title="Tin tuyển dụng" value={`${user.jobs}`} />
                <Quick title="Lượt ứng tuyển" value={`${user.applications}`} />
                <Quick title="Giao dịch" value={user.transactions} />
                <Quick title="Công ty" value={user.company} />
              </>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Nhật ký hoạt động" right={<Link to="/admin/transactions" className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Xem giao dịch</Link>}>
        <SimpleTable headers={['Thời gian', 'Hành động', 'Nguồn']}>
          {user.logs.map(([time, action, source]) => (
            <tr key={`${time}-${action}`} className="border-t border-slate-100">
              <td className="whitespace-nowrap px-4 py-3">{time}</td>
              <td className="px-4 py-3 font-medium text-slate-900">{action}</td>
              <td className="px-4 py-3">{source}</td>
            </tr>
          ))}
        </SimpleTable>
      </SectionCard>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="mt-2 font-semibold text-slate-900">{value}</div>
  </div>
);

const Quick = ({ title, value }) => (
  <div className="rounded-2xl border border-slate-200 p-4">
    <div className="text-sm text-slate-500">{title}</div>
    <div className="mt-2 text-xl font-bold text-slate-900">{value}</div>
  </div>
);

export default UserDetail;


