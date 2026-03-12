"use client";

import { motion } from "framer-motion";
import styles from "./Templates.module.css";

const templates = [
  {
    id: "minimalist",
    name: "The Minimalist",
    badge: "Free",
    locked: false,
    previewClass: styles.template1,
    bars: [
      { w: "55%", bg: "#334155", h: 18 },
      { w: "35%", bg: "#94a3b8", h: 8 },
      { w: "100%", bg: "#e2e8f0", h: 1 },
      { w: "80%", bg: "#cbd5e1", h: 8 },
      { w: "90%", bg: "#cbd5e1", h: 8 },
      { w: "70%", bg: "#cbd5e1", h: 8 },
    ],
  },
  {
    id: "executive",
    name: "The Executive",
    badge: "Free",
    locked: false,
    previewClass: styles.template2,
    bars: [
      { w: "50%", bg: "#f8fafc", h: 20 },
      { w: "38%", bg: "#3b82f6", h: 3 },
      { w: "100%", bg: "#1e293b", h: 1 },
      { w: "75%", bg: "#94a3b8", h: 8 },
      { w: "85%", bg: "#64748b", h: 8 },
      { w: "65%", bg: "#64748b", h: 8 },
    ],
  },
  {
    id: "creative",
    name: "The Creative",
    badge: "Premium",
    locked: true,
    previewClass: styles.template3,
    bars: [
      { w: "50%", bg: "#e879f9", h: 22 },
      { w: "40%", bg: "#a78bfa", h: 8 },
      { w: "100%", bg: "#4c1d95", h: 1 },
      { w: "80%", bg: "#6d28d9", h: 8 },
      { w: "70%", bg: "#6d28d9", h: 8 },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Templates() {
  return (
    <section className={styles.section} id="templates">
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.tag}>Templates</div>
        <h2 className={styles.title}>
          Designed to Impress,
          <br />
          Built to Land Interviews
        </h2>
        <p className={styles.subtitle}>
          Each template is purpose-built for different industries and seniority levels.
          Pick your style, fill in your story.
        </p>
      </motion.div>

      <motion.div
        className={styles.grid}
        variants={{ show: { transition: { staggerChildren: 0.15 } } }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {templates.map((tpl) => (
          <motion.div key={tpl.id} className={styles.card} variants={fadeUp}>
            <div className={`${styles.cardPreview} ${tpl.previewClass}`}>
              {tpl.bars.map((bar, i) => (
                <div
                  key={i}
                  style={{
                    width: bar.w,
                    height: bar.h,
                    background: bar.bg,
                    borderRadius: 100,
                  }}
                />
              ))}
              {tpl.locked && (
                <div className={styles.lockOverlay}>
                  <span className={styles.lockIcon}>🔒</span>
                  <span className={styles.lockText}>Upgrade to Unlock</span>
                </div>
              )}
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.cardName}>{tpl.name}</span>
              <span className={tpl.locked ? styles.paidBadge : styles.freeBadge}>
                {tpl.badge}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
