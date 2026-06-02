import { Link } from 'react-router-dom';

const SavedJobs = () => (
  <div className="min-h-screen bg-slate-50 py-8 px-4">
    <main className="mx-auto max-w-5xl space-y-6">
      <Header title="Việc làm đã lưu" description="Danh sách các việc làm bạn đã thả tim để xem lại và ứng tuyển sau." icon="favorite" />
      <EmptyState
        title="Chưa có việc làm đã lưu"
        description="Khi bạn bấm biểu tượng trái tim ở trang việc làm, job sẽ xuất hiện tại đây."
        actionLabel="Tìm việc ngay"
        actionTo="/jobs"
      />
    </main>
  </div>
);

const Header = ({ title, description, icon }) => (
  <section className="rounded-3xl bg-white border border-slate-200 p-6 flex items-center gap-4">
    <div className="h-14 w-14 rounded-2xl bg-blue-50 text-[#003f87] flex items-center justify-center">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div>
      <h1 className="text-2xl font-black text-slate-900">{title}</h1>
      <p className="text-slate-500 mt-1">{description}</p>
    </div>
  </section>
);

const EmptyState = ({ title, description, actionLabel, actionTo }) => (
  <section className="rounded-3xl bg-white border border-slate-200 p-10 text-center">
    <span className="material-symbols-outlined text-[64px] text-slate-300">work</span>
    <h2 className="mt-4 text-xl font-black text-slate-900">{title}</h2>
    <p className="mt-2 text-slate-500">{description}</p>
    <Link to={actionTo} className="inline-flex mt-6 px-5 py-3 rounded-xl bg-[#003f87] text-white font-bold">{actionLabel}</Link>
  </section>
);

export default SavedJobs;
