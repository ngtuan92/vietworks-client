import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CategorySidebar from './CategorySidebar';
import { Search, MapPin, Upload, Sparkles, Rocket } from 'lucide-react';
import heroImage from '../../../assets/anh-hero.png';
import companyLocationService from '../../../services/companyLocationService';
import { useSearchStore } from '../../../store/searchStore';

const Hero = () => {
  const navigate = useNavigate();
  const globalKeyword = useSearchStore(state => state.globalKeyword);
  const setGlobalKeyword = useSearchStore(state => state.setGlobalKeyword);
  const globalLocation = useSearchStore(state => state.globalLocation);
  const setGlobalLocation = useSearchStore(state => state.setGlobalLocation);
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    companyLocationService.getProvinces()
      .then(res => setProvinces(res || []))
      .catch(err => console.error("Lỗi lấy danh sách tỉnh:", err));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (globalKeyword.trim()) params.set('q', globalKeyword.trim());
    if (globalLocation && globalLocation !== 'all') params.set('location', globalLocation);
    const queryString = params.toString();
    navigate(queryString ? `/jobs?${queryString}` : '/jobs');
  };

  return (
    <div className="bg-[#f8fafc] pb-16">
      <section className="hero-gradient pt-16 pb-64 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-white/5 blur-3xl rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-container-max mx-auto px-gutter relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-white text-display-lg font-display-lg font-black tracking-tight mb-stack-md drop-shadow-lg leading-tight">
              VietWorks - Kiến tạo tương lai <br /> Gặt hái thành công
            </h1>
            <p className="text-sky-100 text-body-lg opacity-90 max-w-2xl mx-auto">
              Tiếp cận 50,000+ việc làm chất lượng cao từ các công ty và tập đoàn lớn nhất tại Việt Nam
            </p>
          </div>

          {/* Search Bar - Premium Glassmorphism */}
          <div className="bg-white/95 backdrop-blur-xl rounded-full p-2.5 md:flex items-center max-w-4xl mx-auto shadow-[0px_8px_32px_rgba(0,0,0,0.1)] border border-white/50">
            <div className="flex-1 flex items-center px-6 md:border-r border-slate-200 h-12">
              <Search className="text-slate-400 mr-3 w-5 h-5 shrink-0" />
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-slate-900 text-base outline-none placeholder:text-slate-500 font-medium"
                placeholder="Chức danh, mô tả, yêu cầu công việc..."
                type="text"
                value={globalKeyword}
                onChange={(event) => setGlobalKeyword(event.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center px-6 h-12">
              <MapPin className="text-slate-400 mr-3 w-5 h-5 shrink-0" />
              <select
                className="w-full bg-transparent border-none focus:ring-0 text-slate-900 text-base outline-none placeholder:text-slate-500 appearance-none cursor-pointer font-medium"
                value={globalLocation}
                onChange={(event) => setGlobalLocation(event.target.value)}
              >
                <option value="">Tất cả địa điểm</option>
                {provinces.map(p => {
                  const val = p.name || p.provinceName;
                  return (
                    <option key={p.code || p.provinceCode || val} value={val}>
                      {val}
                    </option>
                  );
                })}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="bg-primary text-white px-10 h-12 rounded-full font-bold hover:bg-primary-dark transition-all m-1 flex items-center gap-2 shadow-md hover:shadow-lg shrink-0 w-full md:w-auto justify-center"
            >
              <Search className="w-5 h-5" />
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <div className="w-[96%] max-w-[1600px] mx-auto -mt-48 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8">
          
          {/* Left: Category Sidebar */}
          <div className="lg:col-span-3">
            <div className="h-full bg-white rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.06)] overflow-hidden border border-slate-100">
               <CategorySidebar />
            </div>
          </div>

          {/* Center: Hero Image */}
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-[0px_12px_32px_rgba(0,0,0,0.15)] h-[500px] group border border-slate-100/50 bg-white">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src={heroImage}
              alt="Professional team"
            />
            {/* Dark gradient overlay at bottom for text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
            
            {/* Floating content on image */}
            <div className="absolute bottom-0 left-0 p-8 w-full text-white pointer-events-none">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3 border border-white/30">
                #KhámPháTiềmNăng
              </span>
              <h2 className="text-3xl font-bold mb-2">Tỏa sáng sự nghiệp của bạn</h2>
              <p className="text-white/80">Kết nối ngay với hàng ngàn cơ hội hấp dẫn nhất.</p>
            </div>
          </div>

          {/* Right: Premium CV Widget */}
          <div className="lg:col-span-3 rounded-2xl shadow-[0px_12px_32px_rgba(0,0,0,0.15)] bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700/50 p-7 flex flex-col justify-between h-[500px] relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/30 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Nâng tầm sự nghiệp</h3>
              <p className="text-slate-300 text-sm mb-8 leading-relaxed">
                Tạo lợi thế cạnh tranh tuyệt đối bằng cách tải CV lên và sử dụng trí tuệ nhân tạo để phân tích độ phù hợp với JD.
              </p>
            </div>
            
            <div className="space-y-4 mt-auto relative z-10">
              <button
                onClick={() => navigate('/manage-cv')}
                className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-5 h-5" />
                Tải CV lên ngay
              </button>
              
              <button
                onClick={() => navigate('/premium')}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-[1.02]"
              >
                <Sparkles className="w-5 h-5" />
                Chấm điểm CV bằng AI
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;
