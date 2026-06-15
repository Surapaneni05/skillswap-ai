import { useState, useEffect } from 'react'
import { skillAPI } from '../api'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { RiAddLine, RiEditLine, RiDeleteBin6Line, RiLightbulbLine, RiSearchLine } from 'react-icons/ri'

const LEVELS    = ['BEGINNER','INTERMEDIATE','ADVANCED','EXPERT']
const TYPES     = ['OFFERED','WANTED']
const CATEGORIES = ['PROGRAMMING','AI_ML','DATA_SCIENCE','CLOUD','CYBERSECURITY','UI_UX','BUSINESS','COMMUNICATION','LANGUAGES','OTHERS']

const LEVEL_COLORS = {
  BEGINNER: 'badge-primary', INTERMEDIATE: 'badge-accent', ADVANCED: 'badge-warning', EXPERT: 'badge-purple'
}
const CATEGORY_LABELS = {
  PROGRAMMING:'Programming', AI_ML:'AI / ML', DATA_SCIENCE:'Data Science', CLOUD:'Cloud',
  CYBERSECURITY:'Cybersecurity', UI_UX:'UI / UX', BUSINESS:'Business',
  COMMUNICATION:'Communication', LANGUAGES:'Languages', OTHERS:'Others'
}

const blank = { skillName:'', category:'PROGRAMMING', description:'', level:'BEGINNER', yearsOfExperience:0, type:'OFFERED' }

export default function Skills() {
  const [skills, setSkills]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(blank)
  const [saving, setSaving]   = useState(false)
  const [filter, setFilter]   = useState('ALL')
  const [search, setSearch]   = useState('')

  const load = () => {
    skillAPI.getMySkills().then(r => setSkills(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd  = () => { setEditing(null); setForm(blank); setModal(true) }
  const openEdit = (s) => { setEditing(s); setForm({ skillName: s.skillName, category: s.category, description: s.description, level: s.level, yearsOfExperience: s.yearsOfExperience, type: s.type }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await skillAPI.updateSkill(editing.id, form)
      else         await skillAPI.addSkill(form)
      toast.success(editing ? 'Skill updated!' : 'Skill added!')
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save skill') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this skill?')) return
    try { await skillAPI.deleteSkill(id); toast.success('Skill removed'); load() }
    catch { toast.error('Failed to delete') }
  }

  const displayed = skills.filter(s =>
    (filter === 'ALL' || s.type === filter) &&
    s.skillName.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center pt-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <RiLightbulbLine className="w-7 h-7 text-primary-400" /> My Skills
          </h1>
          <p className="text-slate-400 text-sm mt-1">{skills.filter(s=>s.type==='OFFERED').length} offered • {skills.filter(s=>s.type==='WANTED').length} wanted</p>
        </div>
        <button id="add-skill-btn" onClick={openAdd} className="btn-primary flex items-center gap-2">
          <RiAddLine className="w-5 h-5" /> Add Skill
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input className="input-field pl-9 text-sm" placeholder="Search skills..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['ALL','OFFERED','WANTED'].map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter===t ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' : 'btn-ghost'}`}>
              {t.charAt(0)+t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Skills grid */}
      {displayed.length === 0
        ? <div className="text-center py-16 text-slate-500">
            <RiLightbulbLine className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No skills found</p>
            <button onClick={openAdd} className="btn-primary mt-4 inline-flex items-center gap-2">
              <RiAddLine className="w-4 h-4" /> Add Your First Skill
            </button>
          </div>
        : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {displayed.map((s, i) => (
                <motion.div key={s.id}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                  className="glass-dark p-5 hover:border-primary-500/30 transition-all border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{s.skillName}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{CATEGORY_LABELS[s.category]}</p>
                    </div>
                    <span className={`badge ${s.type === 'OFFERED' ? 'badge-accent' : 'badge-warning'}`}>
                      {s.type === 'OFFERED' ? 'Offering' : 'Wanted'}
                    </span>
                  </div>
                  {s.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{s.description}</p>}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`badge ${LEVEL_COLORS[s.level]}`}>{s.level}</span>
                    <span className="text-xs text-slate-500">{s.yearsOfExperience}y exp</span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <button onClick={() => openEdit(s)} className="btn-ghost text-xs flex items-center gap-1 flex-1 justify-center">
                      <RiEditLine className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="btn-ghost text-xs text-red-400 hover:text-red-300 flex items-center gap-1 flex-1 justify-center hover:bg-red-500/10">
                      <RiDeleteBin6Line className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
      }

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setModal(false)}>
            <motion.div className="glass-dark w-full max-w-md p-6 border border-white/10"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <h2 className="font-display font-bold text-lg text-white mb-5">
                {editing ? 'Edit Skill' : 'Add New Skill'}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Skill Name *</label>
                  <input required className="input-field text-sm" placeholder="e.g. React.js"
                    value={form.skillName} onChange={e => setForm({...form, skillName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Type *</label>
                    <select className="select-field text-sm" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      {TYPES.map(t => <option key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Level *</label>
                    <select className="select-field text-sm" value={form.level} onChange={e => setForm({...form, level: e.target.value})}>
                      {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0)+l.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Category *</label>
                    <select className="select-field text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Years of Exp.</label>
                    <input type="number" min={0} max={20} className="input-field text-sm"
                      value={form.yearsOfExperience} onChange={e => setForm({...form, yearsOfExperience: parseInt(e.target.value)||0})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Description</label>
                  <textarea rows={2} className="input-field text-sm resize-none" placeholder="Brief description..."
                    value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : editing ? 'Update' : 'Add Skill'}
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
