import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { getUserProfile, createUserProfile } from './services/userService';
import { UserProfile } from './types';

// Views
import Home from './views/Home';
import Practice from './views/Practice';
import Exam from './views/Exam';
import Analytics from './views/Analytics';
import SubjectiveVault from './views/SubjectiveVault';
import IntelligenceHub from './views/IntelligenceHub';

// Components
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          let p = await getUserProfile(user.uid);
          if (!p) {
            p = await createUserProfile(user.uid, user.email || '', user.displayName || 'User', user.photoURL || '');
          }
          setProfile(p);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#5A5A40] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-serif italic text-[#5A5A40]">Initializing Exam Intelligence...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
          <h1 className="text-4xl font-serif mb-2 text-[#141414]">Learn With Shan Fareed</h1>
          <p className="text-gray-500 mb-8 font-sans">Advanced AI MCQ Ecosystem for CSS, PPSC & FPSC</p>
          <button 
            onClick={() => {
              // Sign in logic - using popup for AI Studio compatibility
              import('firebase/auth').then(({ GoogleAuthProvider, signInWithPopup }) => {
                const provider = new GoogleAuthProvider();
                signInWithPopup(auth, provider);
              });
            }}
            className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-medium hover:bg-[#4A4A30] transition-colors shadow-lg shadow-olive-900/20"
          >
            Start Your Journey with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#F5F5F0] font-sans text-[#141414]">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen overflow-auto">
          <Header profile={profile} />
          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Home profile={profile} />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/exam" element={<Exam profile={profile} />} />
              <Route path="/subjective" element={<SubjectiveVault />} />
              <Route path="/intelligence" element={<IntelligenceHub />} />
              <Route path="/analytics" element={<Analytics profile={profile} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
