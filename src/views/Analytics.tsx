import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, TestResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { motion } from 'motion/react';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Sparkles, Map } from 'lucide-react';
import { getDetailedQuizFeedback, DetailedQuizFeedback } from '../lib/gemini';
import { generateLearningPath } from '../services/learningPathService';

interface AnalyticsProps {
  profile: UserProfile | null;
}

export default function Analytics({ profile }: AnalyticsProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [learningPath, setLearningPath] = useState<DetailedQuizFeedback | null>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  useEffect(() => {
    async function fetchResults() {
      if (!profile) return;
      const path = `users/${profile.uid}/results`;
      try {
        const q = query(
          collection(db, path),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data() as TestResult);
        const reversed = data.reverse();
        setResults(reversed);
        setLoading(false);

        setLoadingRoadmap(true);
        const pathData = await generateLearningPath(data); // data is descending, latest first
        setLearningPath(pathData);
        setLoadingRoadmap(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
        setLoading(false);
      }
    }
    fetchResults();
  }, [profile]);

  const chartData = results.map(r => ({
    name: new Date(r.timestamp).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }),
    score: r.score
  }));

  const subjectData = [
    { name: 'Pak Affairs', score: 75 },
    { name: 'Current Affairs', score: 62 },
    { name: 'GSA', score: 88 },
    { name: 'English', score: 54 },
    { name: 'Islamiyat', score: 92 },
  ];

  if (loading) return <div>Loading Intelligence Report...</div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-serif text-[#141414] mb-2">Performance Intelligence</h1>
          <p className="text-[#14141460]">Deep metrics and behavioral patterns in your exam preparation.</p>
        </div>
      </div>

      {/* Main Graph Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[3rem] border border-[#14141405] shadow-sm"
      >
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#5A5A4010] text-[#5A5A40] rounded-xl flex items-center justify-center">
               <TrendingUp size={20} />
             </div>
             <h3 className="text-xl font-serif font-bold">Accuracy Trend</h3>
           </div>
           <div className="text-right">
             <p className="text-[10px] uppercase font-black tracking-widest text-[#14141430]">Last 10 Tests</p>
           </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData.length > 0 ? chartData : [{ name: 'N/A', score: 0 }]}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#5A5A40" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141405" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#14141440', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#14141440', fontSize: 12, fontWeight: 600 }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#5A5A40', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#5A5A40" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorScore)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Predictive Roadmap Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#141414] text-white p-12 rounded-[3.5rem] relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="text-[#5A5A40]" size={24} />
            <h2 className="text-3xl font-serif font-bold">2027 Adaptive Learning Path</h2>
          </div>

          {loadingRoadmap ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : learningPath ? (
            <div className="space-y-12">
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                <p className="text-xl font-serif italic text-white/90">"{learningPath.summary}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {learningPath.topicBreakdown.map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] group hover:bg-white/10 transition-all flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-white text-lg">{item.topic}</span>
                      <span className="text-[10px] font-black uppercase text-[#5A5A40] bg-[#5A5A4020] px-2 py-0.5 rounded">{item.performance}</span>
                    </div>
                    <p className="text-sm text-white/60 mb-6 flex-1">{item.explanation}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.resources.map((res, j) => (
                        <span key={j} className="text-[9px] font-bold text-[#5A5A40] border border-[#5A5A4030] px-2 py-1 rounded-full bg-white/5">
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-10 bg-[#5A5A4020] border border-[#5A5A4030] rounded-[3rem]">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#5A5A40] mb-4">Master Strategy</h3>
                <p className="text-lg text-white/80 leading-relaxed font-serif">{learningPath.overallStrategy}</p>
              </div>
            </div>
          ) : (
            <p className="text-white/40 italic">Take more tests to generate your strategic path.</p>
          )}
        </div>
        
        <Map className="absolute right-[-5%] bottom-[-5%] w-80 h-80 text-white/5 -rotate-12" />
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Subject Strength Card */}
        <div className="bg-white p-10 rounded-[3rem] border border-[#14141405] shadow-sm">
           <h3 className="text-xl font-serif font-bold mb-8">Subject Stability</h3>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    width={100}
                    tick={{ fill: '#141414', fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={20}>
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score > 70 ? '#546E7A' : entry.score > 50 ? '#90A4AE' : '#CFD8DC'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Insight Panel */}
        <div className="space-y-6">
           <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 relative overflow-hidden">
              <CheckCircle2 size={64} className="absolute -right-4 -bottom-4 text-emerald-500/10 rotate-12" />
              <h4 className="text-emerald-900 font-bold uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
                <Target size={14} /> Core Strength
              </h4>
              <p className="text-emerald-900 font-serif text-2xl mb-1">General Science & Islamiyat</p>
              <p className="text-emerald-700/70 text-sm">You are consistently scoring above the 90th percentile in these domains.</p>
           </div>

           <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 relative overflow-hidden">
              <AlertTriangle size={64} className="absolute -right-4 -bottom-4 text-red-500/10 rotate-12" />
              <h4 className="text-red-900 font-bold uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
                <XCircle size={14} /> Critical Weakness
              </h4>
              <p className="text-red-900 font-serif text-2xl mb-1">English Precis & Comp.</p>
              <p className="text-red-700/70 text-sm">Vocabulary retention and précis logic need focused practice. AI suggests daily drilling.</p>
           </div>

           <div className="p-4 flex items-center justify-between text-[#14141460] font-bold text-xs uppercase tracking-widest border-t border-[#14141410] pt-6">
              <span>View Full History</span>
              <ChevronRight size={16} />
           </div>
        </div>
      </div>
    </div>
  );
}

const XCircle = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
  </svg>
);
