import { ResumeData } from "@/types/resume";
import styles from "./MinimalistTemplate.module.css";

interface Props {
  data: ResumeData;
}

export default function MinimalistTemplate({ data }: Props) {
  const { personalInfo: p, summary, experience, education, skills: propSkills, projects } = data;
  const skills: string[] = Array.isArray(propSkills) 
    ? propSkills 
    : typeof propSkills === 'string' 
      ? (propSkills as string).split(',').map(s => s.trim()).filter(Boolean)
      : [];

  return (
    <div className={styles.resume} id="resume-preview">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.name}>{p.fullName || "Your Name"}</div>
        {p.title && <div className={styles.title}>{p.title}</div>}
        <div className={styles.contacts}>
          {p.email && <span className={styles.contactItem}>✉ {p.email}</span>}
          {p.phone && <span className={styles.contactItem}>✆ {p.phone}</span>}
          {p.location && <span className={styles.contactItem}>⌖ {p.location}</span>}
          {p.website && <span className={styles.contactItem}>⊕ {p.website}</span>}
          {p.linkedin && <span className={styles.contactItem}>in {p.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Professional Summary</div>
          <p className={styles.summaryText}>{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Work Experience</div>
          {experience.map((exp) => (
            <div key={exp.id} className={styles.entry}>
              <div className={styles.entryTop}>
                <span className={styles.entryTitle}>{exp.role || "Role"}</span>
                <span className={styles.entryDates}>
                  {exp.startDate}
                  {exp.startDate && " – "}
                  {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <div className={styles.entrySubtitle}>{exp.company}</div>
              {exp.description && (
                <div className={styles.entryDesc}>{exp.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Education</div>
          {education.map((edu) => (
            <div key={edu.id} className={styles.entry}>
              <div className={styles.entryTop}>
                <span className={styles.entryTitle}>{edu.institution}</span>
                <span className={styles.entryDates}>
                  {edu.startDate}{edu.startDate && " – "}{edu.endDate}
                </span>
              </div>
              <div className={styles.entrySubtitle}>
                {edu.degree}{edu.field && `, ${edu.field}`}
                {edu.gpa && <span className={styles.gpa}>GPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Skills</div>
          <div className={styles.skillsWrap}>
            {skills.map((skill, i) => (
              <span key={i} className={styles.skillPill}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Projects</div>
          {projects.map((proj) => (
            <div key={proj.id} className={styles.entry}>
              <div className={styles.entryTop}>
                <span className={styles.entryTitle}>{proj.name}</span>
              </div>
              {proj.url && <div className={styles.projUrl}>{proj.url}</div>}
              {proj.description && (
                <div className={styles.entryDesc}>{proj.description}</div>
              )}
              {proj.technologies && (
                <div className={styles.projTech}>Tech: {proj.technologies}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
