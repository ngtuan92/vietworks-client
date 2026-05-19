
import { useParams } from 'react-router-dom';

const CompanyDetail = () => {
  const { id } = useParams();

  return (
    <main className="max-w-container-max mx-auto px-gutter py-10">
      <h1 className="text-3xl font-bold text-slate-900">Chi tiết công ty #{id}</h1>
      <p className="mt-3 text-slate-600">
        Trang này là khung chi tiết công ty. Bạn có thể nối API để hiển thị mô tả, liên hệ và việc làm đang mở.
      </p>
    </main>
  );
};

export default CompanyDetail;
