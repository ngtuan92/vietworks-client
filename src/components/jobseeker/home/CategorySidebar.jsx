import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCareerGroups } from '../../../services/jobService';

const CategorySidebar = () => {
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await getCareerGroups();
        if (res.success && res.data) {
          // Lấy tối đa 6 nhóm nổi bật
          setCategories(res.data.slice(0, 6));
        }
      } catch (error) {
        console.error("Failed to fetch career groups:", error);
      }
    };
    fetchGroups();
  }, []);

  const getIconForGroup = (slug) => {
    const map = {
      'kinh-doanh-ban-hang': 'sell',
      'marketing-truyen-thong': 'campaign',
      'cong-nghe-thong-tin': 'terminal',
      'tai-chinh-ke-toan': 'account_balance',
      'hanh-chinh-nhan-su': 'group',
      'san-xuat-van-hanh': 'factory',
      'xay-dung-kien-truc': 'architecture',
      'y-te-cham-soc-suc-khoe': 'medical_services',
      'du-lich-nha-hang-khach-san': 'restaurant',
      'giao-duc-dao-tao': 'school'
    };
    return map[slug] || 'work';
  };

  return (
    <div className="md:col-span-3 bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] p-5 border border-outline-variant flex flex-col h-full">
      <h3 className="font-bold text-slate-800 mb-4 text-lg">Nhóm nghề nổi bật</h3>
      <div className="space-y-1 flex-1">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
            to={`/jobs?careerGroupId=${cat._id}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-sm">{getIconForGroup(cat.slug)}</span>
              </div>
              <span className="font-medium text-slate-700 line-clamp-1 text-sm group-hover:text-primary transition-colors">{cat.name}</span>
            </div>
            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 text-sm">chevron_right</span>
          </Link>
        ))}
        {categories.length === 0 && (
          <div className="p-3 text-slate-500 text-sm text-center">Đang tải danh mục...</div>
        )}
      </div>
      <Link className="flex items-center justify-center p-3 rounded-lg hover:bg-blue-50 transition-colors group border-t border-slate-100 mt-3 pt-4" to="/jobs">
        <span className="text-primary font-semibold text-sm">Khám phá tất cả việc làm</span>
      </Link>
    </div>
  );
};

export default CategorySidebar;
