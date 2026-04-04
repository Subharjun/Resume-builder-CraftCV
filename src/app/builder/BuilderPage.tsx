"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResumeData, emptyData } from "@/hooks/useResumeData";
import { TemplateId, FormSection } from "@/types/resume";
import MinimalistTemplate from "@/components/builder/templates/MinimalistTemplate";
import ExecutiveTemplate from "@/components/builder/templates/ExecutiveTemplate";
import CreativeTemplate, { CreativeStyle, defaultCreativeStyle } from "@/components/builder/templates/CreativeTemplate";
import TemplateGallery from "@/components/builder/TemplateGallery";
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
  { id: "custom", label: "Sections", icon: "➕" },
];

const TEMPLATES: { id: TemplateId; label: string; locked?: boolean }[] = [
  { id: "minimalist", label: "Minimalist" },
  { id: "executive", label: "Executive" },
  { id: "creative", label: "✦ Creative", locked: true },
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
    addCustomSection, updateCustomSection, removeCustomSection,
    moveSectionItem,
  } = useResumeData(resumeId ? undefined : emptyData);

  const [activeTab, setActiveTab] = useState<FormSection>("personal");
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("minimalist");
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const [showLocked, setShowLocked] = useState(false);
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [creativeStyle, setCreativeStyle] = useState<CreativeStyle>(defaultCreativeStyle);
  const [selectedTemplateImg, setSelectedTemplateImg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "login">("idle");
  const [resumeTitle, setResumeTitle] = useState("Untitled Resume");
  const [editingTitle, setEditingTitle] = useState(false);
  const [loadedResumeId, setLoadedResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Import modal (GitHub + LinkedIn)
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTab, setImportTab] = useState<"github" | "linkedin">("github");
  // GitHub
  const [githubUsername, setGithubUsername] = useState("");
  const [githubImporting, setGithubImporting] = useState(false);
  const [githubError, setGithubError] = useState("");
  // LinkedIn
  const [linkedinText, setLinkedinText] = useState("");
  const [linkedinImporting, setLinkedinImporting] = useState(false);
  const [linkedinError, setLinkedinError] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Load resume from MongoDB if ?id= is present
  const loadResume = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/resumes/${id}`);
      if (!response.ok) {
        console.error("Could not load resume");
        return;
      }

      const { resume } = await response.json();
      setLoadedResumeId(resume._id);
      setResumeTitle(resume.title);
      setActiveTemplate(resume.template as TemplateId);
      loadData(resume.data as typeof emptyData);
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
    if (t.id === "creative") {
      setShowGallery(true);
      setActiveTemplate("creative" as TemplateId);
    } else {
      setActiveTemplate(t.id);
    }
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
      if (data.profile) {
        updatePersonalInfo({ website: data.profile.blog || "", linkedin: `github.com/${username}` });
      }
      if (data.structured) {
        if (data.structured.summary) updateSummary(data.structured.summary);
        if (data.structured.skills) updateSkills(data.structured.skills);
      }
      setShowImportModal(false);
      setGithubUsername("");
      setActiveTab("summary");
    } catch {
      setGithubError("Network error — please try again");
    } finally {
      setGithubImporting(false);
    }
  };

  const handleLinkedinImport = async () => {
    if (linkedinText.trim().length < 20) return;
    setLinkedinImporting(true);
    setLinkedinError("");
    try {
      const res = await fetch("/api/linkedin-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: linkedinText }),
      });
      const data = await res.json();
      if (!res.ok) { setLinkedinError(data.error || "Import failed"); return; }
      const s = data.structured;
      if (s) {
        // Fill personal info
        const personalUpdates: Record<string, string> = {};
        if (s.fullName) personalUpdates.fullName = s.fullName;
        if (s.title) personalUpdates.title = s.title;
        if (Object.keys(personalUpdates).length) updatePersonalInfo(personalUpdates);
        // Fill other sections
        if (s.summary) updateSummary(s.summary);
        if (s.skills) updateSkills(s.skills);
        // Add experiences
        if (s.experience?.length) {
          s.experience.forEach((exp: { company: string; position: string; startDate: string; endDate: string; description: string }) => {
            addExperience();
          });
        }
        // Add education
        if (s.education?.length) {
          s.education.forEach(() => addEducation());
        }
      }
      setShowImportModal(false);
      setLinkedinText("");
      setActiveTab(s?.fullName ? "personal" : "summary");
    } catch {
      setLinkedinError("Network error — please try again");
    } finally {
      setLinkedinImporting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      // Check if user is logged in
      const userResponse = await fetch("/api/auth/me");
      if (!userResponse.ok) {
        setSaveStatus("login");
        setSaving(false);
        return;
      }

      const payload = {
        title: resumeTitle || (data.personalInfo.fullName ? `${data.personalInfo.fullName}'s Resume` : "Untitled Resume"),
        template: activeTemplate,
        data: data as unknown as Record<string, unknown>,
      };

      let response;
      if (loadedResumeId) {
        // Update existing resume
        response = await fetch(`/api/resumes/${loadedResumeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Insert new resume
        response = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const result = await response.json();
          if (result.resume?._id) setLoadedResumeId(result.resume._id);
        }
      }

      if (!response.ok) throw new Error("Save failed");
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
      case "experience": return <ExperienceForm items={data.experience} onAdd={addExperience} onUpdate={updateExperience} onDelete={deleteExperience} onMove={(id, dir) => moveSectionItem("experience", id, dir)} />;
      case "education": return <EducationForm items={data.education} onAdd={addEducation} onUpdate={updateEducation} onDelete={deleteEducation} onMove={(id, dir) => moveSectionItem("education", id, dir)} />;
      case "skills": return <SkillsForm skills={data.skills} jobTitle={data.personalInfo.title} onChange={updateSkills} />;
      case "projects": return <ProjectsForm items={data.projects} onAdd={addProject} onUpdate={updateProject} onDelete={deleteProject} onMove={(id, dir) => moveSectionItem("projects", id, dir)} />;
      case "custom": return (
        <div className={styles.customSectionsList}>
          <h3 className={styles.panelTitle}>Section Manager</h3>
          <p className={styles.panelSub}>Add custom blocks like Achievements, Languages, or Certifications.</p>
          <button className={styles.upgradeBtn} style={{marginTop: 15}} onClick={() => { addCustomSection("NEW SECTION"); setActiveTab("custom"); }}>
            + Add New Block
          </button>
          <div style={{marginTop: 20}}>
            {data.customSections.map(s => (
              <div key={s.id} className={styles.customSectionItem}>
                <div style={{display: "flex", flexDirection: "column", gap: "2px", marginRight: "8px"}}>
                   <button className={styles.moveBtn} onClick={() => moveSectionItem("customSections", s.id, "up")}>▲</button>
                   <button className={styles.moveBtn} onClick={() => moveSectionItem("customSections", s.id, "down")}>▼</button>
                </div>
                <input 
                  className={styles.titleInput} 
                  value={s.title} 
                  onChange={(e) => updateCustomSection(s.id, { title: e.target.value })} 
                />
                <button className={styles.deleteBtn} onClick={() => removeCustomSection(s.id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      );
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
            onClick={() => setShowImportModal(true)}
            id="import-btn"
            title="Import from GitHub or LinkedIn"
          >
            ⤓ Import Profile
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
      <div className={`${styles.body} ${mobileView === 'form' ? styles.bodyShowForm : styles.bodyShowPreview}`}>
        {/* Left: AI/Tools Panel */}
        <div className={styles.formPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>✦ AI ASSISTANT</span>
            <span className={styles.panelSub}>Generate content, then edit directly on the page.</span>
          </div>
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

        {/* Right: Preview Panel (Now with direct editing) */}
        <div className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <span className={styles.previewLabel}>
              {activeTemplate.charAt(0).toUpperCase() + activeTemplate.slice(1)} Portfolio
            </span>
            <div className={styles.editIndicator}>✨ Direct Edit Mode Active</div>
          </div>
          <div className={styles.previewPaper} id="resume-preview">
            {activeTemplate === "minimalist" ? (
              <MinimalistTemplate 
                data={data} 
                updatePersonalInfo={updatePersonalInfo}
                updateSummary={updateSummary}
                updateExperience={updateExperience}
                updateEducation={updateEducation}
                updateProject={updateProject}
                updateSkills={updateSkills}
                updateCustomSection={updateCustomSection}
                addCustomSection={addCustomSection}
                removeCustomSection={removeCustomSection}
              />
            ) : activeTemplate === "executive" ? (
              <ExecutiveTemplate 
                data={data} 
                updatePersonalInfo={updatePersonalInfo}
                updateSummary={updateSummary}
                updateExperience={updateExperience}
                updateEducation={updateEducation}
                updateProject={updateProject}
                updateSkills={updateSkills}
                updateCustomSection={updateCustomSection}
                addCustomSection={addCustomSection}
                removeCustomSection={removeCustomSection}
              />
            ) : (
                <CreativeTemplate 
                  data={data} 
                  style={creativeStyle}
                  updatePersonalInfo={updatePersonalInfo}
                  updateSummary={updateSummary}
                  updateExperience={updateExperience}
                  updateEducation={updateEducation}
                  updateProject={updateProject}
                  updateSkills={updateSkills}
                  updateCustomSection={updateCustomSection}
                  addCustomSection={addCustomSection}
                  removeCustomSection={removeCustomSection}
                />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button (Floating Action Button) */}
      <button 
        className={styles.mobileToggleBtn}
        onClick={() => setMobileView(prev => prev === "form" ? "preview" : "form")}
      >
        {mobileView === "form" ? "👀 View Resume" : "✏️ Edit Info"}
      </button>

      {/* Upgrade Modal → opens gallery */}
      {showLocked && (
        <div className={styles.lockedOverlay} onClick={() => setShowLocked(false)}>
          <div className={styles.lockedCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lockedIcon}>✦</div>
            <div className={styles.upgradeBadge}>PRO</div>
            <h2 className={styles.lockedTitle}>Unlock Creative Templates</h2>
            <p className={styles.lockedDesc}>
              Browse thousands of real resume templates. Pick any style — Groq AI Vision will analyze it and instantly style your resume to match.
            </p>
            <ul className={styles.upgradeFeatures}>
              <li>✓ Browse real templates via AI-powered search</li>
              <li>✓ Groq Vision matches layout, colors & fonts</li>
              <li>✓ Dynamic 2-column creative layout</li>
              <li>✓ Unlimited AI bullet rewrites</li>
            </ul>
            <button
              className={styles.upgradeBtn}
              id="upgrade-btn"
              onClick={() => { setIsUpgraded(true); setShowLocked(false); setShowGallery(true); setActiveTemplate("creative" as TemplateId); }}
            >
              ✦ Upgrade & Choose Style
            </button>
            <button className={styles.lockedClose} onClick={() => setShowLocked(false)}>
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* Template Gallery */}
      {showGallery && (
        <TemplateGallery
          onSelectStyle={(style, imgUrl) => {
            setCreativeStyle(style);
            setSelectedTemplateImg(imgUrl);
            setShowGallery(false);
            setActiveTemplate("creative" as TemplateId);
          }}
          onClose={() => setShowGallery(false)}
        />
      )}

      {/* Unified Import Modal — GitHub + LinkedIn */}
      {showImportModal && (
        <div className={styles.lockedOverlay} onClick={() => setShowImportModal(false)}>
          <div className={styles.lockedCard} onClick={(e) => e.stopPropagation()} style={{maxWidth: 480, padding: "36px 32px"}}>
            <h2 className={styles.lockedTitle} style={{marginBottom: 4}}>Import Profile</h2>
            <p className={styles.lockedDesc} style={{marginBottom: 20}}>Auto-fill your resume from GitHub or LinkedIn.</p>

            {/* Tabs */}
            <div className={styles.importTabs}>
              <button
                className={`${styles.importTab} ${importTab === "github" ? styles.importTabActive : ""}`}
                onClick={() => { setImportTab("github"); setGithubError(""); setLinkedinError(""); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </button>
              <button
                className={`${styles.importTab} ${importTab === "linkedin" ? styles.importTabActive : ""}`}
                onClick={() => { setImportTab("linkedin"); setGithubError(""); setLinkedinError(""); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </button>
            </div>

            {/* GitHub Tab */}
            {importTab === "github" && (
              <div>
                <p className={styles.importHint}>Enter your GitHub username or paste your profile URL.</p>
                <p className={styles.importHint} style={{color: "#a78bfa", marginBottom: 12}}>✦ Fills: Summary, Skills, Projects</p>
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
                  {githubImporting ? <><span className={styles.miniSpinner} /> Importing...</> : <>⤓ Import from GitHub</>}
                </button>
              </div>
            )}

            {/* LinkedIn Tab */}
            {importTab === "linkedin" && (
              <div>
                <p className={styles.importHint}>
                  LinkedIn blocks automated access, so paste your profile text below. On LinkedIn:
                </p>
                <ol className={styles.linkedinSteps}>
                  <li>Open your LinkedIn profile</li>
                  <li>Select all text (Ctrl+A) from About, Experience, and Education sections</li>
                  <li>Copy (Ctrl+C) and paste below</li>
                </ol>
                <p className={styles.importHint} style={{color: "#a78bfa", marginBottom: 8}}>✦ Fills: Name, Title, Summary, Skills, Experience, Education</p>
                <textarea
                  className={styles.githubInput}
                  style={{minHeight: 140, resize: "vertical", lineHeight: 1.5}}
                  placeholder="Paste your LinkedIn profile text here..."
                  value={linkedinText}
                  onChange={(e) => { setLinkedinText(e.target.value); setLinkedinError(""); }}
                  id="linkedin-text-input"
                />
                {linkedinError && <p className={styles.githubError}>{linkedinError}</p>}
                <button
                  className={styles.upgradeBtn}
                  onClick={handleLinkedinImport}
                  disabled={linkedinImporting || linkedinText.trim().length < 20}
                  id="linkedin-import-submit"
                >
                  {linkedinImporting ? <><span className={styles.miniSpinner} /> Generating...</> : <>✦ Generate Resume from LinkedIn</>}
                </button>
              </div>
            )}

            <button className={styles.lockedClose} onClick={() => setShowImportModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
