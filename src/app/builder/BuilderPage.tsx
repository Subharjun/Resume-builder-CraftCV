"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResumeData, emptyData } from "@/hooks/useResumeData";
import { TemplateId, FormSection } from "@/types/resume";
import MinimalistTemplate from "@/components/builder/templates/MinimalistTemplate";
import ExecutiveTemplate from "@/components/builder/templates/ExecutiveTemplate";
import PersonalInfoForm from "@/components/builder/sections/PersonalInfoForm";
import SummaryForm from "@/components/builder/sections/SummaryForm";
import ExperienceForm from "@/components/builder/sections/ExperienceForm";
import EducationForm from "@/components/builder/sections/EducationForm";
import SkillsForm from "@/components/builder/sections/SkillsForm";
import ProjectsForm from "@/components/builder/sections/ProjectsForm";
import styles from "./Builder.module.css";

const TABS: { id: FormSection; label: string; icon: string }[] = [
  { id: "personal", label: "Personal", icon: "👤" },
  { id: "summary", label: "Summary", icon: "📝" },
  { id: "experience", label: "Experience", icon: "💼" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "skills", label: "Skills", icon: "⚡" },
  { id: "projects", label: "Projects", icon: "🚀" },
];

const TEMPLATES: { id: TemplateId; label: string; locked?: boolean }[] = [
  { id: "minimalist", label: "Minimalist" },
  { id: "executive", label: "Executive" },
];

export default function BuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");

  const {
    data,
    loadData,
    updatePersonalInfo,
    updateSummary,
    updateSkills,
    addExperience, updateExperience, deleteExperience,
    addEducation, updateEducation, deleteEducation,
    addProject, updateProject, deleteProject,
  } = useResumeData();

  const [activeTab, setActiveTab] = useState<FormSection>("personal");
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("minimalist");
  const [showLocked, setShowLocked] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "login">("idle");
  const [resumeTitle, setResumeTitle] = useState("Untitled Resume");
  const [editingTitle, setEditingTitle] = useState(false);
  const [loadedResumeId, setLoadedResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Load resume from Supabase if ?id= is present
  const loadResume = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: row, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !row) {
        console.error("Could not load resume:", error);
        return;
      }

      setLoadedResumeId(row.id);
      setResumeTitle(row.title);
      setActiveTemplate(row.template as TemplateId);
      loadData(row.data as typeof emptyData);
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  useEffect(() => {
    if (resumeId) {
      loadResume(resumeId);
    }
  }, [resumeId, loadResume]);

  // Focus title input when editing
  useEffect(() => {
    if (editingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editingTitle]);

  const handleTemplateSelect = (t: { id: TemplateId; locked?: boolean }) => {
    if (t.locked) { setShowLocked(true); return; }
    setActiveTemplate(t.id);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSaveStatus("login");
        setSaving(false);
        return;
      }

      const payload = {
        user_id: user.id,
        title: resumeTitle || (data.personalInfo.fullName ? `${data.personalInfo.fullName}'s Resume` : "Untitled Resume"),
        template: activeTemplate,
        data: data as unknown as Record<string, unknown>,
      };

      let result;
      if (loadedResumeId) {
        // Update existing resume
        result = await supabase
          .from("resumes")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", loadedResumeId);
      } else {
        // Insert new resume
        result = await supabase.from("resumes").insert(payload).select().single();
        if (result.data) setLoadedResumeId(result.data.id);
      }

      if (result.error) throw result.error;
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");
      const element = document.getElementById("resume-preview");
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.personalInfo.fullName || "resume"}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case "personal": return <PersonalInfoForm data={data.personalInfo} onChange={updatePersonalInfo} />;
      case "summary": return <SummaryForm value={data.summary} personalTitle={data.personalInfo.title} onChange={updateSummary} />;
      case "experience": return <ExperienceForm items={data.experience} onAdd={addExperience} onUpdate={updateExperience} onDelete={deleteExperience} />;
      case "education": return <EducationForm items={data.education} onAdd={addEducation} onUpdate={updateEducation} onDelete={deleteEducation} />;
      case "skills": return <SkillsForm skills={data.skills} jobTitle={data.personalInfo.title} onChange={updateSkills} />;
      case "projects": return <ProjectsForm items={data.projects} onAdd={addProject} onUpdate={updateProject} onDelete={deleteProject} />;
    }
  };

  if (isLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8b5cf6", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.builder}>
      {/* ── Top Bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button className={styles.backBtn} onClick={() => router.push("/dashboard")} id="back-btn">
            ← Dashboard
          </button>
          {/* Editable Resume Title */}
          <div className={styles.titleWrap}>
            {editingTitle ? (
              <input
                ref={titleInputRef}
                className={styles.titleInput}
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditingTitle(false); }}
                maxLength={60}
                id="resume-title-input"
              />
            ) : (
              <span className={styles.titleDisplay} onClick={() => setEditingTitle(true)} title="Click to rename" id="resume-title">
                {resumeTitle} ✏️
              </span>
            )}
          </div>
        </div>

        {/* Template switcher */}
        <div className={styles.topBarCenter}>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              className={`${styles.templatePill} ${activeTemplate === t.id ? styles.templatePillActive : ""} ${t.locked ? styles.templateLocked : ""}`}
              onClick={() => handleTemplateSelect(t)}
              id={`template-${t.id}`}
            >
              {t.locked ? "🔒 " : ""}{t.label}
            </button>
          ))}
        </div>

        <div className={styles.topBarRight}>
          <button
            className={`${styles.saveBtn} ${saveStatus === "saved" ? styles.saveBtnSuccess : ""}`}
            onClick={handleSave}
            disabled={saving}
            id="save-resume-btn"
          >
            {saving ? "Saving..." : saveStatus === "saved" ? "✓ Saved!" : saveStatus === "login" ? "⚠ Login to Save" : "Save"}
          </button>
          <button className={styles.exportBtn} onClick={handleExportPDF} disabled={exporting} id="export-pdf-btn">
            {exporting ? "⏳ Exporting..." : "⤓ Export PDF"}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        {/* Left: Form Panel */}
        <div className={styles.formPanel}>
          <div className={styles.formTabs}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(tab.id)}
                id={`tab-${tab.id}`}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <div className={styles.formContent} ref={previewRef}>
            {renderForm()}
          </div>
        </div>

        {/* Right: Preview Panel */}
        <div className={styles.previewPanel}>
          <span className={styles.previewLabel}>
            Live Preview — {activeTemplate.charAt(0).toUpperCase() + activeTemplate.slice(1)}
          </span>
          <div className={styles.previewPaper} id="resume-preview">
            {activeTemplate === "minimalist" ? (
              <MinimalistTemplate data={data} />
            ) : (
              <ExecutiveTemplate data={data} />
            )}
          </div>
        </div>
      </div>

      {/* Locked Template Modal */}
      {showLocked && (
        <div className={styles.lockedOverlay} onClick={() => setShowLocked(false)}>
          <div className={styles.lockedCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lockedIcon}>🔒</div>
            <h2 className={styles.lockedTitle}>Premium Template</h2>
            <p className={styles.lockedDesc}>
              The Creative template is a premium design. Upgrade your plan to unlock it and access all future templates.
            </p>
            <button className={styles.lockedClose} onClick={() => setShowLocked(false)}>
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
