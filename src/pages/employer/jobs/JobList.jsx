
import { Link } from 'react-router-dom';

const jobs = [
  { id: 1, title: 'Senior Backend Developer', status: 'PUBLISHED', location: 'TP. Hồ Chí Minh', salary: '30 - 45 triệu', deadline: '31/05/2026', cvs: 18, package: 'GẤP', createdAt: '12/05/2026' },
  { id: 2, title: 'Product Designer', status: 'PENDING_APPROVAL', location: 'Hà Nội', salary: '20 - 30 triệu', deadline: '28/05/2026', cvs: 0, package: 'Thường', createdAt: '15/05/2026' },
  { id: 3, title: 'Sales Executive', status: 'EXPIRED', location: 'Đà Nẵng', salary: 'Thỏa thuận', deadline: '10/05/2026', cvs: 32, package: 'Nổi bật', createdAt: '20/04/2026' },
  { id: 4, title: 'HR Intern', status: 'DRAFT', location: 'TP. Hồ Chí Minh', salary: '4 - 6 triệu', deadline: '20/06/2026', cvs: 0, package: 'Thường', createdAt: '18/05/2026' },
];

const statusMeta = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  EXPIRED: 'bg-slate-200 text-slate-700',
  CLOSED: 'bg-slate-200 text-slate-700',
  BANNED: 'bg-red-100 text-red-700',
  LOCKED: 'bg-red-100 text-red-700',
};

const actionsByStatus = {
  DRAFT: ['Sửa', 'Gửi duyệt', 'Xóa'],
  PENDING_APPROVAL: ['Xem', 'Hủy gửi duyệt'],
  PUBLISHED: ['Xem', 'Sửa', 'Đóng', 'Mua gói', 'Xem CV'],
  EXPIRED: ['Xem', 'Gia hạn', 'Tạo bản sao'],
  CLOSED: ['Xem', 'Mở lại', 'Tạo bản sao'],
  BANNED: ['Xem lý do khóa'],
  LOCKED: ['Xem lý do khóa'],
};

const JobList = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách tin tuyển dụng</h1>
          <p className="text-slate-600 mt-1">Quản lý toàn bộ Job của công ty theo trạng thái và hiệu quả tuyển dụng.</p>
        </div>
        <Link to="/employer/jobs/create" className="px-4 py-2 rounded-xl bg-[#003f87] text-white font-semibold hover:bg-[#0b4e9f] w-fit">
          Tạo tin mới
        </Link>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <FilterField label="Từ khóa" placeholder="Tên job..." />
          <FilterSelect label="Trạng thái" options={['Draft', 'Pending', 'Published', 'Expired', 'Closed', 'Banned']} />
          <FilterSelect label="Địa điểm" options={['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng']} />
          <FilterSelect label="Loại tin" options={['Thường', 'Nổi bật', 'GẤP']} />
          <FilterField label="Ngày tạo từ" type="date" />
          <FilterField label="Ngày tạo đến" type="date" />
          <FilterField label="Hết hạn từ" type="date" />
          <FilterField label="Hết hạn đến" type="date" />
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {['Tên tin tuyển dụng', 'Trạng thái', 'Địa điểm', 'Mức lương', 'Hạn nộp', 'Số CV', 'Gói dịch vụ', 'Ngày tạo', 'Hành động'].map((head) => (
                  <th key={head} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-4 min-w-[220px]">
                    <div className="font-semibold text-slate-900">{job.title}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusMeta[job.status] || 'bg-slate-100 text-slate-700'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{job.location}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{job.salary}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{job.deadline}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{job.cvs}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{job.package}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{job.createdAt}</td>
                  <td className="px-4 py-4 min-w-[240px]">
                    <div className="flex flex-wrap gap-2">
                      {(actionsByStatus[job.status] || ['Xem']).map((action) => (
                        <button key={action} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">
                          {action}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const FilterField = ({ label, placeholder = '', type = 'text' }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <input type={type} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]" />
  </div>
);

const FilterSelect = ({ label, options }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <select className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87] bg-white">
      <option value="">Chọn...</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

export default JobList;
