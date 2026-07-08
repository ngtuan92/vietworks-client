// services/careerService.js
import apiClient from './api';

const careerService = {
  // Lấy danh sách nghề (có phân trang và filter)
  getCareers: async (params = {}) => {
    try {
      const { page = 1, limit = 10, careerGroupId, status, search } = params;
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(careerGroupId && { careerGroupId }),
        ...(status && { status }),
        ...(search && { search })
      });
      
      const response = await apiClient.get(`/careers?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách nghề' };
    }
  },

  // Lấy danh sách nghề đang hoạt động (cho dropdown)
  getActiveCareers: async (groupId = '') => {
    try {
      const queryParams = groupId ? `?groupId=${groupId}` : '';
      const response = await apiClient.get(`/careers/active${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách nghề hoạt động' };
    }
  },

  // Lấy danh sách nghề theo nhóm
  getCareersByGroup: async (groupId) => {
    try {
      const response = await apiClient.get(`/careers/group/${groupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách nghề theo nhóm' };
    }
  },

  // Lấy chi tiết nghề theo ID
  getCareerById: async (id) => {
    try {
      const response = await apiClient.get(`/careers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy chi tiết nghề' };
    }
  },

  // Tạo mới nghề
  createCareer: async (data) => {
    try {
      const response = await apiClient.post('/careers', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi tạo nghề' };
    }
  },

  // Cập nhật nghề
  updateCareer: async (id, data) => {
    try {
      const response = await apiClient.put(`/careers/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi cập nhật nghề' };
    }
  },

  // Xóa mềm (chuyển trạng thái thành INACTIVE)
  softDeleteCareer: async (id) => {
    try {
      const response = await apiClient.patch(`/careers/${id}/soft-delete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi ẩn nghề' };
    }
  },

  // Xóa cứng (chỉ cho Admin, kiểm tra ràng buộc)
  hardDeleteCareer: async (id) => {
    try {
      const response = await apiClient.delete(`/careers/${id}/hard-delete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi xóa nghề' };
    }
  },

  // Khôi phục nghề
  restoreCareer: async (id) => {
    try {
      const response = await apiClient.patch(`/careers/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi khôi phục nghề' };
    }
  },

  // Cập nhật thứ tự hiển thị
  updateOrder: async (orders) => {
    try {
      const response = await apiClient.patch('/careers/update-order', { orders });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi cập nhật thứ tự' };
    }
  }
};

export default careerService;