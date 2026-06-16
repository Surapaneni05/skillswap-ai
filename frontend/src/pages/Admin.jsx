import { useState, useEffect } from 'react'
import { adminAPI } from '../api'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { RiShieldLine, RiUserLine, RiLockLine, RiDeleteBinLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [topSkills, setTopSkills] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([adminAPI.getAnalytics(), adminAPI.getUsers(), adminAPI.getTopSkills()])
      .then(([a, u, s]) => { setAnalytics(a.data); setUsers(u.data); setTopSkills(s.data) })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [])

  const blockUser = async (id, isActive) => {
    try {
      if (isActive) await adminAPI.blockUser(id)
      else await adminAPI.unblockUser(id)
      toast.success(isActive ? 'User blocked' : 'User unblocked')
      const { data } = await adminAPI.getUsers()
      setUsers(data)
    } catch { toast.error('Action failed') }
  }

  const deleteUser = async (id) => {
    if (!confirm('Permanently delete this user?')) return
    try { await adminAPI.deleteUser(id); toast.success('User deleted'); setUsers(u => u.filter(u => u.id !== id)) }
    catch { toast.error('Delete failed') }
  }

  if (loading) return <div className="flex justify-center pt-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  const statCards = [
    { label: 'Total Users', value: analytics?.totalUsers, color: '#6366f1' },
    { label: 'Active Users', value: analytics?.activeUsers, color: '#10b981' },
    { label: 'Total Sessions', value: analytics?.totalSessions, color: '#f59e0b' },
    { label: 'Completed Sessions', value: analytics?.completedSessions, color: '#8b5cf6' },
    { label: 'Total Skills', value: analytics?.totalSkills, color: '#ef4444' },
  ]

  const pieData = [
    { name: 'Active', value: analytics?.activeUsers || 0 },
    { name: 'Inactive', value: (analytics?.totalUsers || 0) - (analytics?.activeUsers || 0) },
  ]

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <div className="bg-dark-800/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white">← Back</button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <RiShieldLine className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg">Admin Panel</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-px">
          {['overview', 'users'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {statCards.map((s, i) => (
                <div key={i} className="glass-dark p-5 border border-white/10 text-center">
                  <p className="font-display text-3xl font-bold" style={{ color: s.color }}>{s.value?.toLocaleString() || 0}</p>
                  <p className="text-slate-500 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-dark p-6 border border-white/10">
                <h2 className="font-display font-semibold text-white mb-4">Top Skills</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topSkills.slice(0, 8).map(([name, count]) => ({ name, count }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-dark p-6 border border-white/10 flex flex-col items-center justify-center">
                <h2 className="font-display font-semibold text-white mb-4 self-start">User Status</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  {pieData.map((d, i) => <div key={i} className="flex items-center gap-1.5 text-xs"><div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} /><span className="text-slate-400">{d.name}: {d.value}</span></div>)}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-slate-400 text-sm">{users.length} total users</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    {['User', 'Email', 'Role', 'Status', 'Credits', 'Rating', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{u.name?.[0]}</div>
                          <span className="font-medium text-sm text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">{u.email}</td>
                      <td className="px-4 py-3"><span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : 'badge-primary'}`}>{u.role}</span></td>
                      <td className="px-4 py-3"><span className={`badge ${u.isActive ? 'badge-accent' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Blocked'}</span></td>
                      <td className="px-4 py-3 text-sm text-accent-400">{u.credits}</td>
                      <td className="px-4 py-3 text-sm text-amber-400">{u.rating?.toFixed(1)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => blockUser(u.id, u.isActive)}
                            className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'text-amber-400 hover:bg-amber-400/10' : 'text-green-400 hover:bg-green-400/10'}`}
                            title={u.isActive ? 'Block' : 'Unblock'}>
                            {u.isActive ? <RiLockLine className="w-4 h-4" /> : <RilockLine className="w-4 h-4" />}
                          </button>
                          <button onClick={() => deleteUser(u.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
                            <RiDeleteBin6Line className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
