import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, MessageCircle, CheckCircle2, XCircle } from 'lucide-react';

const statusMap = {
  UNREAD: { label: 'CHƯA XEM', color: 'bg-slate-100 text-slate-700' },
  VIEWED: { label: 'ĐÃ XEM', color: 'bg-amber-100 text-amber-800' },
  APPROVED: { label: 'CHẤP NHẬN', color: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'TỪ CHỐI', color: 'bg-red-100 text-red-700' },
};

const ApplicationDetail = () => {
  const { id } = useParams();
  const [status, setStatus] = useState('VIEWED');
  const [internalNote, setInternalNote] = useState('');
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [log, setLog] = useState([
    { at: '18/05/2026 10:22', text: 'Ứng viên đã nộp hồ sơ' },
    { at: '18/05/2026 10:35', text: 'Nhà tuyển dụng đã xem CV' },
  ]);

  const current = useMemo(() => statusMap[status], [status]);

  const onApprove = (payload) => {
    setStatus('APPROVED');
    setLog((prev) => [...prev, { at: new Date().toLocaleString('vi-VN'), text: `Gửi lời mời: ${payload.title}` }]);
    setShowApprove(false);
  };

  const onReject = (payload) => {
    setStatus('REJECTED');
    setLog((prev) => [...prev, { at: new Date().toLocaleString('vi-VN'), text: `Từ chối ứng viên: ${payload.reason}` }]);
    setShowReject(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chi tiết CV ứng viên</h1>
        <p className="text-slate-600 mt-1">Application #{id} • Senior Backend Developer</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-8 bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Preview CV</h2>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 hover:shadow-sm transition-all">
              <Download className="w-4 h-4" />
              Tải CV
            </button>
          </div>
          <div className="h-[700px] bg-slate-50 flex items-center justify-center text-slate-500">
            Vùng xem trước PDF / CV Online
          </div>
        </section>

        <section className="xl:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-5">
            <h3 className="font-bold text-slate-900">Thông tin ứng tuyển</h3>
            <div className="mt-3 space-y-2 text-sm">
              <Info label="Ứng viên" value="Nguyễn Minh Anh" />
              <Info label="Email" value="minhanh@gmail.com" />
              <Info label="Số điện thoại" value="09xxxxxx123" />
              <Info label="Job đã nộp" value="Senior Backend Developer" />
              <Info label="Thời gian nộp" value="18/05/2026 10:22" />
              <Info label="Địa điểm mong muốn" value="TP. Hồ Chí Minh - Quận 1" />
            </div>
            <div className="mt-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${current.color}`}>{current.label}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-5">
            <h3 className="font-bold text-slate-900">Lịch sử xử lý</h3>
            <div className="mt-3 space-y-3">
              {log.map((item, idx) => (
                <div key={idx} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <div className="text-xs text-slate-500">{item.at}</div>
                  <div className="text-sm text-slate-700 mt-1">{item.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-5 space-y-3">
            <h3 className="font-bold text-slate-900">Hành động</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-600 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-sm">
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
              <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 font-bold hover:bg-slate-200 hover:text-slate-900 hover:shadow-md hover:-translate-y-0.5 transition-all text-sm">
                <Download className="w-4 h-4" />
                Tải CV
              </button>
              <button onClick={() => setShowApprove(true)} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold hover:bg-emerald-500 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Đồng ý
              </button>
              <button onClick={() => setShowReject(true)} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-red-50 text-red-700 border border-red-200 font-bold hover:bg-red-600 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-sm">
                <XCircle className="w-4 h-4" />
                Từ chối
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú nội bộ</label>
              <textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full min-h-24 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                placeholder="Ghi chú cho HR nội bộ..."
              />
            </div>
          </div>
        </section>
      </div>

      {showApprove ? <ApproveModal onClose={() => setShowApprove(false)} onSubmit={onApprove} /> : null}
      {showReject ? <RejectModal onClose={() => setShowReject(false)} onSubmit={onReject} /> : null}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="text-slate-500">{label}</div>
    <div className="text-slate-800 font-medium text-right">{value}</div>
  </div>
);

const ApproveModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    interviewTime: '',
    interviewType: '',
    interviewAddress: '',
  });

  const change = (e) => setForm((p) => ({ ...p, [e.target.id]: e.target.value }));

  return (
    <Modal title="Đồng ý / Hẹn phỏng vấn" onClose={onClose}>
      <div className="space-y-3">
        <Field id="title" label="Tiêu đề lời mời" required value={form.title} onChange={change} />
        <TextArea id="content" label="Nội dung lời mời" required value={form.content} onChange={change} />
        <Field id="interviewTime" type="datetime-local" label="Thời gian phỏng vấn" value={form.interviewTime} onChange={change} />
        <Select id="interviewType" label="Hình thức phỏng vấn" value={form.interviewType} onChange={change} options={['Trực tiếp', 'Online', 'Qua điện thoại']} />
        <Field id="interviewAddress" label="Địa điểm / Link meeting" value={form.interviewAddress} onChange={change} />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 font-semibold">Hủy</button>
        <button
          onClick={() => onSubmit(form)}
          disabled={!form.title || !form.content}
          className={`px-4 py-2 rounded-xl font-semibold ${form.title && form.content ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
        >
          Gửi lời mời
        </button>
      </div>
    </Modal>
  );
};

const RejectModal = ({ onClose, onSubmit }) => {
  const [reasonTemplate, setReasonTemplate] = useState('');
  const [reason, setReason] = useState('');
  const quick = [
    'Chưa phù hợp với yêu cầu công việc',
    'Thiếu kinh nghiệm cần thiết',
    'Công ty đã tuyển đủ số lượng',
    'Hồ sơ chưa đầy đủ thông tin',
    'Lý do khác',
  ];

  return (
    <Modal title="Từ chối ứng viên" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Mẫu lý do nhanh</label>
          <select
            value={reasonTemplate}
            onChange={(e) => {
              setReasonTemplate(e.target.value);
              setReason(e.target.value);
            }}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary bg-white"
          >
            <option value="">Chọn mẫu...</option>
            {quick.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <TextArea
          id="reason"
          label="Lý do từ chối"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 font-semibold">Hủy</button>
        <button
          onClick={() => onSubmit({ reason })}
          disabled={!reason}
          className={`px-4 py-2 rounded-xl font-semibold ${reason ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
        >
          Gửi từ chối
        </button>
      </div>
    </Modal>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className="w-full max-w-2xl bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

const Field = ({ id, label, value, onChange, required = false, type = 'text' }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label} {required ? <span className="text-red-600">*</span> : null}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
      required={required}
    />
  </div>
);

const TextArea = ({ id, label, value, onChange, required = false }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label} {required ? <span className="text-red-600">*</span> : null}
    </label>
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      className="w-full min-h-24 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
      required={required}
    />
  </div>
);

const Select = ({ id, label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary bg-white"
    >
      <option value="">Chọn...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default ApplicationDetail;
