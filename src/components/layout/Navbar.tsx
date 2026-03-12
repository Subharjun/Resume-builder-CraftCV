"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

const navLinks = ["Features", "Templates", "Pricing", "About"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    });
  }, []);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      {/* Logo */}
      <div className={styles.logo} onClick={() => router.push("/")}>
        <span className={styles.logoDot} />
        <span className="gradient-text">CraftCV</span>
      </div>

      {/* Nav Links */}
      <ul className={styles.navLinks}>
        {navLinks.map((link) => (
          <li key={link} className={styles.navLink}>{link}</li>
        ))}
      </ul>

      {/* Actions */}
      <div className={styles.navActions}>
        {user ? (
          <>
            <button className={styles.btnOutline} id="nav-dashboard-btn"
              onClick={() => router.push("/dashboard")}>
              Dashboard
            </button>
            <div title={user.email}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #8b5cf6, #0ea5e9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.8rem", fontWeight: 700, color: "#fff", cursor: "pointer",
              }}
              onClick={() => router.push("/dashboard")}>
              {initials}
            </div>
          </>
        ) : (
          <>
            <button className={styles.btnOutline} id="nav-login-btn"
              onClick={() => router.push("/auth/login")}>
              Sign In
            </button>
            <button className={styles.btnPrimary} id="nav-cta-btn"
              onClick={() => router.push("/auth/signup")}>
              Get Started ✦
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
