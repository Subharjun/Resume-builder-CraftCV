"use client";
import { useState } from "react";
import { PersonalInfo } from "@/types/resume";
import s from "./FormSections.module.css";

interface Props {
  data: PersonalInfo;
  onChange: (info: Partial<PersonalInfo>) => void;
}

export default function PersonalInfoForm({ data, onChange }: Props) {
  return (
    <div className={s.section}>
      <p className={s.sectionSubheading}>This appears at the top of your resume.</p>

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Full Name</label>
          <input className={s.input} value={data.fullName} placeholder="Alex Johnson"
            onChange={(e) => onChange({ fullName: e.target.value })} />
        </div>
        <div className={s.field}>
          <label className={s.label}>Professional Title</label>
          <input className={s.input} value={data.title} placeholder="Software Engineer"
            onChange={(e) => onChange({ title: e.target.value })} />
        </div>
      </div>

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Email</label>
          <input className={s.input} type="email" value={data.email} placeholder="you@example.com"
            onChange={(e) => onChange({ email: e.target.value })} />
        </div>
        <div className={s.field}>
          <label className={s.label}>Phone</label>
          <input className={s.input} value={data.phone} placeholder="+1 (555) 000-0000"
            onChange={(e) => onChange({ phone: e.target.value })} />
        </div>
      </div>

      <div className={s.field}>
        <label className={s.label}>Location</label>
        <input className={s.input} value={data.location} placeholder="San Francisco, CA"
          onChange={(e) => onChange({ location: e.target.value })} />
      </div>

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Website</label>
          <input className={s.input} value={data.website} placeholder="yoursite.dev"
            onChange={(e) => onChange({ website: e.target.value })} />
        </div>
        <div className={s.field}>
          <label className={s.label}>LinkedIn</label>
          <input className={s.input} value={data.linkedin} placeholder="linkedin.com/in/you"
            onChange={(e) => onChange({ linkedin: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
