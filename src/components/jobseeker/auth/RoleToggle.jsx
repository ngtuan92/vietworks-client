

const RoleToggle = ({ role, setRole }) => {
  return (
    <div className="flex p-1 bg-surface-container rounded-lg border border-outline-variant/30">
      <button
        type="button"
        onClick={() => setRole('candidate')}
        className={`flex-1 py-2 text-center rounded-DEFAULT font-label-md text-label-md transition-all ${
          role === 'candidate'
            ? 'bg-surface-container-lowest shadow-sm border border-outline-variant/20 text-primary'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        Ứng viên
      </button>
      <button
        type="button"
        onClick={() => setRole('employer')}
        className={`flex-1 py-2 text-center rounded-DEFAULT font-label-md text-label-md transition-all ${
          role === 'employer'
            ? 'bg-surface-container-lowest shadow-sm border border-outline-variant/20 text-primary'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        Nhà tuyển dụng
      </button>
    </div>
  );
};

export default RoleToggle;
