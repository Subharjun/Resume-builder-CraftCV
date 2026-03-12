"use client";
import { Project } from "@/types/resume";
import s from "./FormSections.module.css";

interface Props {
  items: Project[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onDelete: (id: string) => void;
}

export default function ProjectsForm({ items, onAdd, onUpdate, onDelete }: Props) {
  return (
    <div className={s.section}>
      <p className={s.sectionSubheading}>Showcase your best work and side projects.</p>

      {items.map((proj, idx) => (
        <div key={proj.id} className={s.entryCard}>
          <div className={s.entryCardHeader}>
            <span className={s.entryCardTitle}>{proj.name || `Project ${idx + 1}`}</span>
            <button className={s.deleteBtn} onClick={() => onDelete(proj.id)}>
              Remove
            </button>
          </div>

          <div className={s.row}>
            <div className={s.field}>
              <label className={s.label}>Project Name</label>
              <input className={s.input} value={proj.name} placeholder="CraftCV"
                onChange={(e) => onUpdate(proj.id, { name: e.target.value })} />
            </div>
            <div className={s.field}>
              <label className={s.label}>URL (Optional)</label>
              <input className={s.input} value={proj.url ?? ""} placeholder="github.com/you/project"
                onChange={(e) => onUpdate(proj.id, { url: e.target.value })} />
            </div>
          </div>

          <div className={s.field}>
            <label className={s.label}>Technologies Used</label>
            <input className={s.input} value={proj.technologies}
              placeholder="Next.js, TypeScript, Supabase..."
              onChange={(e) => onUpdate(proj.id, { technologies: e.target.value })} />
          </div>

          <div className={s.field}>
            <label className={s.label}>Description</label>
            <textarea className={s.textarea} value={proj.description}
              placeholder="Describe what the project does and your impact..."
              onChange={(e) => onUpdate(proj.id, { description: e.target.value })} />
          </div>
        </div>
      ))}

      <button className={s.addBtn} onClick={onAdd} id="add-project-btn">
        + Add Project
      </button>
    </div>
  );
}
