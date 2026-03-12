export default function BuilderPage() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "16px",
      fontFamily: "var(--font-outfit), sans-serif",
    }}>
      <div style={{ fontSize: "2.5rem" }}>⚙️</div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff" }}>
        Builder Coming Soon
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
        We are building this next. Stay tuned.
      </p>
    </main>
  );
}
