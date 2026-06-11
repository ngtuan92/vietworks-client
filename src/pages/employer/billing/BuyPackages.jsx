import { CheckCircle2, AlertCircle, Wallet, Receipt, History } from 'lucide-react';
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <PackageCard title="Mở khóa lẻ" price="20.000 VNĐ" benefits={['Mở 1 CV', 'Xem chi tiết liên hệ', 'Không giới hạn thời gian']} actionLabel="Mua ngay" />
          <PackageCard title="Gói 50 CV" price="800.000 VNĐ" benefits={['Mở 50 CV bất kỳ', 'Lưu trữ CV vĩnh viễn', 'Tiết kiệm 20% chi phí']} actionLabel="Mua ngay" featured />
          <PackageCard title="Gói 100 CV" price="1.500.000 VNĐ" benefits={['Mở 100 CV bất kỳ', 'Lưu trữ CV vĩnh viễn', 'Tiết kiệm 25% chi phí']} actionLabel="Mua ngay" />
        </div>
      </section>

      <section className="space-y-4 pt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Tin nổi bật & GẤP</h2>
            <p className="text-sm text-slate-500 mt-1">Gắn nhãn đặc biệt để đẩy tin tuyển dụng lên trang chủ.</p>
          </div>
          <Link to="/employer/packages/featured-job" className="px-6 py-2 rounded-full bg-primary text-white font-bold hover:bg-primary/95 shadow-md shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all">
            Gắn nhãn ngay
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <PackageCard title="Gói 7 ngày" price="150.000 VNĐ" benefits={['Áp dụng cho 1 Job', 'Top đầu tìm kiếm', 'Nhãn GẤP đỏ nổi bật']} actionLabel="Chọn gói" />
          <PackageCard title="Gói 14 ngày" price="250.000 VNĐ" benefits={['Áp dụng cho 1 Job', 'Top đầu trang chủ', 'Tiếp cận +200% ứng viên']} actionLabel="Chọn gói" featured />
          <PackageCard title="Gói 30 ngày" price="400.000 VNĐ" benefits={['Áp dụng cho 1 Job', 'Hiển thị nổi bật xuyên suốt', 'Hỗ trợ Push Job định kỳ']} actionLabel="Chọn gói" />
        </div>
      </section>
    </div>
  );
};

const PackageCard = ({ title, price, benefits, actionLabel, featured = false }) => (
  <div className={`relative bg-white rounded-3xl transition-all duration-300 ${featured ? 'border-2 border-primary shadow-2xl shadow-primary/20 p-8 scale-105 z-10' : 'border border-slate-200/60 shadow-lg p-6 hover:-translate-y-1'}`}>
    {featured && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-md">
        ĐỀ XUẤT
      </div>
    )}
    <h3 className={`text-lg font-bold ${featured ? 'text-primary' : 'text-slate-900'}`}>{title}</h3>
    <div className="text-3xl font-black text-slate-900 mt-4 mb-1">{price}</div>
    <p className="text-sm text-slate-500 font-semibold mb-6">Đã bao gồm VAT</p>
    
    <ul className="space-y-3 text-sm text-slate-700 font-semibold">
      {benefits.map((b) => (
        <li key={b} className="flex items-start gap-3">
          <CheckCircle2 className={`w-5 h-5 shrink-0 ${featured ? 'text-primary' : 'text-emerald-500'}`} />
          <span>{b}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full mt-8 px-4 py-3 rounded-2xl font-bold transition-all ${
      featured 
        ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:-translate-y-0.5' 
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
    }`}>
      {actionLabel}
    </button>
  </div>
);

export default BuyPackages;
