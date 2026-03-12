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
      <p className={s.sectionSubheading}>
        Add your work history. Use bullet points for impact.
      </p>

      {items.map((exp, idx) => (
        <div key={exp.id} className={s.entryCard}>
          <div className={s.entryCardHeader}>
            <span className={s.entryCardTitle}>
              {exp.role || exp.company || `Experience ${idx + 1}`}
            </span>
            <button className={s.deleteBtn} onClick={() => onDelete(exp.id)}>
              Remove
            </button>
          </div>

          <div className={s.row}>
            <div className={s.field}>
              <label className={s.label}>Company</label>
              <input className={s.input} value={exp.company} placeholder="Acme Inc."
                onChange={(e) => onUpdate(exp.id, { company: e.target.value })} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Role / Title</label>
              <input className={s.input} value={exp.role} placeholder="Software Engineer"
                onChange={(e) => onUpdate(exp.id, { role: e.target.value })} />
            </div>
          </div>

          <div className={s.row}>
            <div className={s.field}>
              <label className={s.label}>Start Date</label>
              <input className={s.input} value={exp.startDate} placeholder="Jan 2022"
                onChange={(e) => onUpdate(exp.id, { startDate: e.target.value })} />
            </div>
            <div className={s.field}>
              <label className={s.label}>End Date</label>
              <input className={s.input} value={exp.endDate} placeholder="Dec 2023"
                disabled={exp.current}
                onChange={(e) => onUpdate(exp.id, { endDate: e.target.value })} />
            </div>
          </div>

          <label className={s.checkboxRow}>
            <input type="checkbox" checked={exp.current}
              onChange={(e) => onUpdate(exp.id, { current: e.target.checked })} />
            Currently working here
          </label>

          <div className={s.field}>
            <label className={s.label}>Description</label>
            <textarea className={s.textarea} value={exp.description}
              placeholder={"• Led a team of 5 engineers...\n• Reduced load time by 40%..."}
              onChange={(e) => onUpdate(exp.id, { description: e.target.value })} />
          </div>

          <button
            className={s.aiBtn}
            disabled={loadingId === exp.id}
            onClick={() => improveWithAI(exp)}
            id={`ai-experience-${exp.id}`}
          >
            {loadingId === exp.id ? (
              <><span className={s.aiSpinner} /> Improving...</>
            ) : (
              <> ✦ Improve with AI</>
            )}
          </button>
        </div>
      ))}

      <button className={s.addBtn} onClick={onAdd} id="add-experience-btn">
        + Add Experience
      </button>
    </div>
  );
}
