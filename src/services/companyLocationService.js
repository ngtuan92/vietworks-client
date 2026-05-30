import api from './api'; // Import instance axios bạn đã cấu hình từ trước
export const companyLocationService = {
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
  }
};

export default companyLocationService;