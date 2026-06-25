import React, { useState, useEffect } from 'react';
import jobService from '../../../services/jobService'; 
import companyLocationService from '../../../services/companyLocationService';
import { useNotification } from '../../../contexts/NotificationContext';
const formatSalaryText = (salaryField) => {
  if (!salaryField) return 'Thỏa thuận';
  if (typeof salaryField === 'object') {
    const { minMillion, maxMillion, currency } = salaryField;
    if (minMillion && maxMillion) return `${minMillion} - ${maxMillion} triệu ${currency || 'VND'}`;
    if (minMillion) return `Từ ${minMillion} triệu ${currency || 'VND'}`;
    if (maxMillion) return `Đến ${maxMillion} triệu ${currency || 'VND'}`;
    return 'Thỏa thuận';
  }
  return salaryField;
};

// Key định danh cho snapshot (locationSnapshotSchema dùng _id: false)
// companyLocation dùng _id, snapshot dùng provinceCode+detailAddress
const getLocationKey = (location) => {
  if (!location) return '';
  if (location._id) return location._id.toString();
  return `${location.provinceCode || ''}_${location.detailAddress || ''}`;
};

const buildFullAddress = (location) => {
  return [
    location.detailAddress || location.addressLine,
    location.wardName || location.ward,
    location.districtName || location.district,
    location.provinceName || location.province
  ]
    .filter(Boolean)
    .join(', ');
};

const buildWorkLocationSnapshot = (location) => {
  const detailAddress = buildFullAddress(location);
  return {
    provinceCode: location?.provinceCode || '',
    provinceName: location?.provinceName || location?.province || '',
    districtCode: location?.districtCode || '',
    districtName: location?.districtName || location?.district || '',
    wardCode: location?.wardCode || '',
    wardName: location?.wardName || location?.ward || '',
    detailAddress: location?.detailAddress || location?.addressLine || detailAddress || ''
  };
};


