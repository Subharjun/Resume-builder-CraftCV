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

interface Props {
  data: ResumeData;
  style?: CreativeStyle;
}

export default function CreativeTemplate({ data, style = defaultCreativeStyle }: Props) {
  const { personalInfo, summary, experience, education, skills, projects } = data;
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
  `;

  return (
    <div style={{ background: "#fff", fontFamily }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="cr-wrap">
        {/* Sidebar */}
        <div className="cr-sidebar">
          <div className="cr-name">{personalInfo.fullName || "Your Name"}</div>
          <div className="cr-title">{personalInfo.title || "Your Title"}</div>

          <div className="cr-side-section">
            <div className="cr-side-label">Contact</div>
            {personalInfo.email    && <div className="cr-contact-row"><span>✉</span>{personalInfo.email}</div>}
            {personalInfo.phone    && <div className="cr-contact-row"><span>☎</span>{personalInfo.phone}</div>}
            {personalInfo.location && <div className="cr-contact-row"><span>⌖</span>{personalInfo.location}</div>}
            {personalInfo.linkedin && <div className="cr-contact-row"><span>in</span>{personalInfo.linkedin}</div>}
            {personalInfo.website  && <div className="cr-contact-row"><span>⊕</span>{personalInfo.website}</div>}
          </div>

          {skillList.length > 0 && (
            <div className="cr-side-section">
              <div className="cr-side-label">Skills</div>
              <div>
                {skillList.map((sk: string, i: number) => (
                  <span key={i} className="cr-skill-tag">{sk}</span>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div className="cr-side-section">
              <div className="cr-side-label">Education</div>
              {education.map((edu, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fff" }}>{edu.degree} {edu.field}</div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{edu.institution}</div>
                  <div style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{edu.startDate} – {edu.endDate}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="cr-main">
          {summary && (
            <div className="cr-section">
              <div className="cr-section-title">Profile</div>
              <div className="cr-sum">{summary}</div>
            </div>
          )}

          {experience.length > 0 && (
            <div className="cr-section">
              <div className="cr-section-title">Experience</div>
              {experience.map((exp, i) => (
                <div key={i} className="cr-exp-item">
                  <div className="cr-exp-role">{exp.role}</div>
                  <div className="cr-exp-meta">
                    <span className="cr-exp-company">{exp.company}</span>
                    {exp.startDate && <span>{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>}
                  </div>
                  {exp.description && <div className="cr-exp-desc">{exp.description}</div>}
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div className="cr-section">
              <div className="cr-section-title">Projects</div>
              {projects.map((proj, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div className="cr-proj-name">{proj.name}</div>
                  {proj.technologies && <div className="cr-proj-tech">{proj.technologies}</div>}
                  {proj.description  && <div className="cr-proj-desc">{proj.description}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
