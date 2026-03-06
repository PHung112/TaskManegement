import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authApi from '../api/authApi'

export default function AuthPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [regForm, setRegForm] = useState({ username: '', email: '', password: '' })
  const [regError, setRegError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) navigate('/projects')
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoading(true)
    try {
      const res = await authApi.login(loginForm)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('currentUser', JSON.stringify({
        id: res.data.id,
        username: res.data.username,
        email: res.data.email,
      }))
      navigate('/projects')
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Đăng nhập thất bại.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegError('')
    setLoading(true)
    try {
      const res = await authApi.register(regForm)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('currentUser', JSON.stringify({
        id: res.data.id,
        username: res.data.username,
        email: res.data.email,
      }))
      navigate('/projects')
    } catch (err) {
      setRegError(err.response?.data?.error || 'Đăng ký thất bại. Username hoặc email có thể đã tồn tại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">T</div>
            <span className="text-2xl font-bold text-white tracking-tight">TaskFlow</span>
          </button>
          <p className="text-white/40 text-sm mt-2">
            {tab === 'login' ? 'Chào mừng trở lại 👋' : 'Tạo tài khoản mới ✨'}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          {/* Tab switcher */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-7">
            {[{ key: 'login', label: 'Đăng nhập' }, { key: 'register', label: 'Đăng ký' }].map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setLoginError(''); setRegError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  tab === t.key ? 'bg-purple-600 text-white shadow' : 'text-white/50 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Tên đăng nhập</label>
                <input
                  value={loginForm.username}
                  onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="Nhập username của bạn..."
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Mật khẩu</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>
              {loginError && (
                <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {loginError}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl font-semibold text-white transition shadow-lg shadow-purple-500/20"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
              <p className="text-center text-white/35 text-sm">
                Chưa có tài khoản?{' '}
                <button type="button" onClick={() => setTab('register')} className="text-purple-400 hover:text-purple-300">
                  Đăng ký ngay
                </button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              {[
                { label: 'Tên đăng nhập', key: 'username', type: 'text', placeholder: 'username...' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'email@example.com' },
                { label: 'Mật khẩu', key: 'password', type: 'password', placeholder: '••••••••' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-white/60 text-sm mb-1.5 block">{f.label}</label>
                  <input
                    type={f.type}
                    value={regForm[f.key]}
                    onChange={e => setRegForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500 transition"
                    required
                  />
                </div>
              ))}
              {regError && (
                <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {regError}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl font-semibold text-white transition shadow-lg shadow-purple-500/20"
              >
                {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </button>
              <p className="text-center text-white/35 text-sm">
                Đã có tài khoản?{' '}
                <button type="button" onClick={() => setTab('login')} className="text-purple-400 hover:text-purple-300">
                  Đăng nhập
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
