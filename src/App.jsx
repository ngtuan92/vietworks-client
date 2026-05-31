import { BrowserRouter, Route, Routes } from 'react-router-dom';
import EmployerLayout from './components/layout/EmployerLayout';
import JobseekerLayout from './components/layout/JobseekerLayout';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/jobseeker/home/Home';
import Jobs from './pages/jobseeker/jobs/Jobs';
import JobDetail from './pages/jobseeker/jobs/JobDetail';
import ManageCV from './pages/jobseeker/cv/ManageCV';
import TemplateGallery from './pages/jobseeker/cv/TemplateGallery';
import CVBuilder from './pages/jobseeker/cv/CVBuilder';
import CvPreview from './pages/jobseeker/cv/CvPreview';

import Login from './pages/jobseeker/auth/Login';
import Register from './pages/jobseeker/auth/Register';
import ForgotPassword from './pages/jobseeker/auth/ForgotPassword';
import ResetPassword from './pages/jobseeker/auth/ResetPassword';
import VerifyEmail from './pages/jobseeker/auth/VerifyEmail';
import JobPreferences from './pages/jobseeker/profile/JobPreferences';
import LinkedinCallback from './pages/jobseeker/auth/LinkedinCallback';
import CompanyList from './pages/jobseeker/companies/CompanyList';
import CompanyDetail from './pages/jobseeker/companies/CompanyDetail';
import SalaryInsight from './pages/jobseeker/premium/SalaryInsight';
import UpgradePremium from './pages/jobseeker/premium/UpgradePremium';
import EmployerRegister from './pages/employer/auth/Register';
import EmployerVerifyEmail from './pages/employer/auth/VerifyEmail';
import EmployerForgotPassword from './pages/employer/auth/ForgotPassword';
import EmployerResetPassword from './pages/employer/auth/ResetPassword';
import EmployerLinkedinCallback from './pages/employer/auth/LinkedinCallback';
import EmployerDashboard from './pages/employer/dashboard/EmployerDashboard';

// Employer Pages
import CompanyProfile from './pages/employer/profile/CompanyProfile';
import JobList from './pages/employer/jobs/JobList';
import CreateEditJob from './pages/employer/jobs/CreateEditJob';
import CandidateList from './pages/employer/ats/CandidateList';
import JobApplications from './pages/employer/ats/JobApplications';
import ApplicationDetail from './pages/employer/ats/ApplicationDetail';
import CVSearch from './pages/employer/talent-pool/CVSearch';
import CandidateDetail from './pages/employer/talent-pool/CandidateDetail';
import UnlockedCandidates from './pages/employer/talent-pool/UnlockedCandidates';
import Wallet from './pages/employer/billing/Wallet';
import BuyPackages from './pages/employer/billing/BuyPackages';
import TopUp from './pages/employer/billing/TopUp';
import PaymentResult from './pages/employer/billing/PaymentResult';
import Transactions from './pages/employer/billing/Transactions';
import BuyFeaturedPackage from './pages/employer/billing/BuyFeaturedPackage';
import ActivePackages from './pages/employer/billing/ActivePackages';
import Messages from './pages/employer/interactions/Messages';
import Notifications from './pages/employer/interactions/Notifications';
import AccountSettings from './pages/employer/profile/AccountSettings';
import EmployerWallet from './pages/employer/wallet/EmployerWallet';

// Admin Pages
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import UserManagement from './pages/admin/users/UserManagement';
import UserDetail from './pages/admin/users/UserDetail';
import CompanyVerification from './pages/admin/companies/CompanyVerification';
import CompanyReview from './pages/admin/companies/CompanyReview';
import CompanyDetailAdmin from './pages/admin/companies/CompanyDetail';
import CompanyModerationHistory from './pages/admin/companies/CompanyModerationHistory';
import JobModeration from './pages/admin/jobs/JobModeration';
import JobReview from './pages/admin/jobs/JobReview';
import JobDetailAdmin from './pages/admin/jobs/JobDetailAdmin';
import JobModerationHistory from './pages/admin/jobs/JobModerationHistory';
import MasterDataManagement from './pages/admin/master-data/MasterDataManagement';
import CVTemplateManagement from './pages/admin/master-data/CVTemplateManagement';
import TransactionManagement from './pages/admin/billing/TransactionManagement';
import InvoiceManagement from './pages/admin/billing/InvoiceManagement';
import PackageManagement from './pages/admin/billing/PackageManagement';
import NotificationCenter from './pages/admin/notifications/NotificationCenter';
import AnalyticsDashboard from './pages/admin/dashboard/AnalyticsDashboard';
import ViolationsManagement from './pages/admin/dashboard/ViolationsManagement';
import AdminAccountSettings from './pages/admin/dashboard/AdminAccountSettings';

