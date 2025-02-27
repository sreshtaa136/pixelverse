import { useState, useEffect } from "react";
// Firebase function to listen for authentication state changes
import { onAuthStateChanged } from "firebase/auth";
// Firestore functions to retrieve user data
import { doc, getDoc } from "firebase/firestore";
// Import Firebase authentication and Firestore instances from our config file
import { auth, db } from "./firebaseConfig";

export default function useAuth() {
  // State to store the authenticated user object
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase Authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If a user is signed in, try to fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          // If user data exists in Firestore, merge it with Firebase Auth user data
          setUser({ ...firebaseUser, username: userDoc.data().username });
        } else {
          // If no Firestore data exists, use Firebase Auth user data only
          setUser(firebaseUser);
        }
      } else {
        // If no user is signed in, set user state to null
        setUser(null);
      }
      setLoading(false); // Mark loading as complete
    });

    // Cleanup function to unsubscribe from Firebase listener when component unmounts
    return unsubscribe;
  }, []);

  // Return the authenticated user object (or null if no user is signed in)
  return {user, loading};
}
