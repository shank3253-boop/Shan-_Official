import { useState, useEffect } from 'react';
import { MCQ } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, CheckCircle2, XCircle, Info, ChevronRight, ChevronLeft, Flag, Award, RefreshCcw, Home, History } from 'lucide-react';
import { saveTestResult } from '../../services/userService';
import { auth } from '../../lib/firebase';
import { getDetailedQuizFeedback, DetailedQuizFeedback } from '../../lib/gemini';

interface QuizEngineProps {
  questions: MCQ[];
  mode: 'practice' | 'exam';
  onComplete: () => void;
}

export default function QuizEngine({ questions, mode, onComplete }: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 min per question
  const [detailedFeedback, setDetailedFeedback] = useState<DetailedQuizFeedback | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    if (isFinished || mode === 'practice') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished]);

  const currentQuestion = questions[currentIndex];
  const isAnswered = selectedAnswers[currentIndex] !== undefined;

  const handleSelect = (option: string) => {
    if (showExplanation && mode === 'practice') return;
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: option });
    if (mode === 'practice') setShowExplanation(true);
  };

  const finishQuiz = async () => {
    setIsFinished(true);
    const correctCount = questions.reduce((acc, q, i) => 
      selectedAnswers[i] === q.answer ? acc + 1 : acc, 0
    );
    const score = (correctCount / questions.length) * 100;
    
    if (auth.currentUser) {
      await saveTestResult(auth.currentUser.uid, {
        userId: auth.currentUser.uid,
        score,
        accuracy: score,
        timeSpent: (questions.length * 60) - timeLeft,
        totalQuestions: questions.length,
        correctCount,
        subject: questions[0].subject,
        topicAnalytics: {} // Simplified for now
      });
    }

    setLoadingFeedback(true);
    const feedback = await getDetailedQuizFeedback({
      score,
      subject: questions[0].subject,
      results: questions.map((q, i) => ({
        question: q.question,
        isCorrect: selectedAnswers[i] === q.answer,
        topic: q.topic
      }))
    });
    setDetailedFeedback(feedback);
    setLoadingFeedback(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    const correctCount = questions.reduce((acc, q, i) => selectedAnswers[i] === q.answer ? acc + 1 : acc, 0);
    const score = (correctCount / questions.length) * 100;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto py-10"
      >
        <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-gray-100 text-center">
          <div className="w-24 h-24 bg-[#5A5A4010] text-[#5A5A40] rounded-full flex items-center justify-center mx-auto mb-8">
            <Award size={48} />
          </div>
          <h2 className="text-4xl font-serif font-bold mb-2">Performance Summary</h2>
          <p className="text-[#14141460] mb-10 italic">LWSF Competitive Intelligence Report</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-gray-50 rounded-3xl">
              <p className="text-xs uppercase tracking-widest text-[#14141440] font-bold mb-2">Final Score</p>
              <p className="text-4xl font-serif font-bold text-[#141414]">{score.toFixed(0)}%</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-3xl">
              <p className="text-xs uppercase tracking-widest text-[#14141440] font-bold mb-2">Correct</p>
              <p className="text-4xl font-serif font-bold text-[#141414]">{correctCount} <span className="text-2xl text-gray-300">/ {questions.length}</span></p>
            </div>
            <div className="p-6 bg-gray-50 rounded-3xl">
              <p className="text-xs uppercase tracking-widest text-[#14141440] font-bold mb-2">Accuracy</p>
              <p className="text-4xl font-serif font-bold text-[#141414]">{score >= 80 ? 'Elite' : score >= 60 ? 'Strong' : 'Improving'}</p>
            </div>
          </div>

          <div className="bg-[#5A5A4005] border border-[#5A5A4010] p-8 rounded-[2rem] text-left mb-10 overflow-hidden relative">
            <div className="flex items-center gap-3 mb-6 text-[#5A5A40]">
              <BrainCircuitLocal size={24} />
              <h3 className="text-xl font-serif font-bold">Concept Analysis & Strategic Roadmap</h3>
            </div>
            
            {loadingFeedback ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-32 bg-gray-100 rounded-3xl"></div>
              </div>
            ) : detailedFeedback ? (
              <div className="space-y-8">
                <div>
                  <p className="text-[#141414] leading-relaxed italic mb-6 font-medium">"{detailedFeedback.summary}"</p>
                </div>

                <div className="space-y-6">
                   <h4 className="text-xs font-black uppercase tracking-widest text-[#5A5A40]">Topic Breakdown</h4>
                   <div className="space-y-4">
                     {detailedFeedback.topicBreakdown.map((item, i) => (
                       <div key={i} className="bg-white p-6 rounded-3xl border border-[#14141405] shadow-sm">
                         <div className="flex items-center justify-between mb-2">
                           <span className="font-bold text-[#141414]">{item.topic}</span>
                           <span className="text-[10px] font-black uppercase text-[#5A5A40] bg-[#5A5A4010] px-2 py-0.5 rounded">{item.performance}</span>
                         </div>
                         <p className="text-sm text-[#14141460] mb-4">{item.explanation}</p>
                         <div className="flex items-center gap-2 flex-wrap">
                           {item.resources.map((res, j) => (
                             <span key={j} className="text-[9px] font-bold text-[#5A5A40] border border-[#5A5A4030] px-2 py-1 rounded-full bg-white select-none">
                               {res}
                             </span>
                           ))}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="p-8 bg-[#141414] text-white rounded-[2rem]">
                   <h4 className="text-xs font-black uppercase tracking-widest text-[#5A5A40] mb-3">Overall Strategy</h4>
                   <p className="text-sm leading-relaxed text-white/80">{detailedFeedback.overallStrategy}</p>
                </div>
              </div>
            ) : (
              <p className="text-[#14141460] italic">Failed to synthesize deep feedback. Focus on your weak areas.</p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={onComplete}
              className="px-10 py-5 bg-[#141414] text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
            >
              <Home size={20} />
              Return to Dashboard
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-10 py-5 bg-white text-[#141414] border border-[#14141415] rounded-2xl font-bold flex items-center gap-3 hover:bg-gray-50 transition-all"
            >
              <RefreshCcw size={20} />
              New Test
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#14141440]">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#141414] mt-1">{currentQuestion.subject}</h2>
        </div>

        <div className="flex items-center gap-4">
          {mode === 'exam' && (
            <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 font-mono font-bold ${timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-white text-[#141414] border border-[#14141410]'}`}>
              <Timer size={20} />
              {formatTime(timeLeft)}
            </div>
          )}
          <button 
            onClick={finishQuiz}
            className="px-6 py-3 bg-[#141414] text-white rounded-2xl font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 transition-all text-sm"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-white/50 h-1.5 rounded-full overflow-hidden mb-12">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          className="h-full bg-[#5A5A40]"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-sm border border-[#14141405]"
        >
          {/* Difficulty and Type Tags */}
          <div className="flex gap-2 mb-6">
             <span className="px-3 py-1 bg-[#F5F5F0] text-[#14141460] rounded-full text-[10px] uppercase font-bold tracking-wider">
               {currentQuestion.questionType}
             </span>
             <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
               currentQuestion.difficulty === 'very hard' ? 'bg-red-50 text-red-600' : 
               currentQuestion.difficulty === 'hard' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
             }`}>
               {currentQuestion.difficulty}
             </span>
             {currentQuestion.pastPaperFrequency && currentQuestion.pastPaperFrequency > 3 && (
               <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                 <History size={10} /> 
                 Freq: {currentQuestion.pastPaperFrequency}x
               </span>
             )}
          </div>

          <h3 className="text-3xl font-serif text-[#141414] leading-snug mb-10">
            {currentQuestion.question}
          </h3>

          <div className="space-y-4">
            {currentQuestion.options.map((option, i) => {
              const charIdx = String.fromCharCode(65 + i);
              const isSelected = selectedAnswers[currentIndex] === option;
              const isCorrect = option === currentQuestion.answer;
              
              let styles = "w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-4 text-lg ";
              if (isSelected) {
                if (showExplanation && mode === 'practice') {
                  styles += isCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-red-50 border-red-500 text-red-900";
                } else {
                  styles += "bg-[#14141405] border-[#141414] text-[#141414]";
                }
              } else if (showExplanation && isCorrect && mode === 'practice') {
                styles += "bg-emerald-50 border-emerald-500 text-emerald-900";
              } else {
                styles += "bg-white border-gray-100 hover:border-gray-300 text-gray-600";
              }

              return (
                <button 
                  key={i} 
                  onClick={() => handleSelect(option)}
                  disabled={showExplanation && mode === 'practice'}
                  className={styles}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-[#141414] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {charIdx}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showExplanation && mode === 'practice' && isCorrect && <CheckCircle2 className="text-emerald-500" size={24} />}
                  {showExplanation && mode === 'practice' && isSelected && !isCorrect && <XCircle className="text-red-500" size={24} />}
                </button>
              );
            })}
          </div>

          {showExplanation && mode === 'practice' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 p-8 bg-[#5A5A4005] border-l-4 border-[#5A5A40] rounded-r-3xl"
            >
              <div className="flex items-center gap-3 mb-3 text-[#5A5A40]">
                <Info size={20} />
                <h4 className="font-bold uppercase text-xs tracking-widest">Logic Insight</h4>
              </div>
              <p className="text-[#141414] leading-relaxed italic">{currentQuestion.explanation}</p>
            </motion.div>
          )}

          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
            <button 
              onClick={() => {
                setCurrentIndex(prev => Math.max(0, prev - 1));
                setShowExplanation(false);
              }}
              disabled={currentIndex === 0}
              className="p-4 rounded-full border border-gray-100 text-gray-400 hover:text-[#141414] hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex gap-4">
               <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">
                 <Flag size={14} /> Report Error
               </button>
            </div>

            <button 
              onClick={() => {
                if (currentIndex < questions.length - 1) {
                  setCurrentIndex(prev => prev + 1);
                  setShowExplanation(false);
                } else {
                  finishQuiz();
                }
              }}
              className="flex items-center gap-3 px-8 py-4 bg-[#5A5A40] text-white rounded-2xl font-bold hover:bg-[#4A4A30] transition-all shadow-lg"
            >
              {currentIndex === questions.length - 1 ? 'Complete Test' : 'Next Question'}
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const BrainCircuitLocal = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0 .94 4.82 2.5 2.5 0 0 0 4.96.46 2.5 2.5 0 0 0 1.98-3 2.5 2.5 0 0 0-.94-4.82Z"/>
    <path d="M12 12.5a2.5 2.5 0 0 1 4.96.46 2.5 2.5 0 0 1 1.98-3 2.5 2.5 0 0 1-.94-4.82 2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.98 3 2.5 2.5 0 0 1 .94 4.82Z"/>
    <path d="M12 12.5v1.5a2.5 2.5 0 0 1-2.5 2.5H8"/>
    <path d="M16 16.5h1.5a2.5 2.5 0 0 0 2.5-2.5V13"/>
    <path d="M8 16.5v1.5a2.5 2.5 0 0 0 2.5 2.5h3"/>
    <path d="M12 20.5v1.5"/>
  </svg>
);
