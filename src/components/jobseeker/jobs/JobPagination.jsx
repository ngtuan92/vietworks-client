

const JobPagination = () => {
  return (
    <nav className="mt-12 flex justify-center items-center gap-2">
      <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50">
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#003f87] text-white font-bold">1</button>
      <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">2</button>
      <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">3</button>
      <span className="text-gray-400 px-2">...</span>
      <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">48</button>
      <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </nav>
  );
};

export default JobPagination;
