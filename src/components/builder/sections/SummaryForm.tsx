"use client";
import { useState } from "react";
import s from "./FormSections.module.css";

interface Props {
  value: string;
  personalTitle?: string;
  onChange: (val: string) => void;
}

export default function SummaryForm({ value, personalTitle, onChange }: Props) {
  const [loading, setLoading] = useState<"standard" | "punchy" | "executive" | null>(null);

  const generateAI = async (tone: "standard" | "punchy" | "executive" = "standard") => {
    setLoading(tone);
    try {
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "summary",
          context: `Tone: ${tone}. Job Title: ${personalTitle || "Professional"}`,
        }),
      });
      const data = await res.json();
      if (data.result) onChange(data.result);
    } catch {
      console.error("AI generation failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={s.section}>
      <div className={s.aiSection}>
        <div className={s.aiLogo}>✦</div>
        <h3 className={s.aiTitle}>AI Summary Architect</h3>
        <p className={s.aiDesc}>Choose a tone and let Groq AI craft your professional story.</p>
        
        <div className={s.aiButtonGroup}>
          <button className={s.aiActionBtn} onClick={() => generateAI("standard")} disabled={!!loading}>
             {loading === "standard" ? "..." : "Standard"}
          </button>
          <button className={s.aiActionBtn} onClick={() => generateAI("punchy")} disabled={!!loading}>
             {loading === "punchy" ? "..." : "Punchy"}
          </button>
          <button className={s.aiActionBtn} onClick={() => generateAI("executive")} disabled={!!loading}>
             {loading === "executive" ? "..." : "Executive"}
          </button>
        </div>
      </div>

      <div className={s.field} style={{ marginTop: 24 }}>
        <label className={s.label}>Manual Tweaks (Secondary)</label>
        <textarea
          className={s.textareaSmall}
          value={value}
          rows={3}
          placeholder="Small adjustments here or edit directly on the resume..."
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
