import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Star,
  Briefcase,
  DollarSign,
  Users,
  ChevronDown,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';
import { EXPERIENCE_LEVELS } from '../../../constants/masterDataConstants';
import { getSalaryLookupOptions, getSalaryLookup } from '../../../services/salaryService';
import { getPublicJobs } from '../../../services/jobService';
import { Link } from 'react-router-dom';

const formatMillion = (n) => {
  if (n == null) return '—';
  return new Intl.NumberFormat('vi-VN').format(n);
};

const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-blue-50 last:border-0">
    <span className="text-sm text-slate-500 font-medium">{label}</span>
    <span className="text-sm font-bold text-slate-800 text-right">{value}</span>
  </div>
);

const SalaryDistributionChart = ({ distribution = [] }) => {
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));
  return (
    <div className="space-y-2">
      {distribution.map((d, idx) => {
        const pct = Math.round((d.count / maxCount) * 100);
        const rangeLabel = d.to == null ? `> ${d.from}` : `${d.from} - ${d.to}`;
        return (
          <motion.div
            key={d.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="flex items-center gap-3 group"
          >
            <span className="w-20 shrink-0 text-xs font-semibold text-slate-400 text-right tabular-nums">
              {rangeLabel}
            </span>
            <div className="flex-1 h-7 rounded-lg bg-slate-100 overflow-hidden relative">
              <motion.div
                className="h-full rounded-lg bg-gradient-to-r from-[#0056B3] to-[#0ea5e9]"
                initial={{ width: 0 }}
                animate={{ width: `${d.count === 0 ? 0 : Math.max(pct, 3)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.05 }}
              />
              {d.count > 0 && (
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-[11px] font-bold text-white drop-shadow-sm">
                    {d.count} tin
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
      <p className="text-[11px] text-slate-400 pt-2 flex items-center gap-1">
        <Info className="w-3 h-3" />
        Đơn vị: triệu VNĐ/tháng
      </p>
    </div>
  );
};

const Field = ({ label, icon: Icon, children, htmlFor }) => (
  <div>
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider"
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </label>
    {children}
  </div>
);

const selectClass =
  'w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-[#0056B3] focus:ring-2 focus:ring-blue-100 transition-all duration-200 appearance-none cursor-pointer hover:border-slate-300';
const selectDisabledClass =
  'disabled:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:border-slate-200';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const SalaryInsight = () => {
  const [options, setOptions] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState(null);

  const [careerGroupId, setCareerGroupId] = useState('');
  const [careerId, setCareerId] = useState('');
  const [careerPositionId, setCareerPositionId] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
    setSuggestedJobs([]);
    setHasSearched(true);
    try {
      const params = {};
      if (careerGroupId) params.careerGroupId = careerGroupId;
      if (careerId) params.careerId = careerId;
      if (careerPositionId) params.careerPositionId = careerPositionId;
      if (experience) params.experience = experience;
      if (location.trim()) params.location = location.trim();

      const res = await getSalaryLookup(params);
      if (res?.success) {
        setResult(res);
      } else {
        setError(res?.message || 'Tra cứu thất bại.');
      }

      // Fetch gợi ý việc làm cùng filter
      setLoadingJobs(true);
      try {
        const jobParams = { limit: 6 };
        if (careerGroupId) jobParams.careerGroupId = careerGroupId;
        if (careerId) jobParams.careerId = careerId;
        if (experience) jobParams.experience = experience;
        if (location.trim()) jobParams.location = location.trim();
        const jobRes = await getPublicJobs(jobParams);
        setSuggestedJobs(jobRes?.data || []);
      } catch {
        setSuggestedJobs([]);
      } finally {
        setLoadingJobs(false);
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
    setExperience('');
    setLocation('');
    setResult(null);
    setError(null);
    setSuggestedJobs([]);
    setHasSearched(false);
  };

  const hasFilters = careerGroupId || careerId || careerPositionId || experience || location;

  // ── Loading ──
  if (loadingOptions) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
        <div className="max-w-container-max mx-auto px-gutter py-24 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 animate-spin text-[#0056B3]" />
            <div className="absolute inset-0 blur-xl opacity-30 bg-[#0056B3] rounded-full animate-pulse" />
          </div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Đang tải dữ liệu tra cứu...</p>
        </div>
      </div>
    );
  }

  // ── Lỗi load options ──
  if (optionsError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
        <div className="max-w-container-max mx-auto px-gutter py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-lg shadow-rose-100/50"
          >
            <div className="mx-auto w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Không thể tải danh mục</h3>
            <p className="text-sm text-rose-600 mb-6">{optionsError}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Tải lại trang
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const { careerGroups = [], experienceLevels = [], provinces = [] } = options || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* ════════════════════════════════════════════ */}
      {/* HERO BANNER */}
      {/* ════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden hero-gradient"
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl animate-pulse" />
        </div>

        <div className="relative max-w-container-max mx-auto px-gutter py-14 md:py-20">
          <motion.div {...fadeUp} className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              Công cụ thông minh
            </span>
            <h1 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              Tra cứu mức lương
              <span className="block text-blue-200">thị trường lao động</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-blue-100/80 max-w-2xl leading-relaxed">
              Thống kê từ dữ liệu tin tuyển dụng thực tế — giúp bạn nắm bắt mặt bằng lương,
              thương lượng công bằng và định hướng sự nghiệp chính xác.
            </p>

            {/* Quick stats */}
            <div className="mt-8 flex flex-wrap gap-6">
              {[
                { icon: DollarSign, label: 'Dữ liệu thực tế', desc: 'Từ tin tuyển dụng thật' },
                { icon: Users, label: 'Cập nhật liên tục', desc: 'Theo thị trường lao động' },
                { icon: BarChart3, label: 'Phân tích chi tiết', desc: 'Theo vị trí & kinh nghiệm' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 text-white/80">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{s.label}</div>
                    <div className="text-xs text-blue-200/70">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/5 to-transparent" />
      </motion.section>

      {/* ════════════════════════════════════════════ */}
      {/* MAIN CONTENT */}
      {/* ════════════════════════════════════════════ */}
      <section className="max-w-container-max mx-auto px-gutter -mt-8 relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ──────────── FILTER FORM ──────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/50 overflow-hidden premium-shadow">
              {/* Filter header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-white flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0056B3]/10 flex items-center justify-center">
                    <Search className="w-4 h-4 text-[#0056B3]" />
                  </div>
                  Bộ lọc tra cứu
                </h2>
                {hasFilters && (
                  <span className="text-[11px] font-semibold text-[#0056B3] bg-blue-50 px-3 py-1 rounded-full">
                    Đã chọn {[careerGroupId, careerId, careerPositionId, experience, location].filter(Boolean).length} điều kiện
                  </span>
                )}
              </div>

              <form onSubmit={handleLookup} className="p-6 space-y-5">

                {/* Row 1: Nhóm nghề + Nghề */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Nhóm nghề" icon={Briefcase}>
                    <div className="relative">
                      <select
                        value={careerGroupId}
                        onChange={handleCareerGroupChange}
                        className={`${selectClass} appearance-none`}
                      >
                        <option value="">Tất cả nhóm nghề</option>
                        {careerGroups.map((g) => (
                          <option key={g._id} value={g._id}>{g.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="Nghề">
                    <div className="relative">
                      <select
                        value={careerId}
                        onChange={handleCareerChange}
                        disabled={!careerGroupId || careers.length === 0}
                        className={`${selectClass} ${selectDisabledClass} appearance-none`}
                      >
                        <option value="">
                          {!careerGroupId
                            ? 'Chọn nhóm nghề trước'
                            : careers.length === 0
                              ? 'Chưa có nghề'
                              : 'Tất cả nghề'}
                        </option>
                        {careers.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>
                </div>

                {/* Row 2: Vị trí chuyên môn + Mức kinh nghiệm */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Vị trí chuyên môn">
                    <div className="relative">
                      <select
                        value={careerPositionId}
                        onChange={(e) => setCareerPositionId(e.target.value)}
                        disabled={!careerId || positions.length === 0}
                        className={`${selectClass} ${selectDisabledClass} appearance-none`}
                      >
                        <option value="">
                          {!careerId
                            ? 'Chọn nghề trước'
                            : positions.length === 0
                              ? 'Chưa có vị trí'
                              : 'Tất cả vị trí'}
                        </option>
                        {positions.map((p) => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="Mức kinh nghiệm" icon={Award}>
                    <div className="relative">
                      <input
                        type="text"
                        list="experience-list"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="Tất cả mức kinh nghiệm"
                        className={`${selectClass}`}
                      />
                      <datalist id="experience-list">
                        {EXPERIENCE_LEVELS.map((l) => (
                          <option key={l} value={l} />
                        ))}
                      </datalist>
                    </div>
                  </Field>
                </div>

                {/* Row 3: Địa điểm */}
                <div>
                  <Field label="Địa điểm (tỉnh/thành)" icon={MapPin}>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className={`${selectClass} pl-10 appearance-none`}
                      >
                        <option value="">Tất cả tỉnh/thành</option>
                        {provinces.map((p) => {
                          const provinceName = p.name || p.provinceName || '';
                          const provinceCode = p.code || p.provinceCode || provinceName;
                          return (
                            <option key={provinceCode} value={provinceName}>
                              {provinceName}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0056B3] text-white font-bold hover:bg-[#004491] transition-all shadow-lg shadow-blue-200/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
                  </motion.button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Đặt lại
                  </button>
                  <span className="text-[11px] text-slate-400 ml-auto hidden sm:flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Chỉ tính tin có mức lương cụ thể
                  </span>
                </div>
              </form>
            </div>
          </motion.div>

          {/* ──────────── SIDEBAR ──────────── */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1 lg:sticky lg:top-6 space-y-4"
          >
            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-rose-200 bg-white p-5 shadow-lg shadow-rose-100/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-rose-800">Tra cứu thất bại</h4>
                      <p className="text-sm text-rose-600 mt-0.5">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            {!error && !result && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/50 p-8 text-center premium-shadow"
              >
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-[#0056B3]" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">Chờ dữ liệu</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Chọn bộ lọc phía bên trái và bấm{' '}
                  <span className="font-bold text-[#0056B3]">"Tra cứu ngay"</span>{' '}
                  để xem thống kê lương thị trường.
                </p>
                {/* Decorative chart mini */}
                <div className="mt-6 flex items-end justify-center gap-1.5 h-16 opacity-30">
                  {[30, 55, 40, 70, 45, 60, 35, 50, 65, 38].map((h, i) => (
                    <div
                      key={i}
                      className="w-3 rounded-t-md bg-gradient-to-t from-[#0056B3] to-blue-300"
                      style={{ height: `${h * 0.7}px` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Loading */}
            {loading && (
              <div className="rounded-2xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/50 p-10 text-center">
                <div className="relative mx-auto w-14 h-14">
                  <Loader2 className="w-14 h-14 animate-spin text-[#0056B3]" />
                  <div className="absolute inset-0 blur-xl opacity-20 bg-[#0056B3] rounded-full" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-500">Đang phân tích dữ liệu...</p>
                <div className="mt-4 flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#0056B3] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ─── Result Summary Card ─── */}
            <AnimatePresence>
              {!loading && result?.enoughData && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="rounded-2xl bg-white border-2 border-[#0056B3]/20 shadow-xl shadow-blue-100/50 overflow-hidden premium-shadow"
                >
                  {/* Summary gradient header */}
                  <div className="bg-gradient-to-r from-[#0056B3] to-[#0ea5e9] p-5 text-white">
                    <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-wider mb-1">
                      <TrendingUp className="w-4 h-4" />
                      Lương trung bình
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-4xl md:text-5xl font-black">
                        {formatMillion(result.data.averageMillion)}
                      </span>
                      <span className="text-lg font-bold text-white/80">triệu</span>
                    </div>
                    <div className="mt-1.5 text-sm text-white/70 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Dựa trên {result.data.sampleSize} tin tuyển dụng
                    </div>
                  </div>

                  {/* Popular range badge */}
                  {result.data.popularRange && (
                    <div className="mx-5 mt-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-3.5 flex items-start gap-2.5">
                      <Star className="w-5 h-5 text-amber-500 shrink-0 fill-amber-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Phổ biến nhất</div>
                        <div className="mt-0.5 text-sm font-bold text-amber-900">
                          {result.data.popularRange.to == null
                            ? `Trên ${result.data.popularRange.from} triệu`
                            : `${result.data.popularRange.from} - ${result.data.popularRange.to} triệu`}
                        </div>
                        <div className="text-xs text-amber-600 mt-0.5">
                          {result.data.popularRange.count} tin trong khoảng này
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats breakdown */}
                  <div className="px-5 py-4 space-y-0.5">
                    <StatRow
                      label="Khoảng lương TB"
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

                  {/* Footer note */}
                  <div className="mx-5 mb-5 pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Đơn vị triệu VNĐ/tháng. Không gồm tin "Thỏa thuận".</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── Insufficient data ─── */}
            <AnimatePresence>
              {!loading && result && result.enoughData === false && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-white border border-amber-200 shadow-lg shadow-amber-100/30 p-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-amber-900 text-sm">Chưa đủ dữ liệu</h3>
                      <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                        {result.message || 'Chưa có đủ tin tuyển dụng để thống kê.'}
                      </p>
                      {result.data?.sampleSize > 0 && (
                        <p className="text-xs text-amber-600 mt-2 font-semibold">
                          Hiện có {result.data.sampleSize} tin (cần ≥ 3).
                        </p>
                      )}
                      <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-3">
                        <p className="text-xs text-amber-700 leading-relaxed">
                          💡 <span className="font-semibold">Gợi ý:</span> Mở rộng bộ lọc — bỏ bớt điều kiện vị trí, kinh nghiệm hoặc địa điểm.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* CHARTS SECTION */}
        {/* ════════════════════════════════════════════ */}
        <AnimatePresence>
          {!loading && result?.enoughData && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
            >
              {/* Distribution chart */}
              <section className="rounded-2xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/50 p-6 premium-shadow">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-[#0056B3]" />
                    </div>
                    Phân bố mức lương
                  </h2>
                  <span className="text-[11px] text-slate-400 font-medium">{result.data.distribution?.length || 0} khoảng</span>
                </div>
                <p className="text-xs text-slate-400 mb-5 ml-9">Số tin tuyển dụng theo từng khoảng lương.</p>
                <SalaryDistributionChart distribution={result.data.distribution} />
              </section>

              {/* By experience */}
              <section className="rounded-2xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/50 p-6 premium-shadow">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Award className="w-4 h-4 text-[#0056B3]" />
                    </div>
                    Lương theo kinh nghiệm
                  </h2>
                  {result.data.byExperience?.length > 0 && (
                    <span className="text-[11px] text-slate-400 font-medium">{result.data.byExperience.length} mức</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-5 ml-9">Lương trung bình và khoảng lương phổ biến theo từng cấp kinh nghiệm.</p>
                {result.data.byExperience?.length > 0 ? (
                  <div className="space-y-2">
                    {result.data.byExperience.map((e, idx) => (
                      <motion.div
                        key={e.experience}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08, duration: 0.3 }}
                        className="group rounded-xl border border-slate-100 bg-white hover:bg-blue-50/30 hover:border-blue-100 transition-all duration-200 px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-[#0056B3] transition-colors">
                              {e.name}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {e.sampleSize} tin
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-base font-bold text-[#0056B3] tabular-nums">
                              {formatMillion(e.averageMillion)} <span className="text-xs font-medium text-slate-400">triệu</span>
                            </div>
                            <div className="text-[11px] text-slate-400 tabular-nums flex items-center gap-1 justify-end">
                              <span className="text-[10px] text-slate-300 font-medium">Khoảng:</span>
                              {formatMillion(e.averageMinMillion)} – {formatMillion(e.averageMaxMillion)} tr
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <BarChart3 className="w-10 h-10 text-slate-200 mx-auto" />
                    <p className="text-sm text-slate-400 mt-3">Chưa có dữ liệu theo kinh nghiệm.</p>
                  </div>
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════ */}
        {/* CÔNG TY TRẢ LƯƠNG CAO NHẤT */}
        {/* ════════════════════════════════════════════ */}
        <AnimatePresence>
          {!loading && result?.enoughData && result.data.topCompanies?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-6"
            >
              <section className="rounded-2xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/50 p-6 premium-shadow">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Star className="w-4 h-4 text-amber-500" />
                    </div>
                    Công ty trả lương cao nhất
                  </h2>
                  <span className="text-[11px] text-slate-400 font-medium">{result.data.topCompanies.length} công ty</span>
                </div>
                <p className="text-xs text-slate-400 mb-5 ml-9">Top công ty có mức lương trung bình cao nhất trong ngành này.</p>

                <div className="space-y-2">
                  {result.data.topCompanies.map((c, idx) => (
                    <motion.div
                      key={c.companyId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06, duration: 0.3 }}
                    >
                      <Link
                        to={`/companies/${c.slug || c.companyId}`}
                        className="group flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-white hover:border-amber-200 hover:bg-amber-50/30 hover:shadow-sm transition-all"
                      >
                        {/* Rank badge */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${idx === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm' :
                            idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                              idx === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-800 text-white' :
                                'bg-slate-100 text-slate-400'
                          }`}>
                          {idx + 1}
                        </div>

                        {/* Company info */}
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm shrink-0 overflow-hidden">
                          {c.avatarUrl
                            ? <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : (c.name || '?').charAt(0)
                          }
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 group-hover:text-amber-700 transition-colors truncate">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {c.sampleSize} tin tuyển dụng
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-base font-bold text-amber-600 tabular-nums">
                            {formatMillion(c.averageMillion)} <span className="text-xs font-medium text-slate-400">triệu</span>
                          </div>
                          <div className="text-[11px] text-slate-400 tabular-nums">
                            {formatMillion(c.averageMinMillion)} – {formatMillion(c.averageMaxMillion)} tr
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════ */}
        {/* GỢI Ý VIỆC LÀM */}
        {/* ════════════════════════════════════════════ */}
        <AnimatePresence>
          {!loading && hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <section className="rounded-2xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/50 p-6 premium-shadow mt-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-emerald-600" />
                      </div>
                      Việc làm gợi ý cho bạn
                    </h2>
                    <p className="text-xs text-slate-400 ml-9 mt-0.5">
                      Các tin tuyển dụng phù hợp với ngành nghề bạn đã chọn.
                    </p>
                  </div>
                  <Link
                    to="/jobs"
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
                  >
                    Xem tất cả <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {loadingJobs ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : suggestedJobs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestedJobs.slice(0, 6).map((job) => {
                      const company = job.companyId || job.company || {};
                      const salary = job.salary || {};
                      const salaryText =
                        salary.type === 'NEGOTIABLE' || (!salary.minMillion && !salary.maxMillion)
                          ? 'Thỏa thuận'
                          : salary.minMillion && salary.maxMillion
                            ? `${salary.minMillion} - ${salary.maxMillion} tr`
                            : salary.minMillion
                              ? `Từ ${salary.minMillion} tr`
                              : `Đến ${salary.maxMillion} tr`;

                      return (
                        <Link
                          key={job._id}
                          to={`/jobs/${job._id}`}
                          className="group block p-4 rounded-xl border border-slate-100 bg-white hover:border-primary/30 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm shrink-0 overflow-hidden">
                              {company.avatarUrl
                                ? <img src={company.avatarUrl} alt="" className="w-full h-full object-cover" />
                                : (company.name || job.title || '?').charAt(0)
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors truncate">
                                {job.title}
                              </h3>
                              <p className="text-xs text-slate-500 truncate mt-0.5">{company.name || '—'}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs">
                                {job.workLocations?.[0]?.provinceName && (
                                  <span className="flex items-center gap-1 text-slate-400">
                                    <MapPin className="w-3 h-3" />
                                    {job.workLocations[0].provinceName}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 font-semibold text-emerald-600 ml-auto">
                                  <DollarSign className="w-3 h-3" />
                                  {salaryText}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-slate-200 mb-2" />
                    <p className="text-sm font-medium">Chưa có việc làm gợi ý phù hợp.</p>
                  </div>
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default SalaryInsight;
