"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseAuth, getFirebaseDatabase, isFirebaseConfigured } from "@/firebase/firebase";

type AuthMode = "login" | "register";

export function ProfileAccess() {
  const [mode, setMode] = useState<AuthMode>("login");
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

  useEffect(() => {
    router.prefetch("/admin");
    router.prefetch("/account");
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (mode === "register" && email.trim().toLowerCase() === "admin@gmail.com") {
      setError("This administrator account is managed by the store owner. Please sign in instead.");
      return;
    }

    setLoading(true);

    try {
      if (!isFirebaseConfigured()) {
        throw new Error("Sign-in is unavailable because Firebase is not configured for this deployment.");
      }

      if (mode === "login") {
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
        if (email.trim().toLowerCase() === "admin@gmail.com") router.push("/admin");
        return;
      }

      const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      await set(ref(getFirebaseDatabase(), `users/${credential.user.uid}`), {
        firstName,
        lastName,
        email: credential.user.email,
        role: "customer",
        createdAt: new Date().toISOString(),
      });
    } catch (authError) {
      const code = (authError as { code?: string })?.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Email or password is incorrect. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many sign-in attempts. Please wait a few minutes and try again.");
      } else if (code === "auth/email-already-in-use") {
        setError("An account already exists for this email. Please sign in instead.");
      } else {
        setError(authError instanceof Error ? authError.message : "We could not complete your request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      if (!isFirebaseConfigured()) {
        throw new Error("Sign-in is unavailable because Firebase is not configured for this deployment.");
      }
      await signInWithGoogle();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const selectMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
  };

  return (
    <section className="w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-xl 2xl:max-w-xl">
      <div className="p-6 sm:p-8 2xl:p-12">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {mode === "login" ? "Your profile" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" ? "Log in or create an account to continue." : "Join Universal Cycles to manage your account."}
          </p>
        </header>

        <div role="tablist" aria-label="Profile access" className="mb-6 grid grid-cols-2 rounded-xl bg-muted p-1">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => selectMode("login")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${mode === "login" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Log in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            onClick={() => selectMode("register")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${mode === "register" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Create account
          </button>
        </div>

        {error && <div role="alert" className="mb-5 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-first-name" className="mb-1 block text-sm font-medium">First name</label>
                <input id="profile-first-name" type="text" autoComplete="given-name" required value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="First name" className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label htmlFor="profile-last-name" className="mb-1 block text-sm font-medium">Last name</label>
                <input id="profile-last-name" type="text" autoComplete="family-name" required value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Last name" className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="profile-email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="profile-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <div>
            <label htmlFor="profile-password" className="mb-1 block text-sm font-medium">Password</label>
            <div className="relative">
              <input id="profile-password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 6 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label htmlFor="profile-confirm-password" className="mb-1 block text-sm font-medium">Confirm password</label>
              <div className="relative">
                <input id="profile-confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          {mode === "login" && <a href="/reset-password" className="block text-right text-xs text-primary hover:underline">Forgot password?</a>}

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Or continue with</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background py-3 font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50">
          <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-xs font-bold text-primary">G</span>
          Continue with Google
        </button>
      </div>
    </section>
  );
}