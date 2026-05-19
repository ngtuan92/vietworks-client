
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategorySidebar from './CategorySidebar';
import aiJobImg from '../../../assets/ai_job.png';

const Hero = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('all');

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (keyword.trim()) {
      params.set('q', keyword.trim());
    }

    if (location !== 'all') {
      params.set('location', location);
    }

    const queryString = params.toString();
    navigate(queryString ? `/jobs?${queryString}` : '/jobs');
  };

  return (
    <section className="hero-gradient pt-16 pb-24 relative overflow-hidden">
      <div className="max-w-container-max mx-auto px-gutter relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-on-primary text-display-lg font-display-lg tracking-tight mb-stack-md">
            VietWorks - Kiến tạo tương lai, gặt hái thành công
          </h1>
          <p className="text-on-primary-container text-body-lg opacity-90">
            Tiếp cận 50,000+ việc làm hàng đầu từ các công ty lớn tại Việt Nam
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-2 md:flex items-center max-w-4xl mx-auto border border-outline-variant">
          <div className="flex-1 flex items-center px-4 border-r border-outline-variant py-3">
            <span className="material-symbols-outlined text-outline mr-3">search</span>
            <input
              className="w-full bg-transparent border-none focus:ring-0 text-body-md outline-none"
              placeholder="Chức danh, từ khóa hoặc công ty..."
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <div className="flex-1 flex items-center px-4 py-3">
            <span className="material-symbols-outlined text-outline mr-3">location_on</span>
            <select
              className="w-full bg-transparent border-none focus:ring-0 text-body-md outline-none appearance-none cursor-pointer"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              <option value="all">Tất cả địa điểm</option>
              <option value="hcm">Hồ Chí Minh</option>
              <option value="hn">Hà Nội</option>
              <option value="dn">Đà Nẵng</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="bg-primary text-on-primary px-10 py-3 rounded-lg font-bold hover:bg-primary-container transition-all m-1 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">search</span>
            Tìm kiếm
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-stack-lg mt-16">
          <CategorySidebar />

          <div className="md:col-span-6 relative rounded-xl overflow-hidden shadow-2xl h-80 group">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYhueuhQrroDLhJFXli1-s34L_Yc51SO1Ju2zvILFOI41W4GxMgEsd_gAnx66BnqgSQaIRo9ZQ-x6hKyxFvs8rzi0R3N8hphNoRB1puJ6LHLe2uErr14IwrlJMKjOLci-10OtAwqOuKAFlTQUuPECsmfzvMIppIkwoNKvyA7cdbZFc3PPlTKH9xrBuM0gCBR3ix6mrsGMLuXVp-YlKBzP30a2CNh6CGKvzM03mh__9vjY6DdRwo8y3jkYHxGVARKs1Ztii2yAMcYSe"
              alt="Professional team"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex flex-col justify-end p-8">
              <h2 className="text-on-primary text-headline-lg font-headline-lg mb-2">Tạo CV số của bạn trong 5 phút</h2>
              <p className="text-on-primary-container opacity-90 mb-4">Các mẫu chuyên nghiệp được chuyên gia nhân sự kiểm duyệt.</p>
              <div className="flex gap-stack-md">
                <button className="px-6 py-2 bg-white text-primary font-bold rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined">play_circle</span>
                  Xem hướng dẫn
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 bg-[#032d60] rounded-xl p-8 flex flex-col justify-center items-center text-center shadow-xl border border-white/10">
            <div className="mb-6 relative">
              <div className="w-24 h-24 bg-primary-fixed rounded-full overflow-hidden flex items-center justify-center">
                <img src={aiJobImg} alt="AI Job Matching" className="w-full h-full object-cover" />
              </div>
            </div>
            <h3 className="text-on-primary text-headline-md font-bold mb-2">Cập nhật thị trường</h3>
            <div className="space-y-4 w-full">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-white/60 text-body-sm">Việc làm đang mở</div>
                <div className="text-white text-headline-md font-bold">
                  56,517 <span className="text-green-400 text-sm">↑</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-white/60 text-body-sm">Mới hôm nay</div>
                <div className="text-white text-headline-md font-bold">5,092</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
