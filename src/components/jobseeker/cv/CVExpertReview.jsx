

const CVExpertReview = () => {
  return (
    <div className="bg-primary text-on-secondary rounded-xl p-stack-lg shadow-lg relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="font-headline-md text-headline-md mb-stack-sm">Đánh Giá CV Chuyên Sâu</h3>
        <p className="font-body-sm mb-stack-lg opacity-90">Nhận phản hồi cá nhân hóa từ các chuyên gia tuyển dụng để hoàn thiện hồ sơ của bạn.</p>
        <button className="w-full bg-on-secondary text-primary font-bold py-stack-md rounded-lg hover:bg-surface-bright transition-all active:scale-95">Bắt đầu ngay</button>
      </div>
      {/* Abstract background element */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-on-primary-container opacity-20 rounded-full"></div>
    </div>
  );
};

export default CVExpertReview;
