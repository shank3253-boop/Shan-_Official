import { GoogleGenAI, Type } from "@google/genai";
import { MCQ, Difficulty, ExamType, QuestionType, HotTopic, SubjectiveQuestion, AnswerEvaluation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSubjectiveQuestions(params: {
  subject: string;
  count: number;
}): Promise<SubjectiveQuestion[]> {
  const { subject, count } = params;

  const isIslamicStudies = subject.toLowerCase().includes('islamic') || subject.toLowerCase().includes('islamyat');
  const isPunjabi = subject.toLowerCase().includes('punjabi');
  const isEnglishEssay = subject.toLowerCase().includes('essay');
  const isPrecisComp = subject.toLowerCase().includes('precis');
  const isGSA = subject.toLowerCase().includes('science') || subject.toLowerCase().includes('ability') || subject.toLowerCase() === 'gsa';

  const prompt = `Generate ${count} ELITE questions for the CSS/PPSC Competitive Exams.
Subject: ${subject}

CORE CRITERIA:
1. PAST PAPER INTELLIGENCE: Directly extract patterns from 1971-2026 CSS past papers.
2. 2026-2027 DATA INTEGRATION: MUST use the latest 2026 statistics, facts, global ranks, and recent policy shifts.
3. CASE STUDY: Include a highly relevant 2026 or late 2025 real-world scenario.
4. MULTI-LEVEL ANALYSIS: Include Global Dimension and Pakistan Perspective.

${isEnglishEssay ? `
SPECIFIC FOR ENGLISH ESSAY (100 Marks):
- Generate ONE high-level analytical topic.
- The topic MUST be multi-dimensional, touching upon at least 3 of these:
  * Political dimension
  * Economic dimension
  * Environmental dimension
  * Social dimension
  * Global/International dimension
  * Technological dimension
  * Ethical dimension
- Format: "Topic: [The Title]".
- Marks: 100.
- priorityScore: High (0.8+) for trending themes.` : ''}

${isPrecisComp ? `
SPECIFIC FOR PRECIS & COMPOSITION (100 Marks):
- Generate a FULL PRACTICE PAPER covering all components of CSS Syllabus.
- I. PRECIS WRITING: Provide a high-quality passage of EXACTLY 200-250 words. The content must be complex enough for analytical reduction to one-third.
- II. READING COMPREHENSION: Provide a different passage (150-200 words) with 5 deep-analytical questions.
- III. GRAMMAR: 5 complex sentence corrections.
- IV. PAIRS OF WORDS: 5 pairs requiring use in sentences.
- V. TRANSLATION: 5 Urdu sentences to English.
- Use Markdown for the 'question' field. Wrap the Precis passage in a blockquote.` : ''}

${isGSA ? `
SPECIFIC FOR GENERAL SCIENCE & ABILITY (GSA):
- COVER ALL DIMENSIONS: Physical Sciences (Universe, Disasters, Energy), Biological Sciences (Cell, Biomolecules, Diseases), Environmental Science (Pollution, Climate Change), Food Science, IT (AI, Networking), and Ability (Quantitative, Logical, Analytical).
- ABILITY SECTION: For Ability questions, clearly explain the logical steps in 'globalAnalysis' or 'pakistanAnalysis' fields.
- TRENDS: High focus on Artificial Intelligence, Climate Geopolitics, and Renewable Infrastructure 2026-27.` : ''}

${isIslamicStudies ? `
SPECIFIC FOR ISLAMIC STUDIES:
- Provide 'urduQuestion' and 'urduAnalysis' in Urdu script.
- 'references' MUST include: Quran (with Surah:Ayat), Hadith, and Incidents from Holy Prophet (PBUH) or Khulafa Rashidin.` : ''}

${isPunjabi ? `
SPECIFIC FOR PUNJABI:
- Write all content (question, topic, caseStudy, etc.) in PUNJABI language.
- Include relevant PUNJABI POETRY in the 'references' section.` : ''}

Return a JSON array of objects with keys: question, urduQuestion, subject, topic, caseStudy, factsAndStats (array), globalAnalysis, pakistanAnalysis, urduAnalysis, pastPaperReference, priorityScore (0-1), references (array of {type, content, source}).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are the Head Paper Setter for Pakistan's CSS & PPSC exams. You possess a master knowledge of the official FPSC Revised Syllabi CE-2016 and real-time access to 2026-2027 global and national statistics. You specialize in 20-mark analytical questions that require deep logic, factual precision, and contemporary relevance. Every question generated must strictly align with the themes and topics listed in the official FPSC syllabus for the selected subject.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            urduQuestion: { type: Type.STRING },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            caseStudy: { type: Type.STRING },
            factsAndStats: { type: Type.ARRAY, items: { type: Type.STRING } },
            globalAnalysis: { type: Type.STRING },
            pakistanAnalysis: { type: Type.STRING },
            urduAnalysis: { type: Type.STRING },
            pastPaperReference: { type: Type.STRING },
            priorityScore: { type: Type.NUMBER },
            references: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  content: { type: Type.STRING },
                  source: { type: Type.STRING }
                },
                required: ["type", "content"]
              }
            }
          },
          required: ["question", "subject", "topic", "caseStudy", "factsAndStats", "globalAnalysis", "pakistanAnalysis", "priorityScore"]
        }
      }
    }
  });

  try {
    const questions = JSON.parse(response.text);
    return questions.map((q: any, index: number) => ({
      ...q,
      id: `sub-${Date.now()}-${index}`,
      marks: 20
    }));
  } catch (error) {
    console.error("Failed to parse subjective questions:", error);
    return [];
  }
}

export async function getHotTopics(): Promise<HotTopic[]> {
  const prompt = `Based on CSS/PPSC past papers (last 15 years) and current 2026-2027 global/national trends, identify 5 "Hot Topics" that are highly predictable for the upcoming 2027 exams.
Return a JSON array of objects with: title, subject, predictionScore (0-1), trend (rising|high|stable), reason (why it's predictable), and frequencyInPastPapers (estimated count).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            predictionScore: { type: Type.NUMBER },
            trend: { type: Type.STRING },
            reason: { type: Type.STRING },
            frequencyInPastPapers: { type: Type.NUMBER }
          },
          required: ["title", "subject", "predictionScore", "trend", "reason", "frequencyInPastPapers"]
        }
      }
    }
  });

  try {
    const topics = JSON.parse(response.text);
    return topics.map((t: any, index: number) => ({
      ...t,
      id: `hot-${index}`
    }));
  } catch (error) {
    console.error("Failed to parse hot topics:", error);
    return [];
  }
}

