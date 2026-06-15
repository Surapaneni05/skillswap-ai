import { useState, useEffect } from 'react'
import { reviewAPI, sessionAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { RiStarFill, RiStarLine, RiAddLine } from 'react-icons/ri'

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange && onChange(s)}>
          {(hover || value) >= s
            ? <RiStarFill className="w-7 h-7 text-amber-400" />
            : <RiStarLine className="w-7 h-7 text-slate-600" />
          }
        </button>
      ))}
    </div>
  )
}

export default function Reviews() {
  const { user } = useAuth()
  const [reviews, setReviews]           = useState([])
  const [sessions, setSessions]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [modal, setModal]               = useState(false)
  const [form, setForm] = useState({ sessionId:'', revieweeId:'', rating:5, comment:'' })
  const [saving, setSaving]             = useState(false)

  useEffect(() => {
    Promise.all([
      reviewAPI.getUserReviews(user?.id),
      sessionAPI.getMySessions(),
    ]).then(([r, s]) => {
      setReviews(r.data)
      setSessions(s.data.filter(s => s.status === 'COMPLETED'))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await reviewAPI.createReview({ ...form, sessionId: parseInt(form.sessionId), revieweeId: parseInt(form.revieweeId), rating: form.rating })
      toast.success('Review submitted! ⭐')
      setModal(false)
      const { data } = await reviewAPI.getUserReviews(user?.id)
      setReviews(data)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review') }
    finally { setSaving(false) }
  }

  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : 0

  if (loading) return <div className="flex justify-center pt-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <RiStarFill className="w-7 h-7 text-amber-400" /> Reviews
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <StarRating value={Math.round(avgRating)} />
            <span className="text-slate-400 text-sm">{avgRating} avg ({reviews.length} reviews)</span>
          </div>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <RiAddLine className="w-5 h-5" /> Write Review
        </button>
      </div>

      {reviews.length === 0
        ? <div className="text-center py-16 text-slate-500">
            <RiStarLine className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No reviews yet</p>
            <p className="text-sm mt-1">Complete sessions to receive reviews</p>
          </div>
        : <div className="space-y-4">
            {reviews.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="glass-dark p-5 border border-white/10">
                <div className="flex items-start gap-4">
                  {r.reviewer?.profileImage
                    ? <img src={`http://localhost:8080${r.reviewer.profileImage}`} alt="" className="w-10 h-10 avatar flex-shrink-0" />
                    : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0">{r.reviewer?.name?.[0]}</div>
                  }
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white text-sm">{r.reviewer?.name}</p>
                      <span className="text-xs text-slate-500">{r.createdAt ? format(new Date(r.createdAt), 'MMM d, yyyy') : ''}</span>
                    </div>
                    <div className="flex gap-0.5 my-1">
                      {[1,2,3,4,5].map(s => (
                        <span key={s}>{s <= r.rating ? <RiStarFill className="w-4 h-4 text-amber-400 inline" /> : <RiStarLine className="w-4 h-4 text-slate-600 inline" />}</span>
                      ))}
                    </div>
                    {r.comment && <p className="text-slate-300 text-sm leading-relaxed mt-1">{r.comment}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
      }

      {/* Review Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setModal(false)}>
            <motion.div className="glass-dark w-full max-w-md p-6 border border-white/10"
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <h2 className="font-display font-bold text-lg text-white mb-5">Write a Review</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Select Session *</label>
                  <select required className="select-field text-sm" value={form.sessionId}
                    onChange={e => {
                      const s = sessions.find(s => s.id === parseInt(e.target.value))
                      setForm({...form, sessionId: e.target.value, revieweeId: s?.mentor?.id === user?.id ? s?.learner?.id : s?.mentor?.id })
                    }}>
                    <option value="">Choose a completed session</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.skill} with {s.mentor?.id === user?.id ? s.learner?.name : s.mentor?.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Rating *</label>
                  <StarRating value={form.rating} onChange={r => setForm({...form, rating: r})} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Comment</label>
                  <textarea rows={3} className="input-field text-sm resize-none" placeholder="Share your experience..."
                    value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Submit Review'}
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
