import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, GraduationCap, BarChart3, Settings, LogOut, Award, BookText } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { motion } from 'motion/react';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: BookOpen, label: 'Practice Mode', path: '/practice' },
  { icon: GraduationCap, label: 'Exam Simulator', path: '/exam' },
  { icon: BookText, label: 'Intelligence Hub', path: '/intelligence' },
  { icon: Award, label: 'Subjective Vault', path: '/subjective' },
  { icon: BarChart3, label: 'Performance', path: '/analytics' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-[#14141415] hidden lg:flex flex-col">
      <div className="p-8">
        <h1 className="text-xl font-serif font-bold tracking-tight text-[#141414]">
          LWSF<span className="text-[#5A5A40]">.</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-[#5A5A40] text-white shadow-md' 
                  : 'text-[#14141460] hover:bg-[#5A5A4010] hover:text-[#5A5A40]'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#14141415]">
        <button 
          onClick={() => auth.signOut()}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
