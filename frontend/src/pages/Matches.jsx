import { useState, useEffect } from 'react'
import { matchAPI, requestAPI } from '../api'
import MatchCard from '../components/MatchCard'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { RiTeamLine, RiSearchLine, RiFilterLine } from 'react-icons/ri'

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [modal, setModal]     = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    matchAPI.getMatches()
      .then(r => setMatches(r.data))
      .catch(() => toast.error('Failed to load matches'))
      .finally(() => setLoading(false))
  }, [])

  const handleSendRequest = async () => {
    setSending(true)
    try {
      await requestAPI.sendRequest({ receiverId: modal.id, message })
      toast.success(`Request sent to ${modal.name}! 🎉`)
      setModal(null); setMessage('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request')
    } finally { setSending(false) }
  }

  const filtered = matches.filter(m =>
    m.user.name.toLowerCase().includes(search.toLowerCase()) ||
    m.user.skills?.some(s => s.skillName.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <div className="flex justify-center pt-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <RiTeamLine className="w-7 h-7 text-primary-400" /> AI Matches
        </h1>
        <p className="text-slate-400 text-sm mt-1">{matches.length} potential matches found for your skills</p>
      </div>

      <div className="relative">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
        <input className="input-field pl-9" placeholder="Search by name or skill..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0
        ? <div className="text-center py-20 text-slate-500">
            <RiTeamLine className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No matches found</p>
            <p className="text-sm mt-2">Add more skills to get better matches</p>
          </div>
        : <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(m => (
              <MatchCard key={m.user.id} match={m} onSendRequest={u => setModal(u)} />
            ))}
          </div>
      }

      {/* Send Request Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setModal(null)}>
            <motion.div className="glass-dark w-full max-w-md p-6 border border-white/10"
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <h2 className="font-display font-bold text-lg text-white mb-1">Send Swap Request</h2>
              <p className="text-slate-400 text-sm mb-5">to <span className="text-primary-400 font-semibold">{modal.name}</span></p>
              <textarea rows={4} className="input-field text-sm resize-none mb-4"
                placeholder="Introduce yourself and explain what you'd like to swap..."
                value={message} onChange={e => setMessage(e.target.value)} />
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSendRequest} disabled={sending} className="btn-primary flex-1">
                  {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Send Request'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
