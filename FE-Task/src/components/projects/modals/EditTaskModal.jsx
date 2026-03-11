import Modal from "../../common/Modal";
import { inputCls, labelCls, btnPrimary, btnSecondary } from "../../common/formStyles";

export default function EditTaskModal({ taskForm, setTaskForm, onSubmit, onClose, formError }) {
  return (
    <Modal title="Chỉnh sửa task" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Tiêu đề *</label>
          <input
            value={taskForm.title}
            onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className={labelCls}>Mô tả</label>
          <textarea
            value={taskForm.description}
            onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
            className={`${inputCls} h-20 resize-none`}
          />
        </div>
        <div>
          <label className={labelCls}>Deadline</label>
          <input
            type="date"
            value={taskForm.deadline}
            onChange={(e) => setTaskForm((p) => ({ ...p, deadline: e.target.value }))}
            className={inputCls}
          />
        </div>
        {formError && <p className="text-red-400 text-xs">{formError}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={btnSecondary}>Hủy</button>
          <button type="submit" className={btnPrimary}>Lưu thay đổi</button>
        </div>
      </form>
    </Modal>
  );
}
