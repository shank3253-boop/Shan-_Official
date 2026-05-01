import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookText, Globe, Landmark, BarChart, Lightbulb, ChevronRight, Share2, Printer, Search, Sparkles, RefreshCcw, Plus, X, Award } from 'lucide-react';
import { getSubjectiveVault, syncExamIntelligence, generateNewSubjectiveQuestion } from '../services/intelligenceService';
import { SubjectiveQuestion, AnswerEvaluation } from '../types';
import { evaluateAnswer, generateModelOutline } from '../lib/gemini';
import Markdown from 'react-markdown';
import SubmissionForm from '../components/SubmissionForm';

const CSS_SUBJECTS = [
  // Compulsory
  "English Essay", "English Precis & Composition", "General Science & Ability", 
  "Current Affairs", "Pakistan Affairs", "Islamic Studies",
  // Group 1
  "Accountancy & Auditing", "Economics", "Computer Science", "Political Science", "International Relations",
  // Group 2
  "Physics", "Chemistry", "Applied Mathematics", "Pure Mathematics", "Statistics", "Geology",
  // Group 3
  "Business Administration", "Public Administration", "Town Planning & Urban Management", "Governance & Public Policies",
  // Group 4
  "History of Pakistan & India", "Islamic History & Culture", "British History", "European History", "History of USA",
  // Group 5
  "Gender Studies", "Environmental Sciences", "Agriculture & Forestry", "Botany", "Zoology", "English Literature", "Urdu Literature",
  // Group 6
  "Law", "Constitutional Law", "International Law", "Muslim Law & Jurisprudence", "Mercantile Law", "Criminology", "Philosophy",
  // Group 7
  "Journalism & Mass Communication", "Psychology", "Geography", "Sociology", "Anthropology", "Punjabi", "Sindhi", "Pashto", "Balochi", "Arabic", "Persian"
];

