import api from './api';   // Import instance axios đã config

// ==================== JOB MANAGEMENT ====================

/**
 * Tạo job mới (ở trạng thái DRAFT)
 */
export const getPublicJobs = async (params = {}) => {
  try {
    const response = await api.get('/jobs/public', {
      params,
    });

    return response.data;
  } catch (error) {
    console.log('STATUS:', error.response?.status);
    console.log('DATA:', error.response?.data);
    console.log('URL:', error.config?.url);

    throw error;
  }
};

export const getPublicJobDetail = async (jobId) => {
  const response = await api.get(`/jobs/public/${jobId}`);
  return response.data;
};
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
 * Đóng job (chỉ cho phép khi đang là PUBLISHED)
 */
export const closeJob = async (jobId) => {
  const response = await api.post(`/jobs/${jobId}/close`);
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
 * Lấy danh sách Cấp bậc công việc (Job Levels)
 */
export const getJobLevels = async (params = {}) => {
  const response = await api.get('/master-data/job-levels', {  params: { careerGroupId: params.careerGroupId } });
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

export const getAllSkills = async (params = {}) => {
  const response = await api.get('/master-data/skills', { params });
  return response.data;
};

export const getJobById = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

/**
 * Lấy danh sách job public (đã PUBLISHED) - Dùng cho ứng viên/guest tìm việc
 */
export const getJobs = async (params = {}) => {
  const response = await api.get('/jobs', { params });
  return response.data;
};

// ==================== UTILITY ====================

export const getMyJobs = async (params = {}) => {
  const response = await api.get('/employer/jobs', { params });
  return response.data;
};

export const getApplyOptions = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/apply-options`);
  return response.data;
};

export const applyJob = async (jobId, applyData) => {
  const response = await api.post(`/jobs/${jobId}/apply`, applyData);
  return response.data;
};

export const getApplyCvPreview = async (jobId, cvId) => {
  const response = await api.get(`/jobs/${jobId}/apply/cv-preview/${cvId}`);
  return response.data;
};

export const checkDuplicateApplication = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/apply/check`);
  return response.data;
};

export const getMyApplications = async (params = {}) => {
  const response = await api.get('/jobseeker/applications', { params });
  return response.data;
};

export const getApplicationStatus = async (applicationId) => {
  const response = await api.get(`/jobseeker/applications/${applicationId}/status`);
  return response.data;
};


// ==================== ADMIN MASTER DATA MANAGEMENT ====================

// --- 1. Quản lý Nhóm ngành nghề (Career Groups) ---
export const createCareerGroup = async (groupData) => {
  const response = await api.post('/admin/master-data/career-groups', groupData);
  return response.data;
};

export const updateCareerGroup = async (id, groupData) => {
  const response = await api.put(`/admin/master-data/career-groups/${id}`, groupData);
  return response.data;
};

export const deleteCareerGroup = async (id) => {
  const response = await api.delete(`/admin/master-data/career-groups/${id}`);
  return response.data;
};

// --- 2. Quản lý Ngành nghề (Careers) ---
export const createCareer = async (careerData) => {
  const response = await api.post('/admin/master-data/careers', careerData);
  return response.data;
};

export const updateCareer = async (id, careerData) => {
  const response = await api.put(`/admin/master-data/careers/${id}`, careerData);
  return response.data;
};

export const deleteCareer = async (id) => {
  const response = await api.delete(`/admin/master-data/careers/${id}`);
  return response.data;
};

// --- 3. Quản lý Vị trí chuyên môn (Career Positions) ---
export const createCareerPosition = async (positionData) => {
  const response = await api.post('/admin/master-data/career-positions', positionData);
  return response.data;
};

export const updateCareerPosition = async (id, positionData) => {
  const response = await api.put(`/admin/master-data/career-positions/${id}`, positionData);
  return response.data;
};

export const deleteCareerPosition = async (id) => {
  const response = await api.delete(`/admin/master-data/career-positions/${id}`);
  return response.data;
};

// --- 4. Quản lý Cấp bậc công việc (Job Levels) ---
export const createJobLevel = async (levelData) => {
  const response = await api.post('/admin/master-data/job-levels', levelData);
  return response.data;
};

export const updateJobLevel = async (id, levelData) => {
  const response = await api.put(`/admin/master-data/job-levels/${id}`, levelData);
  return response.data;
};

export const deleteJobLevel = async (id) => {
  const response = await api.delete(`/admin/master-data/job-levels/${id}`);
  return response.data;
};

// --- 5. Quản lý Kỹ năng (Skills) ---
export const createSkill = async (skillData) => {
  const response = await api.post('/admin/master-data/skills', skillData);
  return response.data;
};

export const updateSkill = async (id, skillData) => {
  const response = await api.put(`/admin/master-data/skills/${id}`, skillData);
  return response.data;
};

export const deleteSkill = async (id) => {
  const response = await api.delete(`/admin/master-data/skills/${id}`);
  return response.data;
};

// --- 6. Quản lý Mức kinh nghiệm (Experience Levels) ---
export const createExperienceLevel = async (expData) => {
  const response = await api.post('/admin/master-data/experience-levels', expData);
  return response.data;
};

export const updateExperienceLevel = async (id, expData) => {
  const response = await api.put(`/admin/master-data/experience-levels/${id}`, expData);
  return response.data;
};

export const deleteExperienceLevel = async (id) => {
  const response = await api.delete(`/admin/master-data/experience-levels/${id}`);
  return response.data;
};

export default {
  createJob,
  updateJob,
  submitJobForReview,
  closeJob,
  deleteJob,
  getCareerGroups,
  getCareersByGroup,
  getCareerPositions,
  getJobLevels,
  getExperienceLevels,
  getSkillsByCareerGroup,
  getAllSkills,
  getJobById,
  getJobs,
  getMyJobs,
  getPublicJobDetail,
  

  getApplyOptions,
  applyJob,
  getApplyCvPreview,
  checkDuplicateApplication,
  getMyApplications,
  getApplicationStatus,

  createCareerGroup,
  updateCareerGroup,
  deleteCareerGroup,

  // Admin Careers
  createCareer,
  updateCareer,
  deleteCareer,

  // Admin Career Positions
  createCareerPosition,
  updateCareerPosition,
  deleteCareerPosition,

  // Admin Job Levels
  createJobLevel,
  updateJobLevel,
  deleteJobLevel,

  // Admin Skills
  createSkill,
  updateSkill,
  deleteSkill,

  // Admin Experience Levels
  createExperienceLevel,
  updateExperienceLevel,
  deleteExperienceLevel,
};