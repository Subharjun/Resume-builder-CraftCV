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
  } = useResumeData(resumeId ? undefined : emptyData);

  const [activeTab, setActiveTab] = useState<FormSection>("personal");
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("minimalist");
  const [showLocked, setShowLocked] = useState(false);
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "login">("idle");
  const [resumeTitle, setResumeTitle] = useState("Untitled Resume");
  const [editingTitle, setEditingTitle] = useState(false);
  const [loadedResumeId, setLoadedResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // GitHub import
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubImporting, setGithubImporting] = useState(false);
  const [githubError, setGithubError] = useState("");
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
    if (t.locked && !isUpgraded) { setShowLocked(true); return; }
    setActiveTemplate(t.id);
  };

  const handleGithubImport = async () => {
    const username = githubUsername.trim().replace(/.*github\.com\//, "").replace(/\/.*/, "");
    if (!username) return;
    setGithubImporting(true);
    setGithubError("");
    try {
      const res = await fetch("/api/github-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) { setGithubError(data.error || "Import failed"); return; }

      // Fill personal info from GitHub profile
      if (data.profile?.name) {
        updatePersonalInfo({ website: data.profile.blog || "", linkedin: `github.com/${username}` });
      }

      // Fill AI-generated fields
      if (data.structured) {
        if (data.structured.summary) updateSummary(data.structured.summary);
        if (data.structured.skills) updateSkills(data.structured.skills);
        if (data.structured.projects?.length) {
          data.structured.projects.forEach((p: { name: string; description: string; tech: string; link: string }) => {
            addProject();
            // Projects are added empty first — we update the last one
          });
        }
      }
      setShowGithubModal(false);
      setGithubUsername("");
      // Navigate to summary to show result
      setActiveTab("summary");
    } catch {
      setGithubError("Network error — please try again");
    } finally {
      setGithubImporting(false);
    }
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
            className={styles.githubBtn}
            onClick={() => setShowGithubModal(true)}
            id="github-import-btn"
            title="Import from GitHub"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub Import
          </button>
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

      {/* Upgrade Modal for locked template */}
      {showLocked && (
        <div className={styles.lockedOverlay} onClick={() => setShowLocked(false)}>
          <div className={styles.lockedCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lockedIcon}>✦</div>
            <div className={styles.upgradeBadge}>PRO</div>
            <h2 className={styles.lockedTitle}>Unlock Creative Template</h2>
            <p className={styles.lockedDesc}>
              The Creative template features a bold two-column layout with accent colors and modern typography — perfect for design, tech, and creative roles.
            </p>
            <ul className={styles.upgradeFeatures}>
              <li>✓ Creative two-column layout</li>
              <li>✓ All future premium templates</li>
              <li>✓ AI bullet point rewrites (unlimited)</li>
              <li>✓ Priority PDF export</li>
            </ul>
            <button
              className={styles.upgradeBtn}
              id="upgrade-btn"
              onClick={() => { setIsUpgraded(true); setShowLocked(false); setActiveTemplate("creative" as TemplateId); }}
            >
              ✦ Upgrade — Free Demo
            </button>
            <button className={styles.lockedClose} onClick={() => setShowLocked(false)}>
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* GitHub Import Modal */}
      {showGithubModal && (
        <div className={styles.lockedOverlay} onClick={() => setShowGithubModal(false)}>
          <div className={styles.lockedCard} onClick={(e) => e.stopPropagation()} style={{maxWidth: 440}}>
            <div className={styles.lockedIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </div>
            <h2 className={styles.lockedTitle}>Import from GitHub</h2>
            <p className={styles.lockedDesc}>
              Enter your GitHub username or profile URL. AI will read your public repos and bio to auto-fill your Summary, Skills, and Projects sections.
            </p>
            <input
              className={styles.githubInput}
              placeholder="github.com/username or just username"
              value={githubUsername}
              onChange={(e) => { setGithubUsername(e.target.value); setGithubError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleGithubImport(); }}
              id="github-username-input"
              autoFocus
            />
            {githubError && <p className={styles.githubError}>{githubError}</p>}
            <button
              className={styles.upgradeBtn}
              onClick={handleGithubImport}
              disabled={githubImporting || !githubUsername.trim()}
              id="github-import-submit"
            >
              {githubImporting ? (
                <><span className={styles.miniSpinner} /> Importing...</>
              ) : (
                <>⤓ Import & Fill Resume</>
              )}
            </button>
            <button className={styles.lockedClose} onClick={() => setShowGithubModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
