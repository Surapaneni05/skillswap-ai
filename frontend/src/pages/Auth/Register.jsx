import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { RiEyeLine, RiEyeOffLine, RiArrowRightLine, RiArrowLeftLine } from 'react-icons/ri'

const steps = ['Account', 'Profile', 'Done']

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    college: '', branch: '', year: '', location: ''
  })

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const nextStep = (e) => {
    e.preventDefault()
    if (step < 1) setStep(s => s + 1)
    else handleSubmit()
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome to SkillSwap AI 🎉')
      navigate('/skills')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30">S</div>
            <span className="font-display font-bold text-2xl gradient-text">SkillSwap AI</span>
          </Link>
          <h1 className="font-display text-2xl font-bold">Create your account</h1>
          <p className="text-slate-400 mt-1">Start with 100 free credits</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8 px-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < step ? 'bg-accent-500 text-white' : i === step ? 'bg-primary-500 text-white' : 'bg-dark-700 text-slate-500'
              }`}>{i + 1}</div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 transition-all ${i < step ? 'bg-accent-500' : 'bg-dark-700'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-dark p-8 border border-white/10">
          <form onSubmit={nextStep} className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                    <input id="name" type="text" required className="input-field" placeholder="Rahul Kumar"
                      value={form.name} onChange={e => update('name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input id="reg-email" type="email" required className="input-field" placeholder="you@university.edu"
                      value={form.email} onChange={e => update('email', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                    <div className="relative">
                      <input id="reg-password" type={showPw ? 'text' : 'password'} required minLength={8}
                        className="input-field pr-12" placeholder="Min. 8 characters"
                        value={form.password} onChange={e => update('password', e.target.value)} />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1">
                        {showPw ? <RiEyeOffLine className="w-5 h-5" /> : <RiEyeLine className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">College / University</label>
                    <input type="text" className="input-field" placeholder="IIT Bombay"
                      value={form.college} onChange={e => update('college', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Branch</label>
                      <input type="text" className="input-field" placeholder="CS/IT"
                        value={form.branch} onChange={e => update('branch', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Year</label>
                      <select className="select-field" value={form.year} onChange={e => update('year', e.target.value)}>
                        <option value="">Select</option>
                        {['1st Year','2nd Year','3rd Year','4th Year','PG','Alumni'].map(y => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                    <input type="text" className="input-field" placeholder="Mumbai, India"
                      value={form.location} onChange={e => update('location', e.target.value)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <RiArrowLeftLine className="w-4 h-4" /> Back
                </button>
              )}
              <button id="reg-next" type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : step < 1 ? <><span>Continue</span><RiArrowRightLine className="w-4 h-4" /></>
                  : <span>Create Account 🚀</span>}
              </button>
            </div>
          </form>

          <div className="divider" />
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
