import { useEffect, useState } from 'react';
// Import service lấy thông tin công ty của bạn
import employerCompanyService from '../../../services/employerCompanyService'; 

import {
  WarningBanner,
  StatsGrid,
  ApplicationTrend,
  QuickServicePacks,
  AttentionJobs,
  RecruitmentFunnel,
  OptimizeSuggestion,
  NewApplicants,
  ServiceCostChart,
  MySubscriptionsWidget,
} from '../../../components/employer/dashboard/DashboardWidgets';

const EmployerDashboard = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy thông tin profile công ty khi vào Dashboard
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const res = await employerCompanyService.getMyCompanyProfile();
        // Kiểm tra cấu trúc response của bạn (ở đây giả định res.data hoặc res.metadata tùy dự án)
        if (res && res.data) {
          setCompany(res.data);
        }
      } catch (error) {
        console.error("Không thể lấy trạng thái xác thực doanh nghiệp:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-medium">
        Đang tải dữ liệu dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner - Đã được truyền status để tự động ẩn/hiện */}
      <WarningBanner verificationStatus={company?.verificationStatus || 'UNVERIFIED'} />

      {/* Stats */}
      <StatsGrid />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left - Charts & Tables */}
        <div className="lg:col-span-8 space-y-6">
          <ApplicationTrend />
          <QuickServicePacks />
          <AttentionJobs />
        </div>

        {/* Right - Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">
          <MySubscriptionsWidget />
          <RecruitmentFunnel />
          <OptimizeSuggestion />
          <NewApplicants />
          <ServiceCostChart />
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;