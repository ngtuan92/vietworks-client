import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Plus, Edit2, Camera, Upload, Trash2, CheckCircle2, ChevronRight, X, Phone, User as UserIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import InlinePdfViewer from '../../../components/shared/InlinePdfViewer';
import {
  searchVietMapPlaces,
  getVietMapPlaceDetail
} from '../../../services/vietmapLocationService.js';
import companyLocationService from '../../../services/companyLocationService.js';
import employerCompanyService from '../../../services/employerCompanyService.js';
import uploadService from '../../../services/uploadService.js';
import companyMasterDataService from '../../../services/companyMasterDataService.js';
import { useNotification } from '../../../contexts/NotificationContext';
import useAuth from '../../../hooks/useAuth';
import { COMPANY_SIZES } from '../../../constants/masterDataConstants';

const TABS = [
  { key: 'general', label: 'Thông tin chung' },
  { key: 'locations', label: 'Địa điểm làm việc' },
  { key: 'description', label: 'Mô tả công ty' },
  { key: 'legal', label: 'Giấy phép kinh doanh' },
];

const CompanyProfile = () => {
  const { updateUser } = useAuth();
  const { warning } = useNotification();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('general');
  const [verificationStatus, setVerificationStatus] = useState('UNVERIFIED'); // UNVERIFIED | PENDING | VERIFIED | REJECTED
  const [rejectedInfo] = useState({
    reason: 'Ảnh mờ, thông tin không khớp với tên công ty.',
    handledAt: '15/05/2026',
  });
  const [banner, setBanner] = useState(null);
const [legalPreview, setLegalPreview] = useState('');
 const [general, setGeneral] = useState({
  taxCode: '',
  companyName: '',
  website: '',
  industryIds: [],
  size: '',
  email: '',
  phone: '',
  logo: null,
  cover: null,
  avatarUrl: '',
  coverUrl: '',
});
const [industries, setIndustries] = useState([]);

const [savingCompany, setSavingCompany] = useState(false);
const [submittingVerification, setSubmittingVerification] = useState(false);
const [fieldErrors, setFieldErrors] = useState({});
const [logoPreview, setLogoPreview] = useState('');
const [coverPreview, setCoverPreview] = useState('');

  const [locations, setLocations] = useState([]);
const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationModal, setLocationModal] = useState({ open: false, mode: 'create', data: null });

  const [description, setDescription] = useState({
    intro: '',
    mission: '',
    culture: '',
    benefits: '',
  });

  const [images, setImages] = useState({
    logo: null,
    cover: null,
    gallery: [],
  });

 const [legal, setLegal] = useState({
  file: null,
  businessLicenseFile: null,
  noteToAdmin: '',
});

  const statusMeta = useMemo(() => {
    const map = {
      UNVERIFIED: { label: 'Chưa gửi xác thực', color: 'bg-slate-100 text-slate-700' },
      PENDING: { label: 'Đang chờ duyệt', color: 'bg-amber-100 text-amber-800' },
      VERIFIED: { label: 'Đã xác thực', color: 'bg-emerald-100 text-emerald-800' },
      REJECTED: { label: 'Bị từ chối', color: 'bg-red-100 text-red-700' },
    };
    return map[verificationStatus] || map.UNVERIFIED;
  }, [verificationStatus]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && TABS.some((t) => t.key === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);


  const fetchCompanyProfile = async () => {
  try {
    const [companyRes, industriesRes] = await Promise.all([
      employerCompanyService.getMyCompanyProfile(),
      companyMasterDataService.getCompanyIndustries(),
    ]);
    

    const company = companyRes.data;
console.log('company profile:', company);
console.log('businessLicenseFile:', company.businessLicenseFile);
    setIndustries(industriesRes.data || []);

    setGeneral({
      taxCode: company.taxCode || '',
      companyName: company.name || '',
      website: company.website || '',
      industryIds: company.industries?.map(i => i._id || i) || [],
      size: company.size || '',
      email: company.email || '',
      phone: company.phone || '',
      logo: null,
      cover: null,
      avatarUrl: company.avatarUrl || '',
      coverUrl: company.coverUrl || '',
    });

    setLogoPreview(company.avatarUrl || '');
    setCoverPreview(company.coverUrl || '');

    setDescription((prev) => ({
      ...prev,
      intro: company.description || '',
    }));

  setLegal((prev) => ({
  ...prev,
  file: null,
  businessLicenseFile: company.businessLicenseFile || null,
}));

setLegalPreview(company.businessLicenseFile?.fileUrl || '');

    setVerificationStatus(company.verificationStatus || 'UNVERIFIED');
  } catch (error) {
    setBanner({
      type: 'error',
      message: error.response?.data?.message || 'Không thể tải hồ sơ công ty.'
    });
  }
};

const handleLegalFileChange = (event) => {
  const file = event.target.files?.[0] || null;

  const isAllowedLegalFile = (selectedFile) => {
    if (!selectedFile) return false;
    return (
      selectedFile.type.startsWith('image/') ||
      selectedFile.type === 'application/pdf' ||
      selectedFile.type === 'application/octet-stream' ||
      /\.pdf$/i.test(selectedFile.name)
    );
  };

  if (file && !isAllowedLegalFile(file)) {
    setBanner({
      type: 'error',
      message: 'Chỉ hỗ trợ ảnh hoặc file PDF cho giấy tờ pháp lý.'
    });
    event.target.value = '';
    return;
  }

  setLegal((prev) => ({
    ...prev,
    file,
  }));

  if (file && file.type.startsWith('image/')) {
    setLegalPreview(URL.createObjectURL(file));
  } else {
    setLegalPreview('');
  }
};



  const handleGeneralChange = (event) => {
  const { id, value, files } = event.target;

  if (files?.[0]) {
    const file = files[0];

    setGeneral((prev) => ({ ...prev, [id]: file }));

    if (id === 'logo') {
      setLogoPreview(URL.createObjectURL(file));
    }

    if (id === 'cover') {
      setCoverPreview(URL.createObjectURL(file));
    }

    return;
  }

  setGeneral((prev) => ({ ...prev, [id]: value }));
};

 const handleSave = async () => {
  try {
    setSavingCompany(true);

    let avatarUrl = general.avatarUrl;
    let coverUrl = general.coverUrl;
    let businessLicenseFile = legal.businessLicenseFile;

    if (general.logo) {
      const uploadRes = await uploadService.uploadCompanyImage(general.logo);
      avatarUrl = uploadRes.data.fileUrl;
    }

    if (general.cover) {
      const uploadRes = await uploadService.uploadCompanyImage(general.cover);
      coverUrl = uploadRes.data.fileUrl;
    }

    if (legal.file) {
      const uploadRes = await uploadService.uploadLegalDocument(legal.file);
      businessLicenseFile = {
        fileUrl: uploadRes.data.fileUrl,
        fileName: uploadRes.data.fileName,
        fileType: uploadRes.data.fileType,
        fileSize: uploadRes.data.fileSize,
      };
    }

    const res = await employerCompanyService.updateMyCompanyProfile({
      name: general.companyName,
      taxCode: general.taxCode,
      website: general.website || null,
      industryIds: general.industryIds,
      size: general.size,
      email: general.email,
      phone: general.phone,
      avatarUrl,
      coverUrl,
      description: description.intro,
      businessLicenseFile,
    });
    

    setGeneral((prev) => ({
      ...prev,
      logo: null,
      cover: null,
      avatarUrl: res.data.avatarUrl || '',
      coverUrl: res.data.coverUrl || '',
    }));

    setLogoPreview(res.data.avatarUrl || avatarUrl || '');
    updateUser({ avatarUrl: res.data.avatarUrl || avatarUrl || '' });
    setCoverPreview(res.data.coverUrl || coverUrl || '');

    setLegal((prev) => ({
      ...prev,
      file: null,
      businessLicenseFile: res.data.businessLicenseFile || businessLicenseFile,
    }));
    setLegalPreview((res.data.businessLicenseFile || businessLicenseFile)?.fileUrl || '');

    if (res.data.verificationStatus) {
      setVerificationStatus(res.data.verificationStatus);
    }

    setBanner({ type: 'success', message: res.message || 'Đã cập nhật hồ sơ công ty.' });
    setTimeout(() => setBanner(null), 3500);
  } catch (error) {
    setBanner({
      type: 'error',
      message: error.response?.data?.message || 'Cập nhật hồ sơ công ty thất bại.'
    });
  } finally {
    setSavingCompany(false);
  }
};

  const handleSubmitForApproval = async () => {
    const errors = {};
    if (!general.taxCode?.trim()) errors.taxCode = 'Vui lòng nhập mã số thuế.';
    if (!general.companyName?.trim()) errors.companyName = 'Vui lòng nhập tên công ty.';
    if (!general.industryIds || general.industryIds.length === 0) {
      errors.industryIds = 'Vui lòng chọn ít nhất 1 lĩnh vực hoạt động.';
    }
    if (!legal.businessLicenseFile?.fileUrl && !legal.file && !legalPreview) {
      errors.businessLicenseFile = 'Giấy phép kinh doanh là bắt buộc trước khi gửi xác thực.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setBanner({
        type: 'error',
        message: 'Vui lòng bổ sung đầy đủ thông tin bắt buộc trước khi gửi xác thực.'
      });
      return;
    }

    try {
      setSubmittingVerification(true);
      setFieldErrors({});

      const res = await employerCompanyService.submitMyCompanyForVerification();

      setVerificationStatus(res.data?.verificationStatus || 'PENDING');

      setBanner({
        type: 'success',
        message: res.message || 'Đã gửi hồ sơ để Admin kiểm duyệt.'
      });

      setTimeout(() => setBanner(null), 2500);
    } catch (error) {
      const respData = error.response?.data;
      if (respData?.missingFields) {
        const errMap = {};
        respData.missingFields.forEach(f => {
          if (f.includes('Mã số thuế')) errMap.taxCode = 'Vui lòng nhập mã số thuế.';
          if (f.includes('Tên công ty')) errMap.companyName = 'Vui lòng nhập tên công ty.';
          if (f.includes('Ngành nghề')) errMap.industryIds = 'Vui lòng chọn ít nhất 1 lĩnh vực hoạt động.';

          if (f.includes('Giấy phép')) errMap.businessLicenseFile = 'Giấy phép kinh doanh là bắt buộc trước khi gửi xác thực.';
        });
        setFieldErrors(errMap);
      }
      setBanner({
        type: 'error',
        message: respData?.message || 'Gửi duyệt hồ sơ công ty thất bại.'
      });
    } finally {
      setSubmittingVerification(false);
    }
  };

  const openCreateLocation = () => setLocationModal({ open: true, mode: 'create', data: null });
  const openEditLocation = (loc) => setLocationModal({ open: true, mode: 'edit', data: loc });
  const closeLocationModal = () => setLocationModal({ open: false, mode: 'create', data: null });
