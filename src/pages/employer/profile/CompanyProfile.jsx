import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  searchVietMapPlaces,
  getVietMapPlaceDetail
} from '../../../services/vietmapLocationService.js';
import companyLocationService from '../../../services/companyLocationService.js';
import employerCompanyService from '../../../services/employerCompanyService.js';
import uploadService from '../../../services/uploadService.js';
import companyMasterDataService from '../../../services/companyMasterDataService.js';
const TABS = [
  { key: 'general', label: 'Thông tin chung' },
  { key: 'locations', label: 'Địa điểm làm việc' },
  { key: 'description', label: 'Mô tả công ty' },
  { key: 'images', label: 'Hình ảnh công ty' },
  { key: 'legal', label: 'Xác thực pháp lý' },
];

const CompanyProfile = () => {
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
  industryId: '',
  sizeId: '',
  email: '',
  phone: '',
  logo: null,
  cover: null,
  avatarUrl: '',
  coverUrl: '',
});
const [industries, setIndustries] = useState([]);
const [sizes, setSizes] = useState([]);
const [savingCompany, setSavingCompany] = useState(false);
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
    const [companyRes, industriesRes, sizesRes] = await Promise.all([
      employerCompanyService.getMyCompanyProfile(),
      companyMasterDataService.getCompanyIndustries(),
      companyMasterDataService.getCompanySizes(),
    ]);
    

    const company = companyRes.data;
