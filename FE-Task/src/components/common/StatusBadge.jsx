export const STATUS_CFG = {
  TODO: { label: "Todo", cls: "bg-slate-700 text-slate-300" },
  ASSIGNED: { label: "Todo", cls: "bg-slate-700 text-slate-300" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-blue-500/20 text-blue-300" },
  SUBMITTED: { label: "Submitted", cls: "bg-yellow-500/20 text-yellow-300" },
  DONE: { label: "Done", cls: "bg-green-500/20 text-green-300" },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, cls: "bg-slate-700 text-slate-300" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
