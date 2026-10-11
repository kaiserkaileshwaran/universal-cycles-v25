"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/firebase/firebase";

import { Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/admin");
    router.prefetch("/account");
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (!isFirebaseConfigured()) {
        throw new Error("Sign-in is unavailable because Firebase is not configured for this deployment.");
      }
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      if (email.toLowerCase() === "admin@gmail.com") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } catch (loginError) {
      const code = (loginError as { code?: string })?.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Email or password is incorrect. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many sign-in attempts. Please wait a few minutes and try again.");
      } else {
        setError(loginError instanceof Error ? loginError.message : "We could not sign you in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      if (!isFirebaseConfigured()) {
        throw new Error("Sign-in is unavailable because Firebase is not configured for this deployment.");
      }
      await signInWithGoogle();
      const currentUser = getFirebaseAuth().currentUser;
      if (currentUser?.email?.toLowerCase() === "admin@gmail.com") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center bg-muted/50 p-4 pt-24 pb-24">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden 2xl:max-w-xl">
        <div className="p-8 2xl:p-12">
          <div className="text-center mb-8">
            <h1 className="mb-2 whitespace-nowrap font-bold text-lg text-primary sm:text-xl xl:text-2xl">Universal Cycles</h1>
            <p className="text-muted-foreground text-sm">Welcome back. Log in to your account.</p>
          </div>
          
          {error && (
            <div role="alert" className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="login-password" className="block text-sm font-medium text-foreground">Password</label>
                <Link href="/reset-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="mt-6 w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </div>
        
        <div className="bg-muted p-6 text-center border-t border-border 2xl:p-8">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
}
