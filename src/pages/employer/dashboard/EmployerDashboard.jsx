
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
} from '../../../components/employer/dashboard/DashboardWidgets';

const EmployerDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <WarningBanner />

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
