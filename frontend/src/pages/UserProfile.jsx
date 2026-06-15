import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { userAPI, reviewAPI, requestAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { RiStarFill, RiStarLine, RiSendPlaneLine, RiMapPinLine, RiBuildingLine, RiGithubLine, RiLinkedinBoxLine } from 'react-icons/ri'

const LEVEL_COLORS = { BEGINNER:'badge-primary', INTERMEDIATE:'badge-accent', ADVANCED:'badge-warning', EXPERT:'badge-purple' }

export default function UserProfile() {
  const { id } = useParams()
  const { user: me } = useAuth()
  const [profile, setProfile] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    Promise.all([userAPI.getById(parseInt(id)), reviewAPI.getUserReviews(parseInt(id))])
      .then(([p, r]) => { setProfile(p.data); setReviews(r.data) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const sendRequest = async () => {
    setSending(true)
    try {
      await requestAPI.sendRequest({ receiverId: parseInt(id), message: `Hi ${profile.name}, I'd love to swap skills with you!` })
      toast.success('Request sent! 🎉')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSending(false) }
  }

  if (loading) return <div className="flex justify-center pt-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!profile) return <div className="text-center text-slate-500 py-20">User not found</div>

  const offered = profile.skills?.filter(s => s.type === 'OFFERED') || []
  const wanted  = profile.skills?.filter(s => s.type === 'WANTED')  || []

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="glass-dark p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {profile.profileImage
            ? <img src={`http://localhost:8080${profile.profileImage}`} alt="" className="w-20 h-20 avatar flex-shrink-0" />
            : <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">{profile.name?.[0]}</div>
          }
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-white">{profile.name}</h1>
                {profile.college && <p className="text-slate-400 flex items-center gap-1 text-sm mt-0.5"><RiBuildingLine className="w-4 h-4" />{profile.college} • {profile.branch}</p>}
                {profile.location && <p className="text-slate-500 flex items-center gap-1 text-xs mt-0.5"><RiMapPinLine className="w-3.5 h-3.5" />{profile.location}</p>}
              </div>
              {me?.id !== profile.id && (
                <button onClick={sendRequest} disabled={sending} className="btn-primary flex items-center gap-2 text-sm flex-shrink-0">
                  <RiSendPlaneLine className="w-4 h-4" /> {sending ? '...' : 'Swap Request'}
                </button>
              )}
            </div>
            {profile.bio && <p className="text-slate-400 text-sm mt-3 leading-relaxed">{profile.bio}</p>}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-amber-400">
                <RiStarFill className="w-4 h-4" />
                <span className="font-bold">{profile.rating?.toFixed(1)}</span>
                <span className="text-slate-500 text-sm">({profile.ratingCount})</span>
              </div>
              <span className="text-accent-400 font-semibold">{profile.credits} credits</span>
              {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white"><RiGithubLine className="w-5 h-5" /></a>}
              {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white"><RiLinkedinBoxLine className="w-5 h-5" /></a>}
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      {(offered.length > 0 || wanted.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="glass-dark p-5 border border-white/10">
            <h2 className="font-semibold text-white mb-3 text-accent-400">✅ Offering</h2>
            <div className="flex flex-wrap gap-2">
              {offered.map(s => <span key={s.id} className={`badge ${LEVEL_COLORS[s.level]}`}>{s.skillName}</span>)}
            </div>
          </div>
          <div className="glass-dark p-5 border border-white/10">
            <h2 className="font-semibold text-white mb-3 text-amber-400">🔍 Wanting</h2>
            <div className="flex flex-wrap gap-2">
              {wanted.map(s => <span key={s.id} className="badge-warning">{s.skillName}</span>)}
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-white">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? <p className="text-slate-500 text-sm">No reviews yet</p>
          : reviews.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="glass-dark p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">{r.reviewer?.name?.[0]}</div>
                <div>
                  <p className="font-medium text-sm text-white">{r.reviewer?.name}</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => s <= r.rating ? <RiStarFill key={s} className="w-3 h-3 text-amber-400" /> : <RiStarLine key={s} className="w-3 h-3 text-slate-600" />)}
                  </div>
                </div>
              </div>
              {r.comment && <p className="text-slate-300 text-sm">{r.comment}</p>}
            </motion.div>
          ))
        }
      </div>
    </div>
  )
}
