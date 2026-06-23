import api from './api';

// ==================== WALLET DEPOSIT ====================

/**
 * Tạo giao dịch nạp tiền vào ví (trả về QR SePay)
 */
export const createDeposit = async (amount) => {
  const res = await api.post('/employer/wallet/deposit', { amount });
  return res.data;
};

// ==================== BOOST CV / JOB ====================

/**
 * Mua gói Boost CV (jobseeker)
 * @param {string} cvId
 * @param {string} packageId
 * @param {'new'|'upgrade'} action - 'upgrade' để huỷ gói cũ và mua gói mới
 */
export const createBoostCvPayment = async (cvId, packageId, action = 'new') => {
  const res = await api.post(`/jobseeker/cvs/${cvId}/boost/payment`, { packageId, action });
  return res.data;
};

/**
 * Mua gói Premium Job (employer)
 */
export const createBoostJobPayment = async (jobId, packageId, action = 'new') => {
  const res = await api.post(`/employer/jobs/${jobId}/boost/payment`, { packageId, action });
  return res.data;
};

// ==================== POLLING & STATUS ====================

/**
 * Polling fallback: kiểm tra giao dịch đã thanh toán chưa
 */
export const checkSepayPayment = async (orderCode) => {
  const res = await api.get(`/transactions/sepay-check/${orderCode}`);
  return res.data?.data; // { paid: true/false }
};

/**
 * Lấy chi tiết giao dịch theo orderCode (cho trang Payment Success)
 * Trả về: { transaction, package, userServicePackage, target }
 */
export const getTransactionByOrderCode = async (orderCode) => {
  const res = await api.get(`/transactions/by-order-code/${orderCode}`);
  return res.data?.data;
};

// ==================== MY SUBSCRIPTIONS ====================

/**
 * Lấy danh sách gói của user hiện tại
 * @param {'employer'|'jobseeker'} role
 * @param {object} params - { status, targetType, page, limit }
 */
export const getMySubscriptions = async (role, params = {}) => {
  const path = role === 'employer' ? '/employer/my-subscriptions' : '/jobseeker/my-subscriptions';
  const res = await api.get(path, { params });
  return res.data;
};

// ==================== PACKAGES ====================

/**
 * List các gói khả dụng (auto filter theo role qua middleware)
 */
export const getPackages = async (params = {}) => {
  const res = await api.get('/packages', { params });
  return res.data?.data;
};

/**
 * List gói Boost CV cho jobseeker
 */
export const getBoostCvPackages = async () => {
  const res = await api.get('/jobseeker/packages/boost-cv');
  return res.data?.data;
};

// ==================== TRANSACTIONS HISTORY ====================

export const getEmployerTransactions = async (params = {}) => {
  const res = await api.get('/employer/transactions', { params });
  return res.data;
};

export const getJobseekerTransactions = async (params = {}) => {
  const res = await api.get('/jobseeker/transactions', { params });
  return res.data;
};
