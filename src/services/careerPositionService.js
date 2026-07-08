// services/careerPositionService.js
import apiClient from './api';

const careerPositionService = {
  // Lấy danh sách vị trí (có phân trang và filter)
  getCareerPositions: async (params = {}) => {
    try {
      const { page = 1, limit = 10, careerGroupId, careerId, status, search } = params;
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(careerGroupId && { careerGroupId }),
        ...(careerId && { careerId }),
        ...(status && { status }),
        ...(search && { search })
      });
      
      const response = await apiClient.get(`/career-positions?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách vị trí' };
    }
  },

  // Lấy danh sách vị trí đang hoạt động (cho dropdown)
  getActivePositions: async (params = {}) => {
    try {
      const { careerId, groupId } = params;
      const queryParams = new URLSearchParams({
        ...(careerId && { careerId }),
        ...(groupId && { groupId })
      });
      const response = await apiClient.get(`/career-positions/active?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách vị trí hoạt động' };
    }
  },

  // Lấy danh sách vị trí theo nghề
  getPositionsByCareer: async (careerId) => {
    try {
      const response = await apiClient.get(`/career-positions/career/${careerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách vị trí theo nghề' };
    }
  },

  // Lấy danh sách vị trí theo nhóm nghề
  getPositionsByGroup: async (groupId) => {
    try {
      const response = await apiClient.get(`/career-positions/group/${groupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách vị trí theo nhóm' };
    }
  },

  // Lấy chi tiết vị trí theo ID
  getCareerPositionById: async (id) => {
    try {
      const response = await apiClient.get(`/career-positions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy chi tiết vị trí' };
    }
  },

  // Tạo mới vị trí
  createCareerPosition: async (data) => {
    try {
      const response = await apiClient.post('/career-positions', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi tạo vị trí' };
    }
  },

  // Cập nhật vị trí
  updateCareerPosition: async (id, data) => {
    try {
      const response = await apiClient.put(`/career-positions/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi cập nhật vị trí' };
    }
  },

  // Xóa mềm (chuyển trạng thái thành INACTIVE)
  softDeleteCareerPosition: async (id) => {
    try {
      const response = await apiClient.patch(`/career-positions/${id}/soft-delete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi ẩn vị trí' };
    }
  },

  // Xóa cứng (chỉ cho Admin, kiểm tra ràng buộc)
  hardDeleteCareerPosition: async (id) => {
    try {
      const response = await apiClient.delete(`/career-positions/${id}/hard-delete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi xóa vị trí' };
    }
  },

  // Khôi phục vị trí
  restoreCareerPosition: async (id) => {
    try {
      const response = await apiClient.patch(`/career-positions/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi khôi phục vị trí' };
    }
  },

  // Cập nhật thứ tự hiển thị
  updateOrder: async (orders) => {
    try {
      const response = await apiClient.patch('/career-positions/update-order', { orders });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi cập nhật thứ tự' };
    }
  }
};

export default careerPositionService;