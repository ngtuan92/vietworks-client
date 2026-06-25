import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMySubscriptions } from '../../../services/paymentService';

const TABS = [
  { value: 'ACTIVE', label: 'Đang dùng' },
  { value: 'EXPIRED', label: 'Đã hết hạn' },
  { value: 'CANCELLED', label: 'Đã huỷ' },
  { value: '', label: 'Tất cả' }
];

const MySubscriptions = () => {
  const [tab, setTab] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const params = {};
        if (tab) params.status = tab;
        const res = await getMySubscriptions('jobseeker', params);
        if (cancelled) return;
        setItems(res?.data || []);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e.response?.data?.message || 'Lỗi tải danh sách gói');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [tab]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white border border-slate-200/60 premium-shadow rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">workspace_premium</span>
              Gói dịch vụ của tôi
            </h1>
            <p className="text-slate-600 mt-1 text-sm">Theo dõi các gói Boost CV bạn đang sử dụng.</p>
          </div>
          <Link
            to="/premium"
            className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 transition-all"
          >
            Khám phá gói mới
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 border-b border-slate-200 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 -mb-px border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
                tab === t.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 mt-3">Đang tải...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((it) => (
                <SubscriptionCard key={it._id} item={it} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE: { label: 'Đang dùng', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    EXPIRED: { label: 'Hết hạn', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    CANCELLED: { label: 'Đã huỷ', cls: 'bg-red-50 text-red-700 border-red-200' }
  };
  const m = map[status] || map.EXPIRED;
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${m.cls}`}>{m.label}</span>;
};

const SubscriptionCard = ({ item }) => {
  const pkg = item.packageId;
  const isActive = item.status === 'ACTIVE';

  return (
    <div className="rounded-xl border border-slate-200 hover:border-primary/40 hover:shadow-md transition-all p-4 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 truncate">{pkg?.name || item.packageCode}</h3>
            <StatusBadge status={item.status} />
          </div>
          {item.targetTitle && (
            <p className="text-sm text-slate-600 mt-1">
              <span className="text-slate-400">{item.targetType === 'JOB' ? 'Job: ' : 'CV: '}</span>
              <span className="font-medium">{item.targetTitle}</span>
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary">{Number(item.pricePaid).toLocaleString('vi-VN')}</div>
          <div className="text-xs text-slate-500">VNĐ</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-slate-50 p-2">
          <div className="text-slate-500">Bắt đầu</div>
          <div className="font-semibold text-slate-800">
            {item.startedAt ? new Date(item.startedAt).toLocaleDateString('vi-VN') : '-'}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <div className="text-slate-500">Hết hạn</div>
          <div className="font-semibold text-slate-800">
            {item.expiredAt ? new Date(item.expiredAt).toLocaleDateString('vi-VN') : '-'}
          </div>
        </div>
      </div>

      {isActive && item.daysRemaining !== null && (
        <div className="mt-3 text-sm">
          <span className="text-slate-500">Còn lại: </span>
          <span className={`font-bold ${item.daysRemaining <= 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {item.daysRemaining} ngày
          </span>
        </div>
      )}

      {!isActive && (
        <Link to="/premium" className="mt-3 inline-block text-sm text-primary font-semibold hover:underline">
          Mua lại →
        </Link>
      )}
    </div>
  );
};

const EmptyState = ({ tab }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
      <span className="material-symbols-outlined text-4xl">inventory_2</span>
    </div>
    <p className="text-slate-500 mt-4">
      {tab === 'ACTIVE'
        ? 'Bạn chưa có gói nào đang hoạt động.'
        : tab === 'EXPIRED'
        ? 'Chưa có gói nào hết hạn.'
        : tab === 'CANCELLED'
        ? 'Chưa có gói nào bị huỷ.'
        : 'Bạn chưa từng mua gói nào.'}
    </p>
    <Link to="/premium" className="inline-block mt-4 px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/95">
      Khám phá gói dịch vụ
    </Link>
  </div>
);

export default MySubscriptions;