const upsertLocation = async () => {
  await fetchCompanyLocations();
  closeLocationModal();

  setBanner({
    type: 'success',
    message: 'Đã cập nhật danh sách địa điểm.'
  });

  setTimeout(() => setBanner(null), 2500);
};

  const removeLocation = async (loc) => {
    if (loc.isUsedInPublishedJob) {
      warning('Địa điểm đang dùng trong tin đang hiển thị, không thể xóa. Bạn chỉ có thể chỉnh sửa/ẩn.');
      return;
    }
    try {
      await companyLocationService.deleteMyCompanyLocation(loc._id);
      await fetchCompanyLocations();
      setBanner({ type: 'success', message: 'Đã xóa địa điểm.' });
      setTimeout(() => setBanner(null), 2500);
    } catch (err) {
      error(err.response?.data?.message || 'Lỗi khi xóa địa điểm.');
    }
  };


  const fetchCompanyLocations = async () => {
  try {
    setLocationsLoading(true);
    const res = await companyLocationService.getMyCompanyLocations();

    if (res.success) {
      setLocations(res.data || []);
    }
  } catch (error) {
    setBanner({
      type: 'error',
      message: error.response?.data?.message || 'Không thể tải danh sách địa điểm.'
    });
  } finally {
    setLocationsLoading(false);
  }
};

