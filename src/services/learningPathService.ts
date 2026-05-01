import { getDetailedQuizFeedback, DetailedQuizFeedback } from '../lib/gemini';
import { TestResult } from '../types';

export async function generateLearningPath(history: TestResult[]): Promise<DetailedQuizFeedback> {
  if (history.length === 0) {
    return {
      summary: "Start by taking a few practice tests to generate your personalized learning path.",
      topicBreakdown: [],
      overallStrategy: "Consistency is key in CSS preparation."
    };
  }

  // Aggregate performance by subject and topic
  const subject = history[0].subject; // Analyzes the latest subject practiced
  const results = history.flatMap(res => {
     // This is a simplified extraction, assuming we have question-level results or just topicAnalytics
     return Object.entries(res.topicAnalytics).map(([topic, stats]) => ({
       question: "Concept analysis in " + topic,
       isCorrect: stats.correct / stats.total > 0.7,
       topic
     }));
  });

  return getDetailedQuizFeedback({
    score: history[0].accuracy,
    subject,
    results
  });
}
