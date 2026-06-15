import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notificationAPI } from '../api'
import {
  RiDashboardLine, RiUserLine, RiLightbulbLine, RiTeamLine,
  RiMessage2Line, RiCalendarLine, RiMapLine, RiStarLine,
  RiBellLine, RiTrophyLine, RiLogoutBoxLine, RiMenuLine, RiCloseLine,
  RiShieldLine
} from 'react-icons/ri'

const navItems = [
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/profile', icon: RiUserLine, label: 'Profile' },
  { to: '/skills', icon: RiLightbulbLine, label: 'My Skills' },
  { to: '/matches', icon: RiTeamLine, label: 'Matches' },
  { to: '/chat', icon: RiMessage2Line, label: 'Chat' },
  { to: '/sessions', icon: RiCalendarLine, label: 'Sessions' },
  { to: '/roadmap', icon: RiMapLine, label: 'AI Roadmap' },
  { to: '/reviews', icon: RiStarLine, label: 'Reviews' },
  { to: '/notifications', icon: RiBellLine, label: 'Notifications' },
  { to: '/leaderboard', icon: RiTrophyLine, label: 'Leaderboard' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    notificationAPI.getUnreadCount()
      .then(r => setUnreadCount(r.data.count))
      .catch(() => {})
    const interval = setInterval(() => {
      notificationAPI.getUnreadCount()
        .then(r => setUnreadCount(r.data.count))
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => { logout(); navigate('/') }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'fixed inset-0 z-50' : 'relative'} flex`}>
      {mobile && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}
      <div className={`${mobile ? 'relative' : ''} w-64 bg-dark-800/95 backdrop-blur-xl border-r border-white/10 flex flex-col h-full`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30">
              S
            </div>
            <span className="font-display font-bold text-lg gradient-text">SkillSwap AI</span>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user?.profileImage
                ? <img src={`http://localhost:8080${user.profileImage}`} alt="" className="w-10 h-10 avatar" />
                : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                    {user?.name?.[0]}
                  </div>
              }
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-accent-500 rounded-full border-2 border-dark-800" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.credits} credits</p>
            </div>
          </div>
          {/* Profile completion bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Profile</span><span>{user?.profileCompletion || 0}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${user?.profileCompletion || 0}%` }} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => mobile && setSidebarOpen(false)}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <RiShieldLine className="w-5 h-5" />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <RiLogoutBoxLine className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen flex bg-dark-900">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && <Sidebar mobile />}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar (mobile) */}
        <div className="lg:hidden sticky top-0 z-40 bg-dark-800/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">S</div>
            <span className="font-display font-bold gradient-text">SkillSwap AI</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white p-2">
            <RiMenuLine className="w-6 h-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="p-6 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
