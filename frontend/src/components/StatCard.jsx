import CountUp from 'react-countup'
import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, color = 'primary', suffix = '', index = 0 }) {
  const colors = {
    primary: { bg: 'from-primary-500/20 to-primary-600/10', icon: 'text-primary-400', border: 'border-primary-500/20' },
    accent:  { bg: 'from-accent-500/20 to-accent-600/10',   icon: 'text-accent-400',   border: 'border-accent-500/20' },
    purple:  { bg: 'from-purple-500/20 to-purple-600/10',   icon: 'text-purple-400',   border: 'border-purple-500/20' },
    amber:   { bg: 'from-amber-500/20 to-amber-600/10',     icon: 'text-amber-400',    border: 'border-amber-500/20' },
  }
  const c = colors[color] || colors.primary

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`stat-card bg-gradient-to-br ${c.bg} border ${c.border}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-dark-700/50 flex items-center justify-center ${c.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className="text-2xl font-display font-bold text-white mt-0.5">
            {typeof value === 'number'
              ? <CountUp end={value} duration={1.5} suffix={suffix} />
              : value}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
