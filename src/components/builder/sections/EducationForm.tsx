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
      <div className={s.aiSection} style={{ marginBottom: 20 }}>
        <div className={s.aiLogo}>✦</div>
        <h3 className={s.aiTitle}>Education Hub</h3>
        <p className={s.aiDesc}>Manage your academic milestones here or edit titles on the page.</p>
        <button className={s.addBtn} onClick={onAdd} id="add-education-btn">
          + Add New Education
        </button>
      </div>

      {items.map((edu, idx) => (
        <div key={edu.id} className={s.entryCard}>
          <div className={s.entryCardHeader}>
            <span className={s.entryCardTitle}>
              {edu.institution || `Institution ${idx + 1}`}
            </span>
            <button className={s.deleteBtn} onClick={() => onDelete(edu.id)}>
              Delete
            </button>
          </div>

          <input className={s.input} value={edu.institution}
            placeholder="Institution Name"
            onChange={(e) => onUpdate(edu.id, { institution: e.target.value })} />

          <div className={s.row}>
            <input className={s.input} value={edu.degree} placeholder="Degree (e.g. B.Tech)"
              onChange={(e) => onUpdate(edu.id, { degree: e.target.value })} />
            <input className={s.input} value={edu.field} placeholder="Field (e.g. CS)"
              onChange={(e) => onUpdate(edu.id, { field: e.target.value })} />
          </div>
        </div>
      ))}

      {items.length === 0 && (
         <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: 20 }}>
           No education listed. Click add to start.
         </p>
      )}
    </div>
  );
}
