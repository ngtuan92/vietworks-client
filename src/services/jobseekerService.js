import api from './api';

// ─── Search History ───────────────────────────────────────
export const getSearchHistory = () =>
  api.get('/jobseeker/search-history').then(r => r.data);

export const addSearchHistory = (keyword) =>
  api.post('/jobseeker/search-history', { keyword }).then(r => r.data);

export const clearSearchHistory = () =>
  api.delete('/jobseeker/search-history').then(r => r.data);

// ─── Job Preferences ──────────────────────────────────────
export const updateJobPreferences = (data) =>
  api.put('/jobseeker/job-preferences', data).then(r => r.data);

// ─── Matched Jobs ─────────────────────────────────────────
export const getMatchedJobs = (params = {}) =>
  api.get('/jobseeker/matched-jobs', { params }).then(r => r.data);

// ─── Saved Jobs ───────────────────────────────────────────
export const getSavedJobs = (params = {}) =>
  api.get('/jobseeker/saved-jobs', { params }).then(r => r.data);

export const saveJob = (jobId) =>
  api.post(`/jobseeker/saved-jobs/${jobId}`).then(r => r.data);

export const unsaveJob = (jobId) =>
  api.delete(`/jobseeker/saved-jobs/${jobId}`).then(r => r.data);

export const getSimilarSavedJobs = (limit = 6) =>
  api.get('/jobseeker/saved-jobs/similar', { params: { limit } }).then(r => r.data);

// ─── Followed Companies ───────────────────────────────────
export const getFollowedCompanies = (params = {}) =>
  api.get('/jobseeker/followed-companies', { params }).then(r => r.data);

export const followCompany = (companyId) =>
  api.post(`/jobseeker/followed-companies/${companyId}`).then(r => r.data);

export const unfollowCompany = (companyId) =>
  api.delete(`/jobseeker/followed-companies/${companyId}`).then(r => r.data);

// ─── Public Companies ─────────────────────────────────────
export const getPublicCompanies = (params = {}) =>
  api.get('/companies', { params }).then(r => r.data);

export const getPublicCompanyDetail = (companyId) =>
  api.get(`/companies/${companyId}`).then(r => r.data);

export const getCompanyOpenJobs = (companyId, params = {}) =>
  api.get(`/companies/${companyId}/jobs`, { params }).then(r => r.data);

// ─── Search Suggestions ───────────────────────────────────
export const getSearchSuggestions = (keyword = '', limit = 10) =>
  api.get('/jobs/search-suggestions', { params: { keyword, limit } }).then(r => r.data);

// ─── Salary Ranges ────────────────────────────────────────
export const getSalaryRanges = () =>
  api.get('/master-data/salary-ranges').then(r => r.data);
