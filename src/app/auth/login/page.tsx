"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "../Auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.orb} ${styles.orbPurple}`} />
      <div className={`${styles.orb} ${styles.orbBlue}`} />

      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoDot} />
          <span className={styles.logoText}>CraftCV</span>
        </div>

        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.subheading}>
          Sign in to continue building your perfect resume.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              id="login-email"
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              id="login-password"
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit"
            className={styles.submitBtn}
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          or
          <span className={styles.dividerLine} />
        </div>

        <button
          id="google-login-btn"
          className={styles.googleBtn}
          onClick={handleGoogleLogin}
          disabled={googleLoading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
          </svg>
          {googleLoading ? "Redirecting..." : "Continue with Google"}
        </button>

        <p className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className={styles.footerLink}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