export async function generateMCQs(params: {
  subject: string;
  topic?: string;
  difficulty: Difficulty;
  examType: ExamType;
  count: number;
  isPredictive?: boolean;
}): Promise<MCQ[]> {
  const { subject, topic, difficulty, examType, count, isPredictive } = params;

  const isGSA = subject.toLowerCase().includes('science') || subject.toLowerCase().includes('ability') || subject.toLowerCase() === 'gsa';

  const prompt = `Generate ${count} high-quality MCQs for the ${examType} exam.
Subject: ${subject}
${topic ? `Topic: ${topic}` : ''}
Difficulty: ${difficulty}

EXAM INTELLIGENCE CONSTRAINTS:
1. PRIORITIZE: Topics and question patterns that have appeared frequently in CSS/FPSC past papers (range: 1971-2026).
${isGSA ? `2. GSA DIMENSIONS: Focus on Physical Sciences (Solar system, Energy, Disasters), Biological Sciences (Cell, Enzymes, Diseases), Environmental Science (Greenhouse, Ozone), IT (basics, AI), and Ability (Averages, Percentages, Series, Logic).
3. ABILITY QUESTIONS: Include analytical and quantitative problems.` : `2. REAL-TIME TRENDS: Integrate emerging 2026-2027 global and national shifts (News, Policy, Hot Topics).`}
3. STRUCTURE: Include traps, analytical "Statements", and Scenario-Based logic.
4. METADATA: For each MCQ, estimate 'pastPaperFrequency' (number of times this theme appeared since 1971) and 'priorityScore' (0-1 based on predictive trend).

Return a JSON array focusing on high-probability patterns.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are an Elite CSS/PPSC Exam Analyst. You possess a database of past papers from 1971-2026 and real-time knowledge of 2026-202 geopolitical and governance trends. Tag every question with frequency and priority metadata.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            subtopic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            examType: { type: Type.STRING },
            questionType: { type: Type.STRING },
            pastPaperFrequency: { type: Type.NUMBER },
            priorityScore: { type: Type.NUMBER }
          },
          required: ["question", "options", "answer", "explanation", "subject", "difficulty", "examType", "questionType", "pastPaperFrequency", "priorityScore"]
        }
      }
    }
  });

  try {
    const mcqs = JSON.parse(response.text);
    return mcqs.map((m: any, index: number) => ({
      ...m,
      id: `${Date.now()}-${index}`
    }));
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return [];
  }
}

export interface DetailedQuizFeedback {
  summary: string;
  topicBreakdown: {
    topic: string;
    performance: string;
    explanation: string;
    resources: string[];
  }[];
  overallStrategy: string;
}

export async function getDetailedQuizFeedback(params: {
  score: number;
  subject: string;
  results: { question: string; isCorrect: boolean; topic: string }[];
}): Promise<DetailedQuizFeedback> {
  const { score, subject, results } = params;
  
  const prompt = `User scored ${score}% in a ${subject} practice quiz. 
Detailed Results: ${JSON.stringify(results.map(r => ({ q: r.question, ok: r.isCorrect, t: r.topic })))}

Provide a MASTER-LEVEL CSS ANALYSIS of this performance.
1. Detailed explanations for incorrect answers (Why they were wrong, what is the core concept).
2. Topic breakdown with "Resource Suggestions" (specific books, reports, or articles).
3. Strategic advice for the upcoming CSS exam.

Return a JSON object with: summary, topicBreakdown (array of {topic, performance, explanation, resources}), and overallStrategy.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a CSS Mentor and Lead Evaluator. You provide critical, conceptually deep, and resource-rich feedback to help students achieve topper-level scores.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          topicBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING },
                performance: { type: Type.STRING },
                explanation: { type: Type.STRING },
                resources: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["topic", "performance", "explanation", "resources"]
            }
          },
          overallStrategy: { type: Type.STRING }
        },
        required: ["summary", "topicBreakdown", "overallStrategy"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    return {
      summary: "Good effort! Continue practicing in your weak areas.",
      topicBreakdown: [],
      overallStrategy: "Consistency is key. Focus on standard CSS books and past papers."
    };
  }
}

