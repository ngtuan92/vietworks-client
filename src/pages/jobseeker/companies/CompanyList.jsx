
import { Link } from 'react-router-dom';

const companies = [
  { id: 1, name: 'TechNova Solutions', industry: 'Công nghệ', openings: 24 },
  { id: 2, name: 'FinTrust Group', industry: 'Tài chính', openings: 12 },
  { id: 3, name: 'BrightSide Creative', industry: 'Thiết kế', openings: 8 },
];

const CompanyList = () => {
  return (
    <main className="max-w-container-max mx-auto px-gutter py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Khám phá công ty</h1>
        <p className="text-slate-600 mt-2">Danh sách công ty nổi bật và đang tuyển dụng trên VietWorks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Link
            key={company.id}
            to={`/companies/${company.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700">
              {company.name.charAt(0)}
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{company.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{company.industry}</p>
            <p className="mt-4 text-sm font-medium text-blue-700">{company.openings} việc làm đang mở</p>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default CompanyList;
