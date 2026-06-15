import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { skillAPI, userAPI } from '../api'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  RiEditLine, RiSaveLine, RiGithubLine, RiLinkedinBoxLine,
  RiGlobalLine, RiMapPinLine, RiBuildingLine, RiUserLine,
  RiAddLine, RiCameraLine, RiStarLine
} from 'react-icons/ri'

export default function Profile() {
  const { user, updateUser, refetchUser } = useAuth()
  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState({})
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user) setForm({
      name: user.name || '',  bio: user.bio || '',
      college: user.college || '', branch: user.branch || '',
      year: user.year || '',  location: user.location || '',
      githubUrl: user.githubUrl || '',  linkedinUrl: user.linkedinUrl || '',
      portfolioUrl: user.portfolioUrl || '',
      achievements: user.achievements || '', certifications: user.certifications || '',
    })
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await userAPI.updateProfile(form)
      updateUser(data)
      setEditing(false)
      toast.success('Profile updated!')
      refetchUser()
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await userAPI.uploadAvatar(formData)
      await refetchUser()
      toast.success('Avatar updated!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const completion = user?.profileCompletion || 0

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="glass-dark p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            {user?.profileImage
              ? <img src={`http://localhost:8080${user.profileImage}`} alt="" className="w-24 h-24 avatar" />
              : <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-3xl">
                  {user?.name?.[0]}
                </div>
            }
            <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              {uploading
                ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                : <RiCameraLine className="w-6 h-6 text-white" />
              }
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-white">{user?.name}</h1>
                <p className="text-slate-400">{user?.email}</p>
                {user?.college && (
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <RiBuildingLine className="w-4 h-4" /> {user.college} • {user.branch} • {user.year}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-amber-400 text-sm">
                    <RiStarLine className="w-4 h-4" /> {user?.rating?.toFixed(1)} ({user?.ratingCount} reviews)
                  </span>
                  <span className="text-accent-400 text-sm font-semibold">{user?.credits} credits</span>
                </div>
              </div>
              <button onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}
                className={editing ? 'btn-accent flex items-center gap-2' : 'btn-secondary flex items-center gap-2'}>
                {saving
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : editing ? <><RiSaveLine className="w-4 h-4" />Save</> : <><RiEditLine className="w-4 h-4" />Edit</>
                }
              </button>
            </div>

            {/* Profile completion */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Profile Completion</span><span className="font-semibold text-white">{completion}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit / View form */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic info */}
        <div className="glass-dark p-6 space-y-4">
          <h2 className="font-display font-semibold text-white flex items-center gap-2">
            <RiUserLine className="w-5 h-5 text-primary-400" /> Basic Info
          </h2>
          {editing ? (
            <>
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
                { label: 'College',   key: 'college', type: 'text', placeholder: 'University name' },
                { label: 'Branch',    key: 'branch', type: 'text', placeholder: 'CS / IT / ECE' },
                { label: 'Location',  key: 'location', type: 'text', placeholder: 'City, Country' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                  <input type={f.type} className="input-field text-sm" placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Year</label>
                <select className="select-field text-sm" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                  <option value="">Select year</option>
                  {['1st Year','2nd Year','3rd Year','4th Year','PG','Alumni'].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Bio</label>
                <textarea rows={3} className="input-field text-sm resize-none" placeholder="Tell others about yourself..."
                  value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {user?.bio && <p className="text-slate-300 text-sm leading-relaxed">{user.bio}</p>}
              {user?.location && <p className="text-sm text-slate-400 flex items-center gap-2"><RiMapPinLine className="w-4 h-4 text-primary-400" />{user.location}</p>}
              {!user?.bio && !user?.location && <p className="text-slate-600 text-sm">Add your bio and location to complete your profile.</p>}
            </div>
          )}
        </div>

        {/* Social links */}
        <div className="glass-dark p-6 space-y-4">
          <h2 className="font-display font-semibold text-white flex items-center gap-2">
            <RiGlobalLine className="w-5 h-5 text-accent-400" /> Social Links
          </h2>
          {editing ? (
            <>
              {[
                { label: 'GitHub', key: 'githubUrl', icon: RiGithubLine, placeholder: 'https://github.com/...' },
                { label: 'LinkedIn', key: 'linkedinUrl', icon: RiLinkedinBoxLine, placeholder: 'https://linkedin.com/in/...' },
                { label: 'Portfolio', key: 'portfolioUrl', icon: RiGlobalLine, placeholder: 'https://yoursite.com' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <f.icon className="w-3.5 h-3.5" />{f.label}
                  </label>
                  <input type="url" className="input-field text-sm" placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
            </>
          ) : (
            <div className="space-y-3">
              {[
                { url: user?.githubUrl,    icon: RiGithubLine,       label: 'GitHub'    },
                { url: user?.linkedinUrl,  icon: RiLinkedinBoxLine,  label: 'LinkedIn'  },
                { url: user?.portfolioUrl, icon: RiGlobalLine,       label: 'Portfolio' },
              ].map(({ url, icon: Icon, label }) => url && (
                <a key={label} href={url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
                  <Icon className="w-4 h-4" />{label}
                </a>
              ))}
              {!user?.githubUrl && !user?.linkedinUrl && !user?.portfolioUrl &&
                <p className="text-slate-600 text-sm">Add your social links to help others connect with you.</p>}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="glass-dark p-6 md:col-span-2 space-y-4">
          <h2 className="font-display font-semibold text-white">Achievements & Certifications</h2>
          {editing ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Achievements</label>
                <textarea rows={3} className="input-field text-sm resize-none" placeholder="Hackathon winner, Open source contributor..."
                  value={form.achievements} onChange={e => setForm({ ...form, achievements: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Certifications</label>
                <textarea rows={3} className="input-field text-sm resize-none" placeholder="AWS Certified, Google Analytics..."
                  value={form.certifications} onChange={e => setForm({ ...form, certifications: e.target.value })} />
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">Achievements</p>
                <p className="text-slate-300 text-sm">{user?.achievements || <span className="text-slate-600">Not added yet</span>}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Certifications</p>
                <p className="text-slate-300 text-sm">{user?.certifications || <span className="text-slate-600">Not added yet</span>}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
