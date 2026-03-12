import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.dot} />
          <span className={styles.brandName}>CraftCV</span>
        </div>
        <p className={styles.copy}>
          © {new Date().getFullYear()} CraftCV. Built with care for job seekers everywhere.
        </p>
        <div className={styles.links}>
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a key={l} className={styles.link}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
