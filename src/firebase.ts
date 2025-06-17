import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Your Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyC6DDwW7_2YxJNWsZE_dnJQVKqThXKuNJM",
  authDomain: "querybee-fd136.firebaseapp.com",
  projectId: "querybee-fd136",
  storageBucket: "querybee-fd136.firebasestorage.app",
  messagingSenderId: "933748632172",
  appId: "1:933748632172:web:03aa8fd5b8cb222bc60649"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// NEW Firestore instance
export const db = getFirestore(app);

// Helper to persist user feedback
export const saveFeedback = async (data: {
  userId: string | null;
  relatedQuery: string;
  isCorrect: boolean;
  reasons?: string[];
}) => {
  try {
    await addDoc(collection(db, 'feedback'), {
      ...data,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to save feedback:', error);
  }
}; 