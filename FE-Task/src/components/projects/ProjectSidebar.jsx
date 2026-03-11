export default function ProjectSidebar({ projects, selectedProject, onSelect, onCreateClick }) {
  return (
    <aside className="w-64 border-r border-white/8 bg-slate-900/50 flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Dự án</span>
        <span className="text-xs bg-white/8 text-white/40 px-2 py-0.5 rounded-full">
          {projects.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className={`w-full text-left px-3 py-3 rounded-xl transition ${
              selectedProject?.id === p.id
                ? "bg-purple-600 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="font-medium text-sm truncate">{p.name}</div>
            <div
              className={`text-xs truncate mt-0.5 ${
                selectedProject?.id === p.id ? "text-purple-200" : "text-white/35"
              }`}
            >
              {p.description || "Không có mô tả"}
            </div>
          </button>
        ))}
        {projects.length === 0 && (
          <p className="text-center text-white/25 text-xs py-10">Chưa có dự án nào</p>
        )}
      </div>
      <div className="p-3 border-t border-white/8">
        <button
          onClick={onCreateClick}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5"
        >
          <span className="text-base leading-none">+</span> Tạo dự án mới
        </button>
      </div>
    </aside>
  );
}
