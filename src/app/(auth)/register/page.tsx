"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth, getFirebaseDatabase } from "@/firebase/firebase";
import { ref, set } from "firebase/database";

import { Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (email.trim().toLowerCase() === "admin@gmail.com") {
      setError("This administrator account is managed by the store owner. Please sign in instead.");
      return;
    }

    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      const user = userCredential.user;
      
      // Store user profile in Realtime Database
      await set(ref(getFirebaseDatabase(), 'users/' + user.uid), {
        firstName,
        lastName,
        email: user.email,
        role: "customer",
        createdAt: new Date().toISOString()
      });

      router.push("/account");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create an account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // Google sign in creates the auth record automatically, but we might want to ensure a DB profile exists.
      // For brevity, skipping explicit DB creation here, typically handled by cloud functions or auth state observer.
      router.push("/account");
    } catch {
      setError("Failed to sign in with Google.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center bg-muted/50 p-4 pt-24 pb-24">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden 2xl:max-w-xl">
        <div className="p-8 2xl:p-12">
          <div className="text-center mb-8">
            <h1 className="mb-2 whitespace-nowrap font-bold text-lg text-primary sm:text-xl xl:text-2xl">Universal Cycles</h1>
            <p className="text-muted-foreground text-sm">Create an account for premium access.</p>
          </div>
          
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow pr-12"
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow pr-12"
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Or register with</span>
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
            Sign up with Google
          </button>
        </div>
        
        <div className="bg-muted p-6 text-center border-t border-border 2xl:p-8">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
}
