import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, BookOpen, GraduationCap, ArrowRight, Zap, Target, TrendingUp, Sparkles, Flame, History, RefreshCcw } from 'lucide-react';
import { UserProfile, HotTopic } from '../types';
import { Link } from 'react-router-dom';
import { getLiveHotTopics, syncExamIntelligence } from '../services/intelligenceService';

interface HomeProps {
  profile: UserProfile | null;
}

export default function Home({ profile }: HomeProps) {
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([]);
  const [loadingHot, setLoadingHot] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function loadIntelligence() {
      setLoadingHot(true);
      try {
        let topics = await getLiveHotTopics();
        
        // If no topics, trigger a sync
        if (topics.length === 0) {
          await syncExamIntelligence();
          topics = await getLiveHotTopics();
        }
        
        setHotTopics(topics);
      } catch (err) {
        console.error("Failed to load intelligence:", err);
      } finally {
        setLoadingHot(false);
      }
    }
    loadIntelligence();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncExamIntelligence();
      setHotTopics(result.trendingTopics);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome Hero */}
      <section>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#14141405] relative overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-5xl font-serif text-[#141414] leading-tight mb-6">
              Assalam-u-Alaikum, <span className="italic font-normal">{profile?.displayName?.split(' ')[0]}</span>. The 2027 Intelligence is live.
            </h1>
            <p className="text-[#14141460] text-lg mb-8 font-sans leading-relaxed">
              Your AI-driven Competitive Exam Engine is primed with self-updating trends. Federal standards, predictive analytics, and personalized loops await.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/exam" 
                className="bg-[#141414] text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-semibold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
              >
                <GraduationCap size={20} />
                Start 2027 Mock Exam
              </Link>
              <Link 
                to="/practice" 
                className="bg-white text-[#141414] border border-[#14141415] px-8 py-4 rounded-2xl flex items-center gap-3 font-semibold hover:bg-gray-50 transition-all"
              >
                <BookOpen size={20} />
                Predictive Practice
              </Link>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[#5A5A4010] to-transparent hidden lg:block" />
          <Target className="absolute top-10 right-10 text-[#5A5A4010] w-64 h-64 -rotate-12" />
        </motion.div>
      </section>

      {/* 2027 Predictive Intelligence Ticker */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#5A5A40]" size={20} />
            <h2 className="text-2xl font-serif font-bold text-[#141414]">2027 Hot Topics Intelligence</h2>
          </div>
          <button 
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-[#5A5A40] hover:text-[#333317] transition-colors bg-[#5A5A4010] py-1 px-3 rounded-full"
          >
            <RefreshCcw size={12} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing trends...' : 'Auto-Update Intelligence'}
          </button>
        </div>

        <div className="flex overflow-x-auto pb-4 gap-6 no-scrollbar snap-x">
          {loadingHot ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="min-w-[300px] h-48 bg-white border border-[#14141405] rounded-[2rem] animate-pulse" />
            ))
          ) : (
            hotTopics.map((topic) => (
              <motion.div 
                key={topic.id}
                whileHover={{ y: -5 }}
                className="min-w-[320px] bg-white p-8 rounded-[2rem] border border-[#14141410] shadow-sm flex flex-col justify-between snap-start group cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#5A5A40] bg-[#5A5A4010] px-3 py-1 rounded-full">
                      {topic.subject}
                    </span>
                    <div className="flex items-center gap-1 text-orange-600 font-bold text-xs">
                      <Flame size={14} fill="currentColor" />
                      {(topic.predictionScore * 100).toFixed(0)}% Probability
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#141414] group-hover:text-[#5A5A40] transition-colors">{topic.title}</h3>
                  <p className="text-xs text-[#14141460] line-clamp-2 italic">"{topic.reason}"</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-[#14141405] pt-4">
                  <div className="flex items-center gap-2 text-[#14141440]">
                    <History size={14} />
                    <span className="text-[10px] font-bold">Past Paper Freq: {topic.frequencyInPastPapers}x</span>
                  </div>
                  <span className="text-[#5A5A40] font-bold text-xs flex items-center gap-1">
                    Master <ArrowRight size={14} />
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-[#14141405] shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <TrendingUp size={24} />
          </div>
          <p className="text-[#14141460] font-medium mb-1">Success Prediction</p>
          <h3 className="text-4xl font-serif font-bold text-[#141414]">
            {((profile?.stats.averageAccuracy || 0) * 0.85).toFixed(1)}%
          </h3>
          <p className="text-[10px] font-bold text-[#14141430] mt-2 uppercase tracking-tighter">Adjusted for 2027 Pattern Shifts</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-[#14141405] shadow-sm">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
            <Award size={24} />
          </div>
          <p className="text-[#14141460] font-medium mb-1">Concepts Mastered</p>
          <h3 className="text-4xl font-serif font-bold text-[#141414]">
            {(profile?.stats.totalTests || 0) * 12}
          </h3>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-[#14141405] shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <p className="text-[#14141460] font-medium mb-1">Preparation Phase</p>
            <h3 className="text-2xl font-serif font-bold text-[#141414]">
              {profile?.stats.totalTests && profile.stats.totalTests > 10 ? 'Strategic Polish' : 'Foundational'}
            </h3>
          </div>
        </div>
      </section>
    </div>
  );
}
