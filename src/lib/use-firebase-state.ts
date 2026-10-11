"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ref, onValue, set } from "firebase/database";
import { getFirebaseDatabase, isFirebaseConfigured } from "@/firebase/firebase";

// Helper to strip 'undefined' values which cause Firebase RTDB crashes
function sanitizeForFirebase(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map(sanitizeForFirebase);
  }
  const result: Record<string, unknown> = {};
  for (const key in value as Record<string, unknown>) {
    if ((value as Record<string, unknown>)[key] !== undefined) {
      result[key] = sanitizeForFirebase((value as Record<string, unknown>)[key]);
    }
  }
  return result;
}

export function useFirebaseState<T>(path: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [state, setState] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);
  const stateRef = useRef<T>(initialValue);

  // Keep ref in sync for the setter
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setReady(true);
      return;
    }

    const dbRef = ref(getFirebaseDatabase(), path);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setState(data);
      } else {
        // Initialize if empty
        set(dbRef, sanitizeForFirebase(initialValue)).catch(console.error);
      }
       
      setReady(true);
    });
    return () => unsubscribe();
  }, [path, initialValue]);

  const setFirebaseState = useCallback((action: React.SetStateAction<T>) => {
    const nextState = typeof action === "function" ? (action as (prevState: T) => T)(stateRef.current) : action;
    if (isFirebaseConfigured()) {
      set(ref(getFirebaseDatabase(), path), sanitizeForFirebase(nextState)).catch(console.error);
    }
    setState(nextState); // Optimistic update
  }, [path]);

  return [state, setFirebaseState, ready];
}
