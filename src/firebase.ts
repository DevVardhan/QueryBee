import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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