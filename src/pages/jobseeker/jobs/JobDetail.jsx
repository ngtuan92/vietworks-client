import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import JobDetailHeader from '../../../components/jobseeker/jobs/JobDetailHeader';
import JobDetailContent from '../../../components/jobseeker/jobs/JobDetailContent';
import JobInfoSidebar from '../../../components/jobseeker/jobs/JobInfoSidebar';
import RelatedJobsSidebar from '../../../components/jobseeker/jobs/RelatedJobsSidebar';
import CompanyCard from '../../../components/jobseeker/jobs/CompanyCard';
import jobService from '../../../services/jobService';

const JobDetail = () => {
  const { id: jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canApply, setCanApply] = useState(true);
  const [cannotApplyReason, setCannotApplyReason] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await jobService.getJobById(jobId);
        if (response.success) {
          setJob(response.data);
          setCanApply(response.canApply !== undefined ? response.canApply : true);
          setCannotApplyReason(response.cannotApplyReason || null);
        } else {
          setError(response.message || 'Failed to load job');
        }
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    const checkApplied = async () => {
      try {
        const res = await jobService.checkDuplicateApplication(jobId);
        if (res.success) {
          setHasApplied(res.data.hasApplied);
        }
      } catch (err) {
        console.error('Error checking duplicate application:', err);
      }
    };

    fetchJob();
    checkApplied();
  }, [jobId]);

  if (loading) {
    return (
      <div className="bg-background font-body-md">
        <main className="max-w-container-max mx-auto px-gutter py-8">
          <div className="flex items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-4xl text-gray-400">progress_activity</span>
            <p className="text-gray-500 ml-4">Đang tải...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-background font-body-md">
        <main className="max-w-container-max mx-auto px-gutter py-8">
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-gray-400">error</span>
            <p className="text-gray-500 mt-2">{error || 'Không tìm thấy việc làm'}</p>
          </div>
        </main>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN');
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Thỏa thuận';
    if (salary.type === 'NEGOTIABLE') return 'Thỏa thuận';
    return `${salary.minMillion || 0} - ${salary.maxMillion || 0} triệu`;
  };

  const formatLocation = (locations) => {
    if (!locations || locations.length === 0) return 'Không xác định';
    const first = locations[0];
    return first.districtName 
      ? `${first.districtName}, ${first.provinceName}` 
      : first.provinceName || 'Không xác định';
  };

  const company = job.companyId;
  const updatedAt = formatDate(job.updatedAt);

  return (
    <div className="bg-background font-body-md">
      <main className="max-w-container-max mx-auto px-gutter py-8">
        <JobDetailHeader
          job={job}
          company={company}
          salary={formatSalary(job.salary)}
          location={formatLocation(job.workLocations)}
          updatedAt={updatedAt}
          canApply={canApply}
          cannotApplyReason={cannotApplyReason}
          hasApplied={hasApplied}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <JobDetailContent job={job} />
            <CompanyCard company={company} />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <JobInfoSidebar job={job} />
            <RelatedJobsSidebar />
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;