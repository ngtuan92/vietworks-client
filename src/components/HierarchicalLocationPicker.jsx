import React, { useState, useEffect } from 'react';
import { companyLocationService } from '../services/companyLocationService';

export default function HierarchicalLocationPicker({ onLocationSelect }) {
  // Danh sách dữ liệu từ API
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  // State lưu trữ code được chọn để lọc cấp con
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');
  const [specificAddress, setSpecificAddress] = useState('');

  // Lấy danh sách Tỉnh/Thành khi component mount
  useEffect(() => {
    companyLocationService.getProvinces()
      .then(data => setProvinces(data))
      .catch(console.error);
  }, []);

  // Khi thay đổi Tỉnh/Thành -> Reset và tải danh sách Phường/Xã
  const handleProvinceChange = (e) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    
    // Reset cấp dưới
    setSelectedWardCode('');
    setWards([]);
    
    if (code) {
      companyLocationService.getCommunes(code)
        .then(data => setWards(data))
        .catch(console.error);
    }
  };

  // Mỗi khi một trong các trường thay đổi, đóng gói dữ liệu đẩy về Form chính
  useEffect(() => {
    if (!selectedProvinceCode) return;

    const pObj = provinces.find(p => String(p.code) === String(selectedProvinceCode));
    const wObj = wards.find(w => String(w.code) === String(selectedWardCode));

    // Xây dựng chuỗi địa chỉ hiển thị hoàn chỉnh
    const addressParts = [
      specificAddress.trim(),
      wObj?.name,
      pObj?.name
    ].filter(Boolean);

    if (typeof onLocationSelect === 'function') {
      onLocationSelect({
        provinceId: selectedProvinceCode,
        provinceName: pObj?.name || '',
        districtName: '', // Không dùng huyện
        wardName: wObj?.name || '',
        fullAddress: addressParts.join(', ')
      });
    }
  }, [selectedProvinceCode, selectedWardCode, specificAddress, provinces, wards, onLocationSelect]);

  return (
    <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Cấp 1: Tỉnh / Thành phố */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Tỉnh / Thành phố</label>
          <select
            value={selectedProvinceCode}
            onChange={handleProvinceChange}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-[#003f87]"
          >
            <option value="">-- Chọn Tỉnh/Thành phố --</option>
            {provinces.map(p => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Cấp 2: Phường / Xã */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Phường / Xã</label>
          <select
            value={selectedWardCode}
            onChange={(e) => setSelectedWardCode(e.target.value)}
            disabled={!selectedProvinceCode}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-[#003f87] disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            <option value="">-- Chọn Phường/Xã --</option>
            {wards.map(w => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Địa chỉ chi tiết (Số nhà, tên đường) */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Số nhà, tên đường (Tùy chọn)</label>
        <input
          type="text"
          value={specificAddress}
          onChange={(e) => setSpecificAddress(e.target.value)}
          placeholder="Ví dụ: Lầu 5, 123 Nguyễn Chí Thanh"
          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-[#003f87]"
        />
      </div>
    </div>
  );
}