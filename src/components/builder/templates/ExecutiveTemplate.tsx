import { TemplateProps } from "@/types/resume";
import styles from "./ExecutiveTemplate.module.css";
import InlineEdit from "../InlineEdit";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ExecutiveTemplate({ 
  data, 
  updatePersonalInfo, 
  updateSummary, 
  updateExperience, 
  updateEducation, 
  updateProject,
  updateSkills
}: TemplateProps) {
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
          <InlineEdit
            className={styles.sidebarName}
            value={p.fullName || "Your Name"}
            onChange={(v) => updatePersonalInfo({ fullName: v })}
          />
          <InlineEdit
            className={styles.sidebarTitle}
            value={p.title || "Job Title"}
            onChange={(v) => updatePersonalInfo({ title: v })}
          />
        </div>

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarSectionTitle}>Contact</div>
          <div className={styles.sidebarItem}>✉ <InlineEdit value={p.email} onChange={(v) => updatePersonalInfo({ email: v })} placeholder="Email" /></div>
          <div className={styles.sidebarItem}>✆ <InlineEdit value={p.phone} onChange={(v) => updatePersonalInfo({ phone: v })} placeholder="Phone" /></div>
          <div className={styles.sidebarItem}>⌖ <InlineEdit value={p.location} onChange={(v) => updatePersonalInfo({ location: v })} placeholder="Location" /></div>
          <div className={styles.sidebarItem}>⊕ <InlineEdit value={p.website} onChange={(v) => updatePersonalInfo({ website: v })} placeholder="Website" /></div>
        </div>

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarSectionTitle}>Skills</div>
          <InlineEdit
            multiline
            className={styles.sidebarSkill}
            value={skills.join(", ")}
            onChange={(v) => updateSkills(v.split(",").map(sk => sk.trim()).filter(Boolean))}
            placeholder="React, CSS, SQL..."
          />
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.main}>
        {/* Summary */}
        <div className={styles.mainSection}>
          <div className={styles.sectionTitle}>Profile</div>
          <InlineEdit
            multiline
            className={styles.summaryText}
            value={summary}
            onChange={updateSummary}
            placeholder="Write your profile summary..."
          />
        </div>

        {/* Experience */}
        {experience.length > 0 && (
          <div className={styles.mainSection}>
            <div className={styles.sectionTitle}>Experience</div>
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
                <InlineEdit
                  multiline
                  className={styles.entryDesc}
                  value={exp.description}
                  onChange={(v) => updateExperience(exp.id, { description: v })}
                  placeholder="Describe your role..."
                />
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
                  <InlineEdit value={edu.field || ""} onChange={(v) => updateEducation(edu.id, { field: v })} placeholder="Field" />
                  {edu.gpa && " · GPA: "}
                  <InlineEdit value={edu.gpa || ""} onChange={(v) => updateEducation(edu.id, { gpa: v })} placeholder="3.8" />
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
                  placeholder="URL"
                />
                <InlineEdit
                  multiline
                  className={styles.entryDesc}
                  value={proj.description || ""}
                  onChange={(v) => updateProject(proj.id, { description: v })}
                  placeholder="Description"
                />
                <div className={styles.projTech}>
                  Tech: <InlineEdit value={proj.technologies || ""} onChange={(v) => updateProject(proj.id, { technologies: v })} placeholder="React, Node..." />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
