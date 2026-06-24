import { Award, Mail, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#f5f5f5] border-t border-gray-200 pt-10 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-gutter max-w-container-max mx-auto mb-8">
        <div className="col-span-1">
          <h3 className="text-xl font-bold text-black mb-3">VietWorks</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4 max-w-xs">
            Nền tảng sự nghiệp hàng đầu Việt Nam. Kết nối nhân tài với các cơ hội doanh nghiệp tốt nhất toàn quốc.
          </p>
          <div className="flex gap-4">
            <Award className="text-[var(--color-primary)] cursor-pointer w-5 h-5" />
            <Mail className="text-[var(--color-primary)] cursor-pointer w-5 h-5" />
            <Globe className="text-[var(--color-primary)] cursor-pointer w-5 h-5" />
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-black mb-4">Nền tảng</h4>
          <ul className="space-y-2">
            <li><a className="text-gray-600 text-sm hover:text-[var(--color-primary)] transition-colors" href="#">Việc làm</a></li>
            <li><a className="text-gray-600 text-sm hover:text-[var(--color-primary)] transition-colors" href="#">Tạo CV</a></li>
            <li><a className="text-gray-600 text-sm hover:text-[var(--color-primary)] transition-colors" href="#">Danh sách Công ty</a></li>
            <li><a className="text-gray-600 text-sm hover:text-[var(--color-primary)] transition-colors" href="#">Tra cứu lương</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-black mb-4">Về chúng tôi</h4>
          <ul className="space-y-2">
            <li><a className="text-gray-600 text-sm hover:text-[var(--color-primary)] transition-colors" href="#">Về chúng tôi</a></li>
            <li><a className="text-gray-600 text-sm hover:text-[var(--color-primary)] transition-colors" href="#">Liên hệ</a></li>
            <li><a className="text-gray-600 text-sm hover:text-[var(--color-primary)] transition-colors" href="#">Bảo mật</a></li>
            <li><a className="text-gray-600 text-sm hover:text-[var(--color-primary)] transition-colors" href="#">Điều khoản dịch vụ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-black mb-4">Hỗ trợ</h4>
          <ul className="space-y-2">
            <li><a className="text-gray-600 text-sm hover:text-[var(--color-primary)] transition-colors" href="#">Trung tâm trợ giúp</a></li>
            <li><a className="text-gray-600 text-sm hover:text-[var(--color-primary)] transition-colors" href="#">Dành cho Nhà tuyển dụng</a></li>
            <li><a className="text-gray-600 text-sm hover:text-[var(--color-primary)] transition-colors" href="#">Dịch vụ Tuyển dụng</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-container-max mx-auto px-gutter pt-6 border-t border-gray-300">
        <p className="text-gray-500 text-xs">
          © 2026 VietWorks. Bản quyền thuộc về Công ty cổ phần VietWorks.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
