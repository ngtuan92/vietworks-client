// services/careerGroupService.js
import apiClient from './api';

const careerGroupService = {
  // Lấy danh sách nhóm nghề (có phân trang và filter)
  getCareerGroups: async (params = {}) => {
    try {
      const { page = 1, limit = 10, status, search } = params;
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(status && { status }),
        ...(search && { search })
      });
      
      const response = await apiClient.get(`/career-groups?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách nhóm nghề' };
    }
  },

  // Lấy danh sách nhóm nghề đang hoạt động (cho dropdown)
  getActiveCareerGroups: async () => {
    try {
      const response = await apiClient.get('/career-groups/active');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách nhóm nghề hoạt động' };
    }
  },

  // Lấy chi tiết nhóm nghề theo ID
  getCareerGroupById: async (id) => {
    try {
      const response = await apiClient.get(`/career-groups/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy chi tiết nhóm nghề' };
    }
  },

  // Tạo mới nhóm nghề
  createCareerGroup: async (data) => {
    try {
      const response = await apiClient.post('/career-groups', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi tạo nhóm nghề' };
    }
  },

  // Cập nhật nhóm nghề
  updateCareerGroup: async (id, data) => {
    try {
      const response = await apiClient.put(`/career-groups/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi cập nhật nhóm nghề' };
    }
  },

  // Xóa mềm (chuyển trạng thái thành INACTIVE)
  softDeleteCareerGroup: async (id) => {
    try {
      const response = await apiClient.patch(`/career-groups/${id}/soft-delete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi ẩn nhóm nghề' };
    }
  },

  // Xóa cứng (chỉ cho Admin, kiểm tra ràng buộc)
  hardDeleteCareerGroup: async (id) => {
    try {
      const response = await apiClient.delete(`/career-groups/${id}/hard-delete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi xóa nhóm nghề' };
    }
  },

  // Khôi phục nhóm nghề
  restoreCareerGroup: async (id) => {
    try {
      const response = await apiClient.patch(`/career-groups/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi khôi phục nhóm nghề' };
    }
  },

  // Cập nhật thứ tự hiển thị
  updateOrder: async (orders) => {
    try {
      const response = await apiClient.patch('/career-groups/update-order', { orders });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi cập nhật thứ tự' };
    }
  }
};

export default careerGroupService;