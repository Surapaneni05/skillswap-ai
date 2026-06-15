import { useState, useEffect } from 'react'
import { sessionAPI, userAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { RiCalendarLine, RiAddLine, RiCheckLine, RiCloseLine, RiVideoLine, RiTimeLine } from 'react-icons/ri'

const STATUS_COLORS = {
  SCHEDULED: 'badge-primary', COMPLETED: 'badge-accent', CANCELLED: 'badge-danger'
}

export default function Sessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('upcoming')
  const [bookModal, setBookModal] = useState(false)
  const [reviewModal, setReviewModal] = useState(null)
  const [users, setUsers]       = useState([])
  const [form, setForm] = useState({ mentorId:'', skill:'', date:'', time:'', duration:60, meetingLink:'', notes:'' })
  const [saving, setSaving]     = useState(false)

  const load = () => {
    sessionAPI.getMySessions().then(r => setSessions(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => {
    load()
    userAPI.getAll().then(r => setUsers(r.data.filter(u => u.id !== user?.id))).catch(() => {})
  }, [])

  const filtered = sessions.filter(s => {
    if (tab === 'upcoming')  return s.status === 'SCHEDULED'
    if (tab === 'completed') return s.status === 'COMPLETED'
    if (tab === 'cancelled') return s.status === 'CANCELLED'
    return true
  })

  const handleBook = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await sessionAPI.bookSession({ ...form, mentorId: parseInt(form.mentorId) })
      toast.success('Session booked! 📅')
      setBookModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed') }
    finally { setSaving(false) }
  }

  const handleComplete = async (id) => {
    try { await sessionAPI.completeSession(id); toast.success('Session completed! Credits transferred.'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this session?')) return
    try { await sessionAPI.cancelSession(id); toast.success('Session cancelled'); load() }
    catch { toast.error('Failed to cancel') }
  }

  if (loading) return <div className="flex justify-center pt-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <RiCalendarLine className="w-7 h-7 text-primary-400" /> Sessions
          </h1>
          <p className="text-slate-400 text-sm mt-1">{sessions.filter(s=>s.status==='SCHEDULED').length} upcoming</p>
        </div>
        <button onClick={() => setBookModal(true)} className="btn-primary flex items-center gap-2">
          <RiAddLine className="w-5 h-5" /> Book Session
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-px">
        {[['upcoming','Upcoming'],['completed','Completed'],['cancelled','Cancelled'],['all','All']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
            {label}
            <span className="ml-1.5 text-xs opacity-70">
              ({sessions.filter(s => key === 'all' ? true : s.status === key.toUpperCase()).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <div className="text-center py-16 text-slate-500">
            <RiCalendarLine className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No {tab} sessions</p>
            <button onClick={() => setBookModal(true)} className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
              Book a Session
            </button>
          </div>
        : <div className="space-y-4">
            {filtered.map(s => {
              const isMentor = s.mentor?.id === user?.id
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-dark p-5 border border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
                        <RiCalendarLine className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{s.skill}</h3>
                        <p className="text-sm text-slate-400 mt-0.5">
                          {isMentor ? `Teaching → ${s.learner?.name}` : `Learning from ${s.mentor?.name}`}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <RiTimeLine className="w-3 h-3" />
                            {s.date ? format(new Date(s.date), 'MMM d, yyyy') : 'TBD'} at {s.time?.slice(0,5) || '—'} • {s.duration}min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                      {s.meetingLink && s.status === 'SCHEDULED' && (
                        <a href={s.meetingLink} target="_blank" rel="noreferrer" className="btn-accent text-xs px-3 py-1.5 flex items-center gap-1">
                          <RiVideoLine className="w-3.5 h-3.5" /> Join
                        </a>
                      )}
                      {s.status === 'SCHEDULED' && isMentor && (
                        <button onClick={() => handleComplete(s.id)} className="btn-accent text-xs px-3 py-1.5 flex items-center gap-1">
                          <RiCheckLine className="w-3.5 h-3.5" /> Complete
                        </button>
                      )}
                      {s.status === 'SCHEDULED' && (
                        <button onClick={() => handleCancel(s.id)} className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1">
                          <RiCloseLine className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
      }

      {/* Book Modal */}
      <AnimatePresence>
        {bookModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setBookModal(false)}>
            <motion.div className="glass-dark w-full max-w-md p-6 border border-white/10 max-h-screen overflow-y-auto"
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <h2 className="font-display font-bold text-lg text-white mb-5">Book a Session</h2>
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Mentor *</label>
                  <select required className="select-field text-sm" value={form.mentorId} onChange={e => setForm({...form, mentorId: e.target.value})}>
                    <option value="">Select mentor</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Skill / Topic *</label>
                  <input required className="input-field text-sm" placeholder="e.g. React.js basics"
                    value={form.skill} onChange={e => setForm({...form, skill: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Date *</label>
                    <input required type="date" className="input-field text-sm" min={new Date().toISOString().split('T')[0]}
                      value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Time *</label>
                    <input required type="time" className="input-field text-sm"
                      value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Duration (min)</label>
                    <select className="select-field text-sm" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})}>
                      {[30,45,60,90,120].map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Meeting Link</label>
                    <input type="url" className="input-field text-sm" placeholder="Zoom / Meet URL"
                      value={form.meetingLink} onChange={e => setForm({...form, meetingLink: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Notes</label>
                  <textarea rows={2} className="input-field text-sm resize-none" placeholder="What to cover..."
                    value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setBookModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Book Session'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
