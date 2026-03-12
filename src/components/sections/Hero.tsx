"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import styles from "./Hero.module.css";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: "easeOut" as const },
});

const stats = [
  { value: "50K+", label: "Resumes Created" },
  { value: "3", label: "Premium Templates" },
  { value: "AI", label: "Powered Writing" },
  { value: "Free", label: "To Get Started" },
];

export default function Hero() {
  const router = useRouter();

  return (
    <section className={styles.hero}>
      {/* Ambient orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      <div className={styles.content}>
        {/* Badge */}
        <motion.div className={styles.badge} {...fadeUp(0.1)}>
          <span className={styles.badgeDot} />
          AI-Powered Resume Builder
        </motion.div>

        {/* Title */}
        <motion.h1 className={styles.heroTitle} {...fadeUp(0.2)}>
          Build a Resume That
          <br />
          <span>Gets You Hired</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p className={styles.heroSubtitle} {...fadeUp(0.3)}>
          CraftCV combines powerful AI with beautiful templates to help you create a
          professional resume in minutes — not hours. Stand out from the crowd.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div className={styles.heroActions} {...fadeUp(0.4)}>
          <button
            className={styles.btnHeroPrimary}
            id="hero-build-btn"
            onClick={() => router.push("/builder")}
          >
            Start Building — It&apos;s Free ✦
          </button>
          <button className={styles.btnHeroSecondary} id="hero-templates-btn">
            View Templates →
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div className={styles.heroBadges} {...fadeUp(0.5)}>
          {stats.map((stat, i) => (
            <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 32 }}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
              {i < stats.length - 1 && <div className={styles.statDivider} />}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Floating Resume Preview */}
      <motion.div
        className={styles.previewWrapper}
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
      >
        <div className={styles.previewCard}>
          {/* macOS-style dots */}
          <div className={styles.previewHeader}>
            <div className={styles.dot} style={{ background: "#f87171" }} />
            <div className={styles.dot} style={{ background: "#fbbf24" }} />
            <div className={styles.dot} style={{ background: "#4ade80" }} />
          </div>

          {/* Mock Resume Layout */}
          <div className={styles.resumePreview}>
            <div className={styles.previewSidebar}>
              <div className={styles.previewAvatar} />
              <div className={`${styles.previewBlock} ${styles.previewBlockFull}`} />
              <div className={`${styles.previewBlock} ${styles.previewBlockMed}`} />
              <div className={`${styles.previewBlock} ${styles.previewBlockShort}`} />
              <div style={{ marginTop: 8 }}>
                {["React", "TypeScript", "Node.js", "Python"].map((skill) => (
                  <div key={skill} style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    marginRight: 6,
                    marginBottom: 6,
                    borderRadius: "100px",
                    fontSize: "0.7rem",
                    background: "rgba(139,92,246,0.2)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    color: "#c4b5fd"
                  }}>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.previewMain}>
              <div className={styles.previewTitleBlock} />
              <div className={styles.previewSubBlock} style={{ width: "50%" }} />
              <div className={styles.glowLine} />
              <div className={styles.sectionLabel} />
              <div className={styles.previewSubBlock} style={{ width: "100%" }} />
              <div className={styles.previewSubBlock} style={{ width: "90%" }} />
              <div className={styles.previewSubBlock} style={{ width: "95%" }} />
              <div className={styles.sectionLabel} style={{ marginTop: 16 }} />
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, height: 60, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }} />
                <div style={{ flex: 1, height: 60, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
