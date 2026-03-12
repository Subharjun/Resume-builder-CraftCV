"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

const navLinks = ["Features", "Templates", "Pricing", "About"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <li key={link} className={styles.navLink}>
            {link}
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className={styles.navActions}>
        <button className={styles.btnOutline} id="nav-login-btn">
          Sign In
        </button>
        <button
          className={styles.btnPrimary}
          id="nav-cta-btn"
          onClick={() => router.push("/builder")}
        >
          Build Resume ✦
        </button>
      </div>
    </nav>
  );
}
