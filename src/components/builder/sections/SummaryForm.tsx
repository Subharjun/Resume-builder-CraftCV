"use client";
import { useState } from "react";
import s from "./FormSections.module.css";

interface Props {
  value: string;
  personalTitle?: string;
  onChange: (val: string) => void;
}

export default function SummaryForm({ value, personalTitle, onChange }: Props) {
  const [loading, setLoading] = useState(false);

  const generateAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "summary",
          context: personalTitle || "a software engineer with experience in web development",
        }),
      });
      const data = await res.json();
      if (data.result) onChange(data.result);
    } catch {
      console.error("AI generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.section}>
      <p className={s.sectionSubheading}>
        A 2–3 sentence pitch that opens your resume. Be specific and impactful.
      </p>

      <div className={s.field}>
        <label className={s.label}>Professional Summary</label>
        <textarea
          className={s.textarea}
          value={value}
          rows={6}
          placeholder="Write a compelling summary or let AI generate one for you..."
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      <button className={s.aiBtn} onClick={generateAI} disabled={loading} id="ai-summary-btn">
        {loading ? (
          <><span className={s.aiSpinner} /> Generating...</>
        ) : (
          <> ✦ Generate with AI</>
        )}
      </button>
    </div>
  );
}
