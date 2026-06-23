import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  TrendingUp,
  MapPin,
  Award,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BarChart3,
  RefreshCw,
  Star
} from 'lucide-react';
import { getSalaryLookupOptions, getSalaryLookup } from '../../../services/salaryService';

const formatMillion = (n) => {
  if (n == null) return '—';
  return new Intl.NumberFormat('vi-VN').format(n);
};

const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <span className="text-sm text-slate-600">{label}</span>
    <span className="text-sm font-bold text-slate-900 text-right">{value}</span>
  </div>
);

const SalaryDistributionChart = ({ distribution = [] }) => {
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));
  return (
    <div className="space-y-2.5">
      {distribution.map((d) => {
        const pct = Math.round((d.count / maxCount) * 100);
        const rangeLabel = d.to == null ? `> ${d.from}` : `${d.from} - ${d.to}`;
        return (
          <div key={d.label} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-xs font-semibold text-slate-500 text-right">
              {rangeLabel}
            </span>
            <div className="flex-1 h-6 rounded-md bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-md bg-gradient-to-r from-[#003f87] to-[#0b6fd6] transition-all"
                style={{ width: `${d.count === 0 ? 0 : Math.max(pct, 4)}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-xs font-bold text-slate-700 text-right">
              {d.count}
            </span>
          </div>
        );
      })}
      <p className="text-[11px] text-slate-400 pt-1">Đơn vị trục: triệu VNĐ/tháng.</p>
    </div>
  );
};

const Field = ({ label, icon: Icon, children, htmlFor }) => (
  <div>
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide"
    >
      {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
      {label}
    </label>
    {children}
  </div>
);

const selectClass =
  'w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-[#003f87] focus:ring-2 focus:ring-blue-100 transition-all';
const selectDisabledClass =
  'disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400';

const SalaryInsight = () => {
  const [options, setOptions] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState(null);

  const [careerGroupId, setCareerGroupId] = useState('');
  const [careerId, setCareerId] = useState('');
  const [careerPositionId, setCareerPositionId] = useState('');
  const [experienceLevelId, setExperienceLevelId] = useState('');
  const [location, setLocation] = useState('');
  const [keyword, setKeyword] = useState('');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getSalaryLookupOptions();
        if (!mounted) return;
        if (res?.success) {
          setOptions(res.data);
        } else {
          setOptionsError('Không thể tải danh mục tra cứu lương.');
        }
      } catch {
        if (mounted) setOptionsError('Không thể tải danh mục tra cứu lương.');
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const careers = useMemo(() => {
    if (!options?.careers || !careerGroupId) return [];
    return options.careers.filter((c) => String(c.careerGroupId) === String(careerGroupId));
  }, [options, careerGroupId]);

  const positions = useMemo(() => {
    if (!options?.careerPositions || !careerId) return [];
    return options.careerPositions.filter((p) => String(p.careerId) === String(careerId));
  }, [options, careerId]);

  const handleCareerGroupChange = useCallback((e) => {
    setCareerGroupId(e.target.value);
    setCareerId('');
    setCareerPositionId('');
  }, []);

  const handleCareerChange = useCallback((e) => {
    setCareerId(e.target.value);
    setCareerPositionId('');
  }, []);

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const params = {};
      if (careerGroupId) params.careerGroupId = careerGroupId;
      if (careerId) params.careerId = careerId;
      if (careerPositionId) params.careerPositionId = careerPositionId;
      if (experienceLevelId) params.experienceLevelId = experienceLevelId;
      if (location.trim()) params.location = location.trim();
      if (keyword.trim()) params.keyword = keyword.trim();

      const res = await getSalaryLookup(params);
      if (res?.success) {
        setResult(res);
      } else {
        setError(res?.message || 'Tra cứu thất bại.');
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Có lỗi xảy ra khi tra cứu. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCareerGroupId('');
    setCareerId('');
    setCareerPositionId('');
    setExperienceLevelId('');
    setLocation('');
    setKeyword('');
    setResult(null);
    setError(null);
  };

  if (loadingOptions) {
    return (
      <main className="max-w-container-max mx-auto px-gutter py-10">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#003f87]" />
        </div>
      </main>
    );
  }

  if (optionsError) {
    return (
      <main className="max-w-container-max mx-auto px-gutter py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold">Không thể tải danh mục</h3>
            <p className="text-sm mt-1">{optionsError}</p>
          </div>
        </div>
      </main>
    );
  }

  const { careerGroups = [], experienceLevels = [] } = options || {};

  return (
    <main className="max-w-container-max mx-auto px-gutter py-10">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-[#003f87] text-xs font-bold uppercase tracking-wider">
          <BarChart3 className="w-3.5 h-3.5" />
          Công cụ tra cứu lương
        </span>
        <h1 className="mt-3 text-3xl md:text-4xl font-black text-slate-900">
          Tra cứu mức lương thị trường
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl leading-relaxed">
          Thống kê được tính từ mức lương các tin tuyển dụng thật đang hiển thị trên VietWorks.
          Chọn vị trí, kinh nghiệm và khu vực để xem khoảng lương phổ biến cho ngành nghề bạn quan tâm.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
            <Search className="w-5 h-5 text-[#003f87]" />
            Bộ lọc tra cứu
          </h2>

          <form onSubmit={handleLookup} className="space-y-5">
            <Field label="Từ khóa vị trí" icon={Search} htmlFor="salary-keyword">
              <input
                id="salary-keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Ví dụ: Lập trình viên Java, Nhân viên kinh doanh..."
                className={selectClass}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Nhóm nghề">
                <select
                  value={careerGroupId}
                  onChange={handleCareerGroupChange}
                  className={`${selectClass}`}
                >
                  <option value="">-- Tất cả nhóm nghề --</option>
                  {careerGroups.map((g) => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Nghề">
                <select
                  value={careerId}
                  onChange={handleCareerChange}
                  disabled={!careerGroupId || careers.length === 0}
                  className={`${selectClass} ${selectDisabledClass}`}
                >
                  <option value="">
                    {!careerGroupId
                      ? '-- Chọn nhóm nghề trước --'
                      : careers.length === 0
                        ? '-- Chưa có nghề --'
                        : '-- Tất cả nghề --'}
                  </option>
                  {careers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Vị trí chuyên môn">
                <select
                  value={careerPositionId}
                  onChange={(e) => setCareerPositionId(e.target.value)}
                  disabled={!careerId || positions.length === 0}
                  className={`${selectClass} ${selectDisabledClass}`}
                >
                  <option value="">
                    {!careerId
                      ? '-- Chọn nghề trước --'
                      : positions.length === 0
                        ? '-- Chưa có vị trí --'
                        : '-- Tất cả vị trí --'}
                  </option>
                  {positions.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Mức kinh nghiệm" icon={Award}>
                <select
                  value={experienceLevelId}
                  onChange={(e) => setExperienceLevelId(e.target.value)}
                  className={selectClass}
                >
                  <option value="">-- Tất cả mức kinh nghiệm --</option>
                  {experienceLevels.map((l) => (
                    <option key={l._id} value={l._id}>{l.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Địa điểm (tỉnh/thành)" icon={MapPin}>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ví dụ: Hà Nội, Hồ Chí Minh..."
                  className={selectClass}
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#003f87] text-white font-bold hover:bg-[#0b4e9f] transition-all shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tra cứu...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Tra cứu ngay
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                Đặt lại
              </button>
              <span className="text-xs text-slate-400 ml-auto">
                * Kết quả chỉ tính các tin đang hiển thị với mức lương cụ thể.
              </span>
            </div>
          </form>
        </section>

        <aside className="lg:col-span-1 lg:sticky lg:top-6 space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="text-sm">{error}</div>
            </div>
          )}

          {!error && !result && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Chọn bộ lọc và bấm{' '}
                <span className="font-bold text-slate-700">"Tra cứu ngay"</span>{' '}
                để xem kết quả thống kê lương.
              </p>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#003f87]" />
              <p className="mt-3 text-sm text-slate-500">Đang tính toán thống kê...</p>
            </div>
          )}

          {!loading && result?.enoughData && (
            <div className="rounded-2xl border-2 border-[#003f87] bg-gradient-to-b from-blue-50/60 to-white p-6 shadow-lg shadow-blue-100">
              <div className="flex items-center gap-2 text-[#003f87]">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Lương trung bình
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">
                  {formatMillion(result.data.averageMillion)}
                </span>
                <span className="text-base font-bold text-slate-500">triệu</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Dựa trên {result.data.sampleSize} tin tuyển dụng đang hiển thị
              </div>

              {result.data.popularRange && (
                <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 shrink-0 fill-amber-400" />
                  <div className="text-sm">
                    <span className="text-amber-800">Khoảng phổ biến nhất: </span>
                    <span className="font-bold text-amber-900">
                      {result.data.popularRange.to == null
                        ? `Trên ${result.data.popularRange.from} triệu`
                        : `${result.data.popularRange.from} - ${result.data.popularRange.to} triệu`}
                    </span>
                    <span className="text-amber-700"> ({result.data.popularRange.count} tin)</span>
                  </div>
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-blue-100 space-y-1 divide-y divide-blue-50">
                <StatRow
                  label="Khoảng lương trung bình"
                  value={`${formatMillion(result.data.averageMinMillion)} - ${formatMillion(result.data.averageMaxMillion)} triệu`}
                />
                <StatRow
                  label="Thấp nhất"
                  value={`${formatMillion(result.data.lowestMillion)} triệu`}
                />
                <StatRow
                  label="Cao nhất"
                  value={`${formatMillion(result.data.highestMillion)} triệu`}
                />
              </div>

              <div className="mt-5 pt-4 border-t border-blue-100 flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>
                  Đơn vị: triệu VNĐ/tháng. Chỉ tính các tin có mức lương cụ thể
                  (không gồm "Thỏa thuận").
                </span>
              </div>
            </div>
          )}

          {!loading && result && result.enoughData === false && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900">
                    Không đủ dữ liệu thống kê
                  </h3>
                  <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                    {result.message ||
                      'Chưa có đủ tin tuyển dụng để tính lương trung bình cho lựa chọn này.'}
                  </p>
                  {result.data?.sampleSize > 0 && (
                    <p className="text-xs text-amber-700 mt-2">
                      Hiện có {result.data.sampleSize} tin phù hợp (cần tối thiểu 3).
                    </p>
                  )}
                  <p className="text-xs text-amber-700 mt-3 leading-relaxed">
                    💡 Gợi ý: Hãy mở rộng bộ lọc — bỏ bớt điều kiện vị trí,
                    kinh nghiệm hoặc địa điểm để có thêm dữ liệu.
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {!loading && result?.enoughData && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Biểu đồ phân bố lương */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#003f87]" />
              Phân bố mức lương
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Số tin tuyển dụng theo từng khoảng lương (triệu VNĐ/tháng).
            </p>
            <SalaryDistributionChart distribution={result.data.distribution} />
          </section>

          {/* Lương theo kinh nghiệm */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#003f87]" />
              Lương theo kinh nghiệm
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Mức lương trung bình theo từng cấp kinh nghiệm.
            </p>
            {result.data.byExperience?.length > 0 ? (
              <div className="space-y-3">
                {result.data.byExperience.map((e) => (
                  <div key={e.experienceLevelId} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{e.name}</div>
                      <div className="text-xs text-slate-400">{e.sampleSize} tin</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#003f87]">
                        {formatMillion(e.averageMillion)} triệu
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatMillion(e.averageMinMillion)} - {formatMillion(e.averageMaxMillion)} triệu
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">Không có dữ liệu theo kinh nghiệm.</p>
            )}
          </section>
        </div>
      )}
    </main>
  );
};

export default SalaryInsight;
