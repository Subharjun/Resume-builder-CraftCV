"use client";
import React from "react";
import { TemplateProps } from "@/types/resume";
import RichEditor from "../RichEditor";
import InlineEdit from "../InlineEdit";

export default function ProfessionalTemplate({
  data,
  updatePersonalInfo,
  updateSummary,
  updateExperience,
  updateEducation,
  updateProject,
  updateSkills,
  updateCustomSection,
  addCustomSection,
  removeCustomSection,
}: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects, customSections } = data;

  const style = `
    .prof-page { background: #fff; padding: 40px 50px; color: #333; font-family: 'Times New Roman', serif; line-height: 1.4; font-size: 11pt; }
    .prof-header { text-align: center; margin-bottom: 20px; }
    .prof-name { font-size: 24pt; font-weight: bold; text-transform: none; margin-bottom: 5px; }
    .prof-contact { font-size: 10pt; color: #444; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
    .prof-contact span:not(:last-child)::after { content: " |"; }
    
    .prof-section { margin-top: 15px; }
    .prof-section-title { font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 2px; margin-bottom: 8px; }
    
    .prof-item { margin-bottom: 8px; }
    .prof-item-header { display: flex; justify-content: space-between; font-weight: bold; }
    .prof-item-sub { display: flex; justify-content: space-between; font-style: italic; font-size: 10pt; }
    
    .prof-rich-content { font-size: 10.5pt; margin-top: 3px; }
    .prof-rich-content ul { padding-left: 20px; margin: 3px 0; }
    
    .custom-section-controls { display: flex; gap: 8px; margin-top: 10px; opacity: 0; transition: opacity 0.2s; }
    .prof-section:hover .custom-section-controls { opacity: 1; }
    .btn-delete { color: #ef4444; font-size: 0.7rem; cursor: pointer; background: none; border: none; }
  `;

  return (
    <div className="prof-page">
      <style dangerouslySetInnerHTML={{ __html: style }} />
      
      {/* Header */}
      <div className="prof-header">
        <InlineEdit
          className="prof-name"
          value={personalInfo.fullName}
          onChange={(v) => updatePersonalInfo({ fullName: v })}
          placeholder="YOUR NAME"
        />
        <div className="prof-contact">
          <InlineEdit value={personalInfo.email} onChange={(v) => updatePersonalInfo({ email: v })} placeholder="email" />
          <InlineEdit value={personalInfo.phone} onChange={(v) => updatePersonalInfo({ phone: v })} placeholder="phone" />
          <InlineEdit value={personalInfo.location} onChange={(v) => updatePersonalInfo({ location: v })} placeholder="location" />
          <InlineEdit value={personalInfo.linkedin} onChange={(v) => updatePersonalInfo({ linkedin: v })} placeholder="linkedin" />
          <InlineEdit value={personalInfo.website} onChange={(v) => updatePersonalInfo({ website: v })} placeholder="portfolio" />
        </div>
      </div>

      {/* Summary */}
      <div className="prof-section">
        <div className="prof-section-title">Professional Summary</div>
        <RichEditor
          className="prof-rich-content"
          value={summary}
          onChange={updateSummary}
          placeholder="Brief professional overview..."
        />
      </div>

      {/* Education */}
      {education.length > 0 && (
        <div className="prof-section">
          <div className="prof-section-title">Education</div>
          {education.map((edu) => (
            <div key={edu.id} className="prof-item">
              <div className="prof-item-header">
                <InlineEdit value={edu.institution} onChange={(v) => updateEducation(edu.id, { institution: v })} placeholder="Institution" />
                <InlineEdit value={`${edu.startDate} – ${edu.endDate}`} onChange={(v) => {
                  const [s, e] = v.split("–").map(x => x.trim());
                  updateEducation(edu.id, { startDate: s, endDate: e });
                }} />
              </div>
              <div className="prof-item-sub">
                <InlineEdit value={`${edu.degree} ${edu.field}`} onChange={(v) => updateEducation(edu.id, { degree: v })} />
                <InlineEdit value={`GPA: ${edu.gpa}`} onChange={(v) => updateEducation(edu.id, { gpa: v.replace("GPA:", "").trim() })} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="prof-section">
          <div className="prof-section-title">Work Experience</div>
          {experience.map((exp) => (
            <div key={exp.id} className="prof-item">
              <div className="prof-item-header">
                <InlineEdit value={exp.company} onChange={(v) => updateExperience(exp.id, { company: v })} placeholder="Company" />
                <InlineEdit value={`${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`} onChange={(v) => {
                   const [s, e] = v.split("–").map(x => x.trim());
                   updateExperience(exp.id, { startDate: s, endDate: e, current: e?.toLowerCase() === 'present' });
                }} />
              </div>
              <InlineEdit className="prof-item-sub" value={exp.role} onChange={(v) => updateExperience(exp.id, { role: v })} />
              <RichEditor
                className="prof-rich-content"
                value={exp.description}
                onChange={(v) => updateExperience(exp.id, { description: v })}
                placeholder="Describe your role and achievements..."
              />
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="prof-section">
          <div className="prof-section-title">Personal Projects</div>
          {projects.map((proj) => (
            <div key={proj.id} className="prof-item">
              <div className="prof-item-header">
                <InlineEdit value={proj.name} onChange={(v) => updateProject(proj.id, { name: v })} placeholder="Project Name" />
                <span><InlineEdit value={proj.url || ""} onChange={(v) => updateProject(proj.id, { url: v })} placeholder="Project Link" /></span>
              </div>
              <InlineEdit className="prof-item-sub" style={{ fontStyle: 'normal', color: '#666' }} value={`Tech Stack: ${proj.technologies}`} onChange={(v) => updateProject(proj.id, { technologies: v.replace('Tech Stack:', '').trim() })} />
              <RichEditor
                className="prof-rich-content"
                value={proj.description}
                onChange={(v) => updateProject(proj.id, { description: v })}
              />
            </div>
          ))}
        </div>
      )}

      {/* Custom Sections (Dynamic Word-like sections) */}
      {customSections.map((sec) => (
        <div key={sec.id} className="prof-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <InlineEdit
              className="prof-section-title"
              style={{ flex: 1 }}
              value={sec.title}
              onChange={(v) => updateCustomSection(sec.id, { title: v })}
            />
            <button className="btn-delete" onClick={() => removeCustomSection(sec.id)}>✕ delete</button>
          </div>
          <RichEditor
            className="prof-rich-content"
            value={sec.content}
            onChange={(v) => updateCustomSection(sec.id, { content: v })}
            placeholder="Click to add content, lists, and formatting..."
          />
        </div>
      ))}

      {/* Add Section Trigger */}
      <div style={{ textAlign: 'center', marginTop: 30, borderTop: '1px dashed #ccc', paddingTop: 20 }}>
        <button 
          onClick={() => addCustomSection("NEW SECTION")}
          style={{ 
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          + Add New Section (e.g. Achievements, Skills)
        </button>
      </div>
    </div>
  );
}
