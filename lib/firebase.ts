import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDKYKzT84Q1uXCYNly2vKjwV95aKdZiq_U",
  authDomain: "hitter-9e510.firebaseapp.com",
  projectId: "hitter-9e510",
  storageBucket: "hitter-9e510.firebasestorage.app",
  messagingSenderId: "830431433557",
  appId: "1:830431433557:web:0efb9d2d77638c35b3d5dc",
  measurementId: "G-FXFQD6SJTK",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Initialize Analytics only on client side
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null

export default app
