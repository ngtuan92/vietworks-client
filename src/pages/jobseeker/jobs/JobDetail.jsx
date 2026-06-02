import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import JobDetailHeader from '../../../components/jobseeker/jobs/JobDetailHeader';
import JobDetailContent from '../../../components/jobseeker/jobs/JobDetailContent';
import JobInfoSidebar from '../../../components/jobseeker/jobs/JobInfoSidebar';
import RelatedJobsSidebar from '../../../components/jobseeker/jobs/RelatedJobsSidebar';
import CompanyCard from '../../../components/jobseeker/jobs/CompanyCard';
import jobService from '../../../services/jobService';
import useAuth from '../../../hooks/useAuth';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canApply, setCanApply] = useState(true);
  const [cannotApplyReason, setCannotApplyReason] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJobDetail = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        setError('');

        const res = await jobService.getJobById(jobId);
        if (res.success) {
          setJob(res.data || null);
          setCanApply(res.canApply !== undefined ? res.canApply : true);
          setCannotApplyReason(res.cannotApplyReason || null);
        } else {
          setError(res.message || 'Không thể tải chi tiết công việc.');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Không thể tải chi tiết công việc.');
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    const checkApplied = async () => {
      if (!isAuthenticated || !jobId) return;
      try {
        const res = await jobService.checkDuplicateApplication(jobId);
        if (res.success) {
          setHasApplied(res.data.hasApplied);
        }
      } catch (err) {
        console.error('Error checking duplicate application:', err);
      }
    };

    fetchJobDetail();
    checkApplied();
  }, [jobId, isAuthenticated]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen font-body-md">
        <main className="max-w-container-max mx-auto px-gutter py-8">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 animate-pulse">
            <div className="h-8 w-2/3 rounded bg-slate-100" />
            <div className="mt-4 h-5 w-1/3 rounded bg-slate-100" />
            <div className="mt-8 h-40 rounded bg-slate-100" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-background min-h-screen font-body-md">
        <main className="max-w-container-max mx-auto px-gutter py-8">
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-red-700">
            <p className="font-bold">Không thể hiển thị công việc</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={() => navigate('/jobs')}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 font-bold text-white"
            >
              Quay lại danh sách việc làm
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background font-body-md">
      <main className="max-w-container-max mx-auto px-gutter py-8">
        <JobDetailHeader
          job={job}
          canApply={canApply}
          cannotApplyReason={cannotApplyReason}
          hasApplied={hasApplied}
          onApplySuccess={() => setHasApplied(true)}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <JobDetailContent job={job} />
            <CompanyCard company={job.companyId} />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <JobInfoSidebar job={job} />
            <RelatedJobsSidebar currentJob={job} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;