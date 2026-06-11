import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import adminService from '../../../services/adminService';
import { useNotification } from '../../../contexts/NotificationContext';
import { AvatarCropModal } from '../../../components/jobseeker/cv/builder/AvatarCropModal';
import uploadService from '../../../services/uploadService';

const defaultLayouts = [
  {
    id: 'left-col',
    name: 'Một Cột Trái',
    svg: (
      <svg className="w-full h-20 border border-gray-300 rounded-lg p-2" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left thin sidebar */}
        <rect x="5" y="5" width="25" height="50" rx="2" fill="#e5e7eb" />
        <circle cx="17.5" cy="15" r="5" fill="#9ca3af" />
        <rect x="10" y="26" width="15" height="4" rx="1" fill="#9ca3af" />
        <rect x="10" y="34" width="15" height="4" rx="1" fill="#9ca3af" />

        {/* Right main area */}
        <rect x="35" y="5" width="60" height="12" rx="2" fill="#0056b3" fillOpacity="0.1" />
        <rect x="40" y="9" width="30" height="4" rx="1" fill="#0056b3" />

        <rect x="35" y="22" width="60" height="14" rx="2" fill="#f3f4f6" />
        <rect x="40" y="27" width="45" height="4" rx="1" fill="#9ca3af" />

        <rect x="35" y="41" width="60" height="14" rx="2" fill="#f3f4f6" />
        <rect x="40" y="46" width="45" height="4" rx="1" fill="#9ca3af" />
      </svg>
    )
  },
  {
    id: 'header-left',
    name: 'Tiêu đề chia trái',
    svg: (
      <svg className="w-full h-20 border border-gray-300 rounded-lg p-2" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Top header divided: left brand, right details */}
        <rect x="5" y="5" width="35" height="18" rx="2" fill="#0056b3" fillOpacity="0.1" />
        <circle cx="15" cy="14" r="5" fill="#0056b3" />
        <rect x="23" y="12" width="12" height="4" rx="1" fill="#0056b3" />

        <rect x="45" y="5" width="50" height="18" rx="2" fill="#e5e7eb" />
        <rect x="50" y="9" width="35" height="3" rx="1" fill="#9ca3af" />
        <rect x="50" y="14" width="25" height="3" rx="1" fill="#9ca3af" />

        {/* Content body split into two sections vertically */}
        <rect x="5" y="28" width="90" height="11" rx="2" fill="#f3f4f6" />
        <rect x="10" y="32" width="70" height="3" rx="1" fill="#9ca3af" />

        <rect x="5" y="44" width="90" height="11" rx="2" fill="#f3f4f6" />
        <rect x="10" y="48" width="70" height="3" rx="1" fill="#9ca3af" />
      </svg>
    )
  },
  {
    id: 'two-col-equal',
    name: 'Hai Cột Bằng Nhau',
    svg: (
      <svg className="w-full h-20 border border-gray-300 rounded-lg p-2" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Title area spanning full width */}
        <rect x="5" y="5" width="90" height="10" rx="2" fill="#0056b3" fillOpacity="0.1" />
        <rect x="15" y="8" width="30" height="4" rx="1" fill="#0056b3" />

        {/* Two columns equally divided */}
        <rect x="5" y="20" width="42" height="35" rx="2" fill="#e5e7eb" />
        <rect x="10" y="26" width="32" height="4" rx="1" fill="#9ca3af" />
        <rect x="10" y="34" width="24" height="4" rx="1" fill="#9ca3af" />
        <rect x="10" y="42" width="28" height="4" rx="1" fill="#9ca3af" />

        <rect x="53" y="20" width="42" height="35" rx="2" fill="#f3f4f6" />
        <rect x="58" y="26" width="32" height="4" rx="1" fill="#9ca3af" />
        <rect x="58" y="34" width="24" height="4" rx="1" fill="#9ca3af" />
        <rect x="58" y="42" width="28" height="4" rx="1" fill="#9ca3af" />
      </svg>
    )
  },
  {
    id: 'full-width',
    name: 'Một Cột Toàn Trang',
    svg: (
      <svg className="w-full h-20 border border-gray-300 rounded-lg p-2" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="5" width="50" height="15" rx="2" fill="#0056b3" fillOpacity="0.1" />
        <circle cx="50" cy="12" r="4" fill="#0056b3" />
        <rect x="5" y="25" width="90" height="8" rx="2" fill="#e5e7eb" />
        <rect x="10" y="28" width="70" height="3" rx="1" fill="#9ca3af" />
        <rect x="5" y="38" width="90" height="8" rx="2" fill="#f3f4f6" />
        <rect x="10" y="41" width="50" height="3" rx="1" fill="#9ca3af" />
        <rect x="5" y="51" width="90" height="8" rx="2" fill="#f3f4f6" />
      </svg>
    )
  },
  {
    id: 'harvard-classic',
    name: 'Harvard Cổ Điển',
    svg: (
      <svg className="w-full h-20 border border-gray-300 rounded-lg p-2" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="4" width="40" height="5" rx="1" fill="#0056b3" />
        <rect x="20" y="11" width="60" height="3" rx="0.5" fill="#9ca3af" />
        <line x1="5" y1="18" x2="95" y2="18" stroke="#0056b3" strokeWidth="1" />
        <rect x="5" y="22" width="20" height="4" rx="1" fill="#0056b3" fillOpacity="0.8" />
        <line x1="5" y1="28" x2="95" y2="28" stroke="#9ca3af" strokeOpacity="0.3" strokeWidth="0.5" />
        <rect x="5" y="31" width="50" height="3" rx="0.5" fill="#9ca3af" />
        <rect x="80" y="31" width="15" height="3" rx="0.5" fill="#9ca3af" />
        <rect x="5" y="38" width="20" height="4" rx="1" fill="#0056b3" fillOpacity="0.8" />
        <line x1="5" y1="44" x2="95" y2="44" stroke="#9ca3af" strokeOpacity="0.3" strokeWidth="0.5" />
        <rect x="5" y="47" width="60" height="3" rx="0.5" fill="#9ca3af" />
        <rect x="80" y="47" width="15" height="3" rx="0.5" fill="#9ca3af" />
      </svg>
    )
  },
  {
    id: 'harvard-gsas',
    name: 'Academic Bất Đối Xứng',
    svg: (
      <svg className="w-full h-20 border border-gray-300 rounded-lg p-2" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="4" width="30" height="5" rx="1" fill="#0056b3" />
        <rect x="5" y="11" width="20" height="3" rx="0.5" fill="#9ca3af" />
        <rect x="5" y="20" width="20" height="4" rx="1" fill="#0056b3" fillOpacity="0.8" />
        <rect x="30" y="20" width="45" height="3" rx="0.5" fill="#9ca3af" />
        <rect x="80" y="20" width="15" height="3" rx="0.5" fill="#9ca3af" />
        <rect x="30" y="25" width="65" height="8" rx="1" fill="#f3f4f6" />
        <rect x="5" y="38" width="20" height="4" rx="1" fill="#0056b3" fillOpacity="0.8" />
        <rect x="30" y="38" width="45" height="3" rx="0.5" fill="#9ca3af" />
        <rect x="80" y="38" width="15" height="3" rx="0.5" fill="#9ca3af" />
        <rect x="30" y="43" width="65" height="8" rx="1" fill="#f3f4f6" />
      </svg>
    )
  }
];

const defaultColors = [
  { hex: '#0056b3', name: 'Blue' },
  { hex: '#1e3a8a', name: 'Elegant Navy' },
  { hex: '#1e293b', name: 'Charcoal' },
  { hex: '#15803d', name: 'Forest Green' },
  { hex: '#b45309', name: 'Warm Terracotta' },
  { hex: '#991b1b', name: 'Burgundy' },
  { hex: '#0d9488', name: 'Teal' },
  { hex: '#7c3aed', name: 'Purple' }
];

const initialSections = [
  { id: 'personal_info', name: 'Thông tin cá nhân (Bắt buộc)', required: true },
  { id: 'objective', name: 'Mục tiêu nghề nghiệp', required: false },
  { id: 'experience', name: 'Kinh nghiệm làm việc', required: false },
  { id: 'education', name: 'Học vấn', required: false },
  { id: 'skills', name: 'Kỹ năng chuyên môn', required: false },
  { id: 'projects', name: 'Dự án tham gia', required: false },
  { id: 'certificates', name: 'Chứng chỉ đạt được', required: false },
  { id: 'awards', name: 'Giải thưởng nổi bật', required: false },
  { id: 'activities', name: 'Hoạt động ngoại khóa', required: false },
  { id: 'interests', name: 'Sở thích cá nhân', required: false },
  { id: 'additional_info', name: 'Thông tin thêm', required: false }
];

const fontMapping = {
  'Inter': 'Inter, sans-serif',
  'Roboto': 'Roboto, sans-serif',
  'Outfit': 'Outfit, sans-serif',
  'Montserrat': 'Montserrat, sans-serif',
  'Poppins': 'Poppins, sans-serif',
  'Open Sans': 'Open Sans, sans-serif',
  'Lora': 'Lora, serif',
  'Lato': 'Lato, sans-serif',
  'Playfair Display': 'Playfair Display, serif',
  'Fira Code': 'monospace'
};

const EditableTextMini = ({ tag: Tag = 'div', html, className, style, onChange, placeholder }) => {
  const displayClass = className && (className.includes('block') || className.includes('inline') || className.includes('flex')) ? '' : 'inline-block';
  return (
    <Tag
      className={`outline-none border border-transparent hover:border-dashed hover:border-blue-400 hover:bg-blue-50/10 rounded px-1 transition-all min-h-[1.2em] min-w-[20px] ${displayClass} cursor-text focus:border-solid focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 empty:before:content-[attr(placeholder)] empty:before:text-gray-400/60 relative ${className || ''}`}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.innerHTML)}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      }}
      dangerouslySetInnerHTML={{ __html: html }}
      placeholder={placeholder}
    />
  );
};

const sectionIdToCode = (id) => {
  if (id === 'personal_info') return 'PROFILE';
  return id.toUpperCase();
};

