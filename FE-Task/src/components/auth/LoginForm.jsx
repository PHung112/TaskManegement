import { useState } from "react";

const inputCls =
  "w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500 transition";

export default function LoginForm({ onLogin, loading, onSwitchToRegister }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await onLogin(form);
    if (!res.success) setError(res.error);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-white/60 text-sm mb-1.5 block">Tên đăng nhập</label>
        <input
          value={form.username}
          onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
          placeholder="Nhập username của bạn..."
          className={inputCls}
          required
        />
      </div>
      <div>
        <label className="text-white/60 text-sm mb-1.5 block">Mật khẩu</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          placeholder="••••••••"
          className={inputCls}
          required
        />
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl font-semibold text-white transition shadow-lg shadow-purple-500/20"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
      <p className="text-center text-white/35 text-sm">
        Chưa có tài khoản?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-purple-400 hover:text-purple-300"
        >
          Đăng ký ngay
        </button>
      </p>
    </form>
  );
}
