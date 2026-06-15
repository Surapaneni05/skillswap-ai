import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { sessionAPI, matchAPI, notificationAPI, creditAPI } from '../api'
import StatCard from '../components/StatCard'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format } from 'date-fns'
import {
  RiLightbulbLine, RiCoinsLine, RiTeamLine, RiCalendarLine,
  RiStarLine, RiArrowRightLine, RiBrainLine
} from 'react-icons/ri'
import { Link } from 'react-router-dom'

const skillGrowthData = [
  { month: 'Jan', skills: 2 }, { month: 'Feb', skills: 3 }, { month: 'Mar', skills: 4 },
  { month: 'Apr', skills: 5 }, { month: 'May', skills: 7 }, { month: 'Jun', skills: 9 },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [upcoming, setUpcoming]   = useState([])
  const [matches, setMatches]     = useState([])
  const [credits, setCredits]     = useState({ earned: 0, spent: 0 })
  const [notifs, setNotifs]       = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      sessionAPI.getUpcoming(),
      matchAPI.getMatches(),
      creditAPI.getSummary(),
      notificationAPI.getAll(),
    ]).then(([s, m, c, n]) => {
      setUpcoming(s.data.slice(0, 3))
      setMatches(m.data.slice(0, 3))
      setCredits(c.data)
      setNotifs(n.data.slice(0, 5))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening with your skill journey today</p>
        </div>
        <Link to="/roadmap" className="btn-primary hidden sm:flex items-center gap-2 text-sm">
          <RiBrainLine className="w-4 h-4" /> Generate Roadmap
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={RiLightbulbLine} label="My Skills"        value={user?.skills?.length || 0}  color="primary" index={0} />
        <StatCard icon={RiCoinsLine}     label="Credits Balance"   value={user?.credits || 0}         color="accent"  index={1} />
        <StatCard icon={RiTeamLine}      label="AI Matches"        value={matches.length}             color="purple"  index={2} />
        <StatCard icon={RiStarLine}      label="Rating"            value={user?.rating?.toFixed(1) || '0.0'} color="amber" index={3} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skills Growth Chart */}
        <div className="glass-dark p-6">
          <h2 className="font-display font-semibold text-white mb-4">Skills Growth</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={skillGrowthData}>
              <defs>
                <linearGradient id="colorSkills" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Area type="monotone" dataKey="skills" stroke="#6366f1" strokeWidth={2} fill="url(#colorSkills)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Credits Chart */}
        <div className="glass-dark p-6">
          <h2 className="font-display font-semibold text-white mb-4">Credit Activity</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: 'Balance', value: user?.credits || 0 },
              { name: 'Earned',  value: credits.earned },
              { name: 'Spent',   value: credits.spent },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="glass-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white flex items-center gap-2">
              <RiCalendarLine className="w-5 h-5 text-primary-400" /> Upcoming Sessions
            </h2>
            <Link to="/sessions" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
              View all <RiArrowRightLine className="w-4 h-4" />
            </Link>
          </div>
          {upcoming.length === 0
            ? <div className="text-center py-8 text-slate-500">
                <RiCalendarLine className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No upcoming sessions</p>
                <Link to="/matches" className="text-primary-400 text-sm mt-2 inline-block">Find a match →</Link>
              </div>
            : upcoming.map(s => (
              <div key={s.id} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
                  <RiCalendarLine className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white">{s.skill}</p>
                  <p className="text-xs text-slate-500">{s.mentor?.name} • {s.date ? format(new Date(s.date), 'MMM d') : 'TBD'} at {s.time?.slice(0,5) || '—'}</p>
                </div>
                <span className="badge-primary">{s.status}</span>
              </div>
            ))
          }
        </div>

        {/* Recent Notifications */}
        <div className="glass-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">Recent Activity</h2>
            <Link to="/notifications" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
              View all <RiArrowRightLine className="w-4 h-4" />
            </Link>
          </div>
          {notifs.length === 0
            ? <p className="text-center text-slate-500 py-8">No notifications yet</p>
            : notifs.map(n => (
              <div key={n.id} className={`flex items-start gap-3 py-3 border-b border-white/5 last:border-0 ${!n.isRead ? 'opacity-100' : 'opacity-60'}`}>
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? 'bg-primary-400' : 'bg-slate-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
