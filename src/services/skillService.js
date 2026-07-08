// services/skillService.js
import apiClient from './api';

const skillService = {
  // Lấy danh sách kỹ năng (có phân trang và filter)
  getSkills: async (params = {}) => {
    try {
      const { page = 1, limit = 10, careerGroupId, status, search } = params;
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(careerGroupId && { careerGroupId }),
        ...(status && { status }),
        ...(search && { search })
      });
      
      const response = await apiClient.get(`/skills?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách kỹ năng' };
    }
  },

  // Lấy danh sách kỹ năng đang hoạt động (cho dropdown)
  getActiveSkills: async (params = {}) => {
    try {
      const { careerGroupId } = params;
      const queryParams = new URLSearchParams({
        ...(careerGroupId && { careerGroupId })
      });
      const response = await apiClient.get(`/skills/active?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách kỹ năng hoạt động' };
    }
  },

  // Lấy danh sách kỹ năng theo nhóm nghề
  getSkillsByCareerGroup: async (groupId) => {
    try {
      const response = await apiClient.get(`/skills/group/${groupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy danh sách kỹ năng theo nhóm' };
    }
  },

  // Lấy chi tiết kỹ năng theo ID
  getSkillById: async (id) => {
    try {
      const response = await apiClient.get(`/skills/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi lấy chi tiết kỹ năng' };
    }
  },

  // Tạo mới kỹ năng
  createSkill: async (data) => {
    try {
      const response = await apiClient.post('/skills', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi tạo kỹ năng' };
    }
  },

  // Cập nhật kỹ năng
  updateSkill: async (id, data) => {
    try {
      const response = await apiClient.put(`/skills/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi cập nhật kỹ năng' };
    }
  },

  // Xóa mềm (chuyển trạng thái thành INACTIVE)
  softDeleteSkill: async (id) => {
    try {
      const response = await apiClient.patch(`/skills/${id}/soft-delete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi ẩn kỹ năng' };
    }
  },

  // Xóa cứng (chỉ cho Admin, kiểm tra ràng buộc)
  hardDeleteSkill: async (id) => {
    try {
      const response = await apiClient.delete(`/skills/${id}/hard-delete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi xóa kỹ năng' };
    }
  },

  // Khôi phục kỹ năng
  restoreSkill: async (id) => {
    try {
      const response = await apiClient.patch(`/skills/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi khôi phục kỹ năng' };
    }
  },

  // Cập nhật nhiều kỹ năng cùng lúc
  bulkUpdateSkills: async (skills) => {
    try {
      const response = await apiClient.patch('/skills/bulk-update', { skills });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Lỗi khi cập nhật kỹ năng' };
    }
  }
};

export default skillService;