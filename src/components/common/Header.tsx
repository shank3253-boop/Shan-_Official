import { Bell, Flame, User as UserIcon } from 'lucide-react';
import { UserProfile } from '../../types';

interface HeaderProps {
  profile: UserProfile | null;
}

export default function Header({ profile }: HeaderProps) {
  return (
    <header className="h-20 bg-transparent flex items-center justify-between px-6 md:px-10">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-sans uppercase tracking-[0.2em] font-semibold text-[#14141440]">
          Competitive Intelligence
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full border border-orange-100">
          <Flame size={16} fill="currentColor" />
          <span className="font-bold text-sm">{profile?.stats.streak || 0} Day Streak</span>
        </div>

        <button className="p-2 text-[#14141460] hover:text-[#141414] transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F5F5F0]"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-[#14141415]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#141414]">{profile?.displayName}</p>
            <p className="text-[10px] uppercase tracking-wider text-[#14141460]">
              {profile?.email}
            </p>
          </div>
          {profile?.photoURL ? (
            <img 
              src={profile.photoURL} 
              alt={profile.displayName} 
              className="w-10 h-10 rounded-xl border-2 border-white shadow-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40] flex items-center justify-center text-white font-bold shadow-sm">
              {profile?.displayName?.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
