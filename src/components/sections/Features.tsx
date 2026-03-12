"use client";

import { motion } from "framer-motion";
import styles from "./Features.module.css";

const features = [
  {
    icon: "✦",
    title: "AI-Powered Writing",
    desc: "Use Groq AI to instantly generate compelling summaries, improve work experience descriptions, and get skill suggestions tailored to your role.",
  },
  {
    icon: "◈",
    title: "Beautiful Templates",
    desc: "Choose from multiple professionally designed templates — free and premium. Every template is crafted by designers, not algorithms.",
  },
  {
    icon: "⬡",
    title: "Real-Time Preview",
    desc: "See every change reflected instantly. Our live preview engine mirrors your edits so you always know exactly what your resume looks like.",
  },
  {
    icon: "⤓",
    title: "One-Click PDF Export",
    desc: "Download your polished resume as a pixel-perfect PDF anytime — ready to submit to any job application, anywhere in the world.",
  },
  {
    icon: "⬙",
    title: "Multi-Section Editor",
    desc: "Manage all your resume sections — experience, education, skills, projects — with a clean, intuitive editor that keeps you focused.",
  },
  {
    icon: "◎",
    title: "Save & Edit Anytime",
    desc: "Your resume is always saved. Come back, update, and export a fresh version whenever you land a new opportunity or skill.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Features() {
  return (
    <section className={styles.features} id="features">
      <motion.div
        className={styles.sectionHeader}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.tag}>Why CraftCV</div>
        <h2 className={styles.sectionTitle}>
          Everything You Need to
          <br />
          Build a Winning Resume
        </h2>
        <p className={styles.sectionSubtitle}>
          We have distilled the resume-building process into a sleek, focused experience.
          No bloat, just the tools that matter.
        </p>
      </motion.div>

      <motion.div
        className={styles.grid}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {features.map((feature) => (
          <motion.div key={feature.title} className={styles.card} variants={fadeUp}>
            <div className={styles.cardIcon}>{feature.icon}</div>
            <h3 className={styles.cardTitle}>{feature.title}</h3>
            <p className={styles.cardDesc}>{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
