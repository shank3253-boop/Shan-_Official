import { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Clock, Target, Info, GraduationCap, ChevronRight, BrainCircuit, BarChart3 } from 'lucide-react';
import { generateMCQs } from '../lib/gemini';
import { MCQ, UserProfile, Difficulty } from '../types';
import QuizEngine from '../components/quiz/QuizEngine';

interface ExamProps {
  profile: UserProfile | null;
}

export default function Exam({ profile }: ExamProps) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('hard');

  const startExam = async () => {
    setLoading(true);
    try {
      const subjects = ['Pakistan Affairs', 'Current Affairs', 'General Science', 'English'];
      const allMcqs: MCQ[] = [];
      
      const batches = await Promise.all(subjects.map(subject => 
        generateMCQs({
          subject,
          difficulty,
          examType: 'CSS',
          count: 5
        })
      ));

      batches.forEach(batch => allMcqs.push(...batch));
      setQuestions(allMcqs.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (questions.length > 0) {
    return (
      <QuizEngine 
        questions={questions} 
        mode="exam" 
        onComplete={() => setQuestions([])} 
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-serif text-[#141414]">Exam Simulator</h1>
        <p className="text-[#14141460] text-lg max-w-xl mx-auto">
          Standardized CSS Mock Exam. 20 Questions, 20 Minutes (Demo Scale). 
          Negative marking and Federal standards applied.
        </p>
      </div>

      <div className="flex justify-center mt-6">
        <div className="flex bg-white border border-[#14141410] p-1 rounded-2xl shadow-sm">
          {(['easy', 'medium', 'hard', 'very hard'] as Difficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                difficulty === level 
                  ? 'bg-[#141414] text-white shadow-xl' 
                  : 'text-[#14141440] hover:text-[#141414]'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#14141405] shadow-sm flex flex-col items-center text-center">
           <div className="w-16 h-16 bg-[#5A5A4010] text-[#5A5A40] rounded-3xl flex items-center justify-center mb-6">
             <Clock size={32} />
           </div>
           <h3 className="text-xl font-serif font-bold mb-2">Timed Session</h3>
           <p className="text-sm text-[#14141440]">The exam will automatically submit when the timer hits zero. Efficiency is key.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-[#14141405] shadow-sm flex flex-col items-center text-center">
           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
             <Target size={32} />
           </div>
           <h3 className="text-xl font-serif font-bold mb-2">Multi-Subject Mix</h3>
           <p className="text-sm text-[#14141440]">English, Pakistan Affairs, GSA, and Current Affairs. Just like the real CSS One Paper.</p>
        </div>
      </div>

      <div className="bg-[#141414] text-white rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-md">
          <div className="flex items-center gap-2 text-[#5A5A40]">
            <Trophy size={18} />
            <span className="uppercase text-xs font-black tracking-widest">Active Challenge</span>
          </div>
          <h2 className="text-3xl font-serif leading-tight">Ready to test your caliber against the FPSC standard?</h2>
          <p className="text-white/60">This session will be recorded in your performance analytics.</p>
          <button 
             onClick={startExam}
             disabled={loading}
             className="bg-white text-[#141414] px-10 py-5 rounded-2xl font-bold flex items-center gap-3 hover:bg-gray-100 transition-all text-lg shadow-2xl"
          >
            {loading ? 'Synthesizing Exam...' : 'Begin Mock Exam'}
            {loading ? <div className="w-5 h-5 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" /> : <ChevronRight size={20} />}
          </button>
        </div>
        
        <GraduationCap className="w-64 h-64 text-white/5 absolute -right-10 -bottom-10" />
      </div>

      <div className="bg-white/50 rounded-3xl p-6 border border-dashed border-[#14141415] flex items-start gap-4">
        <Info className="text-[#14141460] shrink-0 mt-1" size={18} />
        <p className="text-sm text-[#14141460] italic">
          "The greatest mistake in a competitive exam is not lack of knowledge, but lack of time management. Treat this simulator as the real thing." — LWSF AI Advisor
        </p>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-6">
           <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center space-y-6 shadow-2xl border border-white">
              <div className="w-24 h-24 bg-[#5A5A4010] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                 <BrainCircuitLocal size={48} className="text-[#5A5A40]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-serif font-bold">LWSF Exam Engine</h3>
                <p className="text-[#14141460] leading-relaxed">
                  Generating a unique, challenging mix of {questions.length > 0 ? 'questions' : 'high-caliber MCQs'}...
                </p>
              </div>
              <div className="py-2">
                <div className="h-1 bg-gray-100 rounded-full w-full overflow-hidden">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="h-full bg-[#5A5A40] w-1/2"
                  />
                </div>
              </div>
              <p className="text-[10px] uppercase font-black tracking-widest text-[#14141420]">System Architecture: Gemini 3 Flash Preview</p>
           </div>
        </div>
      )}
    </div>
  );
}

const BrainCircuitLocal = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0 .94 4.82 2.5 2.5 0 0 0 4.96.46 2.5 2.5 0 0 0 1.98-3 2.5 2.5 0 0 0-.94-4.82Z"/>
    <path d="M12 12.5a2.5 2.5 0 0 1 4.96.46 2.5 2.5 0 0 1 1.98-3 2.5 2.5 0 0 1-.94-4.82 2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.98 3 2.5 2.5 0 0 1 .94 4.82Z"/>
    <path d="M12 12.5v1.5a2.5 2.5 0 0 1-2.5 2.5H8"/>
    <path d="M16 16.5h1.5a2.5 2.5 0 0 0 2.5-2.5V13"/>
    <path d="M8 16.5v1.5a2.5 2.5 0 0 0 2.5 2.5h3"/>
    <path d="M12 20.5v1.5"/>
  </svg>
);