const getDefaultSectionItem = (code) => {
  switch (code) {
    case 'PROFILE':
      return [{ name: 'HỒ TẤN ĐẠT', title: 'SENIOR FULL-STACK DEVELOPER', summary: 'Hơn 5 năm kinh nghiệm thực chiến thiết kế và phát triển các hệ thống Web và phân tán hiệu năng cao. Có thế mạnh về tối ưu hóa cơ sở dữ liệu lớn, triển khai CI/CD và kiến trúc Microservices.' }];
    case 'CONTACT':
      return [{ phone: '0934 888 999', email: 'dat.ho.developer@gmail.com', address: 'Quận 2, TP. Hồ Chí Minh' }];
    case 'OBJECTIVE':
      return [{ summary: 'Khát khao áp dụng năng lực thiết kế hệ thống và tư duy giải quyết vấn đề để xây dựng các giải pháp SaaS đột phá, tối ưu hóa quy trình nghiệp vụ và hướng tới vai trò Technical Architect.' }];
    case 'EDUCATION':
      return [{ school: 'Đại Học Bách Khoa TP.HCM', date: '2017 - 2021', major: 'Khoa học Máy tính', gpa: 'GPA: 3.65 / 4.0 (Xuất sắc)' }];
    case 'EXPERIENCE':
      return [{ company: 'VNG Corporation', date: '2021 - Nay', title: 'Senior Software Engineer', description: 'Chủ trì thiết kế lại cổng thanh toán nội bộ, giảm 65% thời gian phản hồi API. Hướng dẫn và quản lý chất lượng code cho team 5 lập trình viên.' }];
    case 'SKILLS':
      return [{ name: 'React.js' }, { name: 'Node.js' }, { name: 'Go / Golang' }, { name: 'System Design' }, { name: 'Docker / K8s' }, { name: 'AWS Cloud' }];
    case 'PROJECTS':
      return [{ name: 'Hệ thống E-Commerce core', date: '2022 - 2023', role: 'Technical Lead', description: 'Xây dựng kiến trúc microservices chịu tải cao, hỗ trợ hơn 500,000 người dùng hoạt động hàng ngày.' }];
    case 'CERTIFICATES':
      return [{ name: 'AWS Certified Solutions Architect – Associate', date: '2023' }];
    case 'AWARDS':
      return [{ name: 'Giải thưởng Nhân viên Xuất sắc nhất năm', date: '2023' }];
    case 'ACTIVITIES':
      return [{ name: 'Diễn giả tại VietDevConf', date: '2023', description: 'Trình bày chủ đề: "Tối ưu hóa tải và tài nguyên hệ thống cơ sở dữ liệu trong các dự án SaaS".' }];
    case 'INTERESTS':
      return [{ name: 'Đọc sách công nghệ' }, { name: 'Chạy bộ marathon' }, { name: 'Đóng góp Open Source' }];
    case 'ADDITIONAL_INFO':
      return [{ summary: 'Sẵn sàng đi công tác xa và làm việc ngoài giờ khi dự án yêu cầu.' }];
    default:
      return [];
  }
};

