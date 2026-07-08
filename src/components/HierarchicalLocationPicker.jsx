import React, { useState, useEffect } from 'react';
import { getProvinces, getDistrictsByProvinceCode, getWardsByDistrictCode } from 'sub-vn';

export default function HierarchicalLocationPicker({ onLocationSelect }) {
  // Danh sách dữ liệu từ thư viện
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // State lưu trữ code được chọn để lọc cấp con
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');
  const [specificAddress, setSpecificAddress] = useState('');

  // Lấy danh sách Tỉnh/Thành khi component mount
  useEffect(() => {
    setProvinces(getProvinces());
  }, []);

  // Khi thay đổi Tỉnh/Thành -> Reset và tải danh sách Quận/Huyện
  const handleProvinceChange = (e) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);

    // Reset cấp dưới
    setSelectedDistrictCode('');
    setSelectedWardCode('');
    setDistricts(code ? getDistrictsByProvinceCode(code) : []);
    setWards([]);
  };

  // Khi thay đổi Quận/Huyện -> Reset và tải danh sách Phường/Xã
  const handleDistrictChange = (e) => {
    const code = e.target.value;
    setSelectedDistrictCode(code);

    setSelectedWardCode('');
    setWards(code ? getWardsByDistrictCode(code) : []);
  };

  // Mỗi khi một trong các trường thay đổi, đóng gói dữ liệu đẩy về Form chính
  useEffect(() => {
    if (!selectedProvinceCode) return;

    const pObj = provinces.find(p => p.code === selectedProvinceCode);
    const dObj = districts.find(d => d.code === selectedDistrictCode);
    const wObj = wards.find(w => w.code === selectedWardCode);

    // Xây dựng chuỗi địa chỉ hiển thị hoàn chỉnh
    const addressParts = [
      specificAddress.trim(),
      wObj?.name,
      dObj?.name,
      pObj?.name
    ].filter(Boolean);

    // CHỮA LỖI TẠI ĐÂY: Thêm điều kiện kiểm tra hàm trước khi thực thi
    if (typeof onLocationSelect === 'function') {
      onLocationSelect({
        provinceId: selectedProvinceCode, // Dùng code làm ID tạm hoặc map với DB
        provinceName: pObj?.name || '',
        districtName: dObj?.name || '',
        wardName: wObj?.name || '',
        fullAddress: addressParts.join(', ')
      });
    }
    // Thêm các mảng danh sách vào dependency để cập nhật chính xác tên text khi Object tìm thấy muộn hơn
  }, [selectedProvinceCode, selectedDistrictCode, selectedWardCode, specificAddress, provinces, districts, wards, onLocationSelect]);

  return (
    <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

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

        {/* Cấp 2: Quận / Huyện */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Quận / Huyện</label>
          <select
            value={selectedDistrictCode}
            onChange={handleDistrictChange}
            disabled={!selectedProvinceCode}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-[#003f87] disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            <option value="">-- Chọn Quận/Huyện --</option>
            {districts.map(d => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Cấp 3: Phường / Xã */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Phường / Xã</label>
          <select
            value={selectedWardCode}
            onChange={(e) => setSelectedWardCode(e.target.value)}
            disabled={!selectedDistrictCode}
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