const JobDetailModal = ({ jobId, onClose, onSuccess }) => {
  const { confirm, success, error, warning } = useNotification();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State quản lý địa điểm đang chọn từ picker phụ trợ
const [companyLocations, setCompanyLocations] = useState([]);
  // --- Các State lưu danh sách Master Data từ API ---
  const [masterData, setMasterData] = useState({
    careerGroups: [],
    careers: [],
    positions: [],
    jobLevels: [],
    experienceLevels: [],
    availableSkills: []
  });

  // State lưu trữ dữ liệu Form trùng khớp với cấu trúc Schema
  const [formData, setFormData] = useState({
    title: '',
    careerGroupId: '',
    careerId: '',
    careerPositionId: '',
    jobLevelId: '',
    experienceLevelId: '',
    skills: [],
    salary: { type: 'range', minMillion: '', maxMillion: '', currency: 'VND' },
    workLocations: [], // Chuyển thành mảng Array lưu trữ các Object Snapshot địa điểm
    saturdayPolicy: 'OFF',
    description: '',
    requirements: '',
    benefits: '',
    workingTime: '',
    applyInstruction: '',
    deadline: '',
    isUrgent: false
  });

  // 1. Khởi tạo ban đầu: Load thông tin Job và các danh sách Master Data không phụ thuộc (Global)
  useEffect(() => {
    const initModalData = async () => {
      
      try {
        
        console.log('🔍 STEP 1: Gọi Promise.all...');
        const [jobRes, groupRes, expRes,locationRes] = await Promise.all([
          jobService.getJobById(jobId),
          jobService.getCareerGroups(),
          jobService.getExperienceLevels(),
            companyLocationService.getMyCompanyLocations()

        ]);
        
console.log('🔍 STEP 2: Parse jobRes. success=', jobRes?.success, 'data type=', typeof jobRes?.data);
let loadedJob = null;
if (jobRes.success) {
  console.log('🔍 STEP 2b: JSON.parse bắt đầu...');
  loadedJob = JSON.parse(JSON.stringify(jobRes.data));
  console.log('🔍 STEP 2c: JSON.parse xong. salary=', loadedJob?.salary, ' workLocations length=', loadedJob?.workLocations?.length);
  setJob(loadedJob);
} else {
  throw new Error("Không thể lấy thông tin chi tiết công việc");
}

        setMasterData(prev => ({
          ...prev,
          careerGroups: groupRes.success ? groupRes.data : [],
          experienceLevels: expRes.success ? expRes.data : []
        }));
console.log('🔍 STEP 3: setCompanyLocations. locationRes type=', typeof locationRes, 'keys=', locationRes ? Object.keys(locationRes) : 'null');
setCompanyLocations(Array.isArray(locationRes?.data) ? locationRes.data : []);
console.log('🔍 STEP 3: xong');
        const getId = (field) => (field && typeof field === 'object' ? field._id : field || '');

        const initGroupId = getId(loadedJob.careerGroupId);
        const initCareerId = getId(loadedJob.careerId);

        console.log('🔍 STEP 4: setFormData bắt đầu...');
        setFormData({
          title: loadedJob.title || '',
          careerGroupId: initGroupId,
          careerId: initCareerId,
          careerPositionId: getId(loadedJob.careerPositionId),
          jobLevelId: getId(loadedJob.jobLevelId),
          experienceLevelId: getId(loadedJob.experienceLevelId),
          skills: Array.isArray(loadedJob.skills) ? loadedJob.skills.map(s => typeof s === 'object' ? s._id : s) : [],
          salary: {
            type: loadedJob.salary?.type || 'range',
            minMillion: loadedJob.salary?.minMillion ?? '',
            maxMillion: loadedJob.salary?.maxMillion ?? '',
            currency: loadedJob.salary?.currency || 'VND'
          },
          // Gán trực tiếp mảng Object từ backend, nếu không tồn tại hoặc lỗi thì đặt mảng rỗng
// JobDetailModal.jsx, dòng 145-149 — SỬA LẠI THÀNH:
workLocations: Array.isArray(loadedJob.workLocations)
  ? loadedJob.workLocations
      .filter(loc => loc != null && typeof loc === 'object')
      .map((location) => ({
        provinceCode: location.provinceCode || '',
        provinceName: location.provinceName || '',
        districtCode: location.districtCode || '',
        districtName: location.districtName || '',
        wardCode: location.wardCode || '',
        wardName: location.wardName || '',
        detailAddress: location.detailAddress || ''
      }))
  : [],          saturdayPolicy: loadedJob.saturdayPolicy || 'OFF',
          description: loadedJob.description || '',
          requirements: loadedJob.requirements || '',
          benefits: loadedJob.benefits || '',
          workingTime: loadedJob.workingTime || '',
          applyInstruction: loadedJob.applyInstruction || '',
          deadline: loadedJob.deadline ? new Date(loadedJob.deadline).toISOString().substring(0, 10) : '',
          isUrgent: loadedJob.isUrgent || false
        });
        console.log('🔍 STEP 4: setFormData xong');

        // 2. Load tiếp các danh sách phụ thuộc dựa vào ID hiện tại của Job
        console.log('🔍 STEP 5: Load master data phụ thuộc. initGroupId=', initGroupId);
        if (initGroupId) {
          const [careerRes, levelRes, skillRes] = await Promise.all([
            jobService.getCareersByGroup(initGroupId),
            jobService.getJobLevels(),
            jobService.getSkillsByCareerGroup(initGroupId)
          ]);
          
          let posData = [];
          if (initCareerId) {
            const posRes = await jobService.getCareerPositions(initCareerId);
            if (posRes.success) posData = posRes.data;
          }

          setMasterData(prev => ({
            ...prev,
            careers: careerRes.success ? careerRes.data : [],
            jobLevels: levelRes.success ? levelRes.data : [],
            availableSkills: skillRes.success ? skillRes.data : [],
            positions: posData
          }));
        }

      } catch (err) {
        console.error('🔴 [DEBUG] LỖI ĐẦY ĐỦ:', err);
        console.error('🔴 [DEBUG] Stack:', err.stack);
        console.error('🔴 [DEBUG] Message:', err.message);
        error('Lỗi khởi tạo dữ liệu: ' + err.message);
        onClose();
      } finally {
        loading && setLoading(false);
      }
    };

    if (jobId) initModalData();
  }, [jobId]);

  // --- Hệ thống xử lý thay đổi phân cấp danh mục ---
  const handleCareerGroupChange = async (groupId) => {
    setFormData(prev => ({
      ...prev,
      careerGroupId: groupId,
      careerId: '',
      careerPositionId: '',
      jobLevelId: '',
      skills: []
    }));

    if (!groupId) {
      setMasterData(prev => ({ ...prev, careers: [], jobLevels: [], positions: [], availableSkills: [] }));
      return;
    }

    try {
      const [careerRes, levelRes, skillRes] = await Promise.all([
        jobService.getCareersByGroup(groupId),
        jobService.getJobLevels(),  // bỏ tham số
        jobService.getSkillsByCareerGroup(groupId)
      ]);

      setMasterData(prev => ({
        ...prev,
        careers: careerRes.success ? careerRes.data : [],
        jobLevels: levelRes.success ? levelRes.data : [],
        availableSkills: skillRes.success ? skillRes.data : [],
        positions: []
      }));
    } catch (err) {
      console.error("Lỗi cập nhật danh mục theo nhóm ngành:", err);
    }
  };

  const handleCareerChange = async (careerId) => {
    setFormData(prev => ({ ...prev, careerId: careerId, careerPositionId: '' }));

    if (!careerId) {
      setMasterData(prev => ({ ...prev, positions: [] }));
      return;
    }

    try {
      const posRes = await jobService.getCareerPositions(careerId);
      setMasterData(prev => ({ ...prev, positions: posRes.success ? posRes.data : [] }));
    } catch (err) {
      console.error("Lỗi cập nhật vị trí chuyên môn:", err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleRemoveLocation = (indexToRemove) => {
  setFormData((prev) => ({
    ...prev,
    workLocations: prev.workLocations.filter((_, index) => index !== indexToRemove)
  }));
};

  const handleSaveChanges = async () => {
  if (formData.workLocations.length === 0) {
    warning('Vui lòng chọn ít nhất một địa điểm làm việc!');
    return;
  }

  const uniqueWorkLocations = Array.from(
    new Map(
      formData.workLocations.map((location) => [
        `${location.provinceCode || ''}_${location.detailAddress || ''}`,
        location
      ])
    ).values()
  );

  try {
    const payload = {
      title: formData.title,
      careerGroupId: formData.careerGroupId || null,
      careerId: formData.careerId || null,
      careerPositionId: formData.careerPositionId || null,
      jobLevelId: formData.jobLevelId || null,
      experienceLevelId: formData.experienceLevelId || null,
      skills: formData.skills,
      salary: formData.salary,
      workLocations: uniqueWorkLocations,
      saturdayPolicy: formData.saturdayPolicy,
      description: formData.description,
      requirements: formData.requirements,
      benefits: formData.benefits,
      workingTime: formData.workingTime,
      applyInstruction: formData.applyInstruction,
      isUrgent: formData.isUrgent,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
    };

    const response = await jobService.updateJob(jobId, payload);

    if (response.success) {
      success('Cập nhật thông tin tin tuyển dụng thành công!');
      onSuccess();
    }
  } catch (err) {
    error('Cập nhật thất bại: ' + (err.response?.data?.message || err.message));
  }
};
  const handleSalaryChange = (subField, value) => {
    setFormData(prev => ({
      ...prev,
      salary: { ...prev.salary, [subField]: value === '' ? '' : Number(value) }
    }));
  };

  const handleToggleSkill = (skillId) => {
    setFormData(prev => {
      const currentSkills = [...prev.skills];
      const index = currentSkills.indexOf(skillId);
      if (index > -1) currentSkills.splice(index, 1);
      else currentSkills.push(skillId);
      return { ...prev, skills: currentSkills };
    });
  };

  // --- Xử lý Thêm/Xóa phần tử địa điểm (Object Snapshot) ---
 const handleToggleCompanyLocation = (location) => {
  const compLocKey = `${location.provinceCode || ''}_${location.detailAddress || location.addressLine || ''}`;
  const exists = formData.workLocations.some(
    (item) => `${item.provinceCode || ''}_${item.detailAddress || ''}` === compLocKey
  );

  if (exists) {
    const removeKey = `${location.provinceCode || ''}_${location.detailAddress || location.addressLine || ''}`;
    setFormData((prev) => ({
      ...prev,
      workLocations: prev.workLocations.filter(
        (item) => `${item.provinceCode || ''}_${item.detailAddress || ''}` !== removeKey
      )
    }));
    return;
  }

  const snapshot = buildWorkLocationSnapshot(location);

  const addKey = `${location.provinceCode || ''}_${location.detailAddress || location.addressLine || ''}`;
  setFormData((prev) => ({
    ...prev,
    workLocations: [
      ...prev.workLocations.filter(
        (item) => `${item.provinceCode || ''}_${item.detailAddress || ''}` !== addKey
      ),
      snapshot
    ]
  }));
};

  const handleSendToReview = async () => {
    confirm('Bạn có chắc muốn gửi duyệt tin này trực tiếp không?', async () => {
      try {
        await jobService.submitJobForReview(jobId);
        success('Đã gửi duyệt tin thành công!');
        onSuccess();
      } catch (err) {
        error('Không thể gửi duyệt: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const handleCloseJob = async () => {
    confirm('Bạn có chắc muốn đóng tin tuyển dụng này? Job sẽ không còn hiển thị công khai.', async () => {
      try {
        await jobService.closeJob(jobId);
        success('Đóng tin tuyển dụng thành công!');
        onSuccess();
      } catch (err) {
        error('Không thể đóng job: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  if (loading) return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl">Đang liên kết dữ liệu danh mục hệ thống...</div>
    </div>
  );

  // --- THAY ĐỔI LOGIC Ở ĐÂY ---
  // Cho phép chỉnh sửa ở cả hai trạng thái DRAFT và PUBLISHED
  const isEditable = job?.status === 'DRAFT' || job?.status === 'PUBLISHED';
  const isDraft = job?.status === 'DRAFT';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chi tiết và Cập nhật tin tuyển dụng</h2>
            <div className="flex gap-2 mt-1 items-center">
              <span className={`text-xs font-semibold inline-block px-2 py-0.5 rounded ${
                job?.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                Trạng thái: {job?.status}
              </span>
              {formData.isUrgent && (
                <span className="text-xs font-semibold inline-block px-2 py-0.5 rounded bg-red-100 text-red-800 animate-pulse">
                  🔥 Tuyển gấp
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
        </div>

        {/* Body Form Chỉnh sửa */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          
          {/* Tiêu đề & Cờ tuyển gấp */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tiêu đề công việc</label>
              <input
                type="text"
                disabled={!isEditable}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary disabled:bg-slate-50"
              />
            </div>
            <div className="flex items-center h-12 pb-1">
              <label className="relative flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  disabled={!isEditable}
                  checked={formData.isUrgent}
                  onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500 disabled:opacity-60"
                />
                Đánh dấu Tuyển gấp
              </label>
            </div>
          </div>

          {/* Cấu trúc Danh mục liên kết động */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phân loại ngành nghề hệ thống</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nhóm ngành tuyển dụng</label>
                <select
                  disabled={!isEditable}
                  value={formData.careerGroupId}
                  onChange={(e) => handleCareerGroupChange(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 p-2.5 bg-white focus:border-primary disabled:bg-slate-100"
                >
                  <option value="">-- Chọn nhóm ngành --</option>
                  {masterData.careerGroups.map(g => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ngành nghề chi tiết</label>
                <select
                  disabled={!isEditable || !formData.careerGroupId}
                  value={formData.careerId}
                  onChange={(e) => handleCareerChange(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 p-2.5 bg-white focus:border-primary disabled:bg-slate-100"
                >
                  <option value="">-- Chọn ngành nghề --</option>
                  {masterData.careers.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Vị trí chuyên môn</label>
                <select
                  disabled={!isEditable || !formData.careerId}
                  value={formData.careerPositionId}
                  onChange={(e) => handleInputChange('careerPositionId', e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 p-2.5 bg-white focus:border-primary disabled:bg-slate-100"
                >
                  <option value="">-- Chọn vị trí --</option>
                  {masterData.positions.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cấp bậc (Yêu cầu chọn Nhóm ngành trước)</label>
                <select
                  disabled={!isEditable }
                  value={formData.jobLevelId}
                  onChange={(e) => handleInputChange('jobLevelId', e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 p-2.5 bg-white focus:border-primary disabled:bg-slate-100"
                >
                  <option value="">-- Chọn cấp bậc --</option>
                  {masterData.jobLevels.map(l => (
                    <option key={l._id} value={l._id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Yêu cầu Kinh nghiệm</label>
                <select
                  disabled={!isEditable}
                  value={formData.experienceLevelId}
                  onChange={(e) => handleInputChange('experienceLevelId', e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 p-2.5 bg-white focus:border-primary disabled:bg-slate-100"
                >
                  <option value="">-- Chọn mức kinh nghiệm --</option>
                  {masterData.experienceLevels.map(e => (
                    <option key={e._id} value={e._id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Box chọn Kỹ năng */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Kỹ năng đính kèm ({formData.skills.length} đã chọn)
              </label>
              {!formData.careerGroupId ? (
                <p className="text-xs text-amber-600 italic">Vui lòng lựa chọn Nhóm ngành nghề phía trên để hiển thị danh sách kỹ năng liên quan.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 bg-white rounded-xl border border-slate-200">
                  {masterData.availableSkills.length === 0 && (
                    <span className="text-xs text-slate-400 italic">Không có kỹ năng nào thuộc nhóm ngành này.</span>
                  )}
                  {masterData.availableSkills.map(skill => {
                    const isSelected = formData.skills.includes(skill._id);
                    return (
                      <button
                        type="button"
                        key={skill._id}
                        disabled={!isEditable}
                        onClick={() => handleToggleSkill(skill._id)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          isSelected 
                            ? 'bg-primary text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        } disabled:opacity-80`}
                      >
                        {skill.name} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cấu hình Mức lương, Hạn nộp & Chính sách làm Thứ 7 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mức lương (triệu VND)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number" placeholder="Tối thiểu" disabled={!isEditable}
                  value={formData.salary?.minMillion ?? ''}
                  onChange={(e) => handleSalaryChange('minMillion', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-slate-50"
                />
                <span className="text-slate-400">—</span>
                <input
                  type="number" placeholder="Tối đa" disabled={!isEditable}
                  value={formData.salary?.maxMillion ?? ''}
                  onChange={(e) => handleSalaryChange('maxMillion', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-slate-50"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Hiển thị: {formatSalaryText(formData.salary)}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hạn nộp hồ sơ</label>
              <input
                type="date" disabled={!isEditable}
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Chính sách Thứ 7</label>
              <select
                disabled={!isEditable}
                value={formData.saturdayPolicy}
                onChange={(e) => handleInputChange('saturdayPolicy', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none bg-white focus:border-primary disabled:bg-slate-50"
              >
                <option value="OFF">Nghỉ Thứ 7 & Chủ Nhật (OFF)</option>
                <option value="FULL">Làm việc cả ngày Thứ 7 (FULL)</option>
                <option value="MORNING">Chỉ làm buổi sáng Thứ 7 (MORNING)</option>
                <option value="ALTERNATE">Làm cách tuần (ALTERNATE)</option>
              </select>
            </div>
          </div>

          {/* CẤU TRÚC MỚI: Tích hợp Bộ chọn địa chỉ phân cấp động */}
         <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
  <div>
    <h3 className="text-sm font-bold text-slate-800">Địa điểm làm việc</h3>
    <p className="text-xs text-slate-500 mt-0.5">
      Chọn địa điểm làm việc từ danh sách chi nhánh đã tạo trong hồ sơ công ty.
    </p>
  </div>

  {isEditable && (
    <div className="space-y-2">
      {companyLocations.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 font-medium">
          Công ty chưa có địa điểm làm việc. Vui lòng thêm địa điểm trong hồ sơ công ty trước.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
         {companyLocations.map((location) => {
  // So sánh: snapshot (không có _id) với companyLocation (có _id)
  // Dùng provinceCode + detailAddress làm khóa so khớp
  const compLocKey = `${location.provinceCode || ''}_${location.detailAddress || location.addressLine || ''}`;
  const selected = formData.workLocations.some(
    (item) => `${item.provinceCode || ''}_${item.detailAddress || ''}` === compLocKey
  );

  const fullAddress = [
    location.detailAddress || location.addressLine,
    location.wardName || location.ward,
    location.districtName || location.district,
    location.provinceName || location.province
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <label
      key={location._id}
      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
        selected
          ? 'border-primary bg-blue-50'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => handleToggleCompanyLocation(location)}
                  className="mt-1"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900">
                      {location.name}
                    </p>
                    {location.isPrimary ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Trụ sở chính
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {fullAddress}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  )}

  <div className="space-y-2 pt-2">
    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
      Danh sách địa điểm đã chọn:
    </label>

    {formData.workLocations.length === 0 ? (
      <p className="text-xs text-slate-400 italic">
        Chưa có địa điểm nào được chọn.
      </p>
    ) : (
      <div className="grid grid-cols-1 gap-2">
        {formData.workLocations.map((loc, index) => (
          <div
key={`${loc.provinceCode || ''}_${loc.detailAddress || ''}_${index}`}            className="flex items-center justify-between bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-sm"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-slate-800">
{loc.detailAddress || [loc.wardName, loc.districtName, loc.provinceName].filter(Boolean).join(', ')}
              </p>
              <p className="text-xs text-slate-400">
                Tỉnh/Thành: {loc.provinceName || 'N/A'} | Quận/Huyện:{' '}
                {loc.districtName || 'N/A'} | Phường/Xã: {loc.wardName || 'N/A'}
              </p>
            </div>

            {isEditable && (
              <button
                type="button"
                onClick={() => handleRemoveLocation(index)}
                className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                Xóa
              </button>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
</div>

          {/* Các trường mô tả chi tiết bằng Text */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Thời gian làm việc chi tiết</label>
            <input
              type="text" placeholder="Ví dụ: 08:00 - 17:30 nghỉ trưa 1 tiếng 30 phút"
              disabled={!isEditable}
              value={formData.workingTime}
              onChange={(e) => handleInputChange('workingTime', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả công việc</label>
            <textarea
              rows="3" disabled={!isEditable}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary disabled:bg-slate-50 text-sm"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Yêu cầu ứng viên</label>
            <textarea
              rows="3" disabled={!isEditable}
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary disabled:bg-slate-50 text-sm"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Quyền lợi được hưởng</label>
            <textarea
              rows="3" disabled={!isEditable}
              value={formData.benefits}
              onChange={(e) => handleInputChange('benefits', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary disabled:bg-slate-50 text-sm"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Hướng dẫn ứng tuyển</label>
            <textarea
              rows="2" disabled={!isEditable}
              value={formData.applyInstruction}
              onChange={(e) => handleInputChange('applyInstruction', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary disabled:bg-slate-50 text-sm"
            ></textarea>
          </div>

        </div>

        {/* Footer điều khiển nút bấm */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Đóng
          </button>
          
          {/* Nút lưu thay đổi khả dụng cho cả DRAFT và PUBLISHED */}
          {isEditable && (
            <button 
              onClick={handleSaveChanges} 
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700"
            >
              Lưu chỉnh sửa
            </button>
          )}

          {/* Nút gửi duyệt CHỈ hiện khi tin ở trạng thái nháp DRAFT */}
          {isDraft && (
            <button 
              onClick={handleSendToReview} 
              className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600"
            >
              Gửi xét duyệt luôn
            </button>
          )}

          {/* Nút đóng job CHỈ hiện khi tin ở trạng thái PUBLISHED */}
          {job?.status === 'PUBLISHED' && (
            <button 
              onClick={handleCloseJob} 
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-700 rounded-xl hover:bg-slate-800"
            >
              Đóng tin tuyển dụng
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default JobDetailModal;