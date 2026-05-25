import api from './api';   // Import instance axios đã config

// ==================== JOB MANAGEMENT ====================

/**
 * Tạo job mới (ở trạng thái DRAFT)
 */
export const createJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data;
};

/**
 * Cập nhật job (chỉ cho phép khi đang là DRAFT)
 */
export const updateJob = async (jobId, jobData) => {
  const response = await api.patch(`/jobs/${jobId}`, jobData);
  return response.data;
};

/**
 * Nộp job chờ xét duyệt (DRAFT → PENDING)
 */
export const submitJobForReview = async (jobId) => {
  const response = await api.post(`/jobs/${jobId}/submit`);
  return response.data;
};

/**
 * Xóa job (chỉ cho phép khi đang là DRAFT)
 */
export const deleteJob = async (jobId) => {
  const response = await api.delete(`/jobs/${jobId}`);
  return response.data;
};

// ==================== MASTER DATA ====================

/**
 * Lấy danh sách Nhóm ngành nghề (Career Groups)
 */
export const getCareerGroups = async () => {
  const response = await api.get('/master-data/career-groups');
  return response.data;
};

/**
 * Lấy danh sách ngành nghề theo nhóm
 */
export const getCareersByGroup = async (careerGroupId) => {
  const response = await api.get('/master-data/careers', {
    params: { careerGroupId }
  });
  return response.data;
};

/**
 * Lấy danh sách vị trí công việc (Career Position)
 */
export const getCareerPositions = async (careerId) => {
  const response = await api.get('/master-data/career-positions', {
    params: { careerId }
  });
  return response.data;
};

/**
 * Lấy danh sách Cấp bậc công việc (Job Levels) - Có thể lọc theo careerGroup
 */
export const getJobLevels = async (careerGroupId = null) => {
  const params = careerGroupId ? { careerGroupId } : {};
  const response = await api.get('/master-data/job-levels', { params });
  return response.data;
};

/**
 * Lấy danh sách Mức kinh nghiệm
 */
export const getExperienceLevels = async () => {
  const response = await api.get('/master-data/experience-levels');
  return response.data;
};

/**
 * Lấy danh sách Kỹ năng theo Nhóm ngành nghề
 */
export const getSkillsByCareerGroup = async (careerGroupId) => {
  if (!careerGroupId) throw new Error('careerGroupId is required');
  
  const response = await api.get(`/master-data/career-groups/${careerGroupId}/skills`);
  return response.data;
};

export const getJobById = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

// ==================== UTILITY ====================

export const getMyJobs = async (params = {}) => {
  const response = await api.get('/employer/jobs', { params });
  return response.data;
};

export default {
  createJob,
  updateJob,
  submitJobForReview,
  deleteJob,
  getCareerGroups,
  getCareersByGroup,
  getCareerPositions,
  getJobLevels,
  getExperienceLevels,
  getSkillsByCareerGroup,
  getJobById,
  getMyJobs,
};