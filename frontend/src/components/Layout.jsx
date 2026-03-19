import { Outlet, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Camera, UtensilsCrossed, Heart, Search, Sparkles, Stethoscope, 
  Settings as SettingsIcon
} from 'lucide-react'
import { useLanguage } from '../App'

export default function Layout() {
  const { t } = useLanguage()

  const navItems = [
    { to: '/',       icon: LayoutDashboard, label: t.dashboard },
    { to: '/scan',   icon: Camera,          label: t.scanFood },
    { to: '/meals',  icon: UtensilsCrossed, label: t.mealLog },
    { to: '/health', icon: Heart,           label: t.health },
    { to: '/search', icon: Search,          label: t.nutrition },
    { to: '/care',   icon: Stethoscope,     label: t.careNetwork },
    { to: '/settings', icon: SettingsIcon,   label: t.settings },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 p-6 border-r border-white/5 bg-dark-950/40 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-full border-2 border-primary-500/30 overflow-hidden shadow-2xl shadow-primary-500/10 bg-black/40 flex items-center justify-center">
            <img src="/app_logo.jpg" alt="Smart Plate" className="w-full h-full object-cover scale-[1.55]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-tight uppercase tracking-tighter">Smart <span className="gradient-text">Plate</span></h1>
            <p className="text-[8px] text-dark-500 tracking-[0.3em] uppercase font-black">{t.aiIntelligence}</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300
                 ${isActive 
                   ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20 shadow-2xl shadow-primary-500/5' 
                   : 'text-dark-400 hover:bg-white/5 hover:text-white'}`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 opacity-40">
           <p className="text-[7px] font-black text-dark-500 uppercase tracking-[0.4em] leading-relaxed">
             Precision Human Intelligence Core <br/>
             Engine v1.0.0.Alpha-Sync
           </p>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50
                      bg-dark-900/90 backdrop-blur-2xl border-t border-white/5
                      flex justify-around py-4 px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-2xl transition-all duration-300
               ${isActive ? 'text-primary-500 bg-primary-500/10' : 'text-dark-500 hover:text-white'}`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32 lg:pb-10 bg-dark-950/20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
