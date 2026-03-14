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
          onChange({ title: result.result.slice(0, 40) });
       }
     } catch {
       console.error("AI fail");
     } finally {
       setLoading(false);
     }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        onChange({ photoUrl: event.target.result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={s.section}>
       <div className={s.aiSection}>
        <div className={s.aiLogo}>✦</div>
        <h3 className={s.aiTitle}>Profile Strategist</h3>
        <p className={s.aiDesc}>Your identity and professional hook. Edit details below or directly on the resume.</p>
        <button className={s.aiActionBtn} onClick={optimizeTitle} disabled={loading}>
          {loading ? "Optimizing..." : "✦ Optimize Title with AI"}
        </button>
      </div>

      <div className={s.field} style={{ marginTop: 24 }}>
        <label className={s.label}>Photo (URL or Upload)</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            className={s.input} 
            placeholder="https://example.com/photo.jpg" 
            value={data.photoUrl || ""} 
            onChange={(e) => onChange({ photoUrl: e.target.value })} 
          />
          <label style={{ 
            cursor: 'pointer', 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)', 
            padding: '0 12px', 
            borderRadius: '6px', 
            fontSize: '13px', 
            display: 'flex', 
            alignItems: 'center',
            color: 'var(--text-secondary)'
          }}>
            Upload
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </label>
        </div>
        <p style={{fontSize: 11, color: "var(--text-muted)", marginTop: 4}}>Used in Creative & Executive templates (if applicable).</p>
      </div>

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Full Name</label>
          <input className={s.input} placeholder="John Doe" value={data.fullName || ""} onChange={(e) => onChange({ fullName: e.target.value })} />
        </div>
        <div className={s.field}>
          <label className={s.label}>Title</label>
          <input className={s.input} placeholder="e.g. UX Designer" value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
        </div>
      </div>

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Email</label>
          <input className={s.input} placeholder="john@example.com" value={data.email || ""} onChange={(e) => onChange({ email: e.target.value })} />
        </div>
        <div className={s.field}>
          <label className={s.label}>Phone</label>
          <input className={s.input} placeholder="(555) 123-4567" value={data.phone || ""} onChange={(e) => onChange({ phone: e.target.value })} />
        </div>
      </div>

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Location</label>
          <input className={s.input} placeholder="New York, NY" value={data.location || ""} onChange={(e) => onChange({ location: e.target.value })} />
        </div>
        <div className={s.field}>
          <label className={s.label}>Website</label>
          <input className={s.input} placeholder="johndoe.com" value={data.website || ""} onChange={(e) => onChange({ website: e.target.value })} />
        </div>
      </div>

      <div className={s.field}>
        <label className={s.label}>LinkedIn</label>
        <input 
          className={s.input} 
          placeholder="linkedin.com/in/johndoe" 
          value={data.linkedin || ""} 
          onChange={(e) => onChange({ linkedin: e.target.value })} 
        />
      </div>

    </div>
  );
}