export interface FullGSAPaper {
  mcqs: MCQ[];
  scienceQuestions: SubjectiveQuestion[];
  abilityQuestions: SubjectiveQuestion[];
  totalMarks: number;
}

export async function generateFullGSAPaper(): Promise<FullGSAPaper> {
  const prompt = `Generate a COMPLETE 100-MARK CSS MOCK PAPER for "General Science & Ability".
  
STRUCTURE:
1. PART-I (20 Marks): 20 ELITE MCQs (1 Mark each) covering the full syllabus (Physical, Bio, Env, Food, IT, Ability).
2. PART-II (40 Marks - General Science): 4 Subjective questions (10 marks each) from Science dimensions.
3. PART-III (40 Marks - Ability): 4 Comprehensive Ability questions (10 marks each) involving Quantitative/Analytical logic.

CONSTRAINTS:
- Use 1971-2026 CSS patterns.
- Focus on AI, Climate Risk, and Energy Security for 2026-27 prediction.
- Provide DETAILED logical explanations for all Ability solutions.
- Wrap content in Markdown.

Return a JSON object with keys: mcqs (array), scienceQuestions (array), abilityQuestions (array), totalMarks: 100.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are the Lead Paper Setter for the CSS Competitive Exam. You design balanced, challenging, and high-standard academic papers according to the 2026-2027 syllabus.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mcqs: { 
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                topic: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                pastPaperFrequency: { type: Type.NUMBER },
                priorityScore: { type: Type.NUMBER },
                subject: { type: Type.STRING }
              },
              required: ["question", "options", "answer", "explanation", "topic", "difficulty", "subject"]
            }
          },
          scienceQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                caseStudy: { type: Type.STRING },
                globalAnalysis: { type: Type.STRING },
                pakistanAnalysis: { type: Type.STRING },
                subject: { type: Type.STRING },
                difficulty: { type: Type.STRING }
              },
              required: ["question", "caseStudy", "globalAnalysis", "pakistanAnalysis", "subject"]
            }
          },
          abilityQuestions: {
             type: Type.ARRAY,
             items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                caseStudy: { type: Type.STRING }, // Used for solution steps
                globalAnalysis: { type: Type.STRING }, // Used for logical explanation
                subject: { type: Type.STRING },
                difficulty: { type: Type.STRING }
              },
              required: ["question", "caseStudy", "globalAnalysis", "subject"]
            }
          }
        },
        required: ["mcqs", "scienceQuestions", "abilityQuestions"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return { ...data, totalMarks: 100 };
  } catch (error) {
    throw new Error("Failed to generate mock paper. Try again.");
  }
}

export async function evaluateAnswer(params: {
  question: string;
  answer: string;
  subject: string;
}): Promise<AnswerEvaluation> {
  const { question, answer, subject } = params;

  const prompt = `You are a Senior CSS Examiner. Evaluate the following student answer for a 20-mark descriptive question.
Subject: ${subject}
Question: ${question}
Student Answer: ${answer}

EVALUATION CRITERIA:
1. Analytical Depth (Logic and arguments)
2. Structure (Introduction, Body, Conclusion)
3. Factual Accuracy (Stats, references)
4. English Expression

Return a JSON object with: score (out of 20), maxMarks (20), feedback (general summary), strengths (array), weaknesses (array), and suggestedOutline (array of headings).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a Senior CSS Examiner for the Federal Public Service Commission (FPSC). You evaluate answers based on the official CE-2016 Revised Syllabus, looking for analytical depth, structural coherence, factual accuracy (using latest 2026 stats), and linguistic precision.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          maxMarks: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedOutline: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "maxMarks", "feedback", "strengths", "weaknesses"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Evaluation failed:", error);
    throw error;
  }
}

export async function generateModelOutline(question: string): Promise<string[]> {
  const prompt = `Generate a topper-level model outline for the following CSS 20-mark question: "${question}".
Include Introduction, Historical Context, Main Arguments (5-7 points), Case Study Reference, and Conclusion.
Return a JSON array of headings.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    return ["Introduction", "Historical Perspective", "Current Dynamics", "Challenges", "Prospects", "Conclusion"];
  }
}
export async function getPredictiveRoadmap(history: any[]): Promise<string[]> {
  const prompt = `Based on the following user test history: ${JSON.stringify(history)}
and 2027 CSS/PPSC exam trends, generate a 3-step "Predictive Roadmap" for the user.
What should they focus on FIRST, SECOND, and THIRD to maximize their 2027 score?
Keep each step concise and highly strategic. Return a JSON array of 3 strings.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to parse roadmap:", error);
    return ["Master Pakistan Affairs basics.", "Focus on IR Theories.", "Practice English Précis weekly."];
  }
}
