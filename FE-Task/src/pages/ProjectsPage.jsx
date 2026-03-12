import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import projectApi from "../api/projectApi";
import taskApi from "../api/taskApi";
import userApi from "../api/userApi";
import http from "../api/axiosConfig";

import ProjectSidebar from "../components/projects/ProjectSidebar";
import ProjectDetail from "../components/projects/ProjectDetail";
import CreateProjectModal from "../components/projects/modals/CreateProjectModal";
import EditProjectModal from "../components/projects/modals/EditProjectModal";
import ConfirmDeleteProjectModal from "../components/projects/modals/ConfirmDeleteProjectModal";
import InviteMemberModal from "../components/projects/modals/InviteMemberModal";
import EditRoleModal from "../components/projects/modals/EditRoleModal";
import CreateTaskModal from "../components/projects/modals/CreateTaskModal";
import EditTaskModal from "../components/projects/modals/EditTaskModal";
import ConfirmLeaveModal from "../components/projects/modals/ConfirmLeaveModal";
import SubmitTaskModal from "../components/projects/modals/SubmitTaskModal";
import TransferAdminModal from "../components/projects/modals/TransferAdminModal";
import ConfirmModal from "../components/common/ConfirmModal";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);

  // Data
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("members");

  // Modal
  const [modal, setModal] = useState(null);
  const [modalData, setModalData] = useState({});

  // Forms
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [roleForm, setRoleForm] = useState({ role: "MEMBER" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", deadline: "", assignedToId: "" });
  const [submitForm, setSubmitForm] = useState({ link: "", file: null, taskId: null });
  const [formError, setFormError] = useState("");

  // Member search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimerRef = useRef(null);

  const [transferTarget, setTransferTarget] = useState("");

  // Auth guard
  useEffect(() => {
    const saved = sessionStorage.getItem("currentUser");
    if (!saved) { navigate("/auth"); return; }
    setCurrentUser(JSON.parse(saved));
  }, []);

  // Debounced user search
  useEffect(() => {
    if (modal !== "inviteMember") return;
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    clearTimeout(searchTimerRef.current);
    setSearchLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await userApi.searchUsers(searchQuery.trim());
        setSearchResults(res.data.filter((u) => !members.find((m) => m.userId === u.id)));
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 500);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery, modal, members]);

  const loadProjects = useCallback(async () => {
    try { const res = await projectApi.getMyProjects(); setProjects(res.data); } catch {}
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  // Auto-select project from ?goto=id URL param (from notification click)
  useEffect(() => {
    const gotoId = searchParams.get("goto");
    if (!gotoId || projects.length === 0) return;
    const target = projects.find((p) => String(p.id) === gotoId);
    if (target) {
      selectProject(target);
      setActiveTab("tasks");
      setSearchParams({}, { replace: true }); // clean up URL
    }
  }, [searchParams, projects]);

  // Listen for invite accepted (from NotificationBell) → reload projects
  useEffect(() => {
    const handler = () => loadProjects();
    window.addEventListener("inviteAccepted", handler);
    return () => window.removeEventListener("inviteAccepted", handler);
  }, [loadProjects]);

  const selectProject = useCallback(async (project) => {
    setSelectedProject(project);
    setActiveTab("members");
    try {
      const [mRes, tRes] = await Promise.all([
        projectApi.getProjectMembers(project.id),
        taskApi.getTasksByProject(project.id),
      ]);
      setMembers(mRes.data);
      setTasks(tRes.data);
    } catch {}
  }, []);

  const refreshDetails = useCallback(async (projectId) => {
    if (!projectId) return;
    try {
      const [mRes, tRes] = await Promise.all([
        projectApi.getProjectMembers(projectId),
        taskApi.getTasksByProject(projectId),
      ]);
      setMembers(mRes.data);
      setTasks(tRes.data);
    } catch {}
  }, []);

  const openModal = (name, data = {}) => {
    setFormError("");
    setModalData(data);
    setModal(name);
    if (name !== "inviteMember") { setSearchQuery(""); setSearchResults([]); }
  };

  // ── Project handlers ────────────────────────────────────────────────────────
  const handleCreateProject = async (e) => {
    e.preventDefault(); setFormError("");
    try {
      await projectApi.createProject({ name: projectForm.name, description: projectForm.description });
      await loadProjects(); setModal(null); setProjectForm({ name: "", description: "" });
    } catch { setFormError("Tạo dự án thất bại."); }
  };

  const handleEditProject = async (e) => {
    e.preventDefault(); setFormError("");
    try {
      const res = await projectApi.updateProject(selectedProject.id, projectForm);
      setSelectedProject(res.data); await loadProjects(); setModal(null);
    } catch { setFormError("Cập nhật thất bại."); }
  };

  const handleDeleteProject = async () => {
    try {
      await projectApi.deleteProject(selectedProject.id);
      setSelectedProject(null); setMembers([]); setTasks([]); await loadProjects(); setModal(null);
    } catch {}
  };

  // ── Member handlers ─────────────────────────────────────────────────────────
  const handleInviteMember = async (userId, role) => {
    setFormError("");
    try {
      await projectApi.inviteMember(selectedProject.id, { userId: Number(userId), role });
      // Note: member is NOT added immediately — they must accept the invite notification
      setSearchResults((prev) => prev.filter((u) => u.id !== userId));
      setFormError(""); // clear error — success
      alert(`Lời mời đã được gửi!`);
    } catch (err) {
      setFormError(err?.response?.data?.error || "Mời thành viên thất bại.");
    }
  };

  const handleRemoveMember = async (userId) => {
    const isSelf = userId === currentUser.id;
    try {
      await projectApi.removeMember(selectedProject.id, userId);
      if (isSelf) {
        setSelectedProject(null); setMembers([]); setTasks([]); await loadProjects(); setModal(null);
      } else { await refreshDetails(selectedProject.id); }
    } catch {}
  };

  const handleAdminLeave = async (e) => {
    e.preventDefault(); setFormError("");
    if (!transferTarget) return;
    try {
      await projectApi.updateMemberRole(selectedProject.id, Number(transferTarget), { role: "ADMIN" });
      await projectApi.removeMember(selectedProject.id, currentUser.id);
      setSelectedProject(null); setMembers([]); setTasks([]); await loadProjects(); setModal(null);
    } catch { setFormError("Chuyển nhượng thất bại."); }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault(); setFormError("");
    try {
      await projectApi.updateMemberRole(selectedProject.id, modalData.userId, roleForm);
      await refreshDetails(selectedProject.id); setModal(null);
    } catch { setFormError("Cập nhật vai trò thất bại."); }
  };

  // ── Task handlers ───────────────────────────────────────────────────────────
  const handleCreateTask = async (e) => {
    e.preventDefault(); setFormError("");
    try {
      await taskApi.createTask({
        projectId: selectedProject.id,
        assignedToId: taskForm.assignedToId ? Number(taskForm.assignedToId) : null,
        title: taskForm.title,
        description: taskForm.description,
        deadline: taskForm.deadline || null,
      });
      await refreshDetails(selectedProject.id);
      setModal(null);
      setTaskForm({ title: "", description: "", deadline: "", assignedToId: "" });
    } catch (err) {
      const msg = err?.response?.data?.message;
      setFormError(msg ? `Lỗi: ${msg}` : "Tạo task thất bại.");
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault(); setFormError("");
    try {
      await taskApi.updateTask(modalData.taskId, {
        title: taskForm.title, description: taskForm.description, deadline: taskForm.deadline || null,
      });
      await refreshDetails(selectedProject.id); setModal(null);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setFormError(msg ? `Lỗi: ${msg}` : "Cập nhật task thất bại.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try { await taskApi.deleteTask(taskId); await refreshDetails(selectedProject.id); } catch {}
  };

  const handleAcceptTask = async (taskId) => {
    try { await taskApi.acceptTask(taskId, currentUser.id); await refreshDetails(selectedProject.id); } catch {}
  };

  const handleDoSubmitTask = async (e) => {
    e.preventDefault(); setFormError("");
    if (!submitForm.link && !submitForm.file) {
      setFormError("Vui lòng nộp file hoặc link liên kết."); return;
    }
    try {
      await taskApi.submitTask(submitForm.taskId, currentUser.id, {
        submissionLink: submitForm.link || undefined,
        file: submitForm.file || undefined,
      });
      await refreshDetails(selectedProject.id); setModal(null);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data;
      setFormError(msg ? `Lỗi: ${msg}` : "Nộp task thất bại.");
    }
  };

  const handleConfirmDownload = async () => {
    const { submissionLink, title } = modalData;
    setModal(null);
    if (!submissionLink) return;
    if (submissionLink.startsWith("/api/files/")) {
      try {
        const res = await http.get(submissionLink, { responseType: "blob" });
        const url = URL.createObjectURL(res.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = submissionLink.split("/").pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        alert("Tải file thất bại.");
      }
    } else {
      window.open(submissionLink, "_blank", "noopener,noreferrer");
    }
  };

  const myRole = members.find((m) => m.userId === currentUser?.id)?.role;
  if (!currentUser) return null;

  return (
    <div className="h-[calc(100vh-60px)] bg-slate-900 text-white flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar
          projects={projects}
          selectedProject={selectedProject}
          onSelect={selectProject}
          onCreateClick={() => {
            setProjectForm({ name: "", description: "" });
            openModal("createProject");
          }}
        />

        <main className="flex-1 overflow-y-auto">
          {!selectedProject ? (
            <div className="flex flex-col items-center justify-center h-full text-white/25 select-none">
              <div className="text-7xl mb-5">📁</div>
              <p className="text-lg font-medium">Chọn một dự án</p>
              <p className="text-sm mt-1">hoặc tạo dự án mới</p>
            </div>
          ) : (
            <ProjectDetail
              selectedProject={selectedProject}
              members={members}
              tasks={tasks}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentUser={currentUser}
              myRole={myRole}
              onOpenEditProject={() => {
                setProjectForm({ name: selectedProject.name, description: selectedProject.description || "" });
                openModal("editProject");
              }}
              onOpenDeleteProject={() => openModal("confirmDeleteProject")}
              onOpenLeave={() => openModal("confirmLeave")}
              onOpenTransfer={() => { setTransferTarget(""); openModal("transferAdmin"); }}
              onOpenInviteMember={() => openModal("inviteMember")}
              onOpenConfirmKick={(userId, username) =>
                openModal("confirmKickMember", { userId, username })
              }
              onOpenEditRole={(userId, role) => { setRoleForm({ role }); openModal("editRole", { userId }); }}
              onOpenCreateTask={() => {
                setTaskForm({ title: "", description: "", deadline: "", assignedToId: "" });
                openModal("createTask");
              }}
              onOpenEditTask={(task) => {
                setTaskForm({ title: task.title, description: task.description || "", deadline: task.deadline || "", assignedToId: "" });
                openModal("editTask", { taskId: task.id });
              }}
              onOpenConfirmDeleteTask={(taskId, title) =>
                openModal("confirmDeleteTask", { taskId, title })
              }
              onAcceptTask={handleAcceptTask}
              onOpenSubmitTask={(taskId) => {
                setSubmitForm({ link: "", file: null, taskId });
                setFormError("");
                setModal("submitTask");
              }}
              onOpenDownloadConfirm={(link, title) =>
                openModal("confirmDownload", { submissionLink: link, title })
              }
            />
          )}
        </main>
      </div>

      {/* ════════════ MODALS ════════════ */}
      {modal === "createProject" && (
        <CreateProjectModal
          projectForm={projectForm} setProjectForm={setProjectForm}
          onSubmit={handleCreateProject} onClose={() => setModal(null)} formError={formError}
        />
      )}
      {modal === "editProject" && (
        <EditProjectModal
          projectForm={projectForm} setProjectForm={setProjectForm}
          onSubmit={handleEditProject} onClose={() => setModal(null)} formError={formError}
        />
      )}
      {modal === "confirmDeleteProject" && (
        <ConfirmDeleteProjectModal
          projectName={selectedProject?.name}
          onConfirm={handleDeleteProject} onClose={() => setModal(null)}
        />
      )}
      {modal === "inviteMember" && (
        <InviteMemberModal
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          searchResults={searchResults} searchLoading={searchLoading}
          onAdd={handleInviteMember}
          onClose={() => { setModal(null); setSearchQuery(""); setSearchResults([]); }}
          formError={formError}
        />
      )}
      {modal === "editRole" && (
        <EditRoleModal
          roleForm={roleForm} setRoleForm={setRoleForm}
          onSubmit={handleUpdateRole} onClose={() => setModal(null)} formError={formError}
        />
      )}
      {modal === "createTask" && (
        <CreateTaskModal
          taskForm={taskForm} setTaskForm={setTaskForm} members={members}
          onSubmit={handleCreateTask} onClose={() => setModal(null)} formError={formError}
        />
      )}
      {modal === "editTask" && (
        <EditTaskModal
          taskForm={taskForm} setTaskForm={setTaskForm}
          onSubmit={handleEditTask} onClose={() => setModal(null)} formError={formError}
        />
      )}
      {modal === "confirmLeave" && (
        <ConfirmLeaveModal
          projectName={selectedProject?.name}
          onConfirm={() => handleRemoveMember(currentUser.id)} onClose={() => setModal(null)}
        />
      )}
      {modal === "submitTask" && (
        <SubmitTaskModal
          submitForm={submitForm} setSubmitForm={setSubmitForm}
          onSubmit={handleDoSubmitTask} onClose={() => setModal(null)} formError={formError}
        />
      )}
      {modal === "transferAdmin" && (
        <TransferAdminModal
          members={members} currentUserId={currentUser.id}
          transferTarget={transferTarget} setTransferTarget={setTransferTarget}
          onSubmit={handleAdminLeave} onClose={() => setModal(null)} formError={formError}
        />
      )}
      {modal === "confirmKickMember" && (
        <ConfirmModal
          title="Kick thành viên"
          message={`Bạn có chắc chắn muốn xóa ${modalData.username ?? "thành viên này"} khỏi project?`}
          confirmLabel="Kick"
          onConfirm={() => { setModal(null); handleRemoveMember(modalData.userId); }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "confirmDeleteTask" && (
        <ConfirmModal
          title="Xóa task"
          message={`Bạn có chắc chắn muốn xóa task "${modalData.title ?? ""}"? Hành động này không thể hoàn tác.`}
          confirmLabel="Xóa"
          onConfirm={() => { setModal(null); handleDeleteTask(modalData.taskId); }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "confirmDownload" && (
        <ConfirmModal
          title="Tải về bài nộp"
          message={`Bạn có muốn tải về bài nộp của task "${modalData.title ?? ""}"?`}
          confirmLabel="Tải về"
          danger={false}
          onConfirm={handleConfirmDownload}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}


// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  TODO: { label: "Todo", cls: "bg-slate-700 text-slate-300" },
  ASSIGNED: { label: "Todo", cls: "bg-slate-700 text-slate-300" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-blue-500/20 text-blue-300" },
  SUBMITTED: { label: "Submitted", cls: "bg-yellow-500/20 text-yellow-300" },
  DONE: { label: "Done", cls: "bg-green-500/20 text-green-300" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || {
    label: status,
    cls: "bg-slate-700 text-slate-300",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white text-2xl leading-none transition"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Input helpers ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full bg-slate-700 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500 transition text-sm";
const labelCls = "text-white/55 text-xs mb-1 block";
const btnPrimary =
  "flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium text-sm transition";
const btnSecondary =
  "flex-1 py-2.5 border border-white/15 rounded-xl text-white/55 hover:text-white text-sm transition";

// ─── UserSearchRow ─────────────────────────────────────────────────────────────
function UserSearchRow({ user, onAdd }) {
  const [role, setRole] = useState("MEMBER");
  const [adding, setAdding] = useState(false);
  const handleAdd = async () => {
    setAdding(true);
    await onAdd(user.id, role);
    setAdding(false);
  };
  return (
    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 mx-1.5 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 bg-purple-600/35 rounded-full flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
          {user.username?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{user.username}</div>
          <div className="text-white/35 text-xs truncate">{user.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="bg-slate-700 border border-white/15 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500"
        >
          <option value="MEMBER">MEMBER</option>
          <option value="MANAGER">MANAGER</option>
        </select>
        <button
          onClick={handleAdd}
          disabled={adding}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-xs font-semibold transition"
        >
          {adding ? "..." : "+ Thêm"}
        </button>
      </div>
    </div>
  );
}


