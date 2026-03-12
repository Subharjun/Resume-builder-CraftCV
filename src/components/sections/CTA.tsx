"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import styles from "./CTA.module.css";

export default function CTA() {
  const router = useRouter();
  return (
    <section className={styles.section}>
      <div className={styles.orb} />
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className={styles.badge}>✦ Ready to Start?</div>
        <h2 className={styles.title}>
          Your Dream Job Starts
          <br />
          with a Great Resume
        </h2>
        <p className={styles.subtitle}>
          Join thousands of job seekers who have already built their resume with CraftCV.
          It is free, fast, and beautiful.
        </p>
        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            id="cta-build-btn"
            onClick={() => router.push("/builder")}
          >
            Build My Resume Now ✦
          </button>
        </div>
      </motion.div>
    </section>
  );
}
