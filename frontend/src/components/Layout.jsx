import { Outlet, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Camera, UtensilsCrossed, Heart, Search, Sparkles, Stethoscope
} from 'lucide-react'

const navItems = [
  { to: '/',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scan',   icon: Camera,          label: 'Scan Food' },
  { to: '/meals',  icon: UtensilsCrossed, label: 'Meal Log' },
  { to: '/health', icon: Heart,           label: 'Health' },
  { to: '/search', icon: Search,          label: 'Nutrition' },
  { to: '/care',   icon: Stethoscope,     label: 'Care Network' },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 p-6 border-r border-white/5">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-xl border border-white/5 overflow-hidden shadow-lg shadow-primary-500/10">
            <img src="/logo.png" alt="Smart Plate Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text leading-tight">Smart Plate</h1>
            <p className="text-[9px] text-dark-400 tracking-[0.2em] uppercase font-bold">Health Intelligence</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="glass-sm p-4 mt-4">
          <p className="text-xs text-dark-400">Powered by</p>
          <p className="text-sm font-semibold gradient-text">YOLOv8 + USDA + ICMR</p>
          <p className="text-[10px] text-dark-500 mt-1">TensorFlow • PyTorch • FastAPI</p>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50
                      bg-dark-900/90 backdrop-blur-xl border-t border-white/5
                      flex justify-around py-2 px-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all
               ${isActive ? 'text-primary-500' : 'text-dark-400 hover:text-white'}`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 pb-24 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