const base64ToFile = (base64String, filename = 'avatar.jpg') => {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const CVTemplateForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { success, error, warning } = useNotification();

  const isEditMode = !!id;
  const editingTemplate = location.state;

  // Scaling state for fixed width A4 preview canvas (794px design)
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.5);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [zoomMode, setZoomMode] = useState('auto'); // 'auto' | 'manual'
  const [zoomScale, setZoomScale] = useState(0.5);
  const [mockAvatarUrl, setMockAvatarUrl] = useState(null);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarX, setAvatarX] = useState(0);
  const [avatarY, setAvatarY] = useState(0);

  const [croppingImage, setCroppingImage] = useState(null);

  const handleAvatarClick = () => {
    const uploader = document.getElementById('mockAvatarUploader');
    if (uploader) uploader.click();
  };

  const handleMockAvatarChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn tệp hình ảnh hợp lệ.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhẹ hơn.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCroppingImage(reader.result);
      };
      reader.readAsDataURL(file);
      // Reset input value to allow uploading the same file again if needed
      e.target.value = '';
    }
  };

  const handleCropConfirm = async (croppedBase64) => {
    try {
      const file = base64ToFile(croppedBase64);
      const res = await uploadService.uploadAvatar(file);
      if (res.success && res.data?.fileUrl) {
        setMockAvatarUrl(res.data.fileUrl);
      } else {
        setMockAvatarUrl(croppedBase64);
      }
    } catch (err) {
      console.error('Cloudinary upload error, using base64 fallback:', err);
      setMockAvatarUrl(croppedBase64);
    } finally {
      setAvatarZoom(1);
      setAvatarX(0);
      setAvatarY(0);
      setCroppingImage(null);
    }
  };

  const handleCropDelete = () => {
    setMockAvatarUrl(null);
    setCroppingImage(null);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (zoomMode === 'auto') {
        const width = containerRef.current.offsetWidth;
        const availableWidth = width - 24; // padding & scrollbar buffer
        const computed = availableWidth / 794;
        setScale(Math.min(computed, 1.2)); // Cap at 1.2x
      } else {
        setScale(zoomScale);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    const timer = setTimeout(updateScale, 150);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, [zoomMode, zoomScale, isFocusMode]);

  const handleZoomIn = () => {
    setZoomMode('manual');
    setZoomScale(prev => {
      const currentVal = zoomMode === 'auto' ? scale : prev;
      return Math.min(Math.round((currentVal + 0.1) * 10) / 10, 2.0);
    });
  };

  const handleZoomOut = () => {
    setZoomMode('manual');
    setZoomScale(prev => {
      const currentVal = zoomMode === 'auto' ? scale : prev;
      return Math.max(Math.round((currentVal - 0.1) * 10) / 10, 0.4);
    });
  };

  const handleZoomFit = () => {
    setZoomMode('auto');
  };

  // Form states
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [careerGroups, setCareerGroups] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [selectedLayout, setSelectedLayout] = useState('left-col');
  const [defaultFont, setDefaultFont] = useState('Inter');
  const [primaryColor, setPrimaryColor] = useState('#0056b3');
  const [fontSize, setFontSize] = useState('medium');
  const [density, setDensity] = useState('normal');
  const [titleStyle, setTitleStyle] = useState('underline');
  const [avatarShape, setAvatarShape] = useState('circle');
  const [checkedSections, setCheckedSections] = useState({
    personal_info: true,
    objective: true,
    experience: true,
    education: true,
    skills: true,
    projects: false,
    certificates: true,
    awards: false,
    activities: false,
    interests: false,
    additional_info: false
  });

  // Custom interactive sections list
  const [sections, setSections] = useState([
    {
      sectionCode: 'PROFILE',
      column: 'left',
      order: 1,
      items: [{ name: 'HỒ TẤN ĐẠT', title: 'SENIOR FULL-STACK DEVELOPER', summary: 'Hơn 5 năm kinh nghiệm thực chiến thiết kế và phát triển các hệ thống Web và phân tán hiệu năng cao. Có thế mạnh về tối ưu hóa cơ sở dữ liệu lớn, triển khai CI/CD và kiến trúc Microservices.' }]
    },
    {
      sectionCode: 'CONTACT',
      column: 'left',
      order: 2,
      items: [{ phone: '0934 888 999', email: 'dat.ho.developer@gmail.com', address: 'Quận 2, TP. Hồ Chí Minh' }]
    },
    {
      sectionCode: 'OBJECTIVE',
      column: 'right',
      order: 3,
      items: [{ summary: 'Khát khao áp dụng năng lực thiết kế hệ thống và tư duy giải quyết vấn đề để xây dựng các giải pháp SaaS đột phá, tối ưu hóa quy trình nghiệp vụ và hướng tới vai trò Technical Architect.' }]
    },
    {
      sectionCode: 'EDUCATION',
      column: 'right',
      order: 4,
      items: [{ school: 'Đại Học Bách Khoa TP.HCM', date: '2017 - 2021', major: 'Khoa học Máy tính', gpa: 'GPA: 3.65 / 4.0' }]
    },
    {
      sectionCode: 'EXPERIENCE',
      column: 'right',
      order: 5,
      items: [
        { company: 'VNG Corporation', date: '2021 - Nay', title: 'Senior Software Engineer', description: 'Chủ trì thiết kế lại cổng thanh toán nội bộ, giảm 65% thời gian phản hồi API. Hướng dẫn team 5 dev.' },
        { company: 'FPT Software', date: '2019 - 2021', title: 'Full-Stack Developer', description: 'Xây dựng dashboard quản trị nội bộ cho dự án ngân hàng số, phục vụ 200k+ users/ngày.' }
      ]
    },
    {
      sectionCode: 'SKILLS',
      column: 'left',
      order: 6,
      items: [{ name: 'React.js' }, { name: 'Node.js' }, { name: 'Go / Golang' }, { name: 'System Design' }, { name: 'Docker / K8s' }, { name: 'AWS Cloud' }]
    },
    {
      sectionCode: 'CERTIFICATES',
      column: 'right',
      order: 7,
      items: [{ name: 'AWS Solutions Architect – Associate', date: '2023' }, { name: 'MongoDB Developer Certification', date: '2022' }]
    }
  ]);

  // Image Upload state
  const [previewImage, setPreviewImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load Career Groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await adminService.getCareerGroups();
        if (res.success) setCareerGroups(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGroups();
  }, []);

  // Fill in form if in Edit Mode
  useEffect(() => {
    if (isEditMode && editingTemplate) {
      setName(editingTemplate.name || '');
      setIndustry(editingTemplate.careerGroupId?._id || editingTemplate.careerGroupId || '');
      setIsActive(editingTemplate.status === 'ACTIVE' || editingTemplate.isActive);

      const matchedLayout = defaultLayouts.find(l => l.id === editingTemplate.templateCode);
      if (matchedLayout) setSelectedLayout(matchedLayout.id);

      setDefaultFont(editingTemplate.layoutConfig?.defaultFontId || editingTemplate.font || 'Inter');
      setPrimaryColor(editingTemplate.layoutConfig?.defaultColorId || editingTemplate.color || '#0056b3');
      setFontSize(editingTemplate.layoutConfig?.fontSize || 'medium');
      setDensity(editingTemplate.layoutConfig?.density || 'normal');
      setTitleStyle(editingTemplate.layoutConfig?.titleStyle || 'underline');
      setAvatarShape(editingTemplate.layoutConfig?.avatarShape || 'circle');
      if (editingTemplate.layoutConfig?.mockAvatarUrl) {
        setMockAvatarUrl(editingTemplate.layoutConfig.mockAvatarUrl);
        setAvatarZoom(editingTemplate.layoutConfig.avatarZoom || 1);
        setAvatarX(editingTemplate.layoutConfig.avatarX || 0);
        setAvatarY(editingTemplate.layoutConfig.avatarY || 0);
      }

      if (editingTemplate.previewImageUrl) {
        setPreviewUrl(editingTemplate.previewImageUrl);
      }

      if (editingTemplate.layoutConfig?.sections && editingTemplate.layoutConfig.sections.length > 0) {
        setSections(editingTemplate.layoutConfig.sections);
        const checked = {
          personal_info: false,
          objective: false,
          experience: false,
          education: false,
          skills: false,
          projects: false,
          certificates: false,
          awards: false,
          activities: false,
          interests: false,
          additional_info: false
        };
        editingTemplate.layoutConfig.sections.forEach(s => {
          if (s.sectionCode === 'PROFILE' || s.sectionCode === 'CONTACT') checked.personal_info = true;
          if (s.sectionCode === 'OBJECTIVE') checked.objective = true;
          if (s.sectionCode === 'EXPERIENCE') checked.experience = true;
          if (s.sectionCode === 'EDUCATION') checked.education = true;
          if (s.sectionCode === 'SKILLS') checked.skills = true;
          if (s.sectionCode === 'PROJECTS') checked.projects = true;
          if (s.sectionCode === 'CERTIFICATES') checked.certificates = true;
          if (s.sectionCode === 'AWARDS') checked.awards = true;
          if (s.sectionCode === 'ACTIVITIES') checked.activities = true;
          if (s.sectionCode === 'INTERESTS') checked.interests = true;
          if (s.sectionCode === 'ADDITIONAL_INFO') checked.additional_info = true;
        });
        setCheckedSections(checked);
      }
    }
  }, [isEditMode, editingTemplate]);

  // Section Checkbox Toggle
  const handleSectionToggle = (sectionId) => {
    const section = initialSections.find(s => s.id === sectionId);
    if (section && section.required) return;

    const isCurrentlyChecked = checkedSections[sectionId];
    setCheckedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));

    if (!isCurrentlyChecked) {
      if (sectionId === 'personal_info') {
        const profileItem = getDefaultSectionItem('PROFILE');
        const contactItem = getDefaultSectionItem('CONTACT');
        setSections(prev => [
          ...prev,
          {
            sectionCode: 'PROFILE',
            column: selectedLayout === 'left-col' ? 'left' : (selectedLayout === 'two-col-equal' ? 'left' : 'full'),
            order: prev.length + 1,
            items: profileItem
          },
          {
            sectionCode: 'CONTACT',
            column: selectedLayout === 'left-col' ? 'left' : (selectedLayout === 'two-col-equal' ? 'left' : 'full'),
            order: prev.length + 2,
            items: contactItem
          }
        ]);
      } else {
        const code = sectionIdToCode(sectionId);
        const defaultItem = getDefaultSectionItem(code);
        setSections(prev => [
          ...prev,
          {
            sectionCode: code,
            column: selectedLayout === 'left-col' ? (['PROFILE', 'CONTACT', 'SKILLS', 'INTERESTS'].includes(code) ? 'left' : 'right') : (selectedLayout === 'two-col-equal' ? (prev.length % 2 === 0 ? 'left' : 'right') : 'full'),
            order: prev.length + 1,
            items: defaultItem
          }
        ]);
      }
    } else {
      if (sectionId === 'personal_info') {
        setSections(prev => prev.filter(s => s.sectionCode !== 'PROFILE' && s.sectionCode !== 'CONTACT'));
      } else {
        const code = sectionIdToCode(sectionId);
        setSections(prev => prev.filter(s => s.sectionCode !== code));
      }
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chỉ tải lên file hình ảnh hợp lệ (PNG, JPG, JPEG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhẹ hơn.');
      return;
    }
    setPreviewImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setPreviewUrl(null);
  };

  // Helper functions to modify items
  const handleUpdateItem = (sectionCode, index, field, value) => {
    setSections(prev => prev.map(s => {
      if (s.sectionCode === sectionCode) {
        const newItems = [...s.items];
        newItems[index] = { ...newItems[index], [field]: value };
        return { ...s, items: newItems };
      }
      return s;
    }));
  };

  const handleUpdateSectionColumn = (sectionCode, col) => {
    setSections(prev => prev.map(s => {
      if (s.sectionCode === sectionCode) {
        return { ...s, column: col };
      }
      return s;
    }));
  };

  const handleAddItem = (sectionCode) => {
    setSections(prev => prev.map(s => {
      if (s.sectionCode === sectionCode) {
        let newItem = {};
        if (s.sectionCode === 'SKILLS' || s.sectionCode === 'INTERESTS') newItem = { name: 'Mục mới' };
        else if (s.sectionCode === 'EXPERIENCE') newItem = { company: 'Tên Công Ty', date: 'Thời gian', title: 'Chức danh', description: 'Mô tả công việc' };
        else if (s.sectionCode === 'EDUCATION') newItem = { school: 'Tên Trường', date: 'Thời gian', major: 'Chuyên ngành', gpa: 'GPA' };
        else if (s.sectionCode === 'PROJECTS') newItem = { name: 'Tên Dự Án', date: 'Thời gian', role: 'Vai trò', description: 'Mô tả dự án' };
        else if (s.sectionCode === 'CERTIFICATES' || s.sectionCode === 'AWARDS') newItem = { name: 'Tên hạng mục', date: 'Thời gian' };
        else if (s.sectionCode === 'ACTIVITIES') newItem = { name: 'Tên hoạt động', date: 'Thời gian', description: 'Mô tả hoạt động' };

        return { ...s, items: [...s.items, newItem] };
      }
      return s;
    }));
  };

  const handleRemoveItem = (sectionCode, index) => {
    setSections(prev => prev.map(s => {
      if (s.sectionCode === sectionCode) {
        return { ...s, items: s.items.filter((_, idx) => idx !== index) };
      }
      return s;
    }));
  };

  const handleMoveSectionUp = (sectionCode) => {
    const targetSection = sections.find(s => s.sectionCode === sectionCode);
    if (!targetSection) return;
    const sameColSections = sections
      .filter(s => s.column === targetSection.column)
      .sort((a, b) => a.order - b.order);

    const idx = sameColSections.findIndex(s => s.sectionCode === sectionCode);
    if (idx <= 0) return;

    const aboveSection = sameColSections[idx - 1];
    const targetOrder = targetSection.order;
    const aboveOrder = aboveSection.order;

    setSections(prev => prev.map(s => {
      if (s.sectionCode === sectionCode) return { ...s, order: aboveOrder };
      if (s.sectionCode === aboveSection.sectionCode) return { ...s, order: targetOrder };
      return s;
    }));
  };

  const handleMoveSectionDown = (sectionCode) => {
    const targetSection = sections.find(s => s.sectionCode === sectionCode);
    if (!targetSection) return;
    const sameColSections = sections
      .filter(s => s.column === targetSection.column)
      .sort((a, b) => a.order - b.order);

    const idx = sameColSections.findIndex(s => s.sectionCode === sectionCode);
    if (idx === -1 || idx === sameColSections.length - 1) return;

    const belowSection = sameColSections[idx + 1];
    const targetOrder = targetSection.order;
    const belowOrder = belowSection.order;

    setSections(prev => prev.map(s => {
      if (s.sectionCode === sectionCode) return { ...s, order: belowOrder };
      if (s.sectionCode === belowSection.sectionCode) return { ...s, order: targetOrder };
      return s;
    }));
  };

  const renderSection = (sec, isCont = false) => {
    const { sectionCode, items } = sec;
    const isObjective = sectionCode === 'OBJECTIVE';
    const isContact = sectionCode === 'CONTACT';
    const isSkills = sectionCode === 'SKILLS';
    const isInterests = sectionCode === 'INTERESTS';
    const isAwards = sectionCode === 'AWARDS';
    const isAdditionalInfo = sectionCode === 'ADDITIONAL_INFO';
    const isInSidebar = sec.column === 'left' && selectedLayout === 'left-col';

    // Map fontSize styles dynamically
    let sizeSec = 'text-[12.5px]';
    let sizeHeader = 'text-[11px]';
    let sizeText = 'text-[10px]';
    let iconSize = 11;

    if (fontSize === 'small') {
      sizeSec = 'text-[10.5px]';
      sizeHeader = 'text-[9px]';
      sizeText = 'text-[8.5px]';
      iconSize = 9;
    } else if (fontSize === 'large') {
      sizeSec = 'text-[14.5px]';
      sizeHeader = 'text-[13px]';
      sizeText = 'text-[12px]';
      iconSize = 13;
    }

    // Map density/spacing styles
    let spacingClass = 'space-y-2';
    let containerPadding = 'py-2 px-5';
    if (density === 'compact') {
      spacingClass = 'space-y-1';
      containerPadding = 'py-1 px-4';
    } else if (density === 'comfortable') {
      spacingClass = 'space-y-3.5';
      containerPadding = 'py-3 px-6';
    }

    const textColor = isInSidebar ? 'text-white/95' : 'text-gray-700';
    const subColor = isInSidebar ? 'text-white/70' : 'text-gray-400';
    const tagBg = isInSidebar ? 'bg-white/10 text-white border-transparent' : 'bg-gray-100 text-gray-800 border-transparent';

    const renderSectionHeader = (title) => {
      if (isCont) return null;
      const isBg = titleStyle === 'accent-bg';
      const isLeftBorder = titleStyle === 'left-border';
      const isUnderline = titleStyle === 'underline';

      let styleObj = {};
      let headerClasses = `uppercase font-bold tracking-[0.12em] mb-1.5 flex items-center justify-between ${sizeSec} `;

      if (isInSidebar) {
        if (isBg) {
          headerClasses += ' bg-white/20 text-white px-2 py-0.5 rounded';
        } else if (isLeftBorder) {
          headerClasses += ' border-l-[2px] border-white/80 pl-2 text-white';
        } else if (isUnderline) {
          headerClasses += ' border-b border-white/30 pb-1 text-white';
        } else {
          headerClasses += ' text-white';
        }
      } else {
        if (isBg) {
          headerClasses += ' text-white px-2 py-0.5 rounded';
          styleObj = { backgroundColor: primaryColor };
        } else if (isLeftBorder) {
          headerClasses += ' border-l-[2px] pl-2';
          styleObj = { color: primaryColor, borderColor: primaryColor };
        } else if (isUnderline) {
          headerClasses += ' border-b pb-1';
          styleObj = { color: primaryColor, borderColor: `${primaryColor}40` };
        } else {
          styleObj = { color: primaryColor };
        }
      }

      return (
        <h4 className={headerClasses} style={styleObj}>
          {title}
        </h4>
      );
    };

    return (
      <div key={sectionCode} className={`group/sec relative border border-transparent hover:border-blue-300/60 hover:bg-blue-50/5 ${containerPadding} rounded-sm transition-all`}>
        {/* Section Hover toolbar */}
        <div className="absolute -top-3 right-0.5 bg-white border border-gray-200 shadow-md rounded px-1.5 py-0.5 hidden group-hover/sec:flex items-center gap-1.5 z-20 scale-[0.8] origin-top-right text-gray-800">
          <div className="flex border-r pr-1.5 items-center gap-1 font-bold text-gray-500">
            <button
              type="button"
              onClick={() => handleMoveSectionUp(sectionCode)}
              className="p-0.5 hover:text-blue-600 hover:bg-gray-100 rounded text-[9px]"
              title="Di chuyển lên"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => handleMoveSectionDown(sectionCode)}
              className="p-0.5 hover:text-blue-600 hover:bg-gray-100 rounded text-[9px]"
              title="Di chuyển xuống"
            >
              ▼
            </button>
          </div>

          {selectedLayout !== 'header-left' && (
            <div className="flex border-r pr-1.5 items-center gap-1">
              <button
                type="button"
                onClick={() => handleUpdateSectionColumn(sectionCode, 'left')}
                className={`px-1 rounded text-[8px] hover:bg-gray-100 ${sec.column === 'left' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-400'}`}
                title="Đặt cột trái"
              >
                Trái
              </button>
              <button
                type="button"
                onClick={() => handleUpdateSectionColumn(sectionCode, 'right')}
                className={`px-1 rounded text-[8px] hover:bg-gray-100 ${sec.column === 'right' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-400'}`}
                title="Đặt cột phải"
              >
                Phải
              </button>
            </div>
          )}
          {!['PROFILE', 'CONTACT', 'OBJECTIVE', 'ADDITIONAL_INFO'].includes(sectionCode) && (
            <button
              type="button"
              onClick={() => handleAddItem(sectionCode)}
              className="text-green-600 hover:text-green-700 font-bold text-[9px] px-1"
            >
              + Thêm
            </button>
          )}
        </div>

        {/* Section Header */}
        {selectedLayout !== 'harvard-gsas' && renderSectionHeader(
          sectionCode === 'CONTACT' ? 'LIÊN HỆ' :
            sectionCode === 'EDUCATION' ? 'HỌC VẤN' :
              sectionCode === 'EXPERIENCE' ? 'KINH NGHIỆM' :
                sectionCode === 'SKILLS' ? 'KỸ NĂNG' :
                  sectionCode === 'OBJECTIVE' ? 'MỤC TIÊU NGHỀ NGHIỆP' :
                    sectionCode === 'PROJECTS' ? 'DỰ ÁN' :
                      sectionCode === 'CERTIFICATES' ? 'CHỨNG CHỈ' :
                        sectionCode === 'AWARDS' ? 'GIẢI THƯỞNG' :
                          sectionCode === 'INTERESTS' ? 'SỞ THÍCH' :
                            sectionCode === 'ACTIVITIES' ? 'HOẠT ĐỘNG' :
                              sectionCode === 'ADDITIONAL_INFO' ? 'THÔNG TIN THÊM' : sectionCode
        )}

        {/* Section Content */}
        <div className={spacingClass}>
          {/* Objective Summary */}
          {isObjective && items[0] && (
            <EditableTextMini
              html={items[0].summary || ''}
              onChange={(val) => handleUpdateItem('OBJECTIVE', 0, 'summary', val)}
              className={`${sizeText} leading-relaxed block font-sans ${textColor}`}
              placeholder="Nhập mục tiêu..."
            />
          )}

          {/* Contact Details */}
          {isContact && items[0] && (
            <div className={`space-y-2 ${sizeText} ${textColor} w-full`}>
              <div className="flex items-start gap-2 w-full">
                <span className="material-symbols-outlined shrink-0 opacity-75 mt-0.5 flex items-center justify-center" style={{ fontSize: `${iconSize}px`, width: `${iconSize}px`, height: `${iconSize}px`, lineHeight: `${iconSize}px` }}>phone</span>
                <EditableTextMini
                  html={items[0].phone || ''}
                  onChange={(val) => handleUpdateItem('CONTACT', 0, 'phone', val)}
                  className="font-medium block font-sans break-words w-full"
                  placeholder="Điện thoại"
                />
              </div>
              <div className="flex items-start gap-2 w-full">
                <span className="material-symbols-outlined shrink-0 opacity-75 mt-0.5 flex items-center justify-center" style={{ fontSize: `${iconSize}px`, width: `${iconSize}px`, height: `${iconSize}px`, lineHeight: `${iconSize}px` }}>mail</span>
                <EditableTextMini
                  html={items[0].email || ''}
                  onChange={(val) => handleUpdateItem('CONTACT', 0, 'email', val)}
                  className="font-medium block font-sans break-all w-full"
                  placeholder="Email"
                />
              </div>
              <div className="flex items-start gap-2 w-full">
                <span className="material-symbols-outlined shrink-0 opacity-75 mt-0.5 flex items-center justify-center" style={{ fontSize: `${iconSize}px`, width: `${iconSize}px`, height: `${iconSize}px`, lineHeight: `${iconSize}px` }}>location_on</span>
                <EditableTextMini
                  html={items[0].address || ''}
                  onChange={(val) => handleUpdateItem('CONTACT', 0, 'address', val)}
                  className="font-medium block font-sans break-words w-full"
                  placeholder="Địa chỉ"
                />
              </div>
            </div>
          )}

          {/* Skills tags list */}
          {(isSkills || isInterests) && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {items.map((it, idx) => {
                if (sec.renderItemRange) {
                  const [start, end] = sec.renderItemRange;
                  if (idx < start || idx >= end) return null;
                }
                return (
                  <div key={idx} className={`group/tag relative px-2.5 py-0.5 rounded-full ${sizeText} flex items-center gap-0.5 ${tagBg} border`}>
                    <EditableTextMini
                      html={it.name || ''}
                      onChange={(val) => handleUpdateItem(sectionCode, idx, 'name', val)}
                      className="block font-sans"
                      placeholder="Tag"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(sectionCode, idx)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover/tag:opacity-100 scale-90 transition-opacity ml-0.5 font-bold"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Experience list */}
          {sectionCode === 'EXPERIENCE' && items.map((it, idx) => {
            if (sec.renderItemRange) {
              const [start, end] = sec.renderItemRange;
              if (idx < start || idx >= end) return null;
            }
            return (
              <div key={idx} className={`group/item relative space-y-0.5 py-0.5 ${ (selectedLayout === 'harvard-classic' || selectedLayout === 'harvard-gsas') ? '' : 'border-l-[1.5px] pl-2' }`} style={{ borderColor: isInSidebar ? 'rgba(255,255,255,0.3)' : `${primaryColor}50` }}>
                <button
                  type="button"
                  onClick={() => handleRemoveItem('EXPERIENCE', idx)}
                  className="absolute top-0 right-0 text-red-500 hover:text-red-700 opacity-0 group-hover/item:opacity-100 text-[9px] font-bold"
                >
                  ×
                </button>
                <div className="flex justify-between items-start gap-1">
                  <EditableTextMini
                    html={it.company || ''}
                    onChange={(val) => handleUpdateItem('EXPERIENCE', idx, 'company', val)}
                    className={`font-bold ${sizeHeader} block font-sans ${textColor}`}
                    placeholder="Công ty"
                  />
                  <EditableTextMini
                    html={it.date || ''}
                    onChange={(val) => handleUpdateItem('EXPERIENCE', idx, 'date', val)}
                    className={`${sizeText} italic font-medium shrink-0 block font-sans ${subColor}`}
                    placeholder="Thời gian"
                  />
                </div>
                <EditableTextMini
                  html={it.title || ''}
                  onChange={(val) => handleUpdateItem('EXPERIENCE', idx, 'title', val)}
                  className={`font-bold ${sizeText} block font-sans ${isInSidebar ? 'text-white/95' : ''}`}
                  style={!isInSidebar ? { color: primaryColor } : {}}
                  placeholder="Vị trí"
                />
                <EditableTextMini
                  html={it.description || ''}
                  onChange={(val) => handleUpdateItem('EXPERIENCE', idx, 'description', val)}
                  className={`${sizeText} leading-normal block font-sans ${textColor}`}
                  placeholder="Mô tả công việc"
                />
              </div>
            );
          })}

          {/* Education list */}
          {sectionCode === 'EDUCATION' && items.map((it, idx) => {
            if (sec.renderItemRange) {
              const [start, end] = sec.renderItemRange;
              if (idx < start || idx >= end) return null;
            }
            return (
              <div key={idx} className="group/item relative space-y-0.5 py-0.5">
                <button
                  type="button"
                  onClick={() => handleRemoveItem('EDUCATION', idx)}
                  className="absolute top-0 right-0 text-red-500 hover:text-red-700 opacity-0 group-hover/item:opacity-100 text-[9px] font-bold"
                >
                  ×
                </button>
                <div className="flex justify-between items-start gap-1">
                  <EditableTextMini
                    html={it.school || ''}
                    onChange={(val) => handleUpdateItem('EDUCATION', idx, 'school', val)}
                    className={`font-bold ${sizeHeader} block font-sans ${textColor}`}
                    placeholder="Trường học"
                  />
                  <EditableTextMini
                    html={it.date || ''}
                    onChange={(val) => handleUpdateItem('EDUCATION', idx, 'date', val)}
                    className={`${sizeText} italic font-medium shrink-0 block font-sans ${subColor}`}
                    placeholder="Thời gian"
                  />
                </div>
                <div className={`flex justify-between items-center gap-2 ${sizeText}`}>
                  <EditableTextMini
                    html={it.major || ''}
                    onChange={(val) => handleUpdateItem('EDUCATION', idx, 'major', val)}
                    className={`font-semibold block font-sans ${textColor}`}
                    placeholder="Ngành"
                  />
                  <EditableTextMini
                    html={it.gpa || ''}
                    onChange={(val) => handleUpdateItem('EDUCATION', idx, 'gpa', val)}
                    className={`block font-sans shrink-0 ${subColor}`}
                    placeholder="GPA"
                  />
                </div>
              </div>
            );
          })}

          {/* Projects list */}
          {sectionCode === 'PROJECTS' && items.map((it, idx) => {
            if (sec.renderItemRange) {
              const [start, end] = sec.renderItemRange;
              if (idx < start || idx >= end) return null;
            }
            return (
              <div key={idx} className={`group/item relative space-y-0.5 py-0.5 ${ (selectedLayout === 'harvard-classic' || selectedLayout === 'harvard-gsas') ? '' : 'border-l-[1.5px] pl-2' }`} style={{ borderColor: isInSidebar ? 'rgba(255,255,255,0.3)' : `${primaryColor}50` }}>
                <button
                  type="button"
                  onClick={() => handleRemoveItem('PROJECTS', idx)}
                  className="absolute top-0 right-0 text-red-500 hover:text-red-700 opacity-0 group-hover/item:opacity-100 text-[9px] font-bold"
                >
                  ×
                </button>
                <div className="flex justify-between items-start gap-1">
                  <EditableTextMini
                    html={it.name || ''}
                    onChange={(val) => handleUpdateItem('PROJECTS', idx, 'name', val)}
                    className={`font-bold ${sizeHeader} block font-sans ${textColor}`}
                    placeholder="Dự án"
                  />
                  <EditableTextMini
                    html={it.date || ''}
                    onChange={(val) => handleUpdateItem('PROJECTS', idx, 'date', val)}
                    className={`${sizeText} italic font-medium shrink-0 block font-sans ${subColor}`}
                    placeholder="Thời gian"
                  />
                </div>
                <EditableTextMini
                  html={it.role || ''}
                  onChange={(val) => handleUpdateItem('PROJECTS', idx, 'role', val)}
                  className={`font-semibold ${sizeText} block font-sans ${isInSidebar ? 'text-white/95' : ''}`}
                  style={!isInSidebar ? { color: primaryColor } : {}}
                  placeholder="Vai trò"
                />
                <EditableTextMini
                  html={it.description || ''}
                  onChange={(val) => handleUpdateItem('PROJECTS', idx, 'description', val)}
                  className={`${sizeText} leading-normal block font-sans ${textColor}`}
                  placeholder="Mô tả dự án"
                />
              </div>
            );
          })}

          {/* Certificates and Awards list */}
          {(sectionCode === 'CERTIFICATES' || isAwards) && items.map((it, idx) => {
            if (sec.renderItemRange) {
              const [start, end] = sec.renderItemRange;
              if (idx < start || idx >= end) return null;
            }
            return (
              <div key={idx} className={`group/item relative flex justify-between items-center ${sizeText} py-0.5`}>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(sectionCode, idx)}
                  className="absolute top-0.5 right-0 text-red-500 hover:text-red-700 opacity-0 group-hover/item:opacity-100 text-[9px] font-bold"
                >
                  ×
                </button>
                <EditableTextMini
                  html={it.name || ''}
                  onChange={(val) => handleUpdateItem(sectionCode, idx, 'name', val)}
                  className={`font-semibold block font-sans ${textColor}`}
                  placeholder="Nội dung"
                />
                <EditableTextMini
                  html={it.date || ''}
                  onChange={(val) => handleUpdateItem(sectionCode, idx, 'date', val)}
                  className={`block font-sans ${subColor}`}
                  placeholder="Thời gian"
                />
              </div>
            );
          })}

          {/* Activities list */}
          {sectionCode === 'ACTIVITIES' && items.map((it, idx) => {
            if (sec.renderItemRange) {
              const [start, end] = sec.renderItemRange;
              if (idx < start || idx >= end) return null;
            }
            return (
              <div key={idx} className="group/item relative space-y-0.5 py-0.5">
                <button
                  type="button"
                  onClick={() => handleRemoveItem('ACTIVITIES', idx)}
                  className="absolute top-0 right-0 text-red-500 hover:text-red-700 opacity-0 group-hover/item:opacity-100 text-[9px] font-bold"
                >
                  ×
                </button>
                <div className="flex justify-between items-start gap-1">
                  <EditableTextMini
                    html={it.name || ''}
                    onChange={(val) => handleUpdateItem('ACTIVITIES', idx, 'name', val)}
                    className={`font-bold ${sizeHeader} block font-sans ${textColor}`}
                    placeholder="Hoạt động"
                  />
                  <EditableTextMini
                    html={it.date || ''}
                    onChange={(val) => handleUpdateItem('ACTIVITIES', idx, 'date', val)}
                    className={`${sizeText} italic font-medium shrink-0 block font-sans ${subColor}`}
                    placeholder="Thời gian"
                  />
                </div>
                <EditableTextMini
                  html={it.description || ''}
                  onChange={(val) => handleUpdateItem('ACTIVITIES', idx, 'description', val)}
                  className={`${sizeText} leading-normal block font-sans ${textColor}`}
                  placeholder="Mô tả hoạt động"
                />
              </div>
            );
          })}

          {/* Additional Info block */}
          {isAdditionalInfo && items[0] && (
            <EditableTextMini
              html={items[0].summary || ''}
              onChange={(val) => handleUpdateItem('ADDITIONAL_INFO', 0, 'summary', val)}
              className={`${sizeText} leading-relaxed block font-sans ${textColor}`}
              placeholder="Nhập thông tin thêm..."
            />
          )}
        </div>
      </div>
    );
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      warning('Vui lòng nhập tên mẫu CV.');
      return;
    }
    if (!industry) {
      warning('Vui lòng chọn ngành nghề.');
      return;
    }

    try {
      const payload = {
        name,
        careerGroupId: industry,
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        templateCode: selectedLayout,
        layoutConfig: {
          columns: selectedLayout === 'two-col-equal' ? 2 : 1,
          defaultFontId: defaultFont,
          defaultColorId: primaryColor,
          fontSize,
          density,
          titleStyle,
          avatarShape,
          mockAvatarUrl,
          avatarZoom,
          avatarX,
          avatarY,
          defaultSectionCodes: Object.keys(checkedSections)
            .filter(k => checkedSections[k])
            .flatMap(k => {
              if (k === 'personal_info') return ['PROFILE', 'CONTACT'];
              return [sectionIdToCode(k)];
            }),
          sections: sections
        }
      };

      let result;
      if (isEditMode) {
        result = await adminService.updateTemplate(id, payload);
      } else {
        result = await adminService.createTemplate(payload);
      }

      if (result.success) {
        if (previewImage) {
          await adminService.uploadTemplatePreview(result.data._id, previewImage);
        }
        success(
          isEditMode ? 'Cập nhật mẫu CV thành công!' : 'Tạo mới mẫu CV thành công!',
          'Thành công',
          () => navigate('/admin/cv-templates')
        );
      }
    } catch (err) {
      console.error(err);
      error('Đã xảy ra lỗi khi lưu mẫu CV.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top sticky action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e7eb] pb-5">
        <div>
          <span className="text-sm font-semibold text-gray-500 flex items-center gap-1.5 cursor-pointer hover:text-[#0056b3] transition-colors" onClick={() => navigate('/admin/cv-templates')}>
            Mẫu CV
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            {isEditMode ? 'Cập nhật Mẫu CV' : 'Tạo mới Mẫu CV'}
          </span>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight mt-1">
            {isEditMode ? `Cập nhật Mẫu CV: ${editingTemplate?.id || ''}` : 'Tạo Mới Mẫu CV'}
          </h1>
          <p className="text-sm text-[#4b5563] mt-1">
            Cấu hình chi tiết giao diện và nội dung mặc định cho mẫu CV mới trên hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/cv-templates')}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#0056b3] hover:bg-[#004085] text-white font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            Lưu Mẫu CV
          </button>
        </div>
      </div>

      {/* Top Grid Row: Basic Info & Static Preview Upload */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${isFocusMode ? 'hidden' : ''}`}>
        {/* Left: Thông tin cơ bản */}
        <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0056b3] text-[22px]">info</span>
            Thông tin cơ bản
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Tên mẫu CV *</label>
              <input
                type="text"
                required
                placeholder="VD: Modern Professional, Creative Minimal..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Ngành nghề phù hợp *</label>
              <select
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none cursor-pointer"
              >
                <option value="">Chọn ngành nghề</option>
                {careerGroups.map(group => (
                  <option key={group._id} value={group._id}>{group.name}</option>
                ))}
              </select>
            </div>

            {/* Status Toggle Switch */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <label className="block text-sm font-bold text-gray-900">Trạng thái hoạt động</label>
                <span className="text-xs text-gray-500 block mt-0.5">Hiển thị mẫu CV này cho ứng viên lựa chọn sử dụng.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-[#0056b3]' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Upload Ảnh Preview Tĩnh */}
        <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0056b3] text-[22px]">image</span>
              Ảnh Preview Thiết Kế (Tĩnh)
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed mt-1">
              Hình ảnh thiết kế chính thức (PNG, JPG) sẽ hiển thị trong thư viện Mẫu CV để người dùng có thể xem trước.
            </p>
          </div>

          {/* Drag & Drop Area styled as A4 */}
          <div className="flex-1 flex items-center justify-center py-2">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{ aspectRatio: '1 / 1.414' }}
              className={`w-40 border-2 border-dashed rounded-lg text-center transition-all relative flex flex-col items-center justify-center bg-white shadow-sm hover:shadow-md ${isDragging
                  ? 'border-[#0056b3] bg-blue-50/20'
                  : previewUrl
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50/30'
                }`}
            >
              {previewUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center relative group p-1.5">
                  <img
                    src={previewUrl}
                    alt="CV template preview"
                    className="w-full h-full rounded object-contain"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md flex items-center justify-center transition-colors"
                      title="Gỡ bỏ ảnh"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 p-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                    <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-800 block leading-tight">Kéo thả ảnh hoặc click</span>
                  </div>
                  <span className="text-[8px] text-gray-400 leading-normal max-w-[100px] block">
                    Hỗ trợ JPG, PNG (Tối đa 5MB)
                  </span>
                </div>
              )}
              <input
                id="previewImageUploader"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={previewUrl ? "hidden" : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"}
              />
            </div>
          </div>

          <div className="text-center">
            {previewUrl && (
              <span className="text-[10px] font-semibold text-gray-500 truncate max-w-full px-2 block">
                {previewImage ? previewImage.name : 'image_preview.png'}
              </span>
            )}
            <label
              htmlFor="previewImageUploader"
              className="text-[11px] font-bold text-[#0056b3] hover:underline cursor-pointer"
            >
              {previewUrl ? 'Thay đổi ảnh khác' : 'Chọn tệp hình ảnh'}
            </label>
          </div>
        </div>
      </div>

      {/* Bottom Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column (Form properties) */}
        <div className={`space-y-6 ${isFocusMode ? 'hidden' : ''}`}>

          {/* Card 2: Cấu hình thiết kế */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0056b3] text-[22px]">palette</span>
              Cấu hình thiết kế
            </h2>

            {/* Layout selector */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">Chọn Layout Cấu Trúc</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {defaultLayouts.map((lay) => (
                  <button
                    key={lay.id}
                    type="button"
                    onClick={() => setSelectedLayout(lay.id)}
                    className={`relative text-left p-3 rounded-xl border-2 transition-all flex flex-col justify-between gap-3 bg-white ${selectedLayout === lay.id
                        ? 'border-[#0056b3] bg-blue-50/10 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {/* SVG Layout */}
                    <div className="w-full text-gray-400 group-hover:text-gray-600 transition-colors">
                      {lay.svg}
                    </div>

                    {/* Radio Button Indicator & Name */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${selectedLayout === lay.id ? 'border-[#0056b3] bg-[#0056b3]' : 'border-gray-300'
                        }`}>
                        {selectedLayout === lay.id && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                      </div>
                      <span className="text-xs font-bold text-gray-800">{lay.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fonts & Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Font Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Font Chữ Mặc Định</label>
                <select
                  value={defaultFont}
                  onChange={(e) => setDefaultFont(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none cursor-pointer"
                >
                  <option value="Inter">Inter (Mặc định)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lora">Lora</option>
                  <option value="Lato">Lato</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Fira Code">Fira Code</option>
                </select>
              </div>

              {/* Theme Colors circles selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Màu Chủ Đạo</label>
                <div className="flex flex-wrap items-center gap-3">
                  {defaultColors.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setPrimaryColor(color.hex)}
                      style={{ backgroundColor: color.hex }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm relative transition-transform hover:scale-105 border ${primaryColor === color.hex ? 'border-gray-900 ring-2 ring-blue-500/40 ring-offset-2' : 'border-transparent'
                        }`}
                      title={color.name}
                    >
                      {primaryColor === color.hex && (
                        <span className="material-symbols-outlined text-white text-[18px]">done</span>
                      )}
                    </button>
                  ))}
                  {/* Custom Color Selector trigger */}
                  <div className="relative">
                    <label
                      htmlFor="customColorPicker"
                      className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 hover:border-gray-500 flex items-center justify-center cursor-pointer transition-colors"
                      title="Chọn màu khác"
                    >
                      <span className="material-symbols-outlined text-gray-500 text-[18px]">add</span>
                    </label>
                    <input
                      id="customColorPicker"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="sr-only"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sizing & Spacing options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t pt-5 border-gray-100">
              {/* Font Size Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Cỡ Chữ Giao Diện</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none cursor-pointer"
                >
                  <option value="small">Nhỏ (Compact Sizing)</option>
                  <option value="medium">Vừa (Standard Sizing)</option>
                  <option value="large">Lớn (Readable Sizing)</option>
                </select>
              </div>

              {/* Density / Gap Padding Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Mật Độ Khoảng Cách</label>
                <select
                  value={density}
                  onChange={(e) => setDensity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none cursor-pointer"
                >
                  <option value="compact">Chặt chẽ (Compact Padding)</option>
                  <option value="normal">Tiêu chuẩn (Normal Padding)</option>
                  <option value="comfortable">Rộng rãi (Comfortable Padding)</option>
                </select>
              </div>
            </div>

            {/* Styling customization options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t pt-5 border-gray-100">
              {/* Section Header Accent style */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Kiểu Tiêu Đề Mục (Section)</label>
                <select
                  value={titleStyle}
                  onChange={(e) => setTitleStyle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none cursor-pointer"
                >
                  <option value="underline">Gạch chân phía dưới (Underline)</option>
                  <option value="accent-bg">Nền màu chủ đề chạy ngang (Accent Banner)</option>
                  <option value="left-border">Viền dọc bên trái (Left Border Accent)</option>
                  <option value="minimal">Tối giản chữ trần (Minimal Plain)</option>
                </select>
              </div>

              {/* Avatar shape customizer */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Hình Dạng Ảnh Đại Diện</label>
                <select
                  value={avatarShape}
                  onChange={(e) => setAvatarShape(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none cursor-pointer"
                >
                  <option value="circle">Hình ảnh tròn (Circular Frame)</option>
                  <option value="square">Hình vuông bo nhẹ (Rounded Corner)</option>
                  <option value="hidden">Ẩn hoàn toàn ảnh đại diện (Hidden Frame)</option>
                </select>
              </div>
            </div>


          </div>

          {/* Card 3: Danh sách Section Mặc định */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0056b3] text-[22px]">dns</span>
                Danh sách Section Mặc định
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Chọn các phần nội dung sẽ được bật sẵn khi người dùng tạo CV theo mẫu này.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {initialSections.map((sec) => (
                <button
                  type="button"
                  key={sec.id}
                  onClick={() => handleSectionToggle(sec.id)}
                  disabled={sec.required}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${sec.required
                      ? 'bg-gray-100/50 border-gray-200 cursor-not-allowed opacity-80'
                      : checkedSections[sec.id]
                        ? 'border-[#0056b3] bg-blue-50/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${checkedSections[sec.id]
                      ? 'bg-[#0056b3] border-[#0056b3] text-white'
                      : 'border-gray-300 bg-white'
                    }`}>
                    {checkedSections[sec.id] && (
                      <span className="material-symbols-outlined text-[14px] font-bold">done</span>
                    )}
                  </div>
                  <span className={`text-sm font-semibold ${sec.required ? 'text-gray-400' : 'text-gray-800'}`}>
                    {sec.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Live Preview Card */}
        <div className={`space-y-6 ${isFocusMode ? 'lg:col-span-2 max-w-5xl mx-auto w-full' : 'lg:sticky lg:top-6 self-start'}`}>

          {/* Card 2: Live Mockup Preview tương tác */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="sm:w-1/2 space-y-1">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0056b3] text-[22px]">visibility</span>
                  Thiết kế nội dung mẫu trực quan
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Click trực tiếp vào văn bản để chỉnh sửa. Di chuột vào mỗi section để thêm/xóa mục hoặc di chuyển cột.
                </p>
              </div>
              
              {/* Zoom & View Controls Toolbar */}
              <div className="sm:w-1/2 flex sm:justify-end">
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200 shrink-0 w-fit">
                  <div className="flex items-center border-r border-gray-200 pr-2 mr-1">
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      className="p-1 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-40 transition-colors flex items-center justify-center"
                      disabled={scale <= 0.4}
                      title="Thu nhỏ"
                    >
                      <span className="material-symbols-outlined text-[18px]">zoom_out</span>
                    </button>
                    
                    <span className="text-xs font-bold text-gray-700 min-w-[48px] text-center select-none">
                      {Math.round(scale * 100)}%
                    </span>
                    
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      className="p-1 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-40 transition-colors flex items-center justify-center"
                      disabled={scale >= 2.0}
                      title="Phóng to"
                    >
                      <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleZoomFit}
                      className={`ml-1 px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                        zoomMode === 'auto'
                          ? 'bg-[#0056b3] text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Tự động vừa khít"
                    >
                      Tự động
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                      isFocusMode
                        ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                    title={isFocusMode ? "Trở lại màn hình thiết lập" : "Phóng to khu vực soạn thảo"}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isFocusMode ? 'fullscreen_exit' : 'open_in_full'}
                    </span>
                    {isFocusMode ? 'Thu nhỏ' : 'Tập trung'}
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable container for A4 Pages */}
            <div
              ref={containerRef}
              style={{
                fontFamily: fontMapping[defaultFont] || 'Inter, sans-serif',
              }}
              className={`w-full flex flex-col gap-6 overflow-auto pr-1 pb-4 scrollbar-thin bg-gray-100 p-4 rounded-lg transition-all ${
                isFocusMode ? 'max-h-[calc(100vh-220px)]' : 'max-h-[780px]'
              }`}
            >
              {(() => {
                const leftSections = sections.filter(s => s.column === 'left' && s.sectionCode !== 'PROFILE');
                const rightSections = sections.filter(s => s.column !== 'left' && s.sectionCode !== 'PROFILE');

                const headerLeftSections = sections.filter(s => s.sectionCode !== 'PROFILE' && s.sectionCode !== 'CONTACT');
                const contactSection = sections.find(s => s.sectionCode === 'CONTACT');
                const profileSection = sections.find(s => s.sectionCode === 'PROFILE');

                // Dynamic height-based split pagination
                const paginateSectionsWithItemRanges = (secs, initialHeight = 0, maxHeight = 960) => {
                  const pages = [];
                  let currentPageSecs = [];
                  let currentHeight = initialHeight;

                  const fontScale = fontSize === 'small' ? 0.85 : fontSize === 'large' ? 1.15 : 1.0;
                  const headerHeight = density === 'compact' ? 26 : density === 'comfortable' ? 44 : 34;
                  const gapBetweenSections = density === 'compact' ? 8 : density === 'comfortable' ? 24 : 16;

                  const getItemHeight = (sectionCode, item) => {
                    let h = 40;
                    if (sectionCode === 'OBJECTIVE' || sectionCode === 'ADDITIONAL_INFO') {
                      h = density === 'compact' ? 35 : density === 'comfortable' ? 65 : 50;
                    } else if (sectionCode === 'CONTACT') {
                      h = density === 'compact' ? 40 : density === 'comfortable' ? 70 : 55;
                    } else if (sectionCode === 'SKILLS' || sectionCode === 'INTERESTS') {
                      h = density === 'compact' ? 18 : density === 'comfortable' ? 32 : 24;
                    } else if (sectionCode === 'CERTIFICATES' || sectionCode === 'AWARDS') {
                      h = density === 'compact' ? 18 : density === 'comfortable' ? 30 : 22;
                    } else if (sectionCode === 'EDUCATION') {
                      h = density === 'compact' ? 30 : density === 'comfortable' ? 50 : 40;
                    } else if (item) {
                      const baseH = density === 'compact' ? 32 : density === 'comfortable' ? 50 : 40;
                      let descLines = 0;
                      if (item.description) {
                        const text = item.description.replace(/<[^>]*>/g, '');
                        descLines = Math.max(Math.ceil(text.length / 60), 1);
                      }
                      const descH = descLines * (density === 'compact' ? 12 : density === 'comfortable' ? 20 : 15);
                      h = baseH + descH;
                    }
                    return h * fontScale;
                  };

                  for (let i = 0; i < secs.length; i++) {
                    const sec = secs[i];
                    const items = sec.items || [];
                    const isObjective = sec.sectionCode === 'OBJECTIVE';
                    const isContact = sec.sectionCode === 'CONTACT';

                    let secHeaderHeight = headerHeight * fontScale;
                    const gap = currentPageSecs.length > 0 ? gapBetweenSections : 0;

                    if (isObjective || isContact || sec.sectionCode === 'ADDITIONAL_INFO') {
                      const itemH = getItemHeight(sec.sectionCode);
                      const totalSecHeight = secHeaderHeight + itemH;

                      if (currentPageSecs.length > 0 && currentHeight + gap + totalSecHeight > maxHeight) {
                        pages.push(currentPageSecs);
                        currentPageSecs = [{ ...sec, renderItemRange: [0, 1] }];
                        currentHeight = totalSecHeight;
                      } else {
                        currentHeight += gap + totalSecHeight;
                        currentPageSecs.push({ ...sec, renderItemRange: [0, 1] });
                      }
                      continue;
                    }

                    if (sec.sectionCode === 'SKILLS' || sec.sectionCode === 'INTERESTS') {
                      const itemH = getItemHeight(sec.sectionCode);
                      const rows = Math.max(Math.ceil(items.length / 5), 1);
                      const addButtonH = (density === 'compact' ? 12 : density === 'comfortable' ? 20 : 16) * fontScale;
                      const totalSecHeight = secHeaderHeight + rows * itemH + addButtonH;

                      if (currentPageSecs.length > 0 && currentHeight + gap + totalSecHeight > maxHeight) {
                        pages.push(currentPageSecs);
                        currentPageSecs = [{ ...sec, renderItemRange: [0, items.length] }];
                        currentHeight = totalSecHeight;
                      } else {
                        currentHeight += gap + totalSecHeight;
                        currentPageSecs.push({ ...sec, renderItemRange: [0, items.length] });
                      }
                      continue;
                    }

                    if (items.length === 0) {
                      const addButtonH = (density === 'compact' ? 12 : density === 'comfortable' ? 20 : 16) * fontScale;
                      const emptySecHeight = secHeaderHeight + addButtonH;
                      if (currentPageSecs.length > 0 && currentHeight + gap + emptySecHeight > maxHeight) {
                        pages.push(currentPageSecs);
                        currentPageSecs = [{ ...sec, renderItemRange: [0, 0] }];
                        currentHeight = emptySecHeight;
                      } else {
                        currentHeight += gap + emptySecHeight;
                        currentPageSecs.push({ ...sec, renderItemRange: [0, 0] });
                      }
                      continue;
                    }

                    let itemIdx = 0;
                    let pageStartIdx = 0;
                    let headerAdded = false;
                    const addButtonH = (density === 'compact' ? 12 : density === 'comfortable' ? 20 : 16) * fontScale;

                    while (itemIdx < items.length) {
                      const item = items[itemIdx];
                      if (!item) {
                        itemIdx++;
                        continue;
                      }
                      const itemH = getItemHeight(sec.sectionCode, item);
                      const currentGap = (currentPageSecs.length > 0 || headerAdded) ? gapBetweenSections : 0;

                      let heightNeeded = itemH;
                      if (!headerAdded) {
                        heightNeeded += secHeaderHeight;
                      }
                      if (itemIdx === items.length - 1) {
                        heightNeeded += addButtonH;
                      }

                      if (currentHeight + currentGap + heightNeeded > maxHeight) {
                        if (currentHeight === 0 && itemIdx === pageStartIdx) {
                          itemIdx++;
                          currentHeight += heightNeeded;
                          headerAdded = true;
                        } else {
                          if (itemIdx > pageStartIdx) {
                            currentPageSecs.push({ ...sec, renderItemRange: [pageStartIdx, itemIdx] });
                          }
                          if (currentPageSecs.length > 0) {
                            pages.push(currentPageSecs);
                          }
                          currentPageSecs = [];
                          currentHeight = 0;
                          pageStartIdx = itemIdx;
                          headerAdded = false;
                        }
                      } else {
                        itemIdx++;
                        currentHeight += currentGap + heightNeeded;
                        headerAdded = true;
                      }
                    }

                    if (itemIdx > pageStartIdx) {
                      currentPageSecs.push({ ...sec, renderItemRange: [pageStartIdx, itemIdx] });
                    }
                  }

                  if (currentPageSecs.length > 0) {
                    pages.push(currentPageSecs);
                  }

                  if (pages.length === 0) {
                    pages.push([]);
                  }

                  return pages;
                };

                const isSectionContinuation = (secCode, pageIndex, pagesArray) => {
                  for (let p = 0; p < pageIndex; p++) {
                    if (pagesArray[p]?.some(s => s.sectionCode === secCode)) {
                      return true;
                    }
                  }
                  return false;
                };

                const leftPages = paginateSectionsWithItemRanges(leftSections, 90, 960);
                const rightPages = paginateSectionsWithItemRanges(rightSections, 110, 960);
                const headerLeftPages = paginateSectionsWithItemRanges(headerLeftSections, 100, 960);
                const equalLeftPages = paginateSectionsWithItemRanges(leftSections, 100, 960);
                const equalRightPages = paginateSectionsWithItemRanges(rightSections, 100, 960);
                const fullWidthPages = paginateSectionsWithItemRanges(headerLeftSections, 130, 960);
                const harvardClassicPages = paginateSectionsWithItemRanges(headerLeftSections, 100, 960);
                const harvardGsasPages = paginateSectionsWithItemRanges(headerLeftSections, 90, 960);

                let totalPages = 1;
                if (selectedLayout === 'left-col') {
                  totalPages = Math.max(leftPages.length, rightPages.length);
                } else if (selectedLayout === 'header-left') {
                  totalPages = headerLeftPages.length;
                } else if (selectedLayout === 'two-col-equal') {
                  totalPages = Math.max(equalLeftPages.length, equalRightPages.length);
                } else if (selectedLayout === 'full-width') {
                  totalPages = fullWidthPages.length;
                } else if (selectedLayout === 'harvard-classic') {
                  totalPages = harvardClassicPages.length;
                } else if (selectedLayout === 'harvard-gsas') {
                  totalPages = harvardGsasPages.length;
                }
                totalPages = Math.max(totalPages, 1);

                const sizeProfileName = fontSize === 'small' ? 'text-[21px]' : fontSize === 'large' ? 'text-[29px]' : 'text-[25px]';
                const sizeProfileTitle = fontSize === 'small' ? 'text-[11px]' : fontSize === 'large' ? 'text-[15px]' : 'text-[13px]';
                const sizeProfileSummary = fontSize === 'small' ? 'text-[9.5px]' : fontSize === 'large' ? 'text-[13.5px]' : 'text-[11.5px]';

                return (
                  <>
                    {Array.from({ length: totalPages }).map((_, pageIdx) => {
                      const pLeft = leftPages[pageIdx] || [];
                      const pRight = rightPages[pageIdx] || [];
                      const pHeaderLeft = headerLeftPages[pageIdx] || [];
                      const pEqualLeft = equalLeftPages[pageIdx] || [];
                      const pEqualRight = equalRightPages[pageIdx] || [];
                      const pFullWidth = fullWidthPages[pageIdx] || [];
                      const pHarvardClassic = harvardClassicPages[pageIdx] || [];
                      const pHarvardGsas = harvardGsasPages[pageIdx] || [];

                      return (
                        <div
                          key={pageIdx}
                          style={{
                            width: `${794 * scale}px`,
                            height: `${1123 * scale}px`,
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          className="shadow-md border border-gray-200 bg-white rounded-none mx-auto flex-shrink-0"
                        >
                          <div
                            style={{
                              width: '794px',
                              height: '1123px',
                              transform: `scale(${scale})`,
                              transformOrigin: 'top left',
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                            className="bg-white flex flex-col justify-between select-none pointer-events-auto text-left"
                          >
                            {/* Content Area */}
                            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                              {selectedLayout === 'left-col' && (
                                <div className="flex h-full text-left">
                                  {/* Left Sidebar */}
                                  <div style={{ backgroundColor: primaryColor }} className="w-[33%] flex-shrink-0 text-white flex flex-col">
                                    {pageIdx === 0 && avatarShape !== 'hidden' && (
                                      <div className="px-5 pt-8 pb-4 text-center">
                                        <div
                                          onClick={handleAvatarClick}
                                          className={`w-20 h-20 bg-white/15 mx-auto flex items-center justify-center cursor-pointer hover:bg-white/25 border-2 border-transparent hover:border-blue-400 transition-all overflow-hidden ${avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}
                                          title="Click để thay đổi ảnh đại diện mẫu"
                                        >
                                          {mockAvatarUrl ? (
                                            <img
                                              src={mockAvatarUrl}
                                              className="w-full h-full object-cover"
                                              alt="Avatar mẫu"
                                            />
                                          ) : (
                                            <span className="material-symbols-outlined text-[36px] text-white/70">person</span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    <div className="px-5 py-6 flex flex-col gap-0 flex-1">
                                      {pLeft.map(sec => renderSection(sec, isSectionContinuation(sec.sectionCode, pageIdx, leftPages)))}
                                    </div>
                                  </div>

                                  {/* Right Main Content */}
                                  <div className="flex-1 flex flex-col">
                                    {pageIdx === 0 && (
                                      <div className="px-6 pt-8 pb-4 border-b" style={{ borderColor: `${primaryColor}15` }}>
                                        <EditableTextMini
                                          html={sections.find(s => s.sectionCode === 'PROFILE')?.items[0]?.name || 'NGUYỄN VĂN A'}
                                          onChange={(val) => handleUpdateItem('PROFILE', 0, 'name', val)}
                                          className={`${sizeProfileName} font-extrabold text-gray-800 tracking-tight leading-none block`}
                                          placeholder="Họ và Tên"
                                        />
                                        <EditableTextMini
                                          html={sections.find(s => s.sectionCode === 'PROFILE')?.items[0]?.title || 'SENIOR FULL-STACK DEVELOPER'}
                                          onChange={(val) => handleUpdateItem('PROFILE', 0, 'title', val)}
                                          className={`${sizeProfileTitle} font-bold mt-2 uppercase tracking-widest block`}
                                          style={{ color: primaryColor }}
                                          placeholder="Vị trí ứng tuyển"
                                        />
                                        {sections.find(s => s.sectionCode === 'PROFILE')?.items[0]?.summary && (
                                          <EditableTextMini
                                            html={sections.find(s => s.sectionCode === 'PROFILE')?.items[0]?.summary || ''}
                                            onChange={(val) => handleUpdateItem('PROFILE', 0, 'summary', val)}
                                            className={`${sizeProfileSummary} text-gray-500 mt-2.5 leading-relaxed block`}
                                            placeholder="Giới thiệu ngắn..."
                                          />
                                        )}
                                      </div>
                                    )}
                                    <div className="px-6 py-5 flex flex-col gap-0 flex-1">
                                      {pRight.map(sec => renderSection(sec, isSectionContinuation(sec.sectionCode, pageIdx, rightPages)))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {selectedLayout === 'header-left' && (
                                <div className="flex flex-col h-full text-left">
                                  {pageIdx === 0 && (
                                    <div className="px-8 pt-8 pb-4 flex items-end justify-between gap-6 border-b-2" style={{ borderColor: primaryColor }}>
                                      <div className="flex items-center gap-4">
                                        {avatarShape !== 'hidden' && (
                                          <div
                                            onClick={handleAvatarClick}
                                            style={{ backgroundColor: primaryColor }}
                                            className={`w-18 h-18 flex items-center justify-center text-white flex-shrink-0 cursor-pointer hover:opacity-95 border-2 border-transparent hover:border-blue-400 transition-all overflow-hidden ${avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}
                                            title="Click để thay đổi ảnh đại diện mẫu"
                                          >
                                            {mockAvatarUrl ? (
                                              <img
                                                src={mockAvatarUrl}
                                                className="w-full h-full object-cover"
                                                alt="Avatar mẫu"
                                              />
                                            ) : (
                                              <span className="material-symbols-outlined text-[32px]">person</span>
                                            )}
                                          </div>
                                        )}
                                        <div>
                                          <EditableTextMini
                                            html={sections.find(s => s.sectionCode === 'PROFILE')?.items[0]?.name || 'NGUYỄN VĂN A'}
                                            onChange={(val) => handleUpdateItem('PROFILE', 0, 'name', val)}
                                            className={`${sizeProfileName} font-extrabold text-gray-800 tracking-tight leading-none block`}
                                            placeholder="Họ và Tên"
                                          />
                                          <EditableTextMini
                                            html={sections.find(s => s.sectionCode === 'PROFILE')?.items[0]?.title || 'SENIOR FULL-STACK DEVELOPER'}
                                            onChange={(val) => handleUpdateItem('PROFILE', 0, 'title', val)}
                                            className={`${sizeProfileTitle} font-bold mt-2 uppercase tracking-wider block`}
                                            style={{ color: primaryColor }}
                                            placeholder="Chức danh"
                                          />
                                        </div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        {sections.filter(s => s.sectionCode === 'CONTACT').map(sec => renderSection(sec))}
                                      </div>
                                    </div>
                                  )}
                                  <div className="px-8 py-5 flex flex-col gap-0 flex-1">
                                    {pHeaderLeft.map(sec => renderSection(sec, isSectionContinuation(sec.sectionCode, pageIdx, headerLeftPages)))}
                                  </div>
                                </div>
                              )}

                              {selectedLayout === 'two-col-equal' && (
                                <div className="flex flex-col h-full text-left">
                                  {pageIdx === 0 && (
                                    <div className="px-8 py-5 text-white flex justify-between items-center" style={{ backgroundColor: primaryColor }}>
                                      <div>
                                        <EditableTextMini
                                          html={sections.find(s => s.sectionCode === 'PROFILE')?.items[0]?.name || 'NGUYỄN VĂN A'}
                                          onChange={(val) => handleUpdateItem('PROFILE', 0, 'name', val)}
                                          className={`${sizeProfileName} font-extrabold tracking-tight block text-white`}
                                          placeholder="Họ và Tên"
                                        />
                                        <EditableTextMini
                                          html={sections.find(s => s.sectionCode === 'PROFILE')?.items[0]?.title || 'SENIOR FULL-STACK DEVELOPER'}
                                          onChange={(val) => handleUpdateItem('PROFILE', 0, 'title', val)}
                                          className={`${sizeProfileTitle} text-white/80 block mt-1 font-bold uppercase tracking-wider`}
                                          placeholder="Vị trí ứng tuyển"
                                        />
                                      </div>
                                      {avatarShape !== 'hidden' && (
                                        <div
                                          onClick={handleAvatarClick}
                                          className={`w-16 h-16 bg-white/15 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-white/25 border-2 border-transparent hover:border-blue-400 transition-all overflow-hidden ${avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}
                                          title="Click để thay đổi ảnh đại diện mẫu"
                                        >
                                          {mockAvatarUrl ? (
                                            <img
                                              src={mockAvatarUrl}
                                              className="w-full h-full object-cover"
                                              alt="Avatar mẫu"
                                            />
                                          ) : (
                                            <span className="material-symbols-outlined text-[28px] text-white/80">person</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex-1 grid grid-cols-2 gap-0">
                                    <div className="px-6 py-5 flex flex-col gap-0 border-r" style={{ borderColor: `${primaryColor}12` }}>
                                      {pEqualLeft.map(sec => renderSection(sec, isSectionContinuation(sec.sectionCode, pageIdx, equalLeftPages)))}
                                    </div>
                                    <div className="px-6 py-5 flex flex-col gap-0">
                                      {pEqualRight.map(sec => renderSection(sec, isSectionContinuation(sec.sectionCode, pageIdx, equalRightPages)))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {selectedLayout === 'full-width' && (
                                <div className="flex flex-col h-full text-left">
                                  {pageIdx === 0 && (
                                    <div className="px-10 py-6 flex flex-col items-center justify-center border-b" style={{ borderColor: `${primaryColor}20` }}>
                                      {avatarShape !== 'hidden' && (
                                        <div className={`w-20 h-20 mb-4 bg-gray-100 flex items-center justify-center flex-shrink-0 shadow-inner ${avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}>
                                          <span className="material-symbols-outlined text-[32px] text-gray-400">person</span>
                                        </div>
                                      )}
                                      <div className="text-center">
                                        <EditableTextMini
                                          html={sections.find(s => s.sectionCode === 'PROFILE')?.items[0]?.name || 'NGUYỄN VĂN A'}
                                          onChange={(val) => handleUpdateItem('PROFILE', 0, 'name', val)}
                                          className={`${sizeProfileName} font-extrabold tracking-tight block leading-none`}
                                          style={{ color: primaryColor }}
                                          placeholder="Họ và Tên"
                                        />
                                        <EditableTextMini
                                          html={sections.find(s => s.sectionCode === 'PROFILE')?.items[0]?.title || 'SENIOR FULL-STACK DEVELOPER'}
                                          onChange={(val) => handleUpdateItem('PROFILE', 0, 'title', val)}
                                          className={`${sizeProfileTitle} text-gray-500 block mt-1.5 font-bold uppercase tracking-wider`}
                                          placeholder="Vị trí ứng tuyển"
                                        />
                                      </div>
                                      <div className="mt-4 flex justify-center w-full max-w-sm">
                                        {sections.filter(s => s.sectionCode === 'CONTACT').map(sec => renderSection({ ...sec, column: 'full' }))}
                                      </div>
                                    </div>
                                  )}
                                  <div className="px-12 py-5 flex flex-col gap-0 flex-1">
                                    {pFullWidth.map(sec => renderSection({ ...sec, column: 'full' }, isSectionContinuation(sec.sectionCode, pageIdx, fullWidthPages)))}
                                  </div>
                                </div>
                              )}

                              {selectedLayout === 'harvard-classic' && (
                                <div className="flex flex-col h-full text-left">
                                  {pageIdx === 0 && (
                                    <div className="px-10 py-6 flex flex-col items-center justify-center border-b-2" style={{ borderColor: primaryColor }}>
                                      <div className="text-center">
                                        <EditableTextMini
                                          html={sections.find(s => s.sectionCode === 'PROFILE')?.items[0]?.name || 'NGUYỄN VĂN A'}
                                          onChange={(val) => handleUpdateItem('PROFILE', 0, 'name', val)}
                                          className={`${sizeProfileName} font-black tracking-tight block uppercase leading-none`}
                                          style={{ color: primaryColor }}
                                          placeholder="Họ và Tên"
                                        />
                                        <EditableTextMini
                                          html={sections.find(s => s.sectionCode === 'PROFILE')?.items[0]?.title || 'SENIOR FULL-STACK DEVELOPER'}
                                          onChange={(val) => handleUpdateItem('PROFILE', 0, 'title', val)}
                                          className={`${sizeProfileTitle} text-gray-500 block mt-1.5 font-bold uppercase tracking-wider`}
                                          placeholder="Vị trí ứng tuyển"
                                        />
                                      </div>
                                      
                                      {sections.filter(s => s.sectionCode === 'CONTACT').map(sec => {
                                        const contactItem = sec.items[0] || {};
                                        return (
                                          <div key={sec.sectionCode} className="mt-3 flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[10px] text-gray-600 font-medium font-sans">
                                            {contactItem.address && (
                                              <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[11px] opacity-75">location_on</span>
                                                <EditableTextMini
                                                  html={contactItem.address}
                                                  onChange={(val) => handleUpdateItem('CONTACT', 0, 'address', val)}
                                                  placeholder="Địa chỉ"
                                                />
                                              </div>
                                            )}
                                            {(contactItem.address && contactItem.phone) && <span className="text-gray-400">|</span>}
                                            {contactItem.phone && (
                                              <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[11px] opacity-75">phone</span>
                                                <EditableTextMini
                                                  html={contactItem.phone}
                                                  onChange={(val) => handleUpdateItem('CONTACT', 0, 'phone', val)}
                                                  placeholder="Điện thoại"
                                                />
                                              </div>
                                            )}
                                            {(contactItem.phone && contactItem.email) && <span className="text-gray-400">|</span>}
                                            {contactItem.email && (
                                              <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[11px] opacity-75">mail</span>
                                                <EditableTextMini
                                                  html={contactItem.email}
                                                  onChange={(val) => handleUpdateItem('CONTACT', 0, 'email', val)}
                                                  placeholder="Email"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                  <div className="px-12 py-5 flex flex-col gap-0 flex-1">
                                    {pHarvardClassic.map(sec => renderSection({ ...sec, column: 'full' }, isSectionContinuation(sec.sectionCode, pageIdx, harvardClassicPages)))}
                                  </div>
                                </div>
                              )}

                              {selectedLayout === 'harvard-gsas' && (
                                <div className="flex flex-col h-full text-left">
                                  {pageIdx === 0 && (
                                    <div className="px-12 py-6 flex justify-between items-start border-b" style={{ borderColor: `${primaryColor}20` }}>
                                      <div className="flex-1">
                                        <EditableTextMini
                                          html={sections.find(s => s.sectionCode === 'PROFILE')?.items[0]?.name || 'NGUYỄN VĂN A'}
                                          onChange={(val) => handleUpdateItem('PROFILE', 0, 'name', val)}
                                          className={`${sizeProfileName} font-black tracking-tight block uppercase leading-none`}
                                          style={{ color: primaryColor }}
                                          placeholder="Họ và Tên"
                                        />
                                        <EditableTextMini
                                          html={sections.find(s => s.sectionCode === 'PROFILE')?.items[0]?.title || 'SENIOR FULL-STACK DEVELOPER'}
                                          onChange={(val) => handleUpdateItem('PROFILE', 0, 'title', val)}
                                          className={`${sizeProfileTitle} text-gray-500 block mt-1.5 font-bold uppercase tracking-wider`}
                                          placeholder="Vị trí ứng tuyển"
                                        />
                                      </div>
                                      <div className="shrink-0 text-right">
                                        {sections.filter(s => s.sectionCode === 'CONTACT').map(sec => {
                                          const contactItem = sec.items[0] || {};
                                          return (
                                            <div key={sec.sectionCode} className="text-[10px] text-gray-600 font-medium font-sans flex flex-col gap-0.5 items-end">
                                              {contactItem.phone && (
                                                <div className="flex items-center gap-1 justify-end">
                                                  <EditableTextMini
                                                    html={contactItem.phone}
                                                    onChange={(val) => handleUpdateItem('CONTACT', 0, 'phone', val)}
                                                    placeholder="Điện thoại"
                                                  />
                                                  <span className="material-symbols-outlined text-[11px] opacity-75">phone</span>
                                                </div>
                                              )}
                                              {contactItem.email && (
                                                <div className="flex items-center gap-1 justify-end">
                                                  <EditableTextMini
                                                    html={contactItem.email}
                                                    onChange={(val) => handleUpdateItem('CONTACT', 0, 'email', val)}
                                                    placeholder="Email"
                                                  />
                                                  <span className="material-symbols-outlined text-[11px] opacity-75">mail</span>
                                                </div>
                                              )}
                                              {contactItem.address && (
                                                <div className="flex items-center gap-1 justify-end">
                                                  <EditableTextMini
                                                    html={contactItem.address}
                                                    onChange={(val) => handleUpdateItem('CONTACT', 0, 'address', val)}
                                                    placeholder="Địa chỉ"
                                                  />
                                                  <span className="material-symbols-outlined text-[11px] opacity-75">location_on</span>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  <div className="px-12 py-5 flex flex-col gap-0 flex-1">
                                    {pHarvardGsas.map(sec => (
                                      <div key={sec.sectionCode} className="grid grid-cols-[1fr_3.5fr] gap-6 py-2 border-b border-gray-100 last:border-b-0">
                                        <div className="text-right pr-2">
                                          <h4 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                                            {sec.sectionCode === 'EDUCATION' ? 'HỌC VẤN' :
                                             sec.sectionCode === 'EXPERIENCE' ? 'KINH NGHIỆM' :
                                             sec.sectionCode === 'SKILLS' ? 'KỸ NĂNG' :
                                             sec.sectionCode === 'OBJECTIVE' ? 'MỤC TIÊU' :
                                             sec.sectionCode === 'PROJECTS' ? 'DỰ ÁN' :
                                             sec.sectionCode === 'CERTIFICATES' ? 'CHỨNG CHỈ' :
                                             sec.sectionCode === 'AWARDS' ? 'GIẢI THƯỞNG' :
                                             sec.sectionCode === 'INTERESTS' ? 'SỞ THÍCH' :
                                             sec.sectionCode === 'ACTIVITIES' ? 'HOẠT ĐỘNG' :
                                             sec.sectionCode === 'ADDITIONAL_INFO' ? 'THÔNG TIN THÊM' : sec.sectionCode}
                                          </h4>
                                        </div>
                                        <div className="text-left">
                                          {renderSection({ ...sec, column: 'full' }, isSectionContinuation(sec.sectionCode, pageIdx, harvardGsasPages))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Page Footer Watermark */}
                            <div className="px-12 py-3 border-t border-gray-100 flex justify-end items-center text-[10px] text-gray-400 font-medium select-none pointer-events-none">
                              <span>© VietWorks</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      {croppingImage && (
        <AvatarCropModal
          imageUrl={croppingImage}
          onClose={() => setCroppingImage(null)}
          onConfirm={handleCropConfirm}
          onDelete={handleCropDelete}
        />
      )}
      <input
        id="mockAvatarUploader"
        type="file"
        accept="image/*"
        onChange={handleMockAvatarChange}
        className="hidden"
      />
    </form>
  );
};

export default CVTemplateForm;
