"use client";
import { useState, KeyboardEvent } from "react";
import s from "./FormSections.module.css";

interface Props {
  skills: string[];
  jobTitle?: string;
  onChange: (skills: string[]) => void;
}

export default function SkillsForm({ skills: propSkills, jobTitle, onChange }: Props) {
  const skills = Array.isArray(propSkills) 
    ? propSkills 
    : typeof propSkills === 'string' 
      ? (propSkills as string).split(',').map(s => s.trim()).filter(Boolean)
      : [];

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
      <div className={s.aiSection} style={{ marginBottom: 20 }}>
        <div className={s.aiLogo}>✦</div>
        <h3 className={s.aiTitle}>Skill Strategist</h3>
        <p className={s.aiDesc}>Discover trending skills for your role using Groq AI analytics.</p>
        <button className={s.aiActionBtn} onClick={generateSkillsAI} disabled={loading} id="ai-skills-btn">
          {loading ? "Analyzing..." : "✦ Suggest Skills for " + (jobTitle || "Your Role")}
        </button>
      </div>

      <div className={s.skillsInputRow}>
        <input
          className={s.input}
          value={input}
          placeholder="Type skill & press Enter..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          id="skills-input"
        />
      </div>

      <div className={s.skillsWrap}>
        {skills.map((skill) => (
          <span key={skill} className={s.skillTag}>
            {skill}
            <button className={s.skillRemove} onClick={() => removeSkill(skill)}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}
