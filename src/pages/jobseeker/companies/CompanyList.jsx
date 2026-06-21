import { useState, useEffect } from 'react';
import { Search, Building2, Loader2 } from 'lucide-react';
import { getPublicCompanies } from '../../../services/jobseekerService';
import { useNotification } from '../../../contexts/NotificationContext';
import { useAuthStore } from '../../../store/authStore';
import {
  followCompany,
  unfollowCompany,
  getFollowedCompanies
} from '../../../services/jobseekerService';
import CompanyCard from '../../../components/common/CompanyCard';

const CompanyList = () => {
  const { confirm, error: showError } = useNotification();
  const { isAuthenticated } = useAuthStore();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [followedIds, setFollowedIds] = useState(new Set());
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getPublicCompanies({ keyword: search, page, limit: 12 });
        if (cancelled) return;
        setCompanies(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotal(data.pagination?.total || 0);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [search, page]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getFollowedCompanies({ limit: 200 });
        if (cancelled) return;
        const ids = new Set();
        (res.data || []).forEach((f) => {
          if (f.company?._id) ids.add(f.company._id.toString());
        });
        setFollowedIds(ids);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const handleFollowToggle = (companyId) => {
    if (!isAuthenticated) {
      confirm(
        'Bạn cần đăng nhập để theo dõi công ty. Vui lòng đăng nhập để tiếp tục.',
        () => { window.location.href = '/login'; },
        null,
        'Yêu cầu đăng nhập',
        'Đăng nhập',
        'Hủy'
      );
      return;
    }
    const wasFollowing = followedIds.has(String(companyId));
    setBusyId(companyId);
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (wasFollowing) next.delete(String(companyId));
      else next.add(String(companyId));
      return next;
    });
    (async () => {
      try {
        if (wasFollowing) await unfollowCompany(companyId);
        else await followCompany(companyId);
      } catch {
        setFollowedIds((prev) => {
          const next = new Set(prev);
          if (wasFollowing) next.add(String(companyId));
          else next.delete(String(companyId));
          return next;
        });
        showError?.('Không thể cập nhật trạng thái theo dõi.');
      } finally {
        setBusyId(null);
      }
    })();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(keyword);
  };

  return (
    <main className="max-w-container-max mx-auto px-gutter py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Khám phá công ty</h1>
        <p className="text-slate-600 mt-2">Danh sách công ty nổi bật và đang tuyển dụng trên VietWorks.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Tìm tên công ty..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-primary transition-all"
          />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 transition">
          Tìm kiếm
        </button>
      </form>

      {total > 0 && (
        <p className="text-sm text-slate-500 mb-4">Tìm thấy <span className="font-bold text-slate-700">{total}</span> công ty</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-semibold">Không tìm thấy công ty nào</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <CompanyCard
                key={company._id}
                company={company}
                openJobsCount={company.openJobsCount || 0}
                followMode={followedIds.has(String(company._id)) ? 'remove' : 'add'}
                onFollowClick={handleFollowToggle}
                disabled={busyId === company._id}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition ${p === page ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default CompanyList;
