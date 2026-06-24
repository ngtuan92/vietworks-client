import { useState } from 'react';

/**
 * Hiển thị logo công ty. Khi không có ảnh hoặc ảnh lỗi (404...),
 * tự fallback về chữ cái đầu của tên công ty thay vì hiện ảnh vỡ.
 */
const CompanyLogo = ({ name, avatarUrl, className = '', textClassName = 'text-2xl font-bold text-slate-400' }) => {
  const [error, setError] = useState(false);
  const showImg = avatarUrl && !error;

  if (showImg) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'Company'}
        className={className || 'w-full h-full object-cover'}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <span className={textClassName}>{name?.charAt(0)?.toUpperCase() || 'C'}</span>
  );
};

export default CompanyLogo;
