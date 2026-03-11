import { STATUS_CFG } from "../common/StatusBadge";

export default function ProjectDetail({
  selectedProject, members, tasks, activeTab, setActiveTab,
  currentUser, myRole,
  onOpenEditProject, onOpenDeleteProject, onOpenLeave, onOpenTransfer,
  onOpenInviteMember, onRemoveMember, onOpenEditRole,
  onOpenCreateTask, onOpenEditTask, onDeleteTask, onAcceptTask, onOpenSubmitTask,
}) {
  return (
    <div className="p-7 max-w-4xl">
      {/* Project header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
          <p className="text-white/45 text-sm mt-1 max-w-xl">
            {selectedProject.description || "Không có mô tả"}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 ml-4">
          {(myRole === "ADMIN" || myRole === "MANAGER") && (
            <button
              onClick={onOpenEditProject}
              className="px-4 py-2 border border-white/15 hover:bg-white/5 rounded-xl text-sm transition"
            >
              ✏️ Sửa
            </button>
          )}
          {myRole === "ADMIN" && (
            <button
              onClick={onOpenDeleteProject}
              className="px-4 py-2 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-400 rounded-xl text-sm transition"
            >
              🗑️ Xóa
            </button>
          )}
          {myRole === "ADMIN" && (
            <button
              onClick={onOpenTransfer}
              className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/25 hover:bg-yellow-500/20 text-yellow-400 rounded-xl text-sm transition"
            >
              🚪 Thoát
            </button>
          )}
          {(myRole === "MANAGER" || myRole === "MEMBER") && (
            <button
              onClick={onOpenLeave}
              className="px-4 py-2 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-400 rounded-xl text-sm transition"
            >
              🚪 Thoát
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 rounded-xl p-1 w-fit mb-6">
        {[
          { key: "members", label: "👥 Thành viên", count: members.length },
          { key: "tasks", label: "✅ Tasks", count: tasks.length },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              activeTab === t.key ? "bg-purple-600 text-white" : "text-white/50 hover:text-white"
            }`}
          >
            {t.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === t.key ? "bg-purple-500" : "bg-white/10"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Members Tab ── */}
      {activeTab === "members" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white/70 text-sm uppercase tracking-wide">
              Danh sách thành viên
            </h2>
            {(myRole === "ADMIN" || myRole === "MANAGER") && (
              <button
                onClick={onOpenInviteMember}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-medium transition"
              >
                + Mời thành viên
              </button>
            )}
          </div>
          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between bg-white/4 border border-white/8 rounded-xl px-5 py-4 hover:bg-white/6 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-600/35 rounded-full flex items-center justify-center text-sm font-bold text-purple-300">
                    {m.username?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {m.username}
                      {m.userId === currentUser.id && (
                        <span className="ml-2 text-xs text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full">
                          Bạn
                        </span>
                      )}
                    </div>
                    <div className="text-white/35 text-xs">{m.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      m.role === "ADMIN"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : m.role === "MANAGER"
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {m.role}
                  </span>
                  {myRole === "ADMIN" && m.userId !== currentUser.id && (
                    <>
                      <button
                        onClick={() => onOpenEditRole(m.userId, m.role)}
                        title="Đổi vai trò"
                        className="px-2 py-1 text-white/30 hover:text-white rounded-lg hover:bg-white/5 transition text-sm"
                      >
                        ⚙️
                      </button>
                      <button
                        onClick={() => onRemoveMember(m.userId)}
                        title="Kick khỏi project"
                        className="px-2 py-1 text-red-400/50 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition text-sm"
                      >
                        ✕
                      </button>
                    </>
                  )}
                  {myRole === "MANAGER" && m.userId !== currentUser.id && m.role === "MEMBER" && (
                    <>
                      <button
                        onClick={() => onOpenEditRole(m.userId, m.role)}
                        title="Nâng lên Manager"
                        className="px-2 py-1 text-white/30 hover:text-white rounded-lg hover:bg-white/5 transition text-sm"
                      >
                        ⚙️
                      </button>
                      <button
                        onClick={() => onRemoveMember(m.userId)}
                        title="Kick khỏi project"
                        className="px-2 py-1 text-red-400/50 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition text-sm"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="text-center text-white/25 text-sm py-12">Chưa có thành viên nào</div>
            )}
          </div>
        </div>
      )}

      {/* ── Tasks Tab ── */}
      {activeTab === "tasks" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white/70 text-sm uppercase tracking-wide">
              Danh sách công việc
            </h2>
            {(myRole === "ADMIN" || myRole === "MANAGER") && (
              <button
                onClick={onOpenCreateTask}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-medium transition"
              >
                + Tạo task
              </button>
            )}
          </div>

          {["TODO", "IN_PROGRESS", "SUBMITTED", "DONE"].map((status) => {
            const filtered = tasks.filter((t) =>
              status === "TODO"
                ? t.status === "TODO" || t.status === "ASSIGNED"
                : t.status === status,
            );
            if (filtered.length === 0) return null;
            const cfg = STATUS_CFG[status];
            return (
              <div key={status} className="mb-6">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${cfg.cls}`}
                >
                  {cfg.label} · {filtered.length}
                </div>
                <div className="space-y-2">
                  {filtered.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white/4 border border-white/8 rounded-xl px-5 py-4 hover:bg-white/6 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">{t.title}</div>
                          {t.description && (
                            <p className="text-white/45 text-xs leading-relaxed mb-2">
                              {t.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-white/30">
                            {t.assignedToUsername && <span>👤 {t.assignedToUsername}</span>}
                            {t.deadline && <span>📅 {t.deadline}</span>}
                            {t.submissionLink && (
                              <a
                                href={t.submissionLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400/70 hover:text-purple-300 transition"
                              >
                                📎 Bài nộp
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 ml-4 shrink-0">
                          {t.status === "TODO" && t.assignedToId === currentUser.id && (
                            <button
                              onClick={() => onAcceptTask(t.id)}
                              className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition font-medium"
                            >
                              Nhận
                            </button>
                          )}
                          {t.status === "IN_PROGRESS" && t.assignedToId === currentUser.id && (
                            <button
                              onClick={() => onOpenSubmitTask(t.id)}
                              className="px-3 py-1 text-xs bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition font-medium"
                            >
                              Nộp
                            </button>
                          )}
                          {!t.assignedToId && (myRole === "ADMIN" || myRole === "MANAGER") && (
                            <button
                              onClick={() => onOpenEditTask(t)}
                              className="px-2 py-1 text-white/30 hover:text-white rounded-lg hover:bg-white/5 transition text-sm"
                            >
                              ✏️
                            </button>
                          )}
                          {myRole === "ADMIN" && (
                            <button
                              onClick={() => onDeleteTask(t.id)}
                              className="px-2 py-1 text-red-400/40 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition text-sm"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="text-center text-white/25 text-sm py-12">
              Chưa có task nào trong project này
            </div>
          )}
        </div>
      )}
    </div>
  );
}