console.log('company profile:', company);
console.log('businessLicenseFile:', company.businessLicenseFile);
    setIndustries(industriesRes.data || []);
    setSizes(sizesRes.data || []);

    setGeneral({
      taxCode: company.taxCode || '',
      companyName: company.name || '',
      website: company.website || '',
      industryId: company.industry?._id || '',
      sizeId: company.size?._id || '',
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

  setLegal((prev) => ({
    ...prev,
    file,
  }));

  if (file) {
    setLegalPreview(URL.createObjectURL(file));
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
      const uploadRes = await uploadService.uploadCompanyImage(legal.file);
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
      industryId: general.industryId,
      sizeId: general.sizeId,
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
    setCoverPreview(res.data.coverUrl || coverUrl || '');

    setLegal((prev) => ({
      ...prev,
      file: null,
      businessLicenseFile: res.data.businessLicenseFile || businessLicenseFile,
    }));
    setLegalPreview((res.data.businessLicenseFile || businessLicenseFile)?.fileUrl || '');

    setBanner({ type: 'success', message: 'Đã cập nhật hồ sơ công ty.' });
    setTimeout(() => setBanner(null), 2500);
  } catch (error) {
    setBanner({
      type: 'error',
      message: error.response?.data?.message || 'Cập nhật hồ sơ công ty thất bại.'
    });
  } finally {
    setSavingCompany(false);
  }
};

  const handleSubmitForApproval = () => {
    setBanner({ type: 'success', message: 'Đã gửi hồ sơ để Admin kiểm duyệt.' });
    setTimeout(() => setBanner(null), 2500);
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

  const removeLocation = (loc) => {
    if (loc.isUsedInPublishedJob) {
      window.alert('Địa điểm đang dùng trong tin đang hiển thị, không thể xóa. Bạn chỉ có thể chỉnh sửa/ẩn.');
      return;
    }
    setLocations((prev) => prev.filter((l) => l.id !== loc.id));
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
          <button onClick={handleSubmitForApproval} className="px-4 py-2 rounded-xl bg-[#003f87] text-white font-semibold hover:bg-[#0b4e9f]">
            Gửi duyệt
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

      <div className="bg-white border border-slate-200 rounded-2xl p-2 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === tab.key ? 'bg-[#003f87] text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' ? (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Thông tin chung</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Field label="Mã số thuế" id="taxCode" value={general.taxCode} onChange={handleGeneralChange} required placeholder="VD: 0312345678" />
            <Field label="Tên công ty" id="companyName" value={general.companyName} onChange={handleGeneralChange} required placeholder="VD: Công ty TNHH ABC" />
            <Field label="Website" id="website" value={general.website} onChange={handleGeneralChange} placeholder="https://company.com" type="url" />
           <Select
  label="Lĩnh vực hoạt động"
  id="industryId"
  value={general.industryId}
  onChange={handleGeneralChange}
  required
  options={industries.map((item) => ({
    value: item._id,
    label: item.name
  }))}
/>
            <Select
  label="Quy mô công ty"
  id="sizeId"
  value={general.sizeId}
  onChange={handleGeneralChange}
  required
  options={sizes.map((item) => ({
    value: item._id,
    label: item.name
  }))}
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
        <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Địa điểm làm việc</h2>
              <p className="text-sm text-slate-600 mt-1">Thêm nhiều chi nhánh để dùng trong tin tuyển dụng.</p>
            </div>
            <button onClick={openCreateLocation} className="px-4 py-2 rounded-xl bg-[#003f87] text-white font-semibold hover:bg-[#0b4e9f]">
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
      loc.district,
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
        <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
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

      {activeTab === 'images' ? (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Hình ảnh công ty</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FileField label="Logo" accept="image/*" onChange={(e) => setImages((p) => ({ ...p, logo: e.target.files?.[0] || null }))} hint="PNG/JPG, vuông" />
            <FileField label="Ảnh bìa" accept="image/*" onChange={(e) => setImages((p) => ({ ...p, cover: e.target.files?.[0] || null }))} hint="Ảnh ngang" />
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">Thư viện ảnh</h3>
                <p className="text-sm text-slate-600">Tối đa 10 ảnh.</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const next = Array.from(e.target.files || []).slice(0, 10);
                  setImages((p) => ({ ...p, gallery: next }));
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {(images.gallery || []).map((file, idx) => (
                <div key={idx} className="h-24 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500">
                  {file.name}
                </div>
              ))}
              {(images.gallery || []).length === 0 ? (
                <div className="text-sm text-slate-500">Chưa có ảnh.</div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === 'legal' ? (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Xác thực pháp lý</h2>
              <p className="text-sm text-slate-600 mt-1">Upload giấy phép để Admin duyệt công ty.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setVerificationStatus('UNVERIFIED')} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold">UNVERIFIED</button>
              <button onClick={() => setVerificationStatus('PENDING')} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold">PENDING</button>
              <button onClick={() => setVerificationStatus('VERIFIED')} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold">VERIFIED</button>
              <button onClick={() => setVerificationStatus('REJECTED')} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold">REJECTED</button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <FileField
              label="File giấy đăng ký doanh nghiệp"
              accept="application/pdf,image/*"
onChange={handleLegalFileChange}              hint="PDF hoặc ảnh"
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
    ) : null}
  </div>
) : legal.businessLicenseFile?.fileUrl ? (
  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <p className="text-sm font-semibold text-slate-800">File đã tải lên</p>
    <a
      href={legal.businessLicenseFile.fileUrl}
      target="_blank"
      rel="noreferrer"
      className="text-sm text-[#003f87] font-semibold hover:underline"
    >
      {legal.businessLicenseFile.fileName || 'Xem giấy đăng ký doanh nghiệp'}
    </a>

    {legal.businessLicenseFile.fileType?.startsWith('image/') ? (
      <img
        src={legal.businessLicenseFile.fileUrl}
        alt="Giấy đăng ký doanh nghiệp"
        className="mt-3 max-h-64 rounded-xl border border-slate-200 object-contain"
      />
    ) : null}
  </div>
) : (
  <p className="mt-3 text-sm text-slate-500">Chưa upload giấy đăng ký doanh nghiệp.</p>
)}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú gửi Admin</label>
              <textarea
                className="w-full min-h-28 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]"
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
  );
};

const Field = ({ label, id, value, onChange, placeholder, required = false, type = 'text' }) => (
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
      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]"
      required={required}
    />
  </div>
);

const Select = ({ label, id, value, onChange, options, required = false }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor={id}>
      {label} {required ? <span className="text-red-600">*</span> : null}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87] bg-white"
      required={required}
    >
      <option value="">Chọn...</option>
      {options.map((opt) => (
        <option key={opt.value || opt} value={opt.value || opt}>
          {opt.label || opt}
        </option>
      ))}
    </select>
  </div>
);

const FileField = ({ label, id, onChange, accept, hint }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label}
    </label>
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{hint || 'Chọn file để upload'}</p>
        <p className="text-xs text-slate-500 mt-1">Chọn file để tải lên.</p>
      </div>
      <input id={id} type="file" accept={accept} onChange={onChange} />
    </div>
  </div>
);

