import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { getHotTopics, generateSubjectiveQuestions } from '../lib/gemini';
import { HotTopic, SubjectiveQuestion } from '../types';

/**
 * Self-Updating Intelligence Loop
 */
export async function generateNewSubjectiveQuestion(subject: string): Promise<SubjectiveQuestion> {
  const path = 'intelligence_subjective_vault';
  try {
    const questions = await generateSubjectiveQuestions({ subject, count: 1 });
    const q = questions[0];
    
    await setDoc(doc(db, path, q.id), {
      ...q,
      lastUpdated: new Date().toISOString(),
      isManualRequest: true
    });
    
    return q;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function syncExamIntelligence() {
  console.log("Checking Intelligence Staleness...");
  const vaultPath = 'intelligence_subjective_vault';
  
  try {
    // Check if we already have recent data
    const q = query(collection(db, vaultPath), orderBy('lastUpdated', 'desc'), limit(1));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      const lastDoc = snap.docs[0].data();
      const lastUpdate = new Date(lastDoc.lastUpdated).getTime();
      const now = Date.now();
      const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate < 12) {
        console.log("Intelligence is fresh (updated < 12h ago). Skipping full sync.");
        return { isFresh: true };
      }
    }

    console.log("Intelligence is stale. Triggering 2027 Intelligence Sync...");
    
    // 1. Fetch AI-generated Hot Topics
    const trendingTopics = await getHotTopics();
    
    // 2. Refresh Hot Topics
    for (const topic of trendingTopics) {
      await setDoc(doc(db, 'intelligence_hot_topics', topic.id), {
        ...topic,
        lastUpdated: new Date().toISOString()
      });
    }

    // 3. Generate 5 High-Yield 20-Mark Questions across ALL CSS Categories
    const subjects = [
      'Pakistan Affairs', 'Current Affairs', 'Political Science', 'IR', 
      'Gender Studies', 'Criminology', 'Islamic Studies', 'Public Administration',
      'English Essay', 'Sociology', 'Law', 'Punjabi'
    ];
    const selectedSubjects = subjects.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    for (const sub of selectedSubjects) {
      const questions = await generateSubjectiveQuestions({ subject: sub, count: 1 });
      for (const q of questions) {
        await setDoc(doc(db, 'intelligence_subjective_vault', q.id), {
          ...q,
          isHighProbability: true,
          lastUpdated: new Date().toISOString()
        });
      }
    }

    console.log("Intelligence Sync Complete. High-Yield Vault Updated across all CSS subjects.");
    return { trendingTopics };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'intelligence_sync');
    throw error;
  }
}

export async function getLiveHotTopics(): Promise<HotTopic[]> {
  const path = 'intelligence_hot_topics';
  try {
    const q = query(collection(db, path));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as HotTopic);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function getSubjectiveVault(): Promise<SubjectiveQuestion[]> {
  const path = 'intelligence_subjective_vault';
  try {
    const q = query(collection(db, path), limit(20));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as SubjectiveQuestion);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}
