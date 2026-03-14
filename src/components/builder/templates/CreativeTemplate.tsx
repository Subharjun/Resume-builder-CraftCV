"use client";
import React from "react";
import { ResumeData } from "@/types/resume";

export interface CreativeStyle {
  primaryColor: string;
  accentColor: string;
  textColor: string;
  layout: "sidebar-left" | "sidebar-right" | "top-banner" | "two-column" | "minimal-clean";
  fontStyle: "modern" | "classic" | "elegant" | "tech" | "bold";
  hasSidebar: boolean;
  sidebarWidth: string;
  description: string;
}

export const defaultCreativeStyle: CreativeStyle = {
  primaryColor: "#1e1b4b",
  accentColor: "#7c3aed",
  textColor: "#1a202c",
  layout: "sidebar-left",
  fontStyle: "modern",
  hasSidebar: true,
  sidebarWidth: "32%",
  description: "Modern purple sidebar",
};

const fontFamilies: Record<string, string> = {
  modern:  "'Inter', 'Helvetica Neue', sans-serif",
  classic: "'Georgia', 'Times New Roman', serif",
  elegant: "'Playfair Display', 'Palatino', serif",
  tech:    "'Roboto Mono', 'Courier New', monospace",
  bold:    "'Outfit', 'Arial Black', sans-serif",
};

import { TemplateProps } from "@/types/resume";
import InlineEdit from "../InlineEdit";