// New Admin Pages from pull/merge
import AdminPackages from './pages/admin/packages/AdminPackages';
import AdminUsers from './pages/admin/users/AdminUsers';
import AdminTransactions from './pages/admin/transactions/AdminTransactions';
import AdminRevenueReport from './pages/admin/analytics/AdminRevenueReport';
import AdminUserGrowth from './pages/admin/analytics/AdminUserGrowth';
import AdminInvoices from './pages/admin/invoices/AdminInvoices';

// CV Template Pages from feat/cv-template
import CVTemplateList from './pages/admin/cv-templates/CVTemplateList';
import CVTemplateForm from './pages/admin/cv-templates/CVTemplateForm';

import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<JobseekerLayout />}>
          <Route index element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="manage-cv" element={<ManageCV />} />
          <Route path="cv-templates/gallery" element={<TemplateGallery />} />
          <Route path="cv-builder/:id" element={<CVBuilder />} />
          <Route path="cv-preview/:jobId/:cvId" element={<CvPreview />} />
          
          <Route path="companies" element={<CompanyList />} />
          <Route path="companies/:id" element={<CompanyDetail />} />
          <Route path="salary-insight" element={<SalaryInsight />} />
          <Route path="premium" element={<UpgradePremium />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/job-preferences" element={<JobPreferences />} />
        <Route path="/linkedin-callback" element={<LinkedinCallback />} />

        <Route path="/employer/register" element={<EmployerRegister />} />
        <Route path="/employer/login" element={<Login />} />
        <Route path="/employer/verify-email" element={<EmployerVerifyEmail />} />
        <Route path="/employer/forgot-password" element={<EmployerForgotPassword />} />
        <Route path="/employer/reset-password" element={<EmployerResetPassword />} />
        <Route path="/employer/linkedin-callback" element={<EmployerLinkedinCallback />} />
        
        <Route path="/employer" element={<EmployerLayout />}>
          <Route path="dashboard" element={<EmployerDashboard />} />
          <Route path="company-profile" element={<CompanyProfile />} />
          <Route path="jobs" element={<JobList />} />
          <Route path="jobs/create" element={<CreateEditJob />} />
          <Route path="jobs/:id/edit" element={<CreateEditJob />} />
          <Route path="candidates" element={<CandidateList />} />
          <Route path="jobs/:id/applications" element={<JobApplications />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="talent-pool" element={<CVSearch />} />
          <Route path="talent-pool/:id" element={<CandidateDetail />} />
          <Route path="unlocked-candidates" element={<UnlockedCandidates />} />
          <Route path="wallet" element={<EmployerWallet />} />
          <Route path="wallet-legacy" element={<Wallet />} />
          <Route path="wallet/topup" element={<TopUp />} />
          <Route path="wallet/payment-result" element={<PaymentResult />} />
          <Route path="packages" element={<BuyPackages />} />
          <Route path="packages/featured-job" element={<BuyFeaturedPackage />} />
          <Route path="active-packages" element={<ActivePackages />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="account-settings" element={<AccountSettings />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          
          {/* User management routes */}
          <Route path="users" element={<AdminUsers />} />
          <Route path="users-legacy" element={<UserManagement />} />
          <Route path="users/:id" element={<UserDetail />} />
          
          <Route path="companies" element={<CompanyVerification />} />
          <Route path="companies/history" element={<CompanyModerationHistory />} />
          <Route path="companies/:id" element={<CompanyDetailAdmin />} />
          <Route path="companies/:id/review" element={<CompanyReview />} />
          
          <Route path="jobs" element={<JobModeration />} />
          <Route path="jobs/history" element={<JobModerationHistory />} />
          <Route path="/admin/jobs/:jobId" element={<JobDetailAdmin />} />
          <Route path="/admin/jobs/:jobId/review" element={<JobReview />} />
          
          <Route path="master-data" element={<MasterDataManagement />} />
          
          {/* CV Template management routes */}
          <Route path="cv-templates" element={<CVTemplateList />} />
          <Route path="cv-templates-management" element={<CVTemplateManagement />} />
          <Route path="cv-templates/create" element={<CVTemplateForm />} />
          <Route path="cv-templates/edit/:id" element={<CVTemplateForm />} />
          
          {/* Transaction management routes */}
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="transactions-legacy" element={<TransactionManagement />} />
          
          {/* Invoice management routes */}
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="invoices-legacy" element={<InvoiceManagement />} />
          
          {/* Package management routes */}
          <Route path="packages" element={<AdminPackages />} />
          <Route path="packages-legacy" element={<PackageManagement />} />
          
          <Route path="notifications" element={<NotificationCenter />} />
          
          {/* Analytics routes */}
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="revenue-report" element={<AdminRevenueReport />} />
          <Route path="analytics/user-growth" element={<AdminUserGrowth />} />
          
          <Route path="violations" element={<ViolationsManagement />} />
          <Route path="account" element={<AdminAccountSettings />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
