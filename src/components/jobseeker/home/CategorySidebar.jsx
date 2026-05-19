

const CategorySidebar = () => {
  const categories = [
    { name: 'Kinh doanh / Bán lẻ', icon: 'sell' },
    { name: 'Marketing / PR', icon: 'campaign' },
    { name: 'Công nghệ thông tin', icon: 'terminal' },
  ];

  return (
    <div className="md:col-span-3 bg-white rounded-xl shadow-sm p-stack-md border border-outline-variant">
      <div className="space-y-1">
        {categories.map((cat, index) => (
          <a
            key={index}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors group"
            href="#"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">{cat.icon}</span>
              <span className="font-semibold text-on-surface">{cat.name}</span>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
          </a>
        ))}
        <a className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors group border-t border-outline-variant pt-4 mt-2" href="#">
          <div className="flex items-center gap-3">
            <span className="text-primary font-bold">Xem tất cả 40+ ngành nghề</span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default CategorySidebar;
