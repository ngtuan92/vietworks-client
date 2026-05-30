import api from './api'; // Import instance axios bạn đã cấu hình từ trước

const jobAdminService = {
  /**
   * 1. Lấy danh sách công việc đang chờ duyệt (Phân trang + Tìm kiếm)
   * @param {Object} params - Các tham số query bộ lọc
   * @param {number} [params.page=1] - Số trang hiện tại
   * @param {number} [params.limit=10] - Số lượng bản ghi trên một trang
   * @param {string} [params.search=''] - Từ khóa tìm kiếm theo tiêu đề công việc
   * @returns {Promise} Trả về danh sách job chờ duyệt từ backend
   */
  getAllJobsPending: async (params = { page: 1, limit: 10, search: '' }) => {
    try {
      const response = await api.get('/admin/jobs/pending', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * 2. Lấy chi tiết một công việc theo ID
   * @param {string} jobId - ID của công việc cần xem chi tiết
   * @returns {Promise} Dữ liệu chi tiết của công việc
   */
  getJobById: async (jobId) => {
    try {
      const response = await api.get(`/admin/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * 3. Duyệt công việc cho phép hiển thị trên hệ thống
   * @param {string} jobId - ID của công việc cần duyệt
   * @returns {Promise} Kết quả phản hồi từ server
   */
  approveJob: async (jobId, reviewNote) => {
  try {
    const response = await api.patch(`/admin/jobs/${jobId}/approve`, { reviewNote });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
},

rejectJob: async (jobId, rejectedReason, reviewNote) => {
  try {
    const response = await api.patch(`/admin/jobs/${jobId}/reject`, { rejectedReason, reviewNote });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
},

banJob: async (jobId, bannedReason) => {
  try {
    const response = await api.patch(`/admin/jobs/${jobId}/ban`, { bannedReason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
},
};

export default jobAdminService;