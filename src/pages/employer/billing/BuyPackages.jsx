
import { Link } from 'react-router-dom';

const BuyPackages = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gói dịch vụ</h1>
          <p className="text-slate-600 mt-1">Xem và mua các gói mở khóa CV hoặc gói tin nổi bật/GẤP.</p>
        </div>
        <Link to="/employer/active-packages" className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
          Gói đang sử dụng
        </Link>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Mở khóa CV</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PackageCard title="Mở khóa lẻ" price="20.000 VNĐ" benefits={['Mở 1 CV']} actionLabel="Mua ngay" />
          <PackageCard title="Gói 50 CV" price="800.000 VNĐ" benefits={['Mở 50 CV trong 30 ngày', 'Tiết kiệm 20%']} actionLabel="Mua ngay" />
          <PackageCard title="Gói 100 CV" price="1.500.000 VNĐ" benefits={['Mở 100 CV trong 30 ngày', 'Tiết kiệm 25%']} actionLabel="Mua ngay" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Tin nổi bật & GẤP</h2>
          <Link to="/employer/packages/featured-job" className="px-4 py-2 rounded-xl bg-[#003f87] text-white font-semibold hover:bg-[#0b4e9f]">
            Mua gói cho Job
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PackageCard title="Gói 7 ngày" price="150.000 VNĐ" benefits={['Áp dụng cho 1 Job', 'Top đầu tìm kiếm', 'Nhãn GẤP']} actionLabel="Chọn gói" />
          <PackageCard title="Gói 14 ngày" price="250.000 VNĐ" benefits={['Áp dụng cho 1 Job', 'Top đầu trang chủ', 'Nhãn GẤP']} actionLabel="Chọn gói" />
          <PackageCard title="Gói 30 ngày" price="400.000 VNĐ" benefits={['Áp dụng cho 1 Job', 'Hiển thị nổi bật lâu hơn', 'Nhãn GẤP']} actionLabel="Chọn gói" />
        </div>
      </section>
    </div>
  );
};

const PackageCard = ({ title, price, benefits, actionLabel }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5">
    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    <div className="text-2xl font-bold text-[#003f87] mt-3">{price}</div>
    <ul className="mt-4 space-y-2 text-sm text-slate-600">
      {benefits.map((b) => (
        <li key={b} className="flex items-start gap-2">
          <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
    <button className="w-full mt-5 px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800">
      {actionLabel}
    </button>
  </div>
);

export default BuyPackages;
