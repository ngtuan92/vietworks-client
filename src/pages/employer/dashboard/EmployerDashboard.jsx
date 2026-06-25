import { useEffect, useState } from 'react';
import employerCompanyService from '../../../services/employerCompanyService';
import api from '../../../services/api';

import {
  WarningBanner,
  StatsGrid,
  ApplicationTrend,
  AttentionJobs,
  NewApplicants,
  ServiceCostChart,
  MySubscriptionsWidget,
} from '../../../components/employer/dashboard/DashboardWidgets';

const EmployerDashboard = () => {
  const [company, setCompany] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [companyRes, jobsRes, atsRes, walletRes, analyticsRes] = await Promise.allSettled([
          employerCompanyService.getMyCompanyProfile(),
          api.get('/employer/jobs', { params: { limit: 200 } }),
          api.get('/employer/ats/jobs'),
          api.get('/employer/wallet'),
          api.get('/employer/analytics/dashboard'),
        ]);

        if (companyRes.status === 'fulfilled' && companyRes.value?.data) {
          setCompany(companyRes.value.data);
        }

        const jobs = jobsRes.status === 'fulfilled' && jobsRes.value?.data?.success
          ? jobsRes.value.data.data || []
          : [];

        const atsJobs = atsRes.status === 'fulfilled' && atsRes.value?.data?.success
          ? atsRes.value.data.data || []
          : [];

        const wallet = walletRes.status === 'fulfilled' && walletRes.value?.data?.success
          ? walletRes.value.data.data
          : null;

        // Aggregate stats
        const totalJobs = jobs.length;
        const publishedJobs = jobs.filter(j => j.status === 'PUBLISHED').length;
        const pendingJobs = jobs.filter(j => j.status === 'PENDING_APPROVAL').length;
        const draftJobs = jobs.filter(j => j.status === 'DRAFT').length;

        // Aggregate application funnel from ATS jobs
        const funnelTotals = { total: 0, UNREAD: 0, APPLIED: 0, VIEWED: 0, APPROVED: 0, REJECTED: 0, HIRED: 0 };
        atsJobs.forEach(j => {
          const s = j.stats || {};
          funnelTotals.total += s.total || 0;
          funnelTotals.UNREAD += s.UNREAD || 0;
          funnelTotals.APPLIED += s.APPLIED || 0;
          funnelTotals.VIEWED += s.VIEWED || 0;
          funnelTotals.APPROVED += s.APPROVED || 0;
          funnelTotals.REJECTED += s.REJECTED || 0;
          funnelTotals.HIRED += s.HIRED || 0;
        });

        // Jobs needing attention: expiring in 3 days or PENDING_APPROVAL rejected
        const now = new Date();
        const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const attentionJobs = jobs.filter(j => {
          if (j.status === 'EXPIRED') return true;
          if (j.status === 'PUBLISHED' && j.deadline && new Date(j.deadline) <= in3Days) return true;
          return false;
        }).slice(0, 5);

        // Recent applicants: last 5 applicants across all jobs (from ATS stats)
        // We'll collect basic job info sorted by total applications
        const topJobs = [...atsJobs]
          .filter(j => j.applicationCount > 0)
          .sort((a, b) => (b.stats?.UNREAD || 0) - (a.stats?.UNREAD || 0))
          .slice(0, 5);

        const analytics = analyticsRes.status === 'fulfilled' && analyticsRes.value?.data?.success
          ? analyticsRes.value.data.data
          : null;

        setDashboardData({
          jobs,
          atsJobs,
          wallet,
          analytics,
          totalJobs,
          publishedJobs,
          pendingJobs,
          draftJobs,
          funnelTotals,
          attentionJobs,
          topJobs,
        });
      } catch (error) {
        console.error('Không thể tải dữ liệu dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-medium">
        Đang tải dữ liệu dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <WarningBanner verificationStatus={company?.verificationStatus || 'UNVERIFIED'} />
      <StatsGrid data={dashboardData} />

      {/* Hàng 2 cột: Tin có hồ sơ mới & Gói đang dùng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NewApplicants topJobs={dashboardData?.topJobs || []} />
        <MySubscriptionsWidget />
      </div>

      {/* Còn lại dàn ngang toàn màn hình */}
      <AttentionJobs jobs={dashboardData?.attentionJobs || []} />
      <ApplicationTrend analytics={dashboardData?.analytics} atsJobs={dashboardData?.atsJobs || []} />
      <ServiceCostChart analytics={dashboardData?.analytics} />
    </div>
  );
};

export default EmployerDashboard;