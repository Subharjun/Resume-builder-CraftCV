import { Suspense } from "react";
import BuilderPage from "./BuilderPage";

export default function BuilderRoute() {
  return (
    <Suspense fallback={
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
      }}>
        <div style={{
          width: 48, height: 48,
          border: "3px solid rgba(139,92,246,0.2)",
          borderTopColor: "#8b5cf6",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    }>
      <BuilderPage />
    </Suspense>
  );
}