export default function SubjectiveVault() {
  const [questions, setQuestions] = useState<SubjectiveQuestion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [generatingSubject, setGeneratingSubject] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [modalSearch, setModalSearch] = useState('');
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([]);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [showHighProbOnly, setShowHighProbOnly] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getSubjectiveVault();
      setQuestions(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleGenerateForSubject = async (subject: string) => {
    setGeneratingSubject(subject);
    try {
      const newQ = await generateNewSubjectiveQuestion(subject);
      setQuestions(prev => [newQ, ...prev]);
      setSelectedId(newQ.id);
      setShowSubjectModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingSubject(null);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncExamIntelligence();
      const data = await getSubjectiveVault();
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (selectedForBulk.length === 0) return;
    setIsBulkGenerating(true);
    try {
      const results = [];
      for (const sub of selectedForBulk) {
        setGeneratingSubject(sub);
        const newQ = await generateNewSubjectiveQuestion(sub);
        results.push(newQ);
      }
      setQuestions(prev => [...results, ...prev]);
      setShowSubjectModal(false);
      setSelectedForBulk([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBulkGenerating(false);
      setGeneratingSubject(null);
    }
  };

  const filtered = questions.filter(q => {
    const matchesSearch = q.subject.toLowerCase().includes(filter.toLowerCase()) || 
                         q.topic.toLowerCase().includes(filter.toLowerCase()) ||
                         (q.pastPaperReference && q.pastPaperReference.toLowerCase().includes(filter.toLowerCase()));
    
    if (showHighProbOnly && (!q.priorityScore || q.priorityScore < 0.8)) return false;
    return matchesSearch;
  });

  const selected = questions.find(q => q.id === selectedId);
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [showModelOutline, setShowModelOutline] = useState(false);
  const [modelOutline, setModelOutline] = useState<string[]>([]);
  const [loadingOutline, setLoadingOutline] = useState(false);

  // Load draft from local storage
  useEffect(() => {
    if (selectedId) {
      const draft = localStorage.getItem(`draft_${selectedId}`);
      setUserAnswer(draft || '');
    } else {
      setUserAnswer('');
    }
    setEvaluation(null);
    setShowModelOutline(false);
  }, [selectedId]);

  // Save draft to local storage
  useEffect(() => {
    if (selectedId && userAnswer) {
      localStorage.setItem(`draft_${selectedId}`, userAnswer);
    }
  }, [userAnswer, selectedId]);

  const handleEvaluate = async () => {
    if (!selected || !userAnswer) return;
    setIsEvaluating(true);
    try {
      const result = await evaluateAnswer({
        question: selected.question,
        answer: userAnswer,
        subject: selected.subject
      });
      setEvaluation(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleShowOutline = async () => {
    if (!selected) return;
    setShowModelOutline(true);
    setLoadingOutline(true);
    try {
      const outline = await generateModelOutline(selected.question);
      setModelOutline(outline);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOutline(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-[#141414] mb-2">Subjective Intelligence Vault</h1>
          <p className="text-[#14141460]">20-Mark Master Questions with AI-generated Case Studies and Multi-Level Analysis.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => setShowHighProbOnly(!showHighProbOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              showHighProbOnly 
                ? 'bg-amber-50 border-amber-200 text-amber-700' 
                : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
            }`}
          >
            <Sparkles size={14} />
            High Probability (0.8+)
          </button>

          <button 
            onClick={() => setShowSubjectModal(true)}
            className="flex items-center gap-2 bg-[#141414] text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
          >
            <Plus size={18} />
            Generate IQ
          </button>
          
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${isSyncing ? 'bg-gray-100 text-gray-400' : 'bg-[#5A5A4010] text-[#5A5A40] hover:bg-[#5A5A4020]'}`}
          >
            <RefreshCcw size={18} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Bulk Refresh'}
          </button>

          <button 
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
          >
            <Plus size={18} />
            Contribute
          </button>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14141440]" size={18} />
            <input 
              type="text" 
              placeholder="Filter vault..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-white border border-[#14141415] rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#5A5A4050] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List side */}
        <div className="lg:col-span-4 space-y-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="p-10 bg-white border border-dashed border-gray-200 rounded-[2rem] text-center">
              <Sparkles size={32} className="mx-auto mb-4 text-[#14141410]" />
              <p className="text-sm text-[#14141440] mb-6">Vault is currently empty or no matches found.</p>
              <button 
                onClick={() => setShowSubjectModal(true)}
                className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold text-sm"
              >
                Start Generating IQ
              </button>
            </div>
          ) : (
            filtered.map(q => (
              <button
                key={q.id}
                onClick={() => setSelectedId(q.id)}
                className={`w-full text-left p-6 rounded-[1.5rem] border transition-all ${
                  selectedId === q.id 
                    ? 'bg-[#141414] text-white border-[#141414] shadow-xl' 
                    : 'bg-white text-[#141414] border-[#14141405] hover:border-[#14141415]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${selectedId === q.id ? 'text-white/50' : 'text-[#5A5A40]'}`}>
                    {q.subject}
                  </span>
                  <span className="text-[10px] font-bold opacity-60">
                    {q.subject.toLowerCase().includes('essay') || q.subject.toLowerCase().includes('precis') ? '100' : '20'} Marks
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg line-clamp-2 leading-snug">
                  {q.question.length > 100 ? q.question.substring(0, 100) + '...' : q.question}
                </h3>
              </button>
            ))
          )}
        </div>

        {/* Detail side */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[2.5rem] border border-[#14141405] overflow-hidden"
              >
                <div className="p-10 md:p-14 space-y-10">
                  {/* Header */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sparkles className="text-[#5A5A40]" size={20} />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#14141440]">Predictive Analysis</span>
                      </div>
                      <div className="text-sm font-black text-[#5A5A40] bg-[#5A5A4010] px-4 py-1.5 rounded-full border border-[#5A5A4020]">
                        {selected.subject.toLowerCase().includes('essay') || selected.subject.toLowerCase().includes('precis') ? '100' : '20'} MARKS PAPERS
                      </div>
                    </div>

                    <div className="prose prose-neutral max-w-none">
                      {selected.subject.toLowerCase().includes('essay') ? (
                        <div className="space-y-6">
                           <h2 className="text-4xl font-serif text-[#141414] leading-tight">{selected.question}</h2>
                           <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                             <span>TARGET: 2500-3000 WORDS</span>
                             <span>•</span>
                             <span>TIME: 3 HOURS</span>
                           </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {selected.subject.toLowerCase().includes('precis') && (
                            <div className="flex items-center gap-3 bg-[#5A5A4008] p-4 rounded-2xl border border-[#5A5A4015]">
                              <Lightbulb className="text-[#5A5A40]" size={18} />
                              <p className="text-xs font-bold text-[#5A5A40] uppercase tracking-wide">
                                Goal: Reduce passage to approx. 70-80 words (one-third length).
                              </p>
                            </div>
                          )}
                          <div className="markdown-body text-[#141414] text-lg leading-relaxed font-serif bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 shadow-inner">
                            <Markdown>{selected.question}</Markdown>
                          </div>
                        </div>
                      )}
                    </div>

                    {selected.urduQuestion && (
                      <div className="p-8 bg-[#14141405] rounded-3xl border border-[#14141410] text-right mt-6">
                        <span className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Urdu / Punjabi Version</span>
                        <p className="text-3xl font-serif text-[#141414] leading-loose dir-rtl">
                          {selected.urduQuestion}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Specialized Context Layers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-8 bg-amber-50 rounded-[2.5rem] space-y-4 border-2 border-amber-100 shadow-sm relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                        <BookText size={120} className="rotate-12" />
                      </div>
                      
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
                          <BookText size={20} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-800/60">Analytical Scenario</h4>
                      </div>

                      <div className="relative z-10">
                         <h3 className="text-xl font-serif font-bold text-amber-950 mb-4">Interactive Case Study</h3>
                         <p className="text-lg text-amber-900/80 leading-relaxed font-serif italic border-l-4 border-amber-200 pl-6">
                           "{selected.caseStudy}"
                         </p>
                      </div>

                      <div className="pt-2 flex items-center gap-2 text-amber-900/30 text-[9px] font-bold uppercase tracking-widest">
                         <Sparkles size={12} />
                         AI Pattern Extraction
                      </div>
                    </motion.div>

                    <div className="p-8 bg-blue-50 rounded-[2rem] space-y-3">
                      <div className="flex items-center gap-2 text-blue-600">
                        <BarChart size={18} />
                        <h4 className="text-xs font-black uppercase tracking-widest">Facts & Statistics</h4>
                      </div>
                      <ul className="space-y-2">
                        {selected.factsAndStats.map((stat, i) => (
                          <li key={i} className="text-sm text-blue-900/70 flex gap-2">
                            <span className="text-blue-500">•</span> {stat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Authority References (Quran, Hadith, Poetry, Law) */}
                  {selected.references && selected.references.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <Award className="text-[#5A5A40]" size={20} />
                        <h3 className="font-serif font-bold text-xl uppercase tracking-tighter">Authority References</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        {selected.references.map((ref, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 bg-gray-50/50 border border-gray-100 rounded-3xl group hover:bg-white hover:shadow-xl hover:border-transparent transition-all"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                ref.type === 'Quran' ? 'bg-emerald-100 text-emerald-800' :
                                ref.type === 'Hadith' ? 'bg-indigo-100 text-blue-800' :
                                ref.type === 'Poetry' ? 'bg-rose-100 text-red-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {ref.type}
                              </span>
                              {ref.source && <span className="text-[10px] text-gray-400 font-medium italic">{ref.source}</span>}
                            </div>
                            <p className={`text-base font-serif leading-relaxed ${
                              (ref.type === 'Quran' || ref.type === 'Hadith' || ref.type === 'Poetry') ? 'text-xl' : 'text-sm'
                            } text-[#141414]`}>
                              {ref.content}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deep Analysis Layers */}
                  <div className="space-y-8">
                    {/* Global Analysis */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <Globe className="text-[#14141440]" size={20} />
                        <h3 className="font-serif font-bold text-xl uppercase tracking-tighter">Global Dimension</h3>
                      </div>
                      <p className="text-[#14141470] leading-relaxed text-lg">{selected.globalAnalysis}</p>
                    </div>

                    {/* Pakistan Analysis */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <Landmark className="text-[#14141440]" size={20} />
                        <h3 className="font-serif font-bold text-xl uppercase tracking-tighter">Pakistan Perspective</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <span className="text-[10px] font-black uppercase text-gray-400">English Analysis</span>
                           <p className="text-[#14141470] leading-relaxed">{selected.pakistanAnalysis}</p>
                        </div>
                        {selected.urduAnalysis && (
                          <div className="space-y-2 text-right flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase text-gray-400">نقطہ نظر (پاکستان)</span>
                            <p className="text-2xl font-serif text-[#141414] leading-loose dir-rtl">
                              {selected.urduAnalysis}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Model Outline Section */}
                  {showModelOutline && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-[#5A5A4010] p-8 rounded-[2rem] border border-[#5A5A4020]"
                    >
                      <h4 className="flex items-center gap-2 text-[#5A5A40] font-bold text-sm uppercase tracking-widest mb-6">
                        <Lightbulb size={16} /> 2027 Model Answer Outline
                      </h4>
                      {loadingOutline ? (
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {modelOutline.map((item, i) => (
                            <li key={i} className="flex gap-4 items-start">
                              <span className="w-6 h-6 bg-[#5A5A40] text-white rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold">
                                {i + 1}
                              </span>
                              <span className="text-[#141414] font-medium">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  )}

                  {/* Attempt Section */}
                  <div className="pt-10 border-t border-gray-100">
                    <h3 className="text-xl font-serif font-bold mb-6">Attempt Question</h3>
                    <textarea 
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your analytical answer here (Min. 500 words recommended for 20 marks)..."
                      className="w-full h-96 bg-gray-50 border border-gray-100 rounded-3xl p-8 focus:outline-none focus:ring-2 focus:ring-[#5A5A4050] text-[#141414] transition-all"
                    />

                    {evaluation && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-10 bg-white border-2 border-[#5A5A40] rounded-[2.5rem] shadow-xl"
                      >
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h4 className="text-2xl font-serif font-bold text-[#141414]">AI Examiner Result</h4>
                            <p className="text-[#14141460] text-sm">Evaluation based on FPSC Paper Checking Standards</p>
                          </div>
                          <div className="bg-[#141414] text-white p-6 rounded-3xl text-center min-w-[120px]">
                            <p className="text-[10px] uppercase font-black mb-1">Score</p>
                            <p className="text-4xl font-serif font-bold">{evaluation.score}<span className="text-white/40">/20</span></p>
                          </div>
                        </div>

                        <div className="space-y-6 text-sm">
                          <div>
                            <h5 className="font-bold text-emerald-600 uppercase tracking-widest text-[10px] mb-2">Strengths</h5>
                            <ul className="list-disc pl-5 text-gray-600 space-y-1">
                              {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-bold text-red-600 uppercase tracking-widest text-[10px] mb-2">Weaknesses</h5>
                            <ul className="list-disc pl-5 text-gray-600 space-y-1">
                              {evaluation.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                          </div>
                          <div className="bg-gray-50 p-6 rounded-2xl">
                             <h5 className="font-bold uppercase tracking-widest text-[10px] mb-2">Strategic Advice</h5>
                             <p className="text-[#14141480] italic leading-relaxed">{evaluation.feedback}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-8">
                      <button 
                        onClick={handleEvaluate}
                        disabled={isEvaluating || !userAnswer}
                        className="bg-[#141414] text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 hover:bg-gray-800 transition-all shadow-xl disabled:opacity-50"
                      >
                        {isEvaluating ? 'Evaluating Content...' : 'Evaluate with AI'}
                        {isEvaluating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ChevronRight size={20} />}
                      </button>
                      
                      <button 
                         onClick={handleShowOutline}
                         className="bg-white text-[#141414] border border-[#14141415] px-10 py-5 rounded-2xl font-bold flex items-center gap-3 hover:bg-gray-50 transition-all"
                      >
                        <Lightbulb size={20} />
                        View Topper Outline
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[600px] bg-white rounded-[2.5rem] border border-[#14141405] flex flex-col items-center justify-center text-center p-10">
                <BookText size={64} className="text-[#14141405] mb-6" />
                <h3 className="text-2xl font-serif font-bold text-[#14141440]">Select a question to see deep analysis</h3>
                <p className="text-[#14141420] max-w-xs mt-2">Every question in this vault is curated using CSS past paper intelligence and current year predictions.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Subject Selection Modal */}
      <AnimatePresence>
        {showSubjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowSubjectModal(false)}
              className="absolute inset-0 bg-[#14141490] backdrop-blur-sm" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex flex-col gap-6 bg-gray-50/50">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-[#141414]">Intelligence Generator</h2>
                    <p className="text-[#14141460] text-sm">Select subjects to generate high-yield analytical questions.</p>
                  </div>
                  <button 
                    onClick={() => setShowSubjectModal(false)}
                    className="p-3 hover:bg-gray-100 rounded-full text-gray-400 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Search for subjects (e.g. Political Science)..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#14141420] transition-all"
                  />
                </div>
              </div>

              <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {CSS_SUBJECTS.filter(s => s.toLowerCase().includes(modalSearch.toLowerCase())).map((sub) => {
                  const isSelected = selectedForBulk.includes(sub);
                  return (
                    <button
                      key={sub}
                      disabled={isBulkGenerating || (generatingSubject === sub)}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedForBulk(prev => prev.filter(i => i !== sub));
                        } else {
                          setSelectedForBulk(prev => [...prev, sub]);
                        }
                      }}
                      className={`group flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                        isSelected 
                          ? 'bg-[#141414] border-[#141414] text-white' 
                          : 'bg-white border-gray-100 hover:border-[#14141420] hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected ? 'bg-white border-white' : 'border-gray-200 bg-white'
                        }`}>
                          {isSelected && <ChevronRight size={14} className="text-[#141414]" />}
                        </div>
                        <span className={`text-sm font-semibold transition-colors ${
                          isSelected ? 'text-white' : 'text-[#14141480] group-hover:text-[#141414]'
                        }`}>{sub}</span>
                      </div>
                      {generatingSubject === sub && (
                        <div className="w-4 h-4 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-500">
                  {selectedForBulk.length} subjects selected
                </div>
                <div className="flex gap-4">
                   <button 
                    onClick={() => setSelectedForBulk([])}
                    className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Clear All
                  </button>
                  <button 
                    onClick={handleBulkGenerate}
                    disabled={selectedForBulk.length === 0 || isBulkGenerating}
                    className="bg-[#141414] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50 shadow-xl"
                  >
                    {isBulkGenerating ? (
                      <>
                        <RefreshCcw size={18} className="animate-spin" />
                        Generating ({selectedForBulk.length})...
                      </>
                    ) : (
                      <>
                        Generate Questions
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
