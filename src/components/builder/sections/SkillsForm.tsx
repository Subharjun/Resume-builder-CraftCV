"use client";
import { useState, KeyboardEvent } from "react";
import s from "./FormSections.module.css";

interface Props {
  skills: string[];
  jobTitle?: string;
  onChange: (skills: string[]) => void;
}

export default function SkillsForm({ skills, jobTitle, onChange }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill));
  };

  const generateSkillsAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "skills",
          context: jobTitle || "software engineer",
        }),
      });
      const data = await res.json();
      if (data.result) {
        const suggested = data.result
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s && !skills.includes(s));
        onChange([...skills, ...suggested]);
      }
    } catch {
      console.error("AI generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.section}>
      <p className={s.sectionSubheading}>
        Type a skill and press Enter or comma to add it.
      </p>

      <div className={s.skillsInputRow}>
        <input
          className={s.input}
          value={input}
          placeholder="e.g. React, Node.js, Python..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          id="skills-input"
        />
        <button className={s.addBtn} onClick={addSkill}
          style={{ width: "auto", padding: "10px 18px", borderStyle: "solid" }}>
          Add
        </button>
      </div>

      {skills.length > 0 && (
        <div className={s.skillsWrap}>
          {skills.map((skill) => (
            <span key={skill} className={s.skillTag}>
              {skill}
              <button className={s.skillRemove} onClick={() => removeSkill(skill)}>×</button>
            </span>
          ))}
        </div>
      )}

      <button className={s.aiBtn} onClick={generateSkillsAI} disabled={loading} id="ai-skills-btn">
        {loading ? (
          <><span className={s.aiSpinner} /> Suggesting...</>
        ) : (
          <> ✦ Suggest Skills with AI</>
        )}
      </button>
    </div>
  );
}
