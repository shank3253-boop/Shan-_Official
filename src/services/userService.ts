import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, TestResult } from '../types';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function createUserProfile(uid: string, email: string, displayName: string, photoURL: string): Promise<UserProfile> {
  const path = `users/${uid}`;
  const newUser: UserProfile = {
    uid,
    email,
    displayName,
    photoURL,
    createdAt: new Date().toISOString(),
    stats: {
      totalTests: 0,
      averageAccuracy: 0,
      streak: 0
    }
  };
  
  try {
    await setDoc(doc(db, 'users', uid), newUser);
    return newUser;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function saveTestResult(userId: string, result: Omit<TestResult, 'id' | 'timestamp'>) {
  const path = `users/${userId}/results`;
  const resultRef = doc(db, path, `${Date.now()}`);
  const finalResult: TestResult = {
    ...result,
    id: resultRef.id,
    timestamp: new Date().toISOString(),
  };
  
  try {
    await setDoc(resultRef, finalResult);
    
    // Update user overall stats
    const profile = await getUserProfile(userId);
    if (profile) {
      const newTotalTests = profile.stats.totalTests + 1;
      const newAverageAccuracy = ((profile.stats.averageAccuracy * profile.stats.totalTests) + result.accuracy) / newTotalTests;
      
      await updateDoc(doc(db, 'users', userId), {
        'stats.totalTests': newTotalTests,
        'stats.averageAccuracy': newAverageAccuracy
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
