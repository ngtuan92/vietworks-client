

const JobDetailContent = () => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      <div className="mb-8">
        <h2 className="font-headline-md text-headline-md border-l-4 border-primary pl-4 mb-4">Mô Tả Công Việc</h2>
        <div className="text-on-surface-variant font-body-md text-body-md leading-relaxed">
          <p className="mb-4">Chúng tôi đang tìm kiếm một Lập trình viên Full Stack Senior để tham gia vào đội sản phẩm cốt lõi. Bạn sẽ chịu trách nhiệm phát triển ứng dụng web hiệu suất cao và tham gia vào các quyết định kiến trúc.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Thiết kế và triển khai các giải pháp front-end và back-end có tính mở rộng.</li>
            <li>Phối hợp với nhà thiết kế UI/UX để chuyển hóa thiết kế thành code chất lượng cao.</li>
            <li>Hướng dẫn lập trình viên junior và tham gia đánh giá code.</li>
            <li>Đảm bảo tính khả thi kỹ thuật của các thiết kế UI/UX.</li>
            <li>Tối ưu hóa ứng dụng về tốc độ và khả năng mở rộng.</li>
          </ul>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="font-headline-md text-headline-md border-l-4 border-primary pl-4 mb-4">Yêu Cầu Uyển Viên</h2>
        <div className="text-on-surface-variant font-body-md text-body-md leading-relaxed">
          <ul className="list-disc pl-5 space-y-2">
            <li>Tốt nghiệp Đại học chuyên ngành Khoa học máy tính hoặc liên quan.</li>
            <li>5+ năm kinh nghiệm phát triển Full Stack.</li>
            <li>Thành thạo React.js, Node.js, và TypeScript.</li>
            <li>Hiểu biết sâu về thiết kế và triển khai RESTful API.</li>
            <li>Kinh nghiệm với dịch vụ đám mây AWS/GCP.</li>
            <li>Kỹ năng giải quyết vấn đề và giao tiếp tốt.</li>
          </ul>
        </div>
      </div>
      <div>
        <h2 className="font-headline-md text-headline-md border-l-4 border-primary pl-4 mb-4">Phúc Lợi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-surface rounded-lg">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            <span className="font-body-md text-body-md">Bảo hiểm sức khỏe cao cấp</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-surface rounded-lg">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
            <span className="font-body-md text-body-md">15 ngày nghỉ phép năm</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-surface rounded-lg">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>laptop_mac</span>
            <span className="font-body-md text-body-md">Trang bị MacBook Pro</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-surface rounded-lg">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
            <span className="font-body-md text-body-md">Hỗ trợ thẻ phong tập gym</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailContent;
