import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Loader2, Heart, Search
} from 'lucide-react';
import {
  getFollowedCompanies,
  unfollowCompany
} from '../../../services/jobseekerService';
import { useNotification } from '../../../contexts/NotificationContext';
import CompanyCard from '../../../components/common/CompanyCard';

const FollowedCompanies = () => {
  const { error: showError } = useNotification();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  const fetchList = () => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getFollowedCompanies({ page, limit: 12 });
        if (cancelled) return;
        const list = (data.data || []).map((f) => f.company).filter(Boolean);
        setCompanies(list);
        setTotalPages(data.pagination?.pages || 1);
        setTotal(data.pagination?.total || list.length);
      } catch {
        if (!cancelled) showError?.('Không thể tải danh sách công ty đang theo dõi.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  };

  useEffect(() => {
    const cleanup = fetchList();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, showError]);

  const filtered = companies.filter((c) => {
    if (!search.trim()) return true;
    const kw = search.toLowerCase();
    return c.name?.toLowerCase().includes(kw);
  });

  const handleUnfollow = (id) => {
    setBusyId(id);
    setCompanies((prev) => prev.filter((c) => c._id !== id));
    setTotal((t) => Math.max(t - 1, 0));
    unfollowCompany(id)
      .catch(() => {
        showError?.('Bỏ theo dõi thất bại. Vui lòng thử lại.');
        fetchList();
      })
      .finally(() => setBusyId(null));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(keyword);
  };

  return (
    <main className="max-w-container-max mx-auto px-gutter py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/companies"
          className="text-sm text-slate-500 hover:text-primary transition flex items-center gap-1"
        >
          ← Khám phá công ty
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-7 h-7 text-primary" />
          Công ty đang theo dõi
        </h1>
        <p className="text-slate-600 mt-2">
          Danh sách các công ty bạn quan tâm. Bỏ theo dõi khi không còn phù hợp.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên công ty..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-primary transition-all"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 transition"
        >
          Tìm kiếm
        </button>
      </form>

      {total > 0 && (
        <p className="text-sm text-slate-500 mb-4">
          Đang theo dõi <span className="font-bold text-slate-700">{total}</span> công ty
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="w-16 h-16 rounded-full bg-red-50 mx-auto flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-700 mb-2">Bạn chưa theo dõi công ty nào</h2>
          <p className="text-sm text-slate-500 mb-6">
            Theo dõi công ty để nhận gợi ý việc làm mới nhất từ họ.
          </p>
          <Link
            to="/companies"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 transition"
          >
            <Building2 className="w-4 h-4" />
            Khám phá công ty
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((company) => (
              <CompanyCard
                key={company._id}
                company={company}
                openJobsCount={company.openJobsCount || 0}
                followMode="remove"
                onFollowClick={handleUnfollow}
                disabled={busyId === company._id}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                    p === page
                      ? 'bg-primary text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
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

export default FollowedCompanies;
