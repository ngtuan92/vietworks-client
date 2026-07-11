// services/jobLevelService.js
import apiClient from './api';

const jobLevelService = {
  // Lấy danh sách cấp bậc (có phân trang và filter)
  getJobLevels: async (params = {}) => {
    try {
      const { page = 1, limit = 10, status, search } = params;
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(status && { status }),
        ...(search && { search })
      });
      
      const response = await apiClient.get(`/job-levels?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách cấp bậc' };
    }
  },

  // Lấy danh sách cấp bậc đang hoạt động (cho dropdown)
  getActiveJobLevels: async () => {
    try {
      const response = await apiClient.get('/job-levels/active');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách cấp bậc hoạt động' };
    }
  },

  // Lấy chi tiết cấp bậc theo ID
  getJobLevelById: async (id) => {
    try {
      const response = await apiClient.get(`/job-levels/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy chi tiết cấp bậc' };
    }
  },

  // Tạo mới cấp bậc
  createJobLevel: async (data) => {
    try {
      const response = await apiClient.post('/job-levels', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi tạo cấp bậc' };
    }
  },

  // Cập nhật cấp bậc
  updateJobLevel: async (id, data) => {
    try {
      const response = await apiClient.put(`/job-levels/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi cập nhật cấp bậc' };
    }
  },

  // Xóa mềm (chuyển trạng thái thành INACTIVE)
  softDeleteJobLevel: async (id) => {
    try {
      const response = await apiClient.patch(`/job-levels/${id}/soft-delete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi ẩn cấp bậc' };
    }
  },

  // Xóa cứng (chỉ cho Admin, kiểm tra ràng buộc)
  hardDeleteJobLevel: async (id) => {
    try {
      const response = await apiClient.delete(`/job-levels/${id}/hard-delete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi xóa cấp bậc' };
    }
  },

  // Khôi phục cấp bậc
  restoreJobLevel: async (id) => {
    try {
      const response = await apiClient.patch(`/job-levels/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi khôi phục cấp bậc' };
    }
  },

  // Cập nhật thứ tự hiển thị (batch update)
  updateOrder: async (orders) => {
    try {
      const response = await apiClient.patch('/job-levels/update-order', { orders });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi cập nhật thứ tự' };
    }
  }
};

export default jobLevelService;