useEffect(() => {
  fetchCompanyProfile();
  fetchCompanyLocations();
}, []);


  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ công ty</h1>
          <p className="text-slate-600 mt-1">Cập nhật thông tin doanh nghiệp để hiển thị với ứng viên và gửi Admin kiểm duyệt.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusMeta.color}`}>
            Trạng thái: {statusMeta.label}
          </span>
        <button
  onClick={handleSave}
  disabled={savingCompany}
  className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
>
  {savingCompany ? 'Đang lưu...' : 'Lưu thay đổi'}
</button>
          <button
  onClick={handleSubmitForApproval}
  disabled={submittingVerification || verificationStatus === 'PENDING' || verificationStatus === 'VERIFIED'}
  className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60"
>
  {submittingVerification ? 'Đang gửi...' : 'Gửi duyệt'}
</button>
        </div>
      </header>

      {banner ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-red-50 border-red-100 text-red-700'
          }`}
        >
          {banner.message}
        </div>
      ) : null}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Vertical Sidebar Navigation */}
        <div className="w-full lg:w-64 shrink-0 sticky top-6 bg-white border border-slate-200/60 premium-shadow rounded-2xl p-3 flex flex-col gap-1">
          <h3 className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Thiết lập hồ sơ</h3>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-transparent text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">

      {activeTab === 'general' ? (
        <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-6 space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Thông tin chung</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Field label="Mã số thuế" id="taxCode" value={general.taxCode} onChange={handleGeneralChange} required placeholder="VD: 0312345678" error={fieldErrors.taxCode} />
            <Field label="Tên công ty" id="companyName" value={general.companyName} onChange={handleGeneralChange} required placeholder="VD: Công ty TNHH ABC" error={fieldErrors.companyName} />
            <Field label="Website" id="website" value={general.website} onChange={handleGeneralChange} placeholder="https://company.com" type="url" />
            <MultiSelect
  label="Lĩnh vực hoạt động"
  id="industryIds"
  value={general.industryIds}
  onChange={(val) => setGeneral({ ...general, industryIds: val })}
  required
  options={industries.map((item) => ({
    value: item._id,
    label: item.name
  }))}
  error={fieldErrors.industryIds}
/>
            <DatalistSelect
  label="Quy mô công ty"
  id="size"
  value={general.size || ''}
  onChange={(e) => setGeneral({ ...general, size: e.target.value })}
  required
  options={COMPANY_SIZES}
/>
            <Field label="Email công ty" id="email" value={general.email} onChange={handleGeneralChange} required placeholder="hr@company.com" type="email" />
            <Field label="Số điện thoại công ty" id="phone" value={general.phone} onChange={handleGeneralChange} required placeholder="090xxxxxxx" type="tel" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <div>
    <FileField label="Logo công ty" id="logo" onChange={handleGeneralChange} accept="image/*" hint="PNG/JPG, tỷ lệ vuông" />
    {logoPreview ? (
      <img src={logoPreview} alt="Logo công ty" className="mt-3 h-24 w-24 rounded-xl object-cover border border-slate-200" />
    ) : null}
  </div>

  <div>
    <FileField label="Ảnh bìa" id="cover" onChange={handleGeneralChange} accept="image/*" hint="Ảnh ngang" />
    {coverPreview ? (
      <img src={coverPreview} alt="Ảnh bìa công ty" className="mt-3 h-32 w-full rounded-xl object-cover border border-slate-200" />
    ) : null}
  </div>
</div>

          <p className="text-sm text-slate-500">Gợi ý: Tên công ty có thể bị khóa sau khi được xác thực.</p>
        </section>
      ) : null}

      {activeTab === 'locations' ? (
        <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Địa điểm làm việc</h2>
              <p className="text-sm text-slate-600 mt-1">Thêm nhiều chi nhánh để dùng trong tin tuyển dụng.</p>
            </div>
            <button onClick={openCreateLocation} className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all">
              Thêm địa điểm
            </button>
          </div>

          <div className="space-y-3">
  {locationsLoading ? (
    <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
      Đang tải danh sách địa điểm...
    </div>
  ) : null}

  {!locationsLoading && locations.length === 0 ? (
    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 bg-slate-50">
      Chưa có địa điểm làm việc nào. Bấm “Thêm địa điểm” để tạo chi nhánh đầu tiên.
    </div>
  ) : null}

  {!locationsLoading && locations.map((loc) => {
    const fullAddress = [
      loc.addressLine,
      loc.ward,
      loc.province
    ]
      .filter(Boolean)
      .join(', ');

    return (
      <div
        key={loc._id}
        className="rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900">
              {loc.name}
            </p>

            {loc.isPrimary ? (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Trụ sở chính
              </span>
            ) : null}

            {loc.status ? (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                {loc.status}
              </span>
            ) : null}
          </div>

          <p className="text-sm text-slate-600 mt-1">
            {fullAddress}
          </p>

          {loc.latitude && loc.longitude ? (
            <p className="text-xs text-slate-400 mt-1">
              Tọa độ: {loc.latitude}, {loc.longitude}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditLocation(loc)}
            className="px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sửa
          </button>
          <button
            onClick={() => removeLocation(loc)}
            className="px-3 py-2 rounded-xl border border-red-200 text-red-700 font-semibold hover:bg-red-50"
          >
            Xóa
          </button>
        </div>
      </div>
    );
  })}
</div>

          {locationModal.open ? (
            <LocationModal
              title={locationModal.mode === 'edit' ? 'Sửa địa điểm' : 'Thêm địa điểm'}
              initial={locationModal.data}
              onClose={closeLocationModal}
              onSubmit={upsertLocation}
            />
          ) : null}
        </section>
      ) : null}

      {activeTab === 'description' ? (
        <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-6 space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Mô tả công ty</h2>

          <RichTextEditor
            label="Giới thiệu"
            value={description.intro}
            onChange={(v) => setDescription((p) => ({ ...p, intro: v }))}
            placeholder="Công ty làm gì?"
          />
          <RichTextEditor
            label="Sứ mệnh / Tầm nhìn / Giá trị"
            value={description.mission}
            onChange={(v) => setDescription((p) => ({ ...p, mission: v }))}
            placeholder="Sứ mệnh, tầm nhìn, giá trị..."
          />
          <RichTextEditor
            label="Môi trường làm việc"
            value={description.culture}
            onChange={(v) => setDescription((p) => ({ ...p, culture: v }))}
            placeholder="Văn hóa, con người..."
          />
          <RichTextEditor
            label="Phúc lợi"
            value={description.benefits}
            onChange={(v) => setDescription((p) => ({ ...p, benefits: v }))}
            placeholder="Lý do ứng viên nên ứng tuyển..."
          />
        </section>
      ) : null}



      {activeTab === 'legal' ? (
        <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Xác thực pháp lý</h2>
              <p className="text-sm text-slate-600 mt-1">Upload giấy phép để Admin duyệt công ty.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <FileField
              label="File giấy đăng ký doanh nghiệp"
              accept=".pdf,application/pdf,image/*"
              onChange={handleLegalFileChange}
              hint="PDF hoặc ảnh"
              error={fieldErrors.businessLicenseFile}
            />
{legal.file ? (
  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <p className="text-sm text-slate-700">
      File mới đã chọn: <span className="font-semibold">{legal.file.name}</span>
    </p>

    {legal.file.type?.startsWith('image/') && legalPreview ? (
      <img
        src={legalPreview}
        alt="Giấy đăng ký doanh nghiệp mới"
        className="mt-3 max-h-64 rounded-xl border border-slate-200 object-contain"
      />
    ) : (legal.file.type === 'application/pdf' || /\.pdf$/i.test(legal.file.name)) && legalPreview ? (
      <InlinePdfViewer
        url={legalPreview}
        className="mt-3 w-full h-[500px] rounded-xl border border-slate-200"
      />
    ) : null}
  </div>
) : legal.businessLicenseFile?.fileUrl ? (
  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-semibold text-slate-800">File đã tải lên</p>
      <a
        href={legal.businessLicenseFile.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-primary font-semibold hover:underline bg-primary/10 px-3 py-1.5 rounded-lg"
      >
        Mở trong tab mới
      </a>
    </div>

    {legal.businessLicenseFile.fileType?.startsWith('image/') || /\.(jpeg|jpg|png|gif)$/i.test(legal.businessLicenseFile.fileUrl) ? (
      <img
        src={legal.businessLicenseFile.fileUrl}
        alt="Giấy đăng ký doanh nghiệp"
        className="max-h-64 rounded-xl border border-slate-200 object-contain"
      />
    ) : legal.businessLicenseFile.fileType === 'application/pdf' || /\.pdf$/i.test(legal.businessLicenseFile.fileUrl || legal.businessLicenseFile.fileName) ? (
      <InlinePdfViewer
        url={legal.businessLicenseFile.fileUrl}
        className="w-full h-[500px] rounded-xl border border-slate-200"
      />
    ) : null}
  </div>
) : (
  <p className="mt-3 text-sm text-slate-500">Chưa upload giấy đăng ký doanh nghiệp.</p>
)}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú gửi Admin</label>
              <textarea
                className="w-full min-h-28 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                value={legal.noteToAdmin}
                onChange={(e) => setLegal((p) => ({ ...p, noteToAdmin: e.target.value }))}
                placeholder="Ghi chú thêm để Admin dễ đối chiếu..."
              />
            </div>

            {verificationStatus === 'REJECTED' ? (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-4">
                <p className="font-semibold text-red-700">Hồ sơ bị từ chối</p>
                <p className="text-sm text-red-700 mt-1">Lý do: {rejectedInfo.reason}</p>
                <p className="text-sm text-red-700 mt-1">Thời gian xử lý: {rejectedInfo.handledAt}</p>
                <button onClick={() => setBanner({ type: 'success', message: 'Đã gửi lại hồ sơ xác thực.' })} className="mt-3 px-4 py-2 rounded-xl bg-red-700 text-white font-semibold">
                  Upload lại
                </button>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, id, value, onChange, placeholder, required = false, type = 'text', error = '' }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor={id}>
      {label} {required ? <span className="text-red-600">*</span> : null}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-xl border px-4 py-3 outline-none transition-colors ${
        error ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 focus:border-primary'
      }`}
      required={required}
    />
    {error && <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{error}</p>}
  </div>
);

const Select = ({ label, id, value, onChange, options, required = false, error = '' }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor={id}>
      {label} {required ? <span className="text-red-600">*</span> : null}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={`w-full rounded-xl border px-4 py-3 outline-none transition-colors bg-white ${
        error ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 focus:border-primary'
      }`}
      required={required}
    >
      <option value="">Chọn...</option>
      {options.map((opt) => (
        <option key={opt.value || opt} value={opt.value || opt}>
          {opt.label || opt}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{error}</p>}
  </div>
);

const DatalistSelect = ({ label, id, value, onChange, options, required = false, placeholder = '', error = '' }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor={id}>
      {label} {required ? <span className="text-red-600">*</span> : null}
    </label>
    <input
      type="text"
      id={id}
      list={`${id}-list`}
      value={value}
      onChange={onChange}
      placeholder={placeholder || 'Chọn hoặc nhập...'}
      className={`w-full rounded-xl border px-4 py-3 outline-none transition-colors bg-white ${
        error ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 focus:border-primary'
      }`}
      required={required}
    />
    <datalist id={`${id}-list`}>
      {options.map((opt) => (
        <option key={opt.value || opt} value={opt.value || opt} />
      ))}
    </datalist>
    {error && <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{error}</p>}
  </div>
);

const MultiSelect = ({ label, value = [], onChange, options, required = false, error = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSelection = (optValue) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };
  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-xl border px-4 py-3 bg-white flex justify-between items-center cursor-pointer min-h-[50px] ${
          error ? 'border-red-500 ring-1 ring-red-500/20' : 'border-slate-200'
        }`}
      >
        <span className="text-slate-700">
          {value.length > 0 ? `Đã chọn ${value.length}` : 'Chọn...'}
        </span>
        <span className="text-slate-500">▼</span>
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{error}</p>}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-2">
            {options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={value.includes(opt.value)} 
                  onChange={() => toggleSelection(opt.value)} 
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const FileField = ({ label, id, onChange, accept, hint, error = '' }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label}
    </label>
    <div className={`relative rounded-2xl border-2 border-dashed bg-slate-50 hover:bg-slate-100 transition-all p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer group ${
      error ? 'border-red-500 bg-red-50/20' : 'border-slate-300 hover:border-primary'
    }`}>
      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
        <span className="material-symbols-outlined text-2xl">cloud_upload</span>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">Kéo thả file vào đây hoặc <span className="text-primary">Chọn file</span></p>
        <p className="text-xs text-slate-500 mt-1">{hint || 'Hỗ trợ PNG, JPG, PDF (Tối đa 5MB)'}</p>
      </div>
      <input id={id} type="file" accept={accept} onChange={onChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
    </div>
    {error && <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{error}</p>}
  </div>
);

const RichTextEditor = ({ label, value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [fontSize, setFontSize] = useState('3');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const apply = (command, commandValue = null) => {
    editorRef.current?.focus();
    try {
      document.execCommand(command, false, commandValue);
    } catch {
      // no-op
    }
    onChange(editorRef.current?.innerHTML || '');
  };

  const handleInput = () => onChange(editorRef.current?.innerHTML || '');

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border-b border-slate-200">
          <button type="button" onClick={() => apply('bold')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold">
            B
          </button>
          <button type="button" onClick={() => apply('italic')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold italic">
            I
          </button>
          <button type="button" onClick={() => apply('underline')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold underline">
            U
          </button>
          <span className="w-px h-6 bg-slate-200 mx-1" />
          <button type="button" onClick={() => apply('insertUnorderedList')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold">
            • List
          </button>
          <button type="button" onClick={() => apply('insertOrderedList')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold">
            1. List
          </button>
          <span className="w-px h-6 bg-slate-200 mx-1" />
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1 cursor-pointer" title="Màu chữ">
            <input type="color" className="w-6 h-6 p-0 border-0 rounded cursor-pointer" onChange={(e) => apply('foreColor', e.target.value)} />
          </label>
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1 cursor-pointer" title="Màu nền chữ">
            <input type="color" className="w-6 h-6 p-0 border-0 rounded cursor-pointer" onChange={(e) => apply('hiliteColor', e.target.value)} />
          </label>
          <span className="w-px h-6 bg-slate-200 mx-1" />
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            Cỡ chữ
            <select
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
              value={fontSize}
              onChange={(e) => {
                setFontSize(e.target.value);
                apply('fontSize', e.target.value);
              }}
            >
              <option value="2">Nhỏ</option>
              <option value="3">Vừa</option>
              <option value="4">Lớn</option>
              <option value="5">Rất lớn</option>
            </select>
          </label>
          <span className="w-px h-6 bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={() => {
              const url = window.prompt('Nhập link (URL):');
              if (!url) return;
              apply('createLink', url);
            }}
            className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold"
          >
            Link
          </button>
          <button type="button" onClick={() => apply('removeFormat')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold">
            Xóa format
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="min-h-40 px-4 py-3 outline-none prose max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:ml-4"
          data-placeholder={placeholder}
          style={{ whiteSpace: 'pre-wrap' }}
          suppressContentEditableWarning
        />
        <div className="px-4 py-2 text-xs text-slate-500 border-t border-slate-200 bg-white">
          {placeholder}
        </div>
      </div>
    </div>
  );
};



const getBoundaryName = (boundaries = [], type) => {
  const item = boundaries.find((boundary) => boundary.type === type);

  if (!item) {
    return '';
  }

  return item.full_name || [item.prefix, item.name].filter(Boolean).join(' ');
};

const normalizeVietMapPlace = (item, detail) => {
  const oldData = detail?.data_old || item?.data_old;
  const oldBoundaries = oldData?.boundaries || [];
  const currentBoundaries = detail?.boundaries || item?.boundaries || [];
  const boundaries = oldBoundaries.length > 0 ? oldBoundaries : currentBoundaries;

  return {
    addressLine: detail?.address || detail?.display || item?.address || item?.display || '',
    province: getBoundaryName(boundaries, 0) || detail?.city || item?.city || '',
    ward: getBoundaryName(boundaries, 2) || detail?.ward || item?.ward || '',
    latitude: detail?.lat ?? item?.lat ?? null,
    longitude: detail?.lng ?? item?.lng ?? null,
  };
};

const LocationModal = ({ title, initial, onClose, onSubmit }) => {
  const { warning, error } = useNotification();
  const [saving, setSaving] = useState(false);
  
  // 1. Danh sách địa lý tải động từ API
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  // 2. Cấu trúc State Form đầy đủ
  const [data, setData] = useState({
    name: initial?.name || '',
    addressLine: initial?.addressLine || '',
    province: initial?.province || '',
    provinceCode: '', 
    ward: initial?.ward || '',
    latitude: initial?.latitude || null,
    longitude: initial?.longitude || null,
    isPrimary: Boolean(initial?.isPrimary),
  });

  // Tải danh sách Tỉnh/Thành khi mở modal
  useEffect(() => {
    companyLocationService.getProvinces()
      .then(res => setProvinces(res || []))
      .catch(console.error);
  }, []);

  // 3. Tự động đổ lại dữ liệu cũ khi Mở Modal để Sửa địa điểm (Nếu có)
  useEffect(() => {
    if (initial && provinces.length > 0) {
      // Tìm Tỉnh cũ
      const foundProv = provinces.find(p => String(p.name).trim() === String(initial.province).trim());
      if (foundProv) {
        const provCode = String(foundProv.code);
        companyLocationService.getCommunes(provCode)
          .then(nextWards => {
            setWards(nextWards || []);
            setData(prev => ({
              ...prev,
              provinceCode: provCode
            }));
          })
          .catch(console.error);
      }
    }
  }, [initial, provinces]);

  // 4. Xử lý khi thay đổi Tỉnh thành
  const handleProvinceChange = (e) => {
    const code = e.target.value;
    const matched = provinces.find((p) => String(p.code) === String(code));

    if (code) {
      companyLocationService.getCommunes(code)
        .then(nextWards => {
          setWards(nextWards || []);
          setData((prev) => ({
            ...prev,
            provinceCode: code ? String(code) : '',
            province: matched ? matched.name : '',
            ward: '', 
          }));
        })
        .catch(console.error);
    } else {
      setWards([]);
      setData((prev) => ({
        ...prev,
        provinceCode: '',
        province: '',
        ward: '',
      }));
    }
  };

  // 6. Xử lý thay đổi các ô nhập liệu thông thường công thức chung
  const handleChange = (event) => {
    const { id, value, type, checked } = event.target;
    setData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  // 7. Xử lý lưu Form lên Database
  const handleSubmit = async () => {
    if (!data.name || !data.province || !data.ward || !data.addressLine) {
      warning('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    const payload = {
      name: data.name,
      addressLine: data.addressLine,
      province: data.province,
      ward: data.ward,     
      latitude: data.latitude === '' || data.latitude === null ? null : Number(data.latitude),
      longitude: data.longitude === '' || data.longitude === null ? null : Number(data.longitude),
      isPrimary: data.isPrimary,
    };

    try {
      setSaving(true);
      if (initial && initial._id) {
        await companyLocationService.updateMyCompanyLocation(initial._id, payload);
      } else {
        await companyLocationService.createMyCompanyLocation(payload);
      }
      onSubmit?.(payload);
    } catch (err) {
      error(err.response?.data?.message || 'Lưu địa điểm thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl my-6 bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all shadow-xl overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-slate-200">
            <h3 className="font-bold text-slate-900">{title}</h3>
            <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
          </div>

          <div className="p-5 space-y-4">
            <Field
              label="Tên địa điểm"
              id="name"
              value={data.name}
              onChange={handleChange}
              required
              placeholder="VD: Chi nhánh chính"
            />

            {/* CẤP 1: TỈNH / THÀNH PHỐ */}
            <Select
              label="Tỉnh/Thành phố"
              id="provinceCode"
              value={data.provinceCode} 
              onChange={handleProvinceChange}
              required
              options={provinces.map((p) => ({ value: String(p.code), label: p.name }))}
            />

            {/* CẤP 2: PHƯỜNG / XÃ */}
            <Select
              label="Phường/Xã"
              id="ward"
              value={data.ward}
              onChange={handleChange}
              required
              options={wards.map((w) => ({ value: w.name, label: w.name }))}
              disabled={!data.provinceCode} 
            />

            <Field 
              label="Địa chỉ chi tiết (Số nhà, tên đường...)" 
              id="addressLine" 
              value={data.addressLine} 
              onChange={handleChange} 
              required 
              placeholder="VD: Số 456 Đường Lê Lợi"
            />

            

            <label className="flex items-center gap-2 text-sm text-slate-700 select-none cursor-pointer">
              <input id="isPrimary" type="checkbox" checked={data.isPrimary} onChange={handleChange} />
              Đặt làm trụ sở chính
            </label>
          </div>

          <div className="sticky bottom-0 p-5 flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700">Hủy</button>
            <button type="button" onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded-xl bg-primary text-white font-semibold disabled:opacity-60">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;