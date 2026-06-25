import api from './api'; // Import instance axios bạn đã cấu hình từ trước
export const companyLocationService = {
    getMyCompanyLocations: async () => {
    const response = await api.get('/employer/company/locations');
    return response.data;
  },
getProvinces: async () => {
    const response = await api.get('/provinces');
    return response.data || []; 
  },

  // 2. Lấy thẳng danh sách Phường/Xã từ mã Tỉnh
  getCommunes: async (provinceCode) => {
    const response = await api.get(`/provinces/${provinceCode}/communes`);
    return response.data || [];
  },
  // --- Các hàm quản lý địa điểm công ty cũ ---
  getMyCompanyLocations: async () => {
    const response = await api.get('/employer/company/locations');
    return response.data;
  },
  createMyCompanyLocation: async ({
    name,
    addressLine,
    province,
    district,
    ward,
    latitude,
    longitude,
    isPrimary
  }) => {
    const response = await api.post('/employer/company/locations', {
      name,
      addressLine,
      province,
      district,
      ward,
      latitude,
      longitude,
      isPrimary
    });

    return response.data;
  },
  updateMyCompanyLocation: async (id, locationData) => {
    const response = await api.put(`/employer/company/locations/${id}`, locationData);
    return response.data;
  },
  deleteMyCompanyLocation: async (id) => {
    const response = await api.delete(`/employer/company/locations/${id}`);
    return response.data;
  }
};





export default companyLocationService;