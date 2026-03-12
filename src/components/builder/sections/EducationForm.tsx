"use client";
import { Education } from "@/types/resume";
import s from "./FormSections.module.css";

interface Props {
  items: Education[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Education>) => void;
  onDelete: (id: string) => void;
}

export default function EducationForm({ items, onAdd, onUpdate, onDelete }: Props) {
  return (
    <div className={s.section}>
      <p className={s.sectionSubheading}>Add your educational background.</p>

      {items.map((edu, idx) => (
        <div key={edu.id} className={s.entryCard}>
          <div className={s.entryCardHeader}>
            <span className={s.entryCardTitle}>
              {edu.institution || `Education ${idx + 1}`}
            </span>
            <button className={s.deleteBtn} onClick={() => onDelete(edu.id)}>
              Remove
            </button>
          </div>

          <div className={s.field}>
            <label className={s.label}>Institution</label>
            <input className={s.input} value={edu.institution}
              placeholder="University of California, Berkeley"
              onChange={(e) => onUpdate(edu.id, { institution: e.target.value })} />
          </div>

          <div className={s.row}>
            <div className={s.field}>
              <label className={s.label}>Degree</label>
              <input className={s.input} value={edu.degree} placeholder="B.Tech / B.Sc / MBA"
                onChange={(e) => onUpdate(edu.id, { degree: e.target.value })} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Field of Study</label>
              <input className={s.input} value={edu.field} placeholder="Computer Science"
                onChange={(e) => onUpdate(edu.id, { field: e.target.value })} />
            </div>
          </div>

          <div className={s.row}>
            <div className={s.field}>
              <label className={s.label}>Start Date</label>
              <input className={s.input} value={edu.startDate} placeholder="Aug 2018"
                onChange={(e) => onUpdate(edu.id, { startDate: e.target.value })} />
            </div>
            <div className={s.field}>
              <label className={s.label}>End Date</label>
              <input className={s.input} value={edu.endDate} placeholder="May 2022"
                onChange={(e) => onUpdate(edu.id, { endDate: e.target.value })} />
            </div>
          </div>

          <div className={s.field}>
            <label className={s.label}>GPA (Optional)</label>
            <input className={s.input} value={edu.gpa ?? ""} placeholder="3.8 / 4.0"
              onChange={(e) => onUpdate(edu.id, { gpa: e.target.value })} />
          </div>
        </div>
      ))}

      <button className={s.addBtn} onClick={onAdd} id="add-education-btn">
        + Add Education
      </button>
    </div>
  );
}
