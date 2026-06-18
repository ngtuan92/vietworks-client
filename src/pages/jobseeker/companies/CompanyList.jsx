import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, Briefcase, Loader2, Users } from 'lucide-react';
import { getPublicCompanies } from '../../../services/jobseekerService';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicCompanies({ keyword: search, page, limit: 12 });
      setCompanies(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

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
              <Link
                key={company._id}
                to={`/companies/${company._id}`}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl overflow-hidden bg-blue-50">
                  {company.logoUrl
                    ? <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                    : <span className="text-xl font-bold text-blue-700">{company.name?.charAt(0)}</span>
                  }
                </div>
                <h2 className="text-base font-semibold text-slate-900 line-clamp-1">{company.name}</h2>
                {company.industryName && (
                  <p className="mt-1 text-sm text-slate-500">{company.industryName}</p>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                  {company.openJobsCount > 0 && (
                    <span className="flex items-center gap-1 font-semibold text-blue-700">
                      <Briefcase className="w-3.5 h-3.5" />
                      {company.openJobsCount} việc làm
                    </span>
                  )}
                  {company.followersCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {company.followersCount} theo dõi
                    </span>
                  )}
                </div>
              </Link>
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
