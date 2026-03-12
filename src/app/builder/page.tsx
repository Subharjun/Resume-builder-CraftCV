"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useResumeData } from "@/hooks/useResumeData";
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
  const {
    data,
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
  const previewRef = useRef<HTMLDivElement>(null);

  const handleTemplateSelect = (t: { id: TemplateId; locked?: boolean }) => {
    if (t.locked) {
      setShowLocked(true);
      return;
    }
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
      await supabase.from("resumes").upsert({
        user_id: user.id,
        title: data.personalInfo.fullName
          ? `${data.personalInfo.fullName}'s Resume`
          : "Untitled Resume",
        template: activeTemplate,
        data: data as unknown as Record<string, unknown>,
      });
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

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

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
      case "personal":
        return <PersonalInfoForm data={data.personalInfo} onChange={updatePersonalInfo} />;
      case "summary":
        return (
          <SummaryForm
            value={data.summary}
            personalTitle={data.personalInfo.title}
            onChange={updateSummary}
          />
        );
      case "experience":
        return (
          <ExperienceForm
            items={data.experience}
            onAdd={addExperience}
            onUpdate={updateExperience}
            onDelete={deleteExperience}
          />
        );
      case "education":
        return (
          <EducationForm
            items={data.education}
            onAdd={addEducation}
            onUpdate={updateEducation}
            onDelete={deleteEducation}
          />
        );
      case "skills":
        return (
          <SkillsForm
            skills={data.skills}
            jobTitle={data.personalInfo.title}
            onChange={updateSkills}
          />
        );
      case "projects":
        return (
          <ProjectsForm
            items={data.projects}
            onAdd={addProject}
            onUpdate={updateProject}
            onDelete={deleteProject}
          />
        );
    }
  };

  return (
    <div className={styles.builder}>
      {/* ── Top Bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button className={styles.backBtn} onClick={() => router.push("/")}>
            ← Back
          </button>
          <div className={styles.logo}>
            <span className={styles.logoDot} />
            <span style={{ background: "linear-gradient(135deg,#fff,#94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              CraftCV
            </span>
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
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
            id="save-resume-btn"
          >
            {saving ? "Saving..." : saveStatus === "saved" ? "✓ Saved!" : saveStatus === "login" ? "Login to Save" : "Save"}
          </button>
          <button
            className={styles.exportBtn}
            onClick={handleExportPDF}
            disabled={exporting}
            id="export-pdf-btn"
          >
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
          <span className={styles.previewLabel}>Live Preview — {activeTemplate}</span>
          <div className={styles.previewPaper}>
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
              The Creative template is a premium design. Upgrade your plan to unlock it
              and access all future templates.
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
