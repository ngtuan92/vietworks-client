import { Link } from 'react-router-dom';

const MatchedJobs = () => (
  <div className="min-h-screen bg-slate-50 py-8 px-4">
    <main className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <span className="material-symbols-outlined">recommend</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Việc làm phù hợp</h1>
          <p className="text-slate-500 mt-1">Gợi ý dựa trên nhu cầu việc làm, vị trí chuyên môn, lương, kinh nghiệm và địa điểm của bạn.</p>
        </div>
      </section>

      <section className="rounded-3xl bg-white border border-slate-200 p-10 text-center">
        <span className="material-symbols-outlined text-[64px] text-slate-300">manage_search</span>
        <h2 className="mt-4 text-xl font-black text-slate-900">Cập nhật nhu cầu để nhận gợi ý tốt hơn</h2>
        <p className="mt-2 text-slate-500">Hệ thống sẽ dùng dữ liệu nhu cầu việc làm để lọc các job đang tuyển phù hợp nhất.</p>
        <Link to="/job-preferences" className="inline-flex mt-6 px-5 py-3 rounded-xl bg-[#003f87] text-white font-bold">Cập nhật nhu cầu việc làm</Link>
      </section>
    </main>
  </div>
);

export default MatchedJobs;