const RichTextEditor = ({ label, value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [fontSize, setFontSize] = useState('3'); // execCommand uses 1-7

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
          <button type="button" onClick={() => apply('formatBlock', 'h2')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold">
            H2
          </button>
          <button type="button" onClick={() => apply('formatBlock', 'h3')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold">
            H3
          </button>
          <button type="button" onClick={() => apply('formatBlock', 'p')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold">
            P
          </button>
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
          className="min-h-40 px-4 py-3 outline-none prose max-w-none"
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
    district: getBoundaryName(boundaries, 1) || detail?.district || item?.district || '',
    ward: getBoundaryName(boundaries, 2) || detail?.ward || item?.ward || '',
    latitude: detail?.lat ?? item?.lat ?? null,
    longitude: detail?.lng ?? item?.lng ?? null,
  };
};

const LocationModal = ({ title, initial, onClose, onSubmit }) => {
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState({
    name: initial?.name || '',
    addressLine: initial?.addressLine || '',
    province: initial?.province || '',
    district: initial?.district || '',
    ward: initial?.ward || '',
    latitude: initial?.latitude || null,
    longitude: initial?.longitude || null,
    isPrimary: Boolean(initial?.isPrimary),
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (keyword.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        setSearching(true);
        const results = await searchVietMapPlaces(keyword);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSelectPlace = async (item) => {
    try {
      const detail = await getVietMapPlaceDetail(item.ref_id);
      const normalized = normalizeVietMapPlace(item, detail);

      setData((prev) => ({
        ...prev,
        ...normalized,
      }));

      setKeyword(detail.display || item.display || normalized.addressLine);
      setSuggestions([]);
    } catch {
      setSuggestions([]);
    }
  };

  const handleChange = (event) => {
    const { id, value, type, checked } = event.target;

    setData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      name: data.name,
      addressLine: data.addressLine,
      province: data.province,
      district: data.district,
      ward: data.ward,
      latitude: data.latitude === '' ? null : Number(data.latitude),
      longitude: data.longitude === '' ? null : Number(data.longitude),
      isPrimary: data.isPrimary,
    };

    try {
      setSaving(true);
      await companyLocationService.createMyCompanyLocation(payload);
      onSubmit?.(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl my-6 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-slate-200">
            <h3 className="font-bold text-slate-900">{title}</h3>
            <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4">
            <Field
              label="Tên địa điểm"
              id="name"
              value={data.name}
              onChange={handleChange}
              required
              placeholder="VD: Chi nhánh Hà Nội"
            />

            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tìm địa chỉ <span className="text-red-600">*</span>
              </label>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Nhập số nhà, đường, phường, thành phố..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]"
              />

              {suggestions.length > 0 ? (
                <div className="absolute z-20 mt-2 w-full max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                  {suggestions.map((item) => (
                    <button
                      key={item.ref_id}
                      type="button"
                      onClick={() => handleSelectPlace(item)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                    >
                      <p className="font-semibold text-sm text-slate-900">
                        {item.name || item.address || item.display}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.display || item.address}
                      </p>
                    </button>
                  ))}
                </div>
              ) : null}

              {searching ? (
                <p className="text-xs text-slate-500 mt-2">Đang tìm địa chỉ...</p>
              ) : null}
            </div>

            <Field label="Địa chỉ chi tiết" id="addressLine" value={data.addressLine} onChange={handleChange} required />
            <Field label="Tỉnh/Thành phố" id="province" value={data.province} onChange={handleChange} required />
            <Field label="Quận/Huyện" id="district" value={data.district} onChange={handleChange} />
            <Field label="Phường/Xã" id="ward" value={data.ward} onChange={handleChange} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Vĩ độ" id="latitude" value={data.latitude || ''} onChange={handleChange} />
              <Field label="Kinh độ" id="longitude" value={data.longitude || ''} onChange={handleChange} />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input id="isPrimary" type="checkbox" checked={data.isPrimary} onChange={handleChange} />
              Đặt làm trụ sở chính
            </label>
          </div>

          <div className="sticky bottom-0 p-5 flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#003f87] text-white font-semibold disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;