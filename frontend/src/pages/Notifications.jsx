import { useState, useEffect } from 'react'
import { notificationAPI } from '../api'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { RiBellLine, RiCheckDoubleLine } from 'react-icons/ri'

const TYPE_ICONS = {
  NEW_MATCH: '🤝', NEW_MESSAGE: '💬', SESSION_REMINDER: '📅',
  CREDIT_EARNED: '💰', REVIEW_RECEIVED: '⭐', REQUEST_ACCEPTED: '✅',
  REQUEST_REJECTED: '❌', SESSION_COMPLETED: '🎉', SYSTEM: '🔔',
}

export default function Notifications() {
  const [notifs, setNotifs]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => notificationAPI.getAll().then(r => setNotifs(r.data)).catch(() => {}).finally(() => setLoading(false))
  useEffect(load, [])

  const markAll = async () => {
    await notificationAPI.markAllRead().catch(() => {})
    toast.success('All marked as read')
    load()
  }

  const markOne = async (id) => {
    await notificationAPI.markRead(id).catch(() => {})
    load()
  }

  const unread = notifs.filter(n => !n.isRead).length

  if (loading) return <div className="flex justify-center pt-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <RiBellLine className="w-7 h-7 text-primary-400" /> Notifications
          </h1>
          {unread > 0 && <p className="text-slate-400 text-sm mt-1">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="btn-secondary flex items-center gap-2 text-sm">
            <RiCheckDoubleLine className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifs.length === 0
        ? <div className="text-center py-16 text-slate-500">
            <RiBellLine className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No notifications yet</p>
          </div>
        : <div className="space-y-2">
            {notifs.map((n, i) => (
              <motion.div key={n.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => !n.isRead && markOne(n.id)}
                className={`glass-dark p-4 border cursor-pointer transition-all hover:border-primary-500/30
                  ${!n.isRead ? 'border-primary-500/20 bg-primary-500/5' : 'border-white/10 opacity-70'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 flex-shrink-0">{TYPE_ICONS[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                      <span className="text-xs text-slate-600 flex-shrink-0">
                        {n.createdAt ? format(new Date(n.createdAt), 'MMM d, HH:mm') : ''}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{n.message}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0 mt-1.5" />}
                </div>
              </motion.div>
            ))}
          </div>
      }
    </div>
  )
}
