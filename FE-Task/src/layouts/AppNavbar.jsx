import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/common/NotificationBell";

export default function AppNavbar() {
  const navigate = useNavigate();
  const raw = sessionStorage.getItem("currentUser");
  const currentUser = raw ? JSON.parse(raw) : null;

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("currentUser");
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-slate-900/90 backdrop-blur px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-2 hover:opacity-80 transition">
        <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">
          T
        </div>
        <span className="font-bold tracking-tight text-white">TaskFlow</span>
      </div>
      <div className="flex items-center gap-4">
        {currentUser && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-600/40 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {currentUser.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-white/65 text-sm">
              {currentUser.username}
            </span>
          </div>
        )}
        {currentUser && <NotificationBell />}
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-xs border border-white/15 hover:bg-white/5 rounded-lg transition text-white/60 hover:text-white"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
