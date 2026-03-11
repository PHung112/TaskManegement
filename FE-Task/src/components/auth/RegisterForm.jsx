import { useState } from "react";

const inputCls =
  "w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500 transition";

const FIELDS = [
  { label: "Tên đăng nhập", key: "username", type: "text", placeholder: "username..." },
  { label: "Email", key: "email", type: "email", placeholder: "email@example.com" },
  { label: "Mật khẩu", key: "password", type: "password", placeholder: "••••••••" },
];

export default function RegisterForm({ onRegister, loading, onSwitchToLogin }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const res = await onRegister(form);
    if (!res.success) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      else setErrors({ general: res.error });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="text-white/60 text-sm mb-1.5 block">{f.label}</label>
          <input
            type={f.type}
            value={form[f.key]}
            onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
            className={inputCls}
            required
          />
          {errors[f.key] && (
            <span className="text-red-400 text-xs">{errors[f.key]}</span>
          )}
        </div>
      ))}
      {errors.general && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
          {errors.general}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl font-semibold text-white transition shadow-lg shadow-purple-500/20"
      >
        {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </button>
      <p className="text-center text-white/35 text-sm">
        Đã có tài khoản?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-purple-400 hover:text-purple-300"
        >
          Đăng nhập
        </button>
      </p>
    </form>
  );
}
