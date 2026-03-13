"use client";
import { useState } from "react";
import { PersonalInfo } from "@/types/resume";
import s from "./FormSections.module.css";

interface Props {
  data: PersonalInfo;
  onChange: (info: Partial<PersonalInfo>) => void;
}

export default function PersonalInfoForm({ data, onChange }: Props) {
  const [loading, setLoading] = useState(false);

  const optimizeTitle = async () => {
     setLoading(true);
     // Simulate AI title optimization or use it for real if API supports it
     try {
       const res = await fetch("/api/ai-assist", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ type: "summary", context: `Optimize this job title: ${data.title || "Professional"}` }),
       });
       const result = await res.json();
       if (result.result) {
          // Extract title from result or just set it
          onChange({ title: result.result.slice(0, 40) });
       }
     } catch {
       console.error("AI fail");
     } finally {
       setLoading(false);
     }
  };

  return (
    <div className={s.section}>
       <div className={s.aiSection}>
        <div className={s.aiLogo}>✦</div>
        <h3 className={s.aiTitle}>Profile Strategist</h3>
        <p className={s.aiDesc}>Your identity and professional hook. Edit details on the right.</p>
        <button className={s.aiActionBtn} onClick={optimizeTitle} disabled={loading}>
          {loading ? "Optimizing..." : "✦ Optimize Title with AI"}
        </button>
      </div>

      <div className={s.field} style={{ marginTop: 12 }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Tip: Click any text on the resume preview to edit your name, contact info, or title directly!
        </p>
      </div>
    </div>
  );
}
