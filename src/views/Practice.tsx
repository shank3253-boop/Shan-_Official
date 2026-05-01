import { useState } from 'react';
import { CATEGORIES } from '../constants';
import { BookOpen, Search, ArrowRight, BrainCircuit, Sparkles, PlusCircle, X } from 'lucide-react';
import { generateMCQs } from '../lib/gemini';
import { MCQ, Difficulty } from '../types';
import QuizEngine from '../components/quiz/QuizEngine';
import SubmissionForm from '../components/SubmissionForm';
import { motion, AnimatePresence } from 'motion/react';

export default function Practice() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPredictive, setIsPredictive] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const filteredCategories = CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startPractice = async (subject: string) => {
    setLoading(true);
    setSelectedSubject(subject);
    try {
      const mcqs = await generateMCQs({
        subject,
        difficulty,
        examType: 'General',
        count: 10,
        isPredictive
      });
      setQuestions(mcqs);
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
        mode="practice" 
        onComplete={() => setQuestions([])} 
      />
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-[#141414] mb-2">Practice Engine</h1>
          <p className="text-[#14141460]">Select a subject to generate AI MCQs formatted for competitive excellence.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex bg-white border border-[#14141410] p-1 rounded-2xl">
            {(['easy', 'medium', 'hard', 'very hard'] as Difficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  difficulty === level 
                    ? 'bg-[#141414] text-white shadow-sm' 
                    : 'text-[#14141440] hover:text-[#141414]'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsPredictive(!isPredictive)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${isPredictive ? 'bg-[#5A5A40] text-white shadow-lg' : 'bg-white text-[#14141460] border border-[#14141415]'}`}
          >
            <Sparkles size={18} />
            Predictive AI Mode {isPredictive ? 'ON' : 'OFF'}
          </button>

          <button 
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
          >
            <PlusCircle size={18} />
            Contribute Question
          </button>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14141440]" size={18} />
            <input 
              type="text" 
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#14141415] rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#5A5A4050] transition-all"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl border border-gray-100 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-[#5A5A4010] rounded-2xl flex items-center justify-center text-[#5A5A40] animate-pulse">
              <BrainCircuit size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold">LWSF AI Engine</h3>
              <p className="text-[#14141460]">Synthesizing standard-compliant MCQs for {selectedSubject}...</p>
            </div>
            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
              <div className="h-full bg-[#5A5A40] animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => startPractice(cat.name)}
            className="bg-white p-6 rounded-3xl border border-[#14141410] shadow-sm hover:border-[#5A5A40] hover:shadow-md transition-all text-left flex flex-col group h-full"
          >
            <div className="w-10 h-10 bg-[#F5F5F0] rounded-xl flex items-center justify-center text-[#5A5A40] mb-4 group-hover:bg-[#5A5A40] group-hover:text-white transition-colors">
              <BookOpen size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">{cat.name}</h3>
              <p className="text-xs font-bold uppercase tracking-wider text-[#14141440] mb-4">{cat.group}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs font-semibold text-[#14141460]">10 Questions</span>
              <div className="w-8 h-8 rounded-full border border border-[#14141415] flex items-center justify-center group-hover:bg-[#141414] group-hover:text-white transition-all">
                <ArrowRight size={14} />
              </div>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 bg-[#141414]/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl overflow-hidden"
            >
              <SubmissionForm onClose={() => setShowSubmitModal(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Keyframes for custom animation
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;
document.head.appendChild(styleTag);
