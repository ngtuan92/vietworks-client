import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, FileText, Loader2, Mail, MapPin, Phone } from 'lucide-react';
import atsService from '../../../services/atsService';

const STATUS_LABEL = {
  UNREAD: 'Chưa xem',
  APPLIED: 'Đã nộp',
  VIEWED: 'Đã xem',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  HIRED: 'Đã tuyển'
};

const STATUS_COLOR = {
  UNREAD: 'bg-blue-50 text-primary border border-blue-100',
  APPLIED: 'bg-blue-50 text-primary border border-blue-100',
  VIEWED: 'bg-slate-100 text-slate-700 border border-slate-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  REJECTED: 'bg-red-50 text-red-700 border border-red-100',
  HIRED: 'bg-blue-100 text-primary border border-blue-200'
};

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingViewed, setMarkingViewed] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cvBlobUrl, setCvBlobUrl] = useState('');
  const [cvPreviewLoading, setCvPreviewLoading] = useState(false);
  const cvBlobUrlRef = useRef('');

  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [interviewData, setInterviewData] = useState({ time: '', format: 'ONLINE', location: '', contactPerson: '', note: '' });

  const handleApprove = async () => {
    if (!window.confirm('Bạn muốn chuyển hồ sơ này sang trạng thái Đã duyệt?')) return;
    try {
      setActionLoading(true);
      setError(''); setSuccessMessage('');
      const res = await atsService.approveApplication(id, 'Hồ sơ của bạn đã được duyệt và đang chờ sắp xếp lịch phỏng vấn.');
      setApplication(res.data);
      setSuccessMessage('Đã duyệt hồ sơ thành công.');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi duyệt hồ sơ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return alert('Vui lòng nhập lý do từ chối');
    try {
      setActionLoading(true);
      setError(''); setSuccessMessage('');
      const res = await atsService.rejectApplication(id, rejectReason);
      setApplication(res.data);
      setSuccessMessage('Đã từ chối hồ sơ và thông báo cho ứng viên.');
      setRejectModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi từ chối hồ sơ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInterview = async (e) => {
    e.preventDefault();
    if (!interviewData.time || !interviewData.location) return alert('Vui lòng nhập đủ thời gian và địa điểm');
    try {
      setActionLoading(true);
      setError(''); setSuccessMessage('');
      const res = await atsService.inviteInterview(id, interviewData);
      setApplication(res.data);
      setSuccessMessage('Đã gửi thư mời phỏng vấn thành công.');
      setInterviewModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi mời phỏng vấn');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await atsService.getApplicationDetail(id);
        setApplication(res?.data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải chi tiết hồ sơ ứng tuyển');
      } finally {
        setLoading(false);
      }
    };

    queueMicrotask(() => {
      loadDetail();
    });
  }, [id]);

  useEffect(() => {
    const markViewed = async () => {
      if (!application) return;
      if (!['UNREAD', 'APPLIED'].includes(application.status)) return;

      try {
        setMarkingViewed(true);
        const res = await atsService.markApplicationAsViewed(id);
        setApplication(res?.data || application);
        if (res?.notificationCreated) {
          setSuccessMessage('Đã chuyển hồ sơ sang trạng thái đã xem và gửi thông báo cho ứng viên.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể cập nhật trạng thái đã xem');
      } finally {
        setMarkingViewed(false);
      }
    };

    queueMicrotask(() => {
      markViewed();
    });
  }, [application, id]);

  useEffect(() => {
    if (!application || application?.cv?.type !== 'UPLOADED') return undefined;

    let active = true;

    queueMicrotask(async () => {
      try {
        setCvPreviewLoading(true);
        const blob = await atsService.getApplicationCvBlob(application.id);
        if (!active) return;
        if (cvBlobUrlRef.current) URL.revokeObjectURL(cvBlobUrlRef.current);
        const objectUrl = URL.createObjectURL(blob);
        cvBlobUrlRef.current = objectUrl;
        setCvBlobUrl(objectUrl);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Kh?ng th? t?i CV ?? preview');
      } finally {
        if (active) setCvPreviewLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [application]);

  const cvPreview = useMemo(() => {
    if (!application?.cv) return null;
    if (application.cv.type === 'UPLOADED') {
      return {
        title: application.cv.title,
        mode: 'file',
        fileUrl: application.cv.fileUrl,
        fileName: application.cv.fileName
      };
    }

    return {
      title: application.cv.title,
      mode: 'online',
      sections: application.cv.sections || []
    };
  }, [application]);

  if (loading) {
    return <div className="flex items-center justify-center gap-2 py-16 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /> Đang tải hồ sơ...</div>;
  }

  if (error && !application) {
    return <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>;
  }

  if (!application) {
    return <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">Không tìm thấy hồ sơ ứng tuyển.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Chi tiết hồ sơ ứng tuyển</h1>
            <p className="text-slate-600 mt-1">{application.job?.title || 'Tin tuyển dụng'} • {application.company?.name || 'Công ty'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${STATUS_COLOR[application.status] || STATUS_COLOR.VIEWED}`}>
            {STATUS_LABEL[application.status] || application.status}
          </span>
          {['UNREAD', 'APPLIED', 'VIEWED'].includes(application.status) && (
            <div className="flex gap-2 ml-4">
              <button disabled={actionLoading} onClick={handleApprove} className="px-4 py-1.5 text-sm font-bold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50">Duyệt</button>
              <button disabled={actionLoading} onClick={() => setInterviewModalOpen(true)} className="px-4 py-1.5 text-sm font-bold bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50">Mời phỏng vấn</button>
              <button disabled={actionLoading} onClick={() => setRejectModalOpen(true)} className="px-4 py-1.5 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50">Từ chối</button>
            </div>
          )}
          {application.status === 'APPROVED' && !application.interviewInvitation && (
            <button disabled={actionLoading} onClick={() => setInterviewModalOpen(true)} className="ml-4 px-4 py-1.5 text-sm font-bold bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50">Tạo thư mời phỏng vấn</button>
          )}
        </div>
      </div>

      {successMessage ? <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{successMessage}</div> : null}
      {error && application ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-1 bg-white border border-slate-200/60 premium-shadow rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-primary font-black text-xl flex items-center justify-center">
              {application.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{application.candidateName}</h2>
              <p className="text-sm text-slate-500">Ứng viên đã nộp hồ sơ qua VietWorks</p>
            </div>
          </div>

          <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={application.jobseeker?.email || '--'} />
          <InfoRow icon={<Phone className="w-4 h-4" />} label="Số điện thoại" value={application.jobseeker?.phone || '--'} />
          <InfoRow icon={<MapPin className="w-4 h-4" />} label="Địa điểm mong muốn" value={application.desiredLocation || '--'} />
          <InfoRow icon={<FileText className="w-4 h-4" />} label="CV đã dùng" value={application.cvName || '--'} />
          <InfoRow icon={<Eye className="w-4 h-4" />} label="Thời điểm xem" value={application.viewedAt ? formatDateTime(application.viewedAt) : (markingViewed ? 'Đang cập nhật...' : 'Chưa xem')} />

          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Mốc xử lý</p>
            <div className="mt-3 space-y-3">
              <TimelineItem title="Ứng tuyển" value={formatDateTime(application.appliedAt)} />
              <TimelineItem title="Đã xem" value={application.viewedAt ? formatDateTime(application.viewedAt) : 'Chưa có'} />
            </div>
          </div>
        </section>

        <section className="xl:col-span-2 bg-white border border-slate-200/60 premium-shadow rounded-2xl p-5 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Xem nhanh CV</h3>
              <p className="text-sm text-slate-500 mt-1">Hiển thị CV ứng viên đã dùng để ứng tuyển job này.</p>
            </div>
            {cvPreview?.mode === 'file' && cvPreview.fileUrl ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-primary font-bold border border-blue-100">
                <Eye className="w-4 h-4" /> Đang preview trực tiếp
              </span>
            ) : null}
          </div>

          {cvPreview?.mode === 'online' ? (
            <div className="space-y-4">
              {(cvPreview.sections || []).length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-500">CV online chưa có section để hiển thị nhanh.</div>
              ) : (
                (cvPreview.sections || []).map((section, index) => (
                  <div key={`${section.type || 'section'}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                    <h4 className="font-bold text-slate-900 mb-2">{section.title || section.type || `Mục ${index + 1}`}</h4>
                    <pre className="whitespace-pre-wrap text-sm text-slate-600 font-sans">{JSON.stringify(section.content || section.items || section, null, 2)}</pre>
                  </div>
                ))
              )}
            </div>
          ) : cvPreview?.mode === 'file' ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              {cvPreviewLoading ? (
                <div className="h-[78vh] rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> ?ang t?i CV...
                </div>
              ) : cvBlobUrl ? (
                <object
                  data={cvBlobUrl}
                  type={getObjectMimeType(cvPreview)}
                  className="w-full h-[78vh] rounded-xl border border-slate-200 bg-white"
                >
                  <embed
                    src={cvBlobUrl}
                    type={getObjectMimeType(cvPreview)}
                    className="w-full h-[78vh] rounded-xl border border-slate-200 bg-white"
                  />
                  <div className="p-6 text-center text-slate-500">
                    Trình duyệt không preview được file CV này trực tiếp.
                  </div>
                </object>
              ) : (
                <div className="p-5 text-slate-500">
                  <p className="font-semibold text-slate-900">{cvPreview.fileName || cvPreview.title}</p>
                  <p className="text-sm text-slate-500 mt-1">File CV chưa có đường dẫn preview.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-500">Chưa có dữ liệu CV để preview.</div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Link to={`/employer/jobs/${application.jobId}/applications`} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
              Quay lại danh sách hồ sơ
            </Link>
          </div>
        </section>
      </div>

      {/* REJECT MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 font-bold text-lg">Từ chối ứng viên</div>
            <form onSubmit={handleReject} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Lý do từ chối <span className="text-red-500">*</span></label>
                <textarea required value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="VD: Kinh nghiệm chưa phù hợp..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                <p className="text-xs text-slate-500 mt-1">Ứng viên sẽ nhận được email thông báo kèm theo lý do này.</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setRejectModalOpen(false)} className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200">Hủy</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">Xác nhận từ chối</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTERVIEW MODAL */}
      {interviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 font-bold text-lg">Mời phỏng vấn</div>
            <form onSubmit={handleInterview} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Hình thức</label>
                  <select value={interviewData.format} onChange={e => setInterviewData({...interviewData, format: e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
                    <option value="ONLINE">Online (Trực tuyến)</option>
                    <option value="OFFLINE">Offline (Trực tiếp)</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Thời gian <span className="text-red-500">*</span></label>
                  <input type="datetime-local" required value={interviewData.time} onChange={e => setInterviewData({...interviewData, time: e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Địa chỉ / Link Zoom <span className="text-red-500">*</span></label>
                <input required value={interviewData.location} onChange={e => setInterviewData({...interviewData, location: e.target.value})} placeholder="VD: Tầng 5 tòa VTC Online..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Người liên hệ</label>
                <input value={interviewData.contactPerson} onChange={e => setInterviewData({...interviewData, contactPerson: e.target.value})} placeholder="Tên và SĐT liên lạc..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú thêm</label>
                <textarea value={interviewData.note} onChange={e => setInterviewData({...interviewData, note: e.target.value})} rows={2} placeholder="Mang theo laptop, mặc lịch sự..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setInterviewModalOpen(false)} className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200">Hủy</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">Gửi thư mời</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const getObjectMimeType = () => 'application/pdf';

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">{icon}</div>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5 break-all">{value}</p>
    </div>
  </div>
);

const TimelineItem = ({ title, value }) => (
  <div>
    <p className="text-sm font-semibold text-slate-800">{title}</p>
    <p className="text-sm text-slate-500">{value}</p>
  </div>
);

const formatDateTime = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN');
};

export default ApplicationDetail;




