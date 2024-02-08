import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../utils/init-firebase'; // Make sure you import db from where you initialize Firestore
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  confirmPasswordReset,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext({
  currentUser: null,
  userRole: null, // Include userRole in the context
  signInWithGoogle: () => Promise,
  login: () => Promise,
  register: () => Promise,
  logout: () => Promise,
  forgotPassword: () => Promise,
  resetPassword: () => Promise,
});

export const useAuth = () => useContext(AuthContext)

export default function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // State to hold user role

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user ? user : null);
      if (user) {
        // Fetch user role from Firestore when user logs in
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role); // Set user role
        } else {
          setUserRole(null); // Handle case where user document might not exist
        }
      } else {
        setUserRole(null); // Clear user role when logged out
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log('The user is', currentUser)
  }, [currentUser])

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function register(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  function forgotPassword(email) {
    return sendPasswordResetEmail(auth, email, {
      url: `http://localhost:3000/login`,
    })
  }

  function resetPassword(oobCode, newPassword) {
    return confirmPasswordReset(auth, oobCode, newPassword)
  }

  function logout() {
    return signOut(auth)
  }

  function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  const value = {
    currentUser,
    userRole, // Provide userRole in context
    signInWithGoogle,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
