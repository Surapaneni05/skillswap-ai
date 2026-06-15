import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiExchangeLine, RiBrainLine, RiTeamLine, RiStarLine,
  RiArrowRightLine, RiShieldCheckLine, RiLightbulbLine, RiTrophyLine
} from 'react-icons/ri'

const features = [
  { icon: RiExchangeLine, title: 'Skill Swap',       desc: 'Trade skills peer-to-peer. Teach what you know, learn what you want.', color: 'primary' },
  { icon: RiBrainLine,    title: 'AI Matching',       desc: 'Intelligent matching based on skills, experience, ratings and goals.', color: 'accent' },
  { icon: RiLightbulbLine,title: 'Career Roadmap',    desc: 'Generate a personalized AI learning roadmap for any target role.', color: 'purple' },
  { icon: RiTrophyLine,   title: 'Credit Economy',    desc: 'Earn credits by teaching. Spend them to learn. Gamified growth.', color: 'amber' },
]

const stats = [
  { label: 'Students', value: '12,000+' },
  { label: 'Skills Swapped', value: '50,000+' },
  { label: 'Session Hours', value: '100,000+' },
  { label: 'Universities', value: '500+' },
]

const testimonials = [
  { name: 'Priya S.', role: 'CS Student', text: 'I taught Java and learned React in 3 weeks. SkillSwap AI matched me perfectly!', rating: 5 },
  { name: 'Rahul M.', role: 'Data Science', text: 'The AI roadmap helped me land my first ML internship. Game changer.', rating: 5 },
  { name: 'Ananya K.', role: 'UX Designer', text: 'Found a Python mentor who also wanted UI/UX help. Win-win!', rating: 5 },
]

const colorMap = {
  primary: { icon: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20' },
  accent:  { icon: 'text-accent-400',  bg: 'bg-accent-500/10',  border: 'border-accent-500/20' },
  purple:  { icon: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  amber:   { icon: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-dark-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30">
              S
            </div>
            <span className="font-display font-bold text-xl gradient-text">SkillSwap AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/leaderboard" className="btn-ghost hidden sm:block">Leaderboard</Link>
            <Link to="/login"    className="btn-secondary px-5 py-2 text-sm">Login</Link>
            <Link to="/register" className="btn-primary  px-5 py-2 text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-accent-500/8 rounded-full blur-3xl pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-flex items-center gap-2 badge-primary px-4 py-1.5 mb-6 text-sm">
            <RiBrainLine className="w-4 h-4" /> AI-Powered Skill Exchange Platform
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Teach. Learn. <span className="gradient-text">Grow.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The world's first AI-powered peer skill exchange. Get matched with students who want what you know
            and know what you want — then swap, schedule, and grow together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary flex items-center gap-2 justify-center text-base px-8 py-3.5">
              Start Swapping Free <RiArrowRightLine className="w-5 h-5" />
            </Link>
            <Link to="/leaderboard" className="btn-secondary flex items-center gap-2 justify-center text-base px-8 py-3.5">
              <RiTrophyLine className="w-5 h-5" /> View Leaderboard
            </Link>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="glass p-5 text-center">
              <p className="font-display text-3xl font-bold gradient-text">{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl font-bold mb-4">Everything you need to <span className="gradient-text">level up</span></h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Powered by AI, driven by community</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const c = colorMap[f.color]
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className={`glass-dark p-6 border ${c.border} hover:-translate-y-1 transition-transform`}>
                <div className={`w-12 h-12 ${c.bg} ${c.border} border rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${c.icon}`} />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl font-bold mb-4">How <span className="gradient-text">SkillSwap</span> works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Add Your Skills',    desc: 'List skills you can teach and skills you want to learn across 10 categories.' },
            { step: '02', title: 'Get AI Matched',     desc: 'Our AI finds perfect peers — bidirectional skill matches with a compatibility score.' },
            { step: '03', title: 'Swap & Grow',        desc: 'Send requests, schedule sessions, earn credits, and build your network.' },
          ].map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }} viewport={{ once: true }}
              className="glass-dark p-8 relative overflow-hidden">
              <span className="absolute top-4 right-4 font-display text-6xl font-black text-white/5">{item.step}</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold mb-4">
                {parseInt(item.step)}
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl font-bold mb-4">Loved by <span className="gradient-text">students</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="glass-dark p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, j) => <RiStarLine key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-slate-300 mb-4 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="glass-dark p-12 border border-primary-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/5 pointer-events-none" />
          <RiShieldCheckLine className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h2 className="font-display text-4xl font-bold mb-4">Ready to start your <span className="gradient-text">skill journey?</span></h2>
          <p className="text-slate-400 mb-8">Join 12,000+ students. Free forever. No credit card required.</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5">
            Create Free Account <RiArrowRightLine className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-slate-600 text-sm">
        <p>© 2024 SkillSwap AI. Built with ❤️ for students everywhere.</p>
      </footer>
    </div>
  )
}
