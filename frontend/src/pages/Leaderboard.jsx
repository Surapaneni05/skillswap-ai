import { useState, useEffect } from 'react'
import { userAPI } from '../api'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { RiTrophyLine, RiStarFill, RiMedalLine, RiMapPinLine } from 'react-icons/ri'

const MEDAL_COLORS = ['text-yellow-400','text-slate-300','text-amber-600']
const MEDAL_BG     = ['bg-yellow-400/10 border-yellow-400/30','bg-slate-300/10 border-slate-300/30','bg-amber-600/10 border-amber-600/30']

export default function Leaderboard() {
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userAPI.getLeaderboard().then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center pt-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3 justify-center">
          <RiTrophyLine className="w-8 h-8 text-amber-400" /> Top Mentors
        </h1>
        <p className="text-slate-400 mt-2">Ranked by ratings, sessions, and credits earned</p>
      </div>

      {/* Top 3 podium */}
      {users.length >= 3 && (
        <div className="flex items-end justify-center gap-4 pt-4">
          {[1, 0, 2].map(idx => {
            const u = users[idx]
            if (!u) return null
            const isFirst = idx === 0
            return (
              <motion.div key={u.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex flex-col items-center ${isFirst ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}>
                <div className={`relative mb-2`}>
                  {u.profileImage
                    ? <img src={`http://localhost:8080${u.profileImage}`} alt=""
                        className={`avatar ${isFirst ? 'w-20 h-20' : 'w-14 h-14'}`} />
                    : <div className={`rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold ${isFirst ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-lg'}`}>
                        {u.name?.[0]}
                      </div>
                  }
                  <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full border-2 border-dark-900 flex items-center justify-center text-sm font-bold ${MEDAL_BG[idx]}`}>
                    <RiMedalLine className={`w-4 h-4 ${MEDAL_COLORS[idx]}`} />
                  </div>
                </div>
                <p className={`font-semibold text-center ${isFirst ? 'text-white' : 'text-slate-300'} text-sm`}>{u.name}</p>
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <RiStarFill className="w-3 h-3" /> {u.rating?.toFixed(1)}
                </div>
                <div className={`mt-2 ${isFirst ? 'h-16' : idx === 1 ? 'h-10' : 'h-8'} w-20 rounded-t-lg flex items-start justify-center pt-1 text-xs font-bold border-t ${MEDAL_BG[idx]} ${MEDAL_COLORS[idx]}`}>
                  #{idx + 1}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-3">
        {users.map((u, i) => (
          <motion.div key={u.id}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-dark p-4 border border-white/10 flex items-center gap-4 hover:border-primary-500/30 transition-all ${i < 3 ? 'bg-gradient-to-r from-white/5 to-transparent' : ''}`}>
            {/* Rank */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
              i === 0 ? 'bg-yellow-400/20 text-yellow-400' :
              i === 1 ? 'bg-slate-300/20 text-slate-300' :
              i === 2 ? 'bg-amber-600/20 text-amber-600' : 'bg-dark-700 text-slate-500'
            }`}>#{i + 1}</div>

            {/* Avatar */}
            {u.profileImage
              ? <img src={`http://localhost:8080${u.profileImage}`} alt="" className="w-10 h-10 avatar flex-shrink-0" />
              : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0">{u.name?.[0]}</div>
            }

            <div className="flex-1 min-w-0">
              <Link to={`/users/${u.id}`} className="font-semibold text-white hover:text-primary-400 transition-colors">{u.name}</Link>
              {u.college && <p className="text-xs text-slate-500 truncate">{u.college}</p>}
              {u.location && <p className="text-xs text-slate-600 flex items-center gap-0.5"><RiMapPinLine className="w-3 h-3" />{u.location}</p>}
            </div>

            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-amber-400 justify-end">
                <RiStarFill className="w-4 h-4" />
                <span className="font-bold">{u.rating?.toFixed(1)}</span>
              </div>
              <p className="text-xs text-slate-500">{u.ratingCount} reviews</p>
              <p className="text-xs text-accent-400 font-medium mt-0.5">{u.credits} credits</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
