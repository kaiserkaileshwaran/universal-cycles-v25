"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { 
  User, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/firebase/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => isFirebaseConfigured());

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const initAuth = async () => {
      try {
        const auth = getFirebaseAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        });
        return unsubscribe;
      } catch {
        // Firebase auth unavailable in effect
        queueMicrotask(() => setLoading(false));
        return () => {};
      }
    };

    const cleanupPromise = initAuth();
    return () => {
      cleanupPromise.then((unsubscribe) => unsubscribe?.());
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err?.code === "auth/popup-blocked" || err?.code === "auth/cancelled-popup-request") {
        // Fallback to redirect method if popup is blocked
        const auth = getFirebaseAuth();
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } else {
        throw error;
      }
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      // Error sending password reset email
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
    } catch (error) {
      // Error signing out
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
