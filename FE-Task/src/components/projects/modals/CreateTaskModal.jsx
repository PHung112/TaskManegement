import Modal from "../../common/Modal";
import { inputCls, labelCls, btnPrimary, btnSecondary } from "../../common/formStyles";

const tomorrow = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
})();

export default function CreateTaskModal({ taskForm, setTaskForm, members, onSubmit, onClose, formError }) {
  return (
    <Modal title="Tạo task mới" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Tiêu đề *</label>
          <input
            value={taskForm.title}
            onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Tiêu đề task..."
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className={labelCls}>Mô tả</label>
          <textarea
            value={taskForm.description}
            onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Mô tả chi tiết..."
            className={`${inputCls} h-20 resize-none`}
          />
        </div>
        <div>
          <label className={labelCls}>Giao cho</label>
          <select
            value={taskForm.assignedToId}
            onChange={(e) => setTaskForm((p) => ({ ...p, assignedToId: e.target.value }))}
            className={inputCls}
          >
            <option className="bg-slate-600" value="">-- Không giao --</option>
            {members.map((m) => (
              <option className="bg-slate-600" key={m.userId} value={m.userId}>
                {m.username}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Deadline <span className="text-white/30">(tùy chọn — tối thiểu ngày mai)</span></label>
          <input
            type="date"
            value={taskForm.deadline}
            min={tomorrow}
            onChange={(e) => setTaskForm((p) => ({ ...p, deadline: e.target.value }))}
            className={inputCls}
          />
        </div>
        {formError && <p className="text-red-400 text-xs">{formError}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={btnSecondary}>Hủy</button>
          <button type="submit" className={btnPrimary}>Tạo task</button>
        </div>
      </form>
    </Modal>
  );
}
