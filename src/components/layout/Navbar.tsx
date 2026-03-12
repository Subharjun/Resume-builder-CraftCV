"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

const navLinks = ["Features", "Templates", "Pricing", "About"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

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
          <div className={styles.userMenu} ref={dropdownRef}>
            <button
              className={styles.btnOutline}
              id="nav-dashboard-btn"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </button>
            {/* Avatar with dropdown */}
            <button
              className={styles.avatarBtn}
              onClick={() => setDropdownOpen((p) => !p)}
              id="nav-avatar-btn"
              title={user.email}
            >
              {initials}
            </button>

            {dropdownOpen && (
              <div className={styles.dropdown} id="user-dropdown">
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownName}>{displayName}</div>
                  <div className={styles.dropdownEmail}>{user.email}</div>
                </div>
                <div className={styles.dropdownDivider} />
                <button
                  className={styles.dropdownItem}
                  onClick={() => { setDropdownOpen(false); router.push("/dashboard"); }}
                >
                  📊 Dashboard
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={() => { setDropdownOpen(false); router.push("/builder"); }}
                >
                  ✦ New Resume
                </button>
                <div className={styles.dropdownDivider} />
                <button
                  className={`${styles.dropdownItem} ${styles.dropdownSignOut}`}
                  onClick={handleSignOut}
                  id="nav-sign-out-btn"
                >
                  ↪ Sign Out
                </button>
              </div>
            )}
          </div>
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
