import { Project } from "@/types/resume";
import s from "./FormSections.module.css";

interface Props {
  items: Project[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}

export default function ProjectsForm({ items, onAdd, onUpdate, onDelete, onMove }: Props) {
  return (
    <div className={s.section}>
      <div className={s.aiSection} style={{ marginBottom: 20 }}>
        <div className={s.aiLogo}>✦</div>
        <h3 className={s.aiTitle}>Project Lab</h3>
        <p className={s.aiDesc}>Showcase your builds. Manage titles and tech here, edits on page.</p>
        <button className={s.addBtn} onClick={onAdd} id="add-project-btn">
          + Add New Project
        </button>
      </div>

      {items.map((proj, idx) => (
        <div key={proj.id} className={s.entryCard}>
          <div className={s.entryCardHeader}>
            <span className={s.entryCardTitle}>{proj.name || `Project ${idx + 1}`}</span>
            <div style={{display: "flex", gap: "6px"}}>
               <button className={s.moveBtn} onClick={() => onMove(proj.id, "up")} disabled={idx === 0} title="Move Up">▲</button>
               <button className={s.moveBtn} onClick={() => onMove(proj.id, "down")} disabled={idx === items.length - 1} title="Move Down">▼</button>
               <button className={s.deleteBtn} onClick={() => onDelete(proj.id)} title="Delete">
                 Delete
               </button>
            </div>
          </div>

          <div className={s.row}>
            <input className={s.input} value={proj.name} placeholder="Project Name"
                onChange={(e) => onUpdate(proj.id, { name: e.target.value })} />
            <input className={s.input} value={proj.url ?? ""} placeholder="Live Link"
                onChange={(e) => onUpdate(proj.id, { url: e.target.value })} />
          </div>

          <input className={s.input} value={proj.technologies}
            placeholder="Tech Stack (e.g. React, Node.js)"
            onChange={(e) => onUpdate(proj.id, { technologies: e.target.value })} />
        </div>
      ))}

      {items.length === 0 && (
         <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: 20 }}>
           No projects added. Start showcasing your work!
         </p>
      )}
    </div>
  );
}
