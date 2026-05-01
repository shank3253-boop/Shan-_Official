export type Difficulty = 'easy' | 'medium' | 'hard' | 'very hard';
export type ExamType = 'CSS' | 'PPSC' | 'FPSC' | 'General';
export type QuestionType = 'Conceptual' | 'Scenario' | 'Statement' | 'Match' | 'Assertion-Reason';

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  subject: string;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  examType: ExamType;
  questionType: QuestionType;
  yearWeight?: number;
  isHotTopic?: boolean;
  predictionScore?: number;
  pastPaperFrequency?: number; // 0-10+ appearances
  priorityScore?: number; // AI calculated importance 0-1
}

export interface HotTopic {
  id: string;
  title: string;
  subject: string;
  predictionScore: number; // 0-1
  trend: 'rising' | 'high' | 'stable';
  reason: string;
  frequencyInPastPapers: number;
}

export interface AnswerEvaluation {
  score: number;
  maxMarks: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestedOutline?: string[];
}

export interface SubjectiveQuestion {
  id: string;
  subject: string;
  topic: string;
  question: string;
  urduQuestion?: string;
  marks: number;
  caseStudy: string;
  factsAndStats: string[];
  globalAnalysis: string;
  pakistanAnalysis: string;
  urduAnalysis?: string;
  pastPaperReference?: string;
  priorityScore: number;
  modelOutline?: string[];
  references?: {
    type: 'Quran' | 'Hadith' | 'Incident' | 'Poetry' | 'Other';
    content: string;
    source?: string;
  }[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  stats: {
    totalTests: number;
    averageAccuracy: number;
    streak: number;
  };
}

export interface TestResult {
  id: string;
  userId: string;
  timestamp: string;
  score: number;
  accuracy: number;
  timeSpent: number;
  totalQuestions: number;
  correctCount: number;
  subject: string;
  topicAnalytics: Record<string, { correct: number; total: number }>;
}

export interface Category {
  id: string;
  name: string;
  group: 'CSS Compulsory' | 'CSS Optional' | 'One Paper' | 'General';
}

export interface QuestionSubmission {
  id: string;
  userId: string;
  userEmail: string;
  type: 'MCQ' | 'Subjective' | 'Objective';
  subject: string;
  topic: string;
  content: any; // MCQ object or Subjective object
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface LearningPath {
  id: string;
  userId: string;
  weakAreas: {
    topic: string;
    accuracy: number;
    recommendation: string;
    resources: string[];
  }[];
  generatedAt: string;
}
