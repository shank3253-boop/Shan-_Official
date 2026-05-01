import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { QuestionSubmission } from '../types';

export async function submitQuestion(submission: Omit<QuestionSubmission, 'id' | 'userId' | 'userEmail' | 'status' | 'createdAt'>) {
  const path = 'question_submissions';
  const user = auth.currentUser;
  if (!user) throw new Error("User must be signed in to submit questions.");

  try {
    const docRef = await addDoc(collection(db, path), {
      ...submission,
      userId: user.uid,
      userEmail: user.email,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function getUserSubmissions() {
  const path = 'question_submissions';
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(
      collection(db, path), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuestionSubmission));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}
