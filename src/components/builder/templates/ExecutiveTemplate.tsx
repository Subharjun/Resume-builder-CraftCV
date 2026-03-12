import { ResumeData } from "@/types/resume";
import styles from "./ExecutiveTemplate.module.css";

interface Props {
  data: ResumeData;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ExecutiveTemplate({ data }: Props) {
  const { personalInfo: p, summary, experience, education, skills: propSkills, projects } = data;
  const skills: string[] = Array.isArray(propSkills) 
    ? propSkills 
    : typeof propSkills === 'string' 
      ? (propSkills as string).split(',').map(s => s.trim()).filter(Boolean)
      : [];

  return (
    <div className={styles.resume} id="resume-preview">
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div>
          <div className={styles.avatar}>
            {getInitials(p.fullName || "YN")}
          </div>
          <div className={styles.sidebarName}>{p.fullName || "Your Name"}</div>
          {p.title && <div className={styles.sidebarTitle}>{p.title}</div>}
        </div>

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarSectionTitle}>Contact</div>
          {p.email && <div className={styles.sidebarItem}>✉ {p.email}</div>}
          {p.phone && <div className={styles.sidebarItem}>✆ {p.phone}</div>}
          {p.location && <div className={styles.sidebarItem}>⌖ {p.location}</div>}
          {p.website && <div className={styles.sidebarItem}>⊕ {p.website}</div>}
          {p.linkedin && <div className={styles.sidebarItem}>in {p.linkedin}</div>}
        </div>

        {skills.length > 0 && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>Skills</div>
            {skills.map((skill, i) => (
              <div key={i} className={styles.sidebarSkill}>
                <span className={styles.skillDot} />
                {skill}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={styles.main}>
        {/* Summary */}
        {summary && (
          <div className={styles.mainSection}>
            <div className={styles.sectionTitle}>Profile</div>
            <p className={styles.summaryText}>{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className={styles.mainSection}>
            <div className={styles.sectionTitle}>Experience</div>
            {experience.map((exp) => (
              <div key={exp.id} className={styles.entry}>
                <div className={styles.entryTop}>
                  <span className={styles.entryTitle}>{exp.role || "Role"}</span>
                  <span className={styles.entryDates}>
                    {exp.startDate}{exp.startDate && " – "}
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
          <div className={styles.mainSection}>
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
                  {edu.gpa && ` · GPA: ${edu.gpa}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className={styles.mainSection}>
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
    </div>
  );
}
