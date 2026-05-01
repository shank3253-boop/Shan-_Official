import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, BookOpen, Layers, HelpCircle, CheckCircle2 } from 'lucide-react';
import { submitQuestion } from '../services/submissionService';
import { CATEGORIES } from '../constants';

export default function SubmissionForm({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'MCQ' | 'Subjective' | 'Objective'>('MCQ');
  const [subject, setSubject] = useState(CATEGORIES[0].name);
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const content = type === 'MCQ' ? {
        question,
        options,
        answer,
        explanation
      } : {
        question,
        explanation
      };

      await submitQuestion({
        type,
        subject,
        topic,
        content
      });
      setSubmitted(true);
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error(error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-[#141414]">Submission Received!</h3>
        <p className="text-[#14141460]">Our academic team will review your question for quality and standard compliance before adding it to the bank.</p>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 flex flex-col h-full max-h-[90vh]">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-serif font-bold text-[#141414]">Academic Contribution</h2>
          <p className="text-[#14141460]">Help build the elite CSS question bank.</p>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition-all">
          <X size={24} className="text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 overflow-y-auto pr-2">
        {/* Type Selector */}
        <div className="grid grid-cols-3 gap-4">
          {(['MCQ', 'Subjective', 'Objective'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`p-4 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${type === t ? 'border-[#141414] bg-[#141414] text-white shadow-lg' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-[#14141440] flex items-center gap-2">
               <BookOpen size={12} /> Subject
             </label>
             <select 
               value={subject}
               onChange={e => setSubject(e.target.value)}
               className="w-full bg-[#14141405] border-transparent rounded-2xl p-4 font-bold focus:ring-2 focus:ring-[#14141410]"
             >
               {CATEGORIES.map(cat => (
                 <option key={cat.id} value={cat.name}>{cat.name}</option>
               ))}
             </select>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-[#14141440] flex items-center gap-2">
               <Layers size={12} /> Topic
             </label>
             <input 
               type="text"
               required
               placeholder="e.g. Constitutional Reforms"
               value={topic}
               onChange={e => setTopic(e.target.value)}
               className="w-full bg-[#14141405] border-transparent rounded-2xl p-4 font-bold focus:ring-2 focus:ring-[#14141410]"
             />
          </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-[#14141440] flex items-center gap-2">
             <HelpCircle size={12} /> Question Statement
           </label>
           <textarea 
             required
             rows={3}
             placeholder="Enter the full question statement..."
             value={question}
             onChange={e => setQuestion(e.target.value)}
             className="w-full bg-[#14141405] border-transparent rounded-2xl p-6 font-medium focus:ring-2 focus:ring-[#14141410]"
           />
        </div>

        {type === 'MCQ' && (
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-[#14141440]">Options & Correct Answer</label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {options.map((opt, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="answer" 
                      required
                      checked={answer === opt && opt !== ''}
                      onChange={() => setAnswer(opt)}
                      className="w-4 h-4 accent-[#141414]"
                    />
                    <input 
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={opt}
                      onChange={e => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }}
                      className="flex-1 bg-white border-b border-gray-100 p-2 focus:border-[#141414] outline-none"
                    />
                 </div>
               ))}
             </div>
          </div>
        )}

        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-[#14141440]">Explanation / Logic</label>
           <textarea 
             required
             rows={4}
             placeholder="Explain why this answer is correct and provide historical/logical context..."
             value={explanation}
             onChange={e => setExplanation(e.target.value)}
             className="w-full bg-[#14141405] border-transparent rounded-2xl p-6 font-medium focus:ring-2 focus:ring-[#14141410]"
           />
        </div>

        <button
          disabled={isSubmitting}
          className="w-full py-5 bg-[#141414] text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-all disabled:opacity-50 shadow-2xl shadow-gray-300"
        >
          {isSubmitting ? 'Syncing with Bank...' : 'Submit to Academic Repository'}
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
