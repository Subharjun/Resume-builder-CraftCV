import { TemplateProps } from "@/types/resume";
import styles from "./MinimalistTemplate.module.css";
import InlineEdit from "../InlineEdit";
import RichEditor from "../RichEditor";

export default function MinimalistTemplate({ 
  data, 
  updatePersonalInfo, 
  updateSummary, 
  updateExperience, 
  updateEducation, 
  updateProject,
  updateSkills,
  updateCustomSection
}: TemplateProps) {
  const { personalInfo: p, summary, experience, education, skills: propSkills, projects, customSections } = data;
  const skills: string[] = Array.isArray(propSkills) 
    ? propSkills 
    : typeof propSkills === 'string' 
      ? (propSkills as string).split(',').map(s => s.trim()).filter(Boolean)
      : [];

  return (
    <div className={styles.resume} id="resume-preview">
      {/* Header */}
      <div className={styles.header}>
        <InlineEdit
          className={styles.name}
          value={p.fullName || "Your Name"}
          onChange={(val) => updatePersonalInfo({ fullName: val })}
        />
        <InlineEdit
          className={styles.title}
          value={p.title || "Job Title"}
          onChange={(val) => updatePersonalInfo({ title: val })}
        />
        <div className={styles.contacts}>
          <span className={styles.contactItem}>✉ <InlineEdit value={p.email} onChange={(v) => updatePersonalInfo({ email: v })} placeholder="email@example.com" /></span>
          <span className={styles.contactItem}>✆ <InlineEdit value={p.phone} onChange={(v) => updatePersonalInfo({ phone: v })} placeholder="Phone" /></span>
          <span className={styles.contactItem}>⌖ <InlineEdit value={p.location} onChange={(v) => updatePersonalInfo({ location: v })} placeholder="Location" /></span>
          {p.linkedin && (
             <span className={styles.contactItem}>in <a href={p.linkedin.startsWith("http") ? p.linkedin : `https://${p.linkedin}`} target="_blank" rel="noreferrer" style={{color: "inherit", textDecoration: "none"}}><InlineEdit value={p.linkedin} onChange={(v) => updatePersonalInfo({ linkedin: v })} placeholder="LinkedIn" /></a></span>
          )}
          <span className={styles.contactItem}>⊕ <InlineEdit value={p.website} onChange={(v) => updatePersonalInfo({ website: v })} placeholder="Website" /></span>
        </div>
      </div>

      {/* Summary */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Professional Summary</div>
        <RichEditor
          className={styles.summaryText}
          value={summary}
          onChange={updateSummary}
          placeholder="Write a brief professional summary..."
        />
      </div>

      {/* Experience */}
      {experience.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Work Experience</div>
          {experience.map((exp) => (
            <div key={exp.id} className={styles.entry}>
              <div className={styles.entryTop}>
                <InlineEdit
                  className={styles.entryTitle}
                  value={exp.role || "Role"}
                  onChange={(v) => updateExperience(exp.id, { role: v })}
                />
                <div className={styles.entryDates}>
                   <InlineEdit value={exp.startDate} onChange={(v) => updateExperience(exp.id, { startDate: v })} placeholder="Start" />
                   {" – "}
                   <InlineEdit value={exp.current ? "Present" : exp.endDate} onChange={(v) => updateExperience(exp.id, { endDate: v, current: v.toLowerCase() === 'present' })} placeholder="End" />
                </div>
              </div>
              <InlineEdit
                className={styles.entrySubtitle}
                value={exp.company || "Company"}
                onChange={(v) => updateExperience(exp.id, { company: v })}
              />
              <RichEditor
                className={styles.entryDesc}
                value={exp.description}
                onChange={(v) => updateExperience(exp.id, { description: v })}
                placeholder="• List your responsibilities and achievements..."
              />
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
                <InlineEdit
                  className={styles.entryTitle}
                  value={edu.institution || "Institution"}
                  onChange={(v) => updateEducation(edu.id, { institution: v })}
                />
                <div className={styles.entryDates}>
                  <InlineEdit value={edu.startDate} onChange={(v) => updateEducation(edu.id, { startDate: v })} placeholder="Start" />
                  {" – "}
                  <InlineEdit value={edu.endDate} onChange={(v) => updateEducation(edu.id, { endDate: v })} placeholder="End" />
                </div>
              </div>
              <div className={styles.entrySubtitle}>
                <InlineEdit value={edu.degree || ""} onChange={(v) => updateEducation(edu.id, { degree: v })} placeholder="Degree" />
                {", "}
                <InlineEdit value={edu.field || ""} onChange={(v) => updateEducation(edu.id, { field: v })} placeholder="Field of Study" />
                {" · GPA: "}
                <InlineEdit value={edu.gpa || ""} onChange={(v) => updateEducation(edu.id, { gpa: v })} placeholder="3.8" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Projects</div>
          {projects.map((proj) => (
            <div key={proj.id} className={styles.entry}>
              <div className={styles.entryTop}>
                <InlineEdit
                  className={styles.entryTitle}
                  value={proj.name || "Project Name"}
                  onChange={(v) => updateProject(proj.id, { name: v })}
                />
              </div>
              <InlineEdit
                className={styles.projUrl}
                value={proj.url || ""}
                onChange={(v) => updateProject(proj.id, { url: v })}
                placeholder="project-url.com"
              />
              <RichEditor
                className={styles.entryDesc}
                value={proj.description || ""}
                onChange={(v) => updateProject(proj.id, { description: v })}
                placeholder="Describe your project..."
              />
              <div className={styles.projTech}>
                Tech: <InlineEdit value={proj.technologies || ""} onChange={(v) => updateProject(proj.id, { technologies: v })} placeholder="React, AWS..." />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Sections */}
      {customSections.map((sec) => (
        <div key={sec.id} className={styles.section}>
          <InlineEdit
             className={styles.sectionTitle}
             value={sec.title}
             onChange={(v) => updateCustomSection(sec.id, { title: v })}
          />
          <RichEditor
            className={styles.entryDesc}
            value={sec.content}
            onChange={(v) => updateCustomSection(sec.id, { content: v })}
            placeholder="Add your lists, achievements, or summary here..."
          />
        </div>
      ))}

      {/* Skills */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Skills</div>
        <InlineEdit
          multiline
          className={styles.summaryText}
          value={skills.join(", ")}
          onChange={(v) => updateSkills(v.split(",").map(s => s.trim()).filter(Boolean))}
          placeholder="React, Node.js, Python..."
        />
      </div>
    </div>
  );
}
