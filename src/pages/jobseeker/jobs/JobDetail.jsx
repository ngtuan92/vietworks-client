import JobDetailHeader from '../../../components/jobseeker/jobs/JobDetailHeader';
import JobDetailContent from '../../../components/jobseeker/jobs/JobDetailContent';
import JobInfoSidebar from '../../../components/jobseeker/jobs/JobInfoSidebar';
import RelatedJobsSidebar from '../../../components/jobseeker/jobs/RelatedJobsSidebar';
import CompanyCard from '../../../components/jobseeker/jobs/CompanyCard';

const JobDetail = () => {
  return (
    <div className="bg-background font-body-md">
      <main className="max-w-container-max mx-auto px-gutter py-8">
        {/* Job Header */}
        <JobDetailHeader />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <JobDetailContent />
            <CompanyCard />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <JobInfoSidebar />
            <RelatedJobsSidebar />
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;
