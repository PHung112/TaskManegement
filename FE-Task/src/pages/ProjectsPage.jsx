import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import projectApi from '../api/projectApi'
import taskApi from '../api/taskApi'
import userApi from '../api/userApi'

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  TODO:        { label: 'Todo',        cls: 'bg-slate-700 text-slate-300' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-500/20 text-blue-300' },
  SUBMITTED:   { label: 'Submitted',   cls: 'bg-yellow-500/20 text-yellow-300' },
  DONE:        { label: 'Done',        cls: 'bg-green-500/20 text-green-300' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, cls: 'bg-slate-700 text-slate-300' }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white text-2xl leading-none transition">&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Input helpers ─────────────────────────────────────────────────────────────
const inputCls = 'w-full bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500 transition text-sm'
const labelCls = 'text-white/55 text-xs mb-1 block'
const btnPrimary = 'flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium text-sm transition'
const btnSecondary = 'flex-1 py-2.5 border border-white/15 rounded-xl text-white/55 hover:text-white text-sm transition'

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)

  // Data
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('members')

  // Modal: null | 'createProject' | 'editProject' | 'confirmDeleteProject' |
  //        'inviteMember' | 'editRole' | 'createTask' | 'editTask'
  const [modal, setModal] = useState(null)
  const [modalData, setModalData] = useState({})

  // Forms
  const [projectForm, setProjectForm] = useState({ name: '', description: '' })
  const [inviteForm, setInviteForm] = useState({ userId: '', role: 'MEMBER' })
  const [roleForm, setRoleForm] = useState({ role: 'MEMBER' })
  const [taskForm, setTaskForm] = useState({ title: '', description: '', deadline: '', assignedToId: '' })
  const [formError, setFormError] = useState('')

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('currentUser')
    if (!saved) { navigate('/auth'); return }
    setCurrentUser(JSON.parse(saved))
  }, [])

  // ── Load initial data ───────────────────────────────────────────────────────
  const loadProjects = useCallback(async () => {
    try {
      const res = await projectApi.getMyProjects()
      setProjects(res.data)
    } catch {}
  }, [])

  useEffect(() => {
    loadProjects()
    userApi.getAllUsers().then(r => setUsers(r.data)).catch(() => {})
  }, [loadProjects])

  // ── Select project → load details ──────────────────────────────────────────
  const selectProject = useCallback(async (project) => {
    setSelectedProject(project)
    setActiveTab('members')
    try {
      const [mRes, tRes] = await Promise.all([
        projectApi.getProjectMembers(project.id),
        taskApi.getTasksByProject(project.id),
      ])
      setMembers(mRes.data)
      setTasks(tRes.data)
    } catch {}
  }, [])

  const refreshDetails = useCallback(async (projectId) => {
    if (!projectId) return
    try {
      const [mRes, tRes] = await Promise.all([
        projectApi.getProjectMembers(projectId),
        taskApi.getTasksByProject(projectId),
      ])
      setMembers(mRes.data)
      setTasks(tRes.data)
    } catch {}
  }, [])

  // ── Project CRUD ────────────────────────────────────────────────────────────
  const handleCreateProject = async (e) => {
    e.preventDefault()
    setFormError('')
    try {
      await projectApi.createProject({ name: projectForm.name, description: projectForm.description })
      await loadProjects()
      setModal(null)
      setProjectForm({ name: '', description: '' })
    } catch { setFormError('Tạo dự án thất bại.') }
  }

  const handleEditProject = async (e) => {
    e.preventDefault()
    setFormError('')
    try {
      const res = await projectApi.updateProject(selectedProject.id, projectForm)
      setSelectedProject(res.data)
      await loadProjects()
      setModal(null)
    } catch { setFormError('Cập nhật thất bại.') }
  }

  const handleDeleteProject = async () => {
    try {
      await projectApi.deleteProject(selectedProject.id)
      setSelectedProject(null)
      setMembers([])
      setTasks([])
      await loadProjects()
      setModal(null)
    } catch {}
  }

  // ── Member actions ──────────────────────────────────────────────────────────
  const handleInviteMember = async (e) => {
    e.preventDefault()
    setFormError('')
    try {
      await projectApi.inviteMember(selectedProject.id, {
        userId: Number(inviteForm.userId),
        role: inviteForm.role,
      })
      await refreshDetails(selectedProject.id)
      setModal(null)
      setInviteForm({ userId: '', role: 'MEMBER' })
    } catch { setFormError('Mời thành viên thất bại.') }
  }

  const handleRemoveMember = async (userId) => {
    try {
      await projectApi.removeMember(selectedProject.id, userId)
      await refreshDetails(selectedProject.id)
    } catch {}
  }

  const handleUpdateRole = async (e) => {
    e.preventDefault()
    setFormError('')
    try {
      await projectApi.updateMemberRole(selectedProject.id, modalData.userId, roleForm)
      await refreshDetails(selectedProject.id)
      setModal(null)
    } catch { setFormError('Cập nhật vai trò thất bại.') }
  }

  // ── Task actions ────────────────────────────────────────────────────────────
  const handleCreateTask = async (e) => {
    e.preventDefault()
    setFormError('')
    try {
      await taskApi.createTask({
        projectId: selectedProject.id,
        assignedToId: taskForm.assignedToId ? Number(taskForm.assignedToId) : null,
        title: taskForm.title,
        description: taskForm.description,
        deadline: taskForm.deadline || null,
      })
      await refreshDetails(selectedProject.id)
      setModal(null)
      setTaskForm({ title: '', description: '', deadline: '', assignedToId: '' })
    } catch { setFormError('Tạo task thất bại.') }
  }

  const handleEditTask = async (e) => {
    e.preventDefault()
    setFormError('')
    try {
      await taskApi.updateTask(modalData.taskId, {
        title: taskForm.title,
        description: taskForm.description,
        deadline: taskForm.deadline || null,
      })
      await refreshDetails(selectedProject.id)
      setModal(null)
    } catch { setFormError('Cập nhật task thất bại.') }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await taskApi.deleteTask(taskId)
      await refreshDetails(selectedProject.id)
    } catch {}
  }

  const handleAcceptTask = async (taskId) => {
    try {
      await taskApi.acceptTask(taskId, currentUser.id)
      await refreshDetails(selectedProject.id)
    } catch {}
  }

  const handleSubmitTask = async (taskId) => {
    try {
      await taskApi.submitTask(taskId, currentUser.id)
      await refreshDetails(selectedProject.id)
    } catch {}
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const openModal = (name, data = {}) => {
    setFormError('')
    setModalData(data)
    setModal(name)
  }

  if (!currentUser) return null

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/8 bg-slate-900/90 backdrop-blur px-6 py-3.5 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">T</div>
          <span className="font-bold tracking-tight">TaskFlow</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-600/40 rounded-full flex items-center justify-center text-xs font-bold">
              {currentUser.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-white/65 text-sm">{currentUser.username}</span>
          </div>
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('currentUser'); navigate('/auth') }}
            className="px-3 py-1.5 text-xs border border-white/15 hover:bg-white/5 rounded-lg transition text-white/60 hover:text-white"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-57px)]">

        {/* Sidebar */}
        <aside className="w-64 border-r border-white/8 bg-slate-900/50 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Dự án</span>
            <span className="text-xs bg-white/8 text-white/40 px-2 py-0.5 rounded-full">{projects.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => selectProject(p)}
                className={`w-full text-left px-3 py-3 rounded-xl transition ${
                  selectedProject?.id === p.id
                    ? 'bg-purple-600 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="font-medium text-sm truncate">{p.name}</div>
                <div className={`text-xs truncate mt-0.5 ${selectedProject?.id === p.id ? 'text-purple-200' : 'text-white/35'}`}>
                  {p.description || 'Không có mô tả'}
                </div>
              </button>
            ))}
            {projects.length === 0 && (
              <p className="text-center text-white/25 text-xs py-10">Chưa có dự án nào</p>
            )}
          </div>
          <div className="p-3 border-t border-white/8">
            <button
              onClick={() => { setProjectForm({ name: '', description: '' }); openModal('createProject') }}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5"
            >
              <span className="text-base leading-none">+</span> Tạo dự án mới
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          {!selectedProject ? (
            <div className="flex flex-col items-center justify-center h-full text-white/25 select-none">
              <div className="text-7xl mb-5">📁</div>
              <p className="text-lg font-medium">Chọn một dự án</p>
              <p className="text-sm mt-1">hoặc tạo dự án mới</p>
            </div>
          ) : (
            <div className="p-7 max-w-4xl">

              {/* Project header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
                  <p className="text-white/45 text-sm mt-1 max-w-xl">
                    {selectedProject.description || 'Không có mô tả'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => { setProjectForm({ name: selectedProject.name, description: selectedProject.description || '' }); openModal('editProject') }}
                    className="px-4 py-2 border border-white/15 hover:bg-white/5 rounded-xl text-sm transition"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => openModal('confirmDeleteProject')}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-400 rounded-xl text-sm transition"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-white/5 rounded-xl p-1 w-fit mb-6">
                {[
                  { key: 'members', label: `👥 Thành viên`, count: members.length },
                  { key: 'tasks',   label: `✅ Tasks`,      count: tasks.length },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                      activeTab === t.key ? 'bg-purple-600 text-white' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {t.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.key ? 'bg-purple-500' : 'bg-white/10'}`}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* ── Members Tab ── */}
              {activeTab === 'members' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-white/70 text-sm uppercase tracking-wide">Danh sách thành viên</h2>
                    <button
                      onClick={() => { setInviteForm({ userId: '', role: 'MEMBER' }); openModal('inviteMember') }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-medium transition"
                    >
                      + Mời thành viên
                    </button>
                  </div>
                  <div className="space-y-2">
                    {members.map(m => (
                      <div key={m.userId} className="flex items-center justify-between bg-white/4 border border-white/8 rounded-xl px-5 py-4 hover:bg-white/6 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-purple-600/35 rounded-full flex items-center justify-center text-sm font-bold text-purple-300">
                            {m.username?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {m.username}
                              {m.userId === currentUser.id && (
                                <span className="ml-2 text-xs text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full">Bạn</span>
                              )}
                            </div>
                            <div className="text-white/35 text-xs">{m.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${m.role === 'MANAGER' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-400'}`}>
                            {m.role}
                          </span>
                          <button
                            onClick={() => { setRoleForm({ role: m.role }); openModal('editRole', { userId: m.userId }) }}
                            title="Đổi vai trò"
                            className="px-2 py-1 text-white/30 hover:text-white rounded-lg hover:bg-white/5 transition text-sm"
                          >
                            ⚙️
                          </button>
                          <button
                            onClick={() => handleRemoveMember(m.userId)}
                            title="Loại khỏi project"
                            className="px-2 py-1 text-red-400/50 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition text-sm"
                          >
                            ✕
                          </button>
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
              {activeTab === 'tasks' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-white/70 text-sm uppercase tracking-wide">Danh sách công việc</h2>
                    <button
                      onClick={() => { setTaskForm({ title: '', description: '', deadline: '', assignedToId: '' }); openModal('createTask') }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-medium transition"
                    >
                      + Tạo task
                    </button>
                  </div>

                  {/* Group by status */}
                  {['TODO', 'IN_PROGRESS', 'SUBMITTED', 'DONE'].map(status => {
                    const filtered = tasks.filter(t => t.status === status)
                    if (filtered.length === 0) return null
                    const cfg = STATUS_CFG[status]
                    return (
                      <div key={status} className="mb-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${cfg.cls}`}>
                          {cfg.label} · {filtered.length}
                        </div>
                        <div className="space-y-2">
                          {filtered.map(t => (
                            <div key={t.id} className="bg-white/4 border border-white/8 rounded-xl px-5 py-4 hover:bg-white/6 transition">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm mb-1">{t.title}</div>
                                  {t.description && (
                                    <p className="text-white/45 text-xs leading-relaxed mb-2">{t.description}</p>
                                  )}
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/30">
                                    {t.assignedToUsername && (
                                      <span>👤 {t.assignedToUsername}</span>
                                    )}
                                    {t.deadline && (
                                      <span>📅 {t.deadline}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 ml-4 shrink-0">
                                  {t.status === 'TODO' && (
                                    <button
                                      onClick={() => handleAcceptTask(t.id)}
                                      className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition font-medium"
                                    >
                                      Nhận
                                    </button>
                                  )}
                                  {t.status === 'IN_PROGRESS' && (
                                    <button
                                      onClick={() => handleSubmitTask(t.id)}
                                      className="px-3 py-1 text-xs bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition font-medium"
                                    >
                                      Nộp
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setTaskForm({ title: t.title, description: t.description || '', deadline: t.deadline || '', assignedToId: '' })
                                      openModal('editTask', { taskId: t.id })
                                    }}
                                    className="px-2 py-1 text-white/30 hover:text-white rounded-lg hover:bg-white/5 transition text-sm"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(t.id)}
                                    className="px-2 py-1 text-red-400/40 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition text-sm"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {tasks.length === 0 && (
                    <div className="text-center text-white/25 text-sm py-12">Chưa có task nào trong project này</div>
                  )}
                </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* ════════════ MODALS ════════════ */}

      {/* Create Project */}
      {modal === 'createProject' && (
        <Modal title="Tạo dự án mới" onClose={() => setModal(null)}>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className={labelCls}>Tên dự án *</label>
              <input value={projectForm.name} onChange={e => setProjectForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Tên dự án..." className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Mô tả</label>
              <textarea value={projectForm.description} onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Mô tả dự án..." className={`${inputCls} h-24 resize-none`} />
            </div>
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setModal(null)} className={btnSecondary}>Hủy</button>
              <button type="submit" className={btnPrimary}>Tạo dự án</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Project */}
      {modal === 'editProject' && (
        <Modal title="Chỉnh sửa dự án" onClose={() => setModal(null)}>
          <form onSubmit={handleEditProject} className="space-y-4">
            <div>
              <label className={labelCls}>Tên dự án *</label>
              <input value={projectForm.name} onChange={e => setProjectForm(p => ({ ...p, name: e.target.value }))}
                className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Mô tả</label>
              <textarea value={projectForm.description} onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))}
                className={`${inputCls} h-24 resize-none`} />
            </div>
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setModal(null)} className={btnSecondary}>Hủy</button>
              <button type="submit" className={btnPrimary}>Lưu thay đổi</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Project */}
      {modal === 'confirmDeleteProject' && (
        <Modal title="Xóa dự án" onClose={() => setModal(null)}>
          <p className="text-white/55 text-sm mb-6">
            Bạn có chắc muốn xóa dự án <strong className="text-white">{selectedProject?.name}</strong>? Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} className={btnSecondary}>Hủy</button>
            <button onClick={handleDeleteProject} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl font-medium text-sm transition">
              Xóa dự án
            </button>
          </div>
        </Modal>
      )}

      {/* Invite Member */}
      {modal === 'inviteMember' && (
        <Modal title="Mời thành viên" onClose={() => setModal(null)}>
          <form onSubmit={handleInviteMember} className="space-y-4">
            <div>
              <label className={labelCls}>Chọn người dùng *</label>
              <select value={inviteForm.userId} onChange={e => setInviteForm(p => ({ ...p, userId: e.target.value }))}
                className={`${inputCls} bg-slate-700`} required>
                <option value="">-- Chọn người dùng --</option>
                {users
                  .filter(u => !members.find(m => m.userId === u.id))
                  .map(u => (
                    <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                  ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Vai trò</label>
              <select value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}
                className={`${inputCls} bg-slate-700`}>
                <option value="MEMBER">MEMBER</option>
                <option value="MANAGER">MANAGER</option>
              </select>
            </div>
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setModal(null)} className={btnSecondary}>Hủy</button>
              <button type="submit" className={btnPrimary}>Mời</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Role */}
      {modal === 'editRole' && (
        <Modal title="Thay đổi vai trò" onClose={() => setModal(null)}>
          <form onSubmit={handleUpdateRole} className="space-y-4">
            <div>
              <label className={labelCls}>Vai trò mới</label>
              <select value={roleForm.role} onChange={e => setRoleForm({ role: e.target.value })}
                className={`${inputCls} bg-slate-700`}>
                <option value="MEMBER">MEMBER</option>
                <option value="MANAGER">MANAGER</option>
              </select>
            </div>
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setModal(null)} className={btnSecondary}>Hủy</button>
              <button type="submit" className={btnPrimary}>Cập nhật</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Task */}
      {modal === 'createTask' && (
        <Modal title="Tạo task mới" onClose={() => setModal(null)}>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className={labelCls}>Tiêu đề *</label>
              <input value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Tiêu đề task..." className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Mô tả</label>
              <textarea value={taskForm.description} onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Mô tả chi tiết..." className={`${inputCls} h-20 resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Giao cho</label>
              <select value={taskForm.assignedToId} onChange={e => setTaskForm(p => ({ ...p, assignedToId: e.target.value }))}
                className={`${inputCls} bg-slate-700`}>
                <option value="">-- Không giao --</option>
                {members.map(m => (
                  <option key={m.userId} value={m.userId}>{m.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Deadline</label>
              <input type="date" value={taskForm.deadline} onChange={e => setTaskForm(p => ({ ...p, deadline: e.target.value }))}
                className={inputCls} />
            </div>
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setModal(null)} className={btnSecondary}>Hủy</button>
              <button type="submit" className={btnPrimary}>Tạo task</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Task */}
      {modal === 'editTask' && (
        <Modal title="Chỉnh sửa task" onClose={() => setModal(null)}>
          <form onSubmit={handleEditTask} className="space-y-4">
            <div>
              <label className={labelCls}>Tiêu đề *</label>
              <input value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))}
                className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Mô tả</label>
              <textarea value={taskForm.description} onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))}
                className={`${inputCls} h-20 resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Deadline</label>
              <input type="date" value={taskForm.deadline} onChange={e => setTaskForm(p => ({ ...p, deadline: e.target.value }))}
                className={inputCls} />
            </div>
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setModal(null)} className={btnSecondary}>Hủy</button>
              <button type="submit" className={btnPrimary}>Lưu thay đổi</button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  )
}
