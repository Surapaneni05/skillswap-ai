import { useState } from 'react'
import { roadmapAPI } from '../api'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { RiMapLine, RiSparklingLine, RiBrainLine, RiBookOpenLine, RiCheckLine, RiCodeLine, RiAwardLine } from 'react-icons/ri'

const ROLES = ['Full Stack Developer','Data Scientist','Machine Learning Engineer','DevOps Engineer','Cloud Engineer','Frontend Developer','Backend Developer','Cybersecurity Engineer','UI/UX Designer','Mobile Developer']
const LEVELS = ['Beginner','Intermediate','Advanced']
const TIME_OPTIONS = ['5 hours/week','10 hours/week','15 hours/week','20+ hours/week']

export default function Roadmap() {
  const [form, setForm] = useState({ targetRole: '', currentSkills: '', experienceLevel: 'Beginner', timeAvailable: '10 hours/week' })
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!form.targetRole) { toast.error('Please select a target role'); return }
    setLoading(true)
    try {
      const { data } = await roadmapAPI.generate(form)
      setRoadmap(data)
      toast.success('Roadmap generated! 🗺️')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to generate roadmap') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <RiBrainLine className="w-7 h-7 text-primary-400" /> AI Career Roadmap
        </h1>
        <p className="text-slate-400 text-sm mt-1">Get a personalized learning path powered by AI</p>
      </div>

      {/* Input form */}
      <div className="glass-dark p-6 border border-white/10">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Target Role *</label>
            <select className="select-field" value={form.targetRole} onChange={e => setForm({...form, targetRole: e.target.value})}>
              <option value="">Choose your dream role...</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Current Skills</label>
            <textarea rows={2} className="input-field resize-none" placeholder="e.g. HTML, CSS, basic JavaScript, Python basics..."
              value={form.currentSkills} onChange={e => setForm({...form, currentSkills: e.target.value})} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Experience Level</label>
              <select className="select-field" value={form.experienceLevel} onChange={e => setForm({...form, experienceLevel: e.target.value})}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Time Available</label>
              <select className="select-field" value={form.timeAvailable} onChange={e => setForm({...form, timeAvailable: e.target.value})}>
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <button id="generate-roadmap" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
            {loading
              ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating your roadmap...</>
              : <><RiSparklingLine className="w-5 h-5" />Generate AI Roadmap</>
            }
          </button>
        </form>
      </div>

      {/* Roadmap output */}
      <AnimatePresence>
        {roadmap && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Title */}
            <div className="glass-dark p-6 border border-primary-500/20 bg-gradient-to-br from-primary-500/10 to-accent-500/5">
              <h2 className="font-display text-2xl font-bold gradient-text">{roadmap.title}</h2>
              {roadmap.summary && <p className="text-slate-400 mt-2">{roadmap.summary}</p>}
              {roadmap.weeklyPlan && (
                <div className="mt-3 inline-flex items-center gap-2 badge-primary px-3 py-1">
                  <RiBookOpenLine className="w-4 h-4" /> {roadmap.weeklyPlan}
                </div>
              )}
            </div>

            {/* Monthly timeline */}
            {roadmap.months && roadmap.months.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <RiMapLine className="w-5 h-5 text-primary-400" /> Monthly Roadmap
                </h3>
                <div className="relative pl-8 space-y-4">
                  {/* Vertical line */}
                  <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500 via-accent-500 to-transparent" />

                  {roadmap.months.map((m, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative glass-dark p-5 border border-white/10 hover:border-primary-500/30 transition-colors">
                      {/* Timeline dot */}
                      <div className="absolute -left-[18px] top-5 w-4 h-4 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 border-2 border-dark-900" />

                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Month {m.month}</span>
                          <h4 className="font-display font-bold text-white mt-0.5">{m.title}</h4>
                        </div>
                      </div>

                      {m.topics && m.topics.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><RiCodeLine className="w-3.5 h-3.5" /> Topics to learn</p>
                          <div className="flex flex-wrap gap-2">
                            {m.topics.map((t, j) => (
                              <span key={j} className="px-2.5 py-1 bg-primary-500/15 text-primary-300 text-xs rounded-lg border border-primary-500/20">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {m.projects && m.projects.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-500 mb-2">🚀 Projects</p>
                          <div className="flex flex-wrap gap-2">
                            {m.projects.map((p, j) => (
                              <span key={j} className="px-2.5 py-1 bg-accent-500/15 text-accent-300 text-xs rounded-lg border border-accent-500/20">{p}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications & Interview Prep */}
            <div className="grid sm:grid-cols-2 gap-6">
              {roadmap.certifications && (
                <div className="glass-dark p-5 border border-white/10">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <RiAwardLine className="w-5 h-5 text-amber-400" /> Certifications
                  </h3>
                  <ul className="space-y-2">
                    {roadmap.certifications.map((c, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <RiCheckLine className="w-4 h-4 text-accent-400 flex-shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {roadmap.interviewPrep && (
                <div className="glass-dark p-5 border border-white/10">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    🎯 Interview Prep
                  </h3>
                  <ul className="space-y-2">
                    {roadmap.interviewPrep.map((c, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <RiCheckLine className="w-4 h-4 text-primary-400 flex-shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {roadmap.generatedBy && (
              <p className="text-xs text-slate-600 text-center">{roadmap.generatedBy}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