export default function CreativeTemplate({ 
  data, 
  style = defaultCreativeStyle,
  updatePersonalInfo,
  updateSummary,
  updateExperience,
  updateEducation,
  updateProject,
  updateSkills,
  updateCustomSection
}: TemplateProps & { style?: CreativeStyle }) {
  const { personalInfo, summary, experience, education, skills, projects, customSections = [] } = data;
  const fontFamily = fontFamilies[style.fontStyle] ?? fontFamilies.modern;
  const skillList: string[] = Array.isArray(skills)
    ? skills
    : (typeof skills === "string" ? (skills as string).split(",").map((s: string) => s.trim()).filter(Boolean) : []);
  const isSidebarLeft = style.layout !== "sidebar-right";

  const css = `
    .cr-wrap { display:flex; flex-direction:${isSidebarLeft ? "row" : "row-reverse"}; min-height:297mm; font-family:${fontFamily}; color:${style.textColor}; background:#fff; }
    .cr-sidebar { width:${style.sidebarWidth}; background:${style.primaryColor}; color:#fff; padding:36px 24px; flex-shrink:0; }
    .cr-main   { flex:1; padding:36px 32px; }
    .cr-name   { font-size:1.5rem; font-weight:800; color:#fff; line-height:1.2; margin-bottom:4px; }
    .cr-title  { font-size:0.78rem; color:${style.accentColor}; text-transform:uppercase; letter-spacing:0.12em; margin-bottom:20px; font-weight:600; }
    .cr-side-section { margin-bottom:24px; }
    .cr-side-label { font-size:0.65rem; text-transform:uppercase; letter-spacing:0.15em; color:rgba(255,255,255,0.5); margin-bottom:10px; font-weight:700; }
    .cr-contact-row { display:flex; align-items:flex-start; gap:8px; margin-bottom:7px; font-size:0.72rem; color:rgba(255,255,255,0.85); line-height:1.4; word-break:break-all; }
    .cr-skill-tag   { display:inline-block; padding:4px 10px; border-radius:4px; background:rgba(255,255,255,0.12); color:rgba(255,255,255,0.9); font-size:0.68rem; margin:3px 2px; }
    .cr-section       { margin-bottom:26px; }
    .cr-section-title { font-size:0.7rem; text-transform:uppercase; letter-spacing:0.15em; font-weight:700; color:${style.accentColor}; border-bottom:2px solid ${style.accentColor}; padding-bottom:6px; margin-bottom:14px; }
    .cr-exp-item { margin-bottom:16px; }
    .cr-exp-role { font-size:0.88rem; font-weight:700; color:${style.textColor}; }
    .cr-exp-meta { font-size:0.72rem; color:#666; margin-bottom:6px; display:flex; gap:8px; flex-wrap:wrap; }
    .cr-exp-company { color:${style.accentColor}; font-weight:600; }
    .cr-exp-desc { font-size:0.74rem; color:#444; line-height:1.6; white-space:pre-line; }
    .cr-sum { font-size:0.8rem; line-height:1.7; color:#444; }
    .cr-proj-name { font-size:0.85rem; font-weight:700; color:${style.textColor}; }
    .cr-proj-tech { font-size:0.68rem; color:${style.accentColor}; margin-bottom:4px; }
    .cr-proj-desc { font-size:0.74rem; color:#444; line-height:1.5; }
    .cr-photo { width: 120px; height: 120px; object-fit: cover; border-radius: 50%; border: 3px solid rgba(255,255,255,0.2); margin-bottom: 24px; display: block; }
  `;

  return (
    <div style={{ background: "#fff", fontFamily }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="cr-wrap">
        {/* Sidebar */}
        <div className="cr-sidebar">
          {personalInfo.photoUrl && (
             <img src={personalInfo.photoUrl} alt="Avatar" className="cr-photo" />
          )}

          <InlineEdit
            className="cr-name"
            value={data.personalInfo.fullName || "Your Name"}
            onChange={(v) => updatePersonalInfo({ fullName: v })}
          />
          <InlineEdit
            className="cr-title"
            value={data.personalInfo.title || "Your Title"}
            onChange={(v) => updatePersonalInfo({ title: v })}
          />

          <div className="cr-side-section">
            <div className="cr-side-label">Contact</div>
            <div className="cr-contact-row"><span>✉</span><InlineEdit style={{display:'inline'}} value={data.personalInfo.email} onChange={(v) => updatePersonalInfo({ email: v })} placeholder="Email" /></div>
            <div className="cr-contact-row"><span>☎</span><InlineEdit style={{display:'inline'}} value={data.personalInfo.phone} onChange={(v) => updatePersonalInfo({ phone: v })} placeholder="Phone" /></div>
            <div className="cr-contact-row"><span>⌖</span><InlineEdit style={{display:'inline'}} value={data.personalInfo.location} onChange={(v) => updatePersonalInfo({ location: v })} placeholder="Location" /></div>
            {data.personalInfo.linkedin && (
               <div className="cr-contact-row">
                 <span>in</span>
                 <a href={data.personalInfo.linkedin.startsWith("http") ? data.personalInfo.linkedin : `https://${data.personalInfo.linkedin}`} target="_blank" rel="noreferrer" style={{color: "inherit", textDecoration: "none"}}>
                   <InlineEdit style={{display:'inline'}} value={data.personalInfo.linkedin} onChange={(v) => updatePersonalInfo({ linkedin: v })} placeholder="LinkedIn" />
                 </a>
               </div>
            )}
            <div className="cr-contact-row"><span>⊕</span><InlineEdit style={{display:'inline'}} value={data.personalInfo.website} onChange={(v) => updatePersonalInfo({ website: v })} placeholder="Website" /></div>
          </div>

          <div className="cr-side-section">
            <div className="cr-side-label">Skills</div>
            <InlineEdit
              multiline
              className="cr-skill-tag"
              style={{ background: 'none', padding: 0, border: 'none', display: 'block' }}
              value={skillList.join(", ")}
              onChange={(v) => updateSkills(v.split(",").map(sk => sk.trim()).filter(Boolean))}
              placeholder="React, CSS..."
            />
          </div>

          {data.education.length > 0 && (
            <div className="cr-side-section">
              <div className="cr-side-label">Education</div>
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fff" }}>
                     <InlineEdit value={edu.degree || ""} onChange={(v) => updateEducation(edu.id, { degree: v })} placeholder="Degree" />
                     {" "}
                     <InlineEdit value={edu.field || ""} onChange={(v) => updateEducation(edu.id, { field: v })} placeholder="Field" />
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                     <InlineEdit value={edu.institution} onChange={(v) => updateEducation(edu.id, { institution: v })} placeholder="Institution" />
                  </div>
                  <div style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                     <InlineEdit value={edu.startDate} onChange={(v) => updateEducation(edu.id, { startDate: v })} placeholder="Start" />
                     {" – "}
                     <InlineEdit value={edu.endDate} onChange={(v) => updateEducation(edu.id, { endDate: v })} placeholder="End" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="cr-main">
          <div className="cr-section">
            <div className="cr-section-title">Profile</div>
            <div 
               className="tiptap-content cr-sum" 
               dangerouslySetInnerHTML={{ __html: data.summary || "<p>Write your profile summary...</p>" }} 
            />
          </div>

          {data.experience.length > 0 && (
            <div className="cr-section">
              <div className="cr-section-title">Experience</div>
              {data.experience.map((exp, i) => (
                <div key={i} className="cr-exp-item">
                  <InlineEdit
                    className="cr-exp-role"
                    value={exp.role}
                    onChange={(v) => updateExperience(exp.id, { role: v })}
                    placeholder="Role"
                  />
                  <div className="cr-exp-meta">
                    <InlineEdit
                      className="cr-exp-company"
                      value={exp.company}
                      onChange={(v) => updateExperience(exp.id, { company: v })}
                      placeholder="Company"
                    />
                    <span>
                      <InlineEdit value={exp.startDate} onChange={(v) => updateExperience(exp.id, { startDate: v })} placeholder="Start" />
                      {" – "}
                      <InlineEdit value={exp.current ? "Present" : exp.endDate} onChange={(v) => updateExperience(exp.id, { endDate: v, current: v.toLowerCase()==='present' })} placeholder="End" />
                    </span>
                  </div>
                  <div 
                     className="tiptap-content cr-exp-desc" 
                     dangerouslySetInnerHTML={{ __html: exp.description }} 
                  />
                </div>
              ))}
            </div>
          )}

          {data.projects.length > 0 && (
            <div className="cr-section">
              <div className="cr-section-title">Projects</div>
              {data.projects.map((proj, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <InlineEdit
                    className="cr-proj-name"
                    value={proj.name}
                    onChange={(v) => updateProject(proj.id, { name: v })}
                    placeholder="Project Name"
                  />
                  <InlineEdit
                    className="cr-proj-tech"
                    value={proj.technologies}
                    onChange={(v) => updateProject(proj.id, { technologies: v })}
                    placeholder="Tech Stack"
                  />
                  <div 
                     className="tiptap-content cr-proj-desc" 
                     dangerouslySetInnerHTML={{ __html: proj.description }} 
                  />
                </div>
              ))}
            </div>
          )}

          {/* Custom Sections */}
          {customSections.map((sec) => (
            <div key={sec.id} className="cr-section">
              <div className="cr-section-title">
                <InlineEdit
                  value={sec.title}
                  onChange={(v) => updateCustomSection(sec.id, { title: v })}
                  placeholder="Section Title"
                />
              </div>
              <div 
                 className="tiptap-content cr-sum" 
                 dangerouslySetInnerHTML={{ __html: sec.content }} 
              />
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
