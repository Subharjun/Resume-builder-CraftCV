"use client";
import { useState } from "react";
import { Experience } from "@/types/resume";
import s from "./FormSections.module.css";

interface Props {
  items: Experience[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Experience>) => void;
  onDelete: (id: string) => void;
}

export default function ExperienceForm({ items, onAdd, onUpdate, onDelete }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const improveWithAI = async (exp: Experience) => {
    setLoadingId(exp.id);
    try {
      const context = `Role: ${exp.role} at ${exp.company}. Description: ${exp.description}`;
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "experience", context }),
      });
      const data = await res.json();
      if (data.result) onUpdate(exp.id, { description: data.result });
    } catch {
      console.error("AI generation failed");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={s.section}>
      <div className={s.aiSection} style={{ marginBottom: 20 }}>
        <div className={s.aiLogo}>✦</div>
        <h3 className={s.aiTitle}>Experience Optimizer</h3>
        <p className={s.aiDesc}>Click 'Improve' on any card to rewrite bullets with metric-driven impact.</p>
        <button className={s.addBtn} onClick={onAdd} id="add-experience-btn">
          + Add New Experience
        </button>
      </div>

      {items.map((exp, idx) => (
        <div key={exp.id} className={s.entryCard}>
          <div className={s.entryCardHeader}>
            <span className={s.entryCardTitle}>
              {exp.role || exp.company || `Position ${idx + 1}`}
            </span>
            <button className={s.deleteBtn} onClick={() => onDelete(exp.id)}>
              Delete
            </button>
          </div>

          <div className={s.row}>
            <input className={s.input} value={exp.company} placeholder="Company"
              onChange={(e) => onUpdate(exp.id, { company: e.target.value })} />
            <input className={s.input} value={exp.role} placeholder="Role"
              onChange={(e) => onUpdate(exp.id, { role: e.target.value })} />
          </div>

          <button
            className={s.aiActionBtn}
            disabled={loadingId === exp.id}
            onClick={() => improveWithAI(exp)}
          >
            {loadingId === exp.id ? "Optimizing..." : "✦ AI Improve Bullets"}
          </button>
        </div>
      ))}

      {items.length === 0 && (
         <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: 20 }}>
           No experience added yet. Add some to see AI magic.
         </p>
      )}
    </div>
  );
}
