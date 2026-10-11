"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to send password reset email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center bg-muted/50 p-4 pt-24 pb-24">
      <Link href="/" className="absolute top-8 left-8 p-2 bg-white/50 backdrop-blur-md rounded-full hover:bg-white transition-colors">
        <ArrowLeft size={20} />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md 2xl:max-w-xl"
      >
        <div className="bg-white p-8 md:p-10 2xl:p-12 rounded-3xl shadow-xl border border-border">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Reset Password</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email address and we will send you a link to reset your password.
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 p-4 bg-destructive/10 text-destructive text-sm rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}

          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-bold mb-2">Email Sent</h2>
              <p className="text-muted-foreground mb-6">
                Check your inbox for a link to reset your password. If it does not appear within a few minutes, check your spam folder.
              </p>
              <Link href="/login" className="block w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-md hover:bg-primary/90 transition-colors">
                Return to Login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-[#F5F7F5] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-md hover:bg-primary/90 transition-colors disabled:opacity-70 flex justify-center items-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}
        </div>

        {!success && (
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        )}
      </motion.div>
    </div>
    <Footer />
    </div>
  );
}
