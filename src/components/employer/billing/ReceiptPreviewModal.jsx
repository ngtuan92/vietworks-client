import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { useAuthStore } from '../../../store/authStore';
import employerCompanyService from '../../../services/employerCompanyService';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const numberToWords = (num) => {
  if (num === 0) return 'Không đồng';
  // A simple fallback for number to words in VN
  return new Intl.NumberFormat('vi-VN').format(num) + ' đồng chẵn';
};

// Lọc các giao dịch đủ điều kiện
const isInvoiceEligible = (tx) => tx?.status === 'SUCCESS';

const describeTx = (tx) => {
  const date = tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString('vi-VN') : '';
  const amount = formatPrice(tx?.amount || 0);
  return `${amount} — ${date} — ${tx?.description || tx?._id}`;
};

const ReceiptPreviewModal = ({ isOpen, onClose, transactions = [], defaultSelectedId = null }) => {
  const { user } = useAuthStore();
  const isEmployer = user?.role === 'employer';
  
  const eligible = useMemo(() => transactions.filter(isInvoiceEligible), [transactions]);

  const [selectedId, setSelectedId] = useState('');
  
  // Company state for employer
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [companyLoading, setCompanyLoading] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef(null);

  // Lấy transaction đang được chọn
  const selectedTx = useMemo(() => eligible.find(t => t._id === selectedId) || null, [eligible, selectedId]);

  useEffect(() => {
    if (isOpen) {
      const initial = defaultSelectedId && eligible.some((t) => t._id === defaultSelectedId)
        ? defaultSelectedId
        : eligible[0]?._id || '';
      setSelectedId(initial);

      if (isEmployer) {
        fetchCompanyProfile();
      }
    }
  }, [isOpen, defaultSelectedId, eligible, isEmployer]);

  const fetchCompanyProfile = async () => {
    try {
      setCompanyLoading(true);
      const res = await employerCompanyService.getMyCompanyProfile();
      const comp = res?.data;
      if (comp) {
        setCompanyName(comp.name || '');
        setTaxId(comp.taxCode || '');
        // Lấy địa chỉ từ location chính (isPrimary) hoặc location đầu tiên
        const primaryLocation = comp.locations?.find(l => l.isPrimary) || comp.locations?.[0];
        if (primaryLocation) {
          const parts = [primaryLocation.addressLine, primaryLocation.ward, primaryLocation.district, primaryLocation.province].filter(Boolean);
          setAddress(parts.join(', '));
        }
      }
    } catch (err) {
      console.error('Lỗi lấy thông tin công ty:', err);
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current || !selectedTx) return;
    
    try {
      setIsGenerating(true);
      
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const margin = 15; // mm
      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const maxW = pdfPageWidth - margin * 2;
      const maxH = pdfPageHeight - margin * 2;
      
      // Tính tỉ lệ sao cho vừa khít 1 trang A4
      const imgRatio = canvas.width / canvas.height;
      let finalW = maxW;
      let finalH = finalW / imgRatio;
      if (finalH > maxH) {
        finalH = maxH;
        finalW = finalH * imgRatio;
      }
      
      // Căn giữa ngang
      const offsetX = margin + (maxW - finalW) / 2;
      
      pdf.addImage(imgData, 'PNG', offsetX, margin, finalW, finalH);
      pdf.save(`Bien_Lai_VietWorks_${selectedTx._id.substring(0,8)}.pdf`);
    } catch (err) {
      console.error('Lỗi khi tạo PDF:', err);
      alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  // Cảnh báo nếu Employer thiếu thông tin công ty
  const missingCompanyInfo = isEmployer && (!companyName || !taxId);

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl bg-slate-100 rounded-2xl shadow-2xl border border-slate-200/60 flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
          
          {/* Cột trái: Form điều khiển */}
          <div className="w-full md:w-1/3 bg-white border-r border-slate-200 p-6 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-600 text-[24px]">receipt_long</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Xem & Tải Phiếu Thu</h2>
                  <p className="text-sm text-slate-500">Tải biên lai thanh toán PDF</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg md:hidden">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {eligible.length === 0 ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                Bạn chưa có giao dịch nào đủ điều kiện xuất phiếu thu.
              </div>
            ) : (
              <div className="space-y-6 flex-1">

                {isEmployer && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 border-b pb-2">Thông tin xuất phiếu thu</h3>
                    {companyLoading ? (
                      <p className="text-sm text-slate-500 animate-pulse">Đang tải dữ liệu công ty...</p>
                    ) : (
                      <>
                        {missingCompanyInfo && (
                          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex gap-2 items-start">
                            <span className="material-symbols-outlined text-[18px]">warning</span>
                            <div>
                              <p className="font-bold mb-1">Thiếu thông tin công ty</p>
                              <p className="text-xs mb-2">Vui lòng cập nhật đầy đủ Tên công ty và MST để phiếu thu hợp lệ.</p>
                              <Link to="/employer/profile" className="text-indigo-600 font-bold hover:underline text-xs" onClick={onClose}>
                                Cập nhật hồ sơ →
                              </Link>
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Tên công ty</label>
                          <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-700 border border-slate-200">
                            {companyName || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Mã số thuế</label>
                          <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-700 border border-slate-200">
                            {taxId || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Địa chỉ</label>
                          <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-700 border border-slate-200">
                            {address || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
              <button
                onClick={handleDownloadPdf}
                disabled={!selectedTx || isGenerating || missingCompanyInfo}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang tạo PDF...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">download</span>
                    Tải PDF
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all hidden md:block"
              >
                Đóng
              </button>
            </div>
          </div>

          {/* Cột phải: Preview A4 */}
          <div className="hidden md:flex md:w-2/3 bg-slate-200 p-8 items-start justify-center overflow-y-auto custom-scrollbar">
            {selectedTx ? (
              <div 
                className="bg-white shadow-xl origin-top transition-transform scale-90 lg:scale-100"
                style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}
              >
                <div ref={printRef} className="bg-white" style={{ width: '100%', height: '100%', color: '#1f2937', fontFamily: 'Arial, sans-serif' }}>
                  
                  {/* Header */}
                  <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-6 mb-8">
                    <div>
                      <h1 className="text-3xl font-black text-indigo-700 tracking-tight">VietWorks</h1>
                      <p className="text-sm text-slate-500 mt-1">Nền tảng Tuyển dụng & Việc làm</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest mb-1">
                        {isEmployer ? 'Phiếu Thu Tiền' : 'Biên Lai Thanh Toán'}
                      </h2>
                      <p className="text-sm text-slate-500">Mã GD: <span className="font-bold text-slate-800">{selectedTx._id.substring(0, 8).toUpperCase()}</span></p>
                      <p className="text-sm text-slate-500">Ngày lập: {new Date(selectedTx.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>

                  {/* Thông tin 2 bên */}
                  <div className="grid grid-cols-2 gap-12 mb-10 text-sm">
                    {/* Bên cung cấp */}
                    <div>
                      <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-3">Đơn vị cung cấp</h3>
                      <p className="font-bold text-slate-800 text-base mb-1">Hệ thống Việc làm VietWorks</p>
                      <p className="text-slate-600 mb-1">Website: www.vietworks.vn</p>
                      <p className="text-slate-600">Email: vietworks.noreply@gmail.com</p>
                    </div>

                    {/* Bên mua */}
                    <div>
                      <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-3">Khách hàng thanh toán</h3>
                      {isEmployer ? (
                        <>
                          <p className="font-bold text-slate-800 text-base mb-1">{companyName || '---'}</p>
                          <p className="text-slate-600 mb-1"><span className="font-semibold">MST:</span> {taxId || '---'}</p>
                          <p className="text-slate-600 mb-1"><span className="font-semibold">Địa chỉ:</span> {address || '---'}</p>
                          <p className="text-slate-600"><span className="font-semibold">Người GD:</span> {user?.fullName} ({user?.email})</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-slate-800 text-base mb-1">{user?.fullName}</p>
                          <p className="text-slate-600 mb-1">Email: {user?.email}</p>
                          <p className="text-slate-600">Vai trò: Ứng viên (Jobseeker)</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bảng chi tiết */}
                  <div className="mb-10">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300">
                          <th className="py-3 px-4 font-bold text-slate-700">Diễn giải dịch vụ</th>
                          <th className="py-3 px-4 font-bold text-slate-700 text-center">Số lượng</th>
                          <th className="py-3 px-4 font-bold text-slate-700 text-right">Đơn giá</th>
                          <th className="py-3 px-4 font-bold text-slate-700 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="py-4 px-4 text-slate-800">{selectedTx.description || 'Mua dịch vụ VietWorks'}</td>
                          <td className="py-4 px-4 text-center text-slate-800">1</td>
                          <td className="py-4 px-4 text-right text-slate-800">{formatPrice(selectedTx.amount)}</td>
                          <td className="py-4 px-4 text-right font-bold text-slate-800">{formatPrice(selectedTx.amount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Tổng kết */}
                  <div className="flex justify-end mb-16">
                    <div className="w-1/2">
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">Tổng cộng:</span>
                        <span className="font-bold text-lg text-indigo-700">{formatPrice(selectedTx.amount)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">Bằng chữ:</span>
                        <span className="text-slate-800 font-medium text-right">{numberToWords(selectedTx.amount)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">Hình thức:</span>
                        <span className="text-slate-800">Chuyển khoản (SePay)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">Trạng thái:</span>
                        <span className="text-emerald-600 font-bold uppercase tracking-wider">Đã thanh toán</span>
                      </div>
                    </div>
                  </div>

                  {/* Ký nhận (Chỉ cho Employer hoặc cho đẹp) */}
                  <div className="flex justify-between mt-auto px-10 text-center">
                    <div>
                      <p className="font-bold text-slate-800 mb-6">Người nộp tiền</p>
                      <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '22px', color: '#1e3a5f' }}>{user?.fullName || '---'}</p>
                    </div>
                    <div className="relative">
                      <p className="font-bold text-slate-800 mb-4">Đơn vị phát hành</p>
                      <div className="w-32 h-32 absolute left-1/2 -translate-x-1/2 top-8 opacity-20 rotate-[-15deg] pointer-events-none">
                        <div className="w-full h-full rounded-full border-4 border-red-500 flex items-center justify-center">
                          <div className="text-center">
                            <span className="block text-red-500 font-black text-xl leading-none">ĐÃ THU</span>
                            <span className="block text-red-500 font-bold text-sm">TIỀN</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-indigo-600 font-medium italic mt-16 text-sm">Hệ thống VietWorks</p>
                      <p className="text-slate-400 text-xs mt-1">Phát hành tự động</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-16 pt-6 border-t border-slate-200 text-center">
                    <p className="text-slate-400 text-sm italic">
                      Cảm ơn Quý khách đã tin tưởng và sử dụng dịch vụ của VietWorks.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-center py-20">
                <span className="material-symbols-outlined text-[48px] mb-2 opacity-20">description</span>
                <p>Vui lòng chọn giao dịch để xem trước</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReceiptPreviewModal;
