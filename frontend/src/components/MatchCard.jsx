import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiStarLine, RiMapPinLine, RiBuildingLine, RiSendPlaneLine } from 'react-icons/ri'

const CATEGORY_COLORS = {
  PROGRAMMING: 'bg-blue-500/20 text-blue-300',
  AI_ML: 'bg-purple-500/20 text-purple-300',
  DATA_SCIENCE: 'bg-cyan-500/20 text-cyan-300',
  CLOUD: 'bg-sky-500/20 text-sky-300',
  CYBERSECURITY: 'bg-red-500/20 text-red-300',
  UI_UX: 'bg-pink-500/20 text-pink-300',
  BUSINESS: 'bg-amber-500/20 text-amber-300',
  COMMUNICATION: 'bg-green-500/20 text-green-300',
  LANGUAGES: 'bg-orange-500/20 text-orange-300',
  OTHERS: 'bg-slate-500/20 text-slate-300',
}

export default function MatchCard({ match, onSendRequest }) {
  const navigate = useNavigate()
  const { user, matchScore, matchLabel, commonOfferedSkill, commonWantedSkill } = match

  const scoreColor = matchScore >= 85 ? 'text-accent-400' : matchScore >= 65 ? 'text-primary-400' : 'text-amber-400'
  const ringColor = matchScore >= 85 ? '#10b981' : matchScore >= 65 ? '#6366f1' : '#f59e0b'

  const offered = user.skills?.filter(s => s.type === 'OFFERED').slice(0, 3) || []
  const wanted = user.skills?.filter(s => s.type === 'WANTED').slice(0, 2) || []

  return (
    <motion.div className="match-card"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }} transition={{ duration: 0.3 }}>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0 cursor-pointer" onClick={() => navigate(`/users/${user.id}`)}>
          {user.profileImage
            ? <img src={`http://localhost:8080${user.profileImage}`} alt="" className="w-14 h-14 avatar" />
            : <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl">
                {user.name?.[0]}
              </div>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-white cursor-pointer hover:text-primary-400 transition-colors"
                onClick={() => navigate(`/users/${user.id}`)}>
                {user.name}
              </h3>
              {user.college && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <RiBuildingLine className="w-3 h-3" /> {user.college}
                </p>
              )}
            </div>

            {/* Match Score Ring */}
            <div className="flex flex-col items-center flex-shrink-0">
              <svg className="score-ring w-14 h-14 -rotate-90" style={{ '--score-offset': `${283 - (283 * matchScore / 100)}` }}>
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                <circle cx="28" cy="28" r="22" fill="none" stroke={ringColor} strokeWidth="4"
                  strokeLinecap="round" strokeDasharray="283"
                  strokeDashoffset={283 - (283 * matchScore / 100)} />
              </svg>
              <span className={`text-xs font-bold mt-0.5 ${scoreColor}`}>{matchScore}%</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <RiStarLine className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-slate-400">{user.rating?.toFixed(1) || '0.0'} ({user.ratingCount || 0})</span>
            <span className="mx-1 text-slate-700">•</span>
            <span className={`text-xs font-semibold ${scoreColor}`}>{matchLabel}</span>
          </div>

          {/* Match reason */}
          {(commonOfferedSkill || commonWantedSkill) && (
            <div className="mt-2 text-xs text-slate-500">
              {commonOfferedSkill && <span>They offer: <span className="text-accent-400 font-medium">{commonOfferedSkill}</span></span>}
              {commonWantedSkill && <span className="ml-2">They want: <span className="text-primary-400 font-medium">{commonWantedSkill}</span></span>}
            </div>
          )}

          {/* Skills */}
          {offered.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {offered.map(skill => (
                <span key={skill.id}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[skill.category] || CATEGORY_COLORS.OTHERS}`}>
                  {skill.skillName}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button onClick={() => onSendRequest(user)}
          className="btn-primary flex-1 flex items-center justify-center gap-2 py-2 text-sm">
          <RiSendPlaneLine className="w-4 h-4" />
          Send Request
        </button>
        <button onClick={() => navigate(`/chat/${user.id}`)}
          className="btn-secondary px-4 py-2 text-sm">
          Chat
        </button>
      </div>
    </motion.div>
  )
}
