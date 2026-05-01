import { Category } from "./types";

export const CATEGORIES: Category[] = [
  // CSS Compulsory
  { id: 'eng-essay', name: 'English Essay', group: 'CSS Compulsory' },
  { id: 'precis-comp', name: 'Precis & Composition', group: 'CSS Compulsory' },
  { id: 'gsa', name: 'General Science & Ability', group: 'CSS Compulsory' },
  { id: 'curr-affairs', name: 'Current Affairs', group: 'CSS Compulsory' },
  { id: 'pak-affairs', name: 'Pakistan Affairs', group: 'CSS Compulsory' },
  { id: 'islamic-studies', name: 'Islamic Studies', group: 'CSS Compulsory' },

  // One Paper / PPSC
  { id: 'gk', name: 'General Knowledge', group: 'One Paper' },
  { id: 'everyday-science', name: 'Everyday Science', group: 'One Paper' },
  { id: 'math', name: 'Math / Analytics', group: 'One Paper' },
  { id: 'computer-sci', name: 'Computer Science', group: 'One Paper' },

  // CSS Optional (Sample)
  { id: 'ir', name: 'International Relations', group: 'CSS Optional' },
  { id: 'pol-sci', name: 'Political Science', group: 'CSS Optional' },
  { id: 'law', name: 'Law / Sociology', group: 'CSS Optional' },
  { id: 'psychology', name: 'Psychology', group: 'CSS Optional' },
  { id: 'pub-admin', name: 'Public Administration', group: 'CSS Optional' },
  { id: 'punjabi', name: 'Punjabi', group: 'CSS Optional' },
  { id: 'gender-studies', name: 'Gender Studies', group: 'CSS Optional' },
  { id: 'criminology', name: 'Criminology', group: 'CSS Optional' },
];

export const EXAM_MODES = {
  PRACTICE: 'Practice Mode',
  EXAM: 'Exam Simulator',
};

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'very hard'] as const;
