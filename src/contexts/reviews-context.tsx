"use client";

import { createContext, useCallback, useContext, type ReactNode, useState, useEffect } from "react";
import type { Review } from "@/types";

type ReviewDraft = Omit<Review, "id" | "createdAt" | "helpful" | "status" | "isVerified"> & { status?: Review["status"]; isVerified?: boolean };
interface ReviewsValue {
  reviews: Review[];
  addReview: (draft: ReviewDraft) => void;
  markHelpful: (reviewId: string) => void;
  deleteReview: (reviewId: string) => void;
  updateReview: (reviewId: string, updates: Partial<Review>) => void;
}
const ReviewsContext = createContext<ReviewsValue | undefined>(undefined);

import { useFirebaseState } from "@/lib/use-firebase-state";

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useFirebaseState<Review[]>("reviews", []);

  const addReview = useCallback((draft: ReviewDraft) => {
    setReviews((current) => {
      const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const review: Review = { ...draft, id, createdAt: Date.now(), helpful: 0, status: draft.status || "pending", isVerified: draft.isVerified || false };
      return [review, ...current];
    });
  }, [setReviews]);

  const markHelpful = useCallback((reviewId: string) => {
    setReviews((current) => current.map((r) => r.id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r));
  }, [setReviews]);

  const deleteReview = useCallback((reviewId: string) => {
    setReviews((current) => current.filter((r) => r.id !== reviewId));
  }, [setReviews]);

  const updateReview = useCallback((reviewId: string, updates: Partial<Review>) => {
    setReviews((current) => current.map((r) => r.id === reviewId ? { ...r, ...updates } : r));
  }, [setReviews]);

  return <ReviewsContext.Provider value={{ reviews, addReview, markHelpful, deleteReview, updateReview }}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) throw new Error("useReviews must be used within ReviewsProvider");
  return context;
}
