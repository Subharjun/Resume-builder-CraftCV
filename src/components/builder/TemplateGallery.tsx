"use client";
import { useState, useEffect, useCallback } from "react";
import s from "./TemplateGallery.module.css";
import { CreativeStyle } from "./templates/CreativeTemplate";

interface TemplateImage {
  thumbnail: string;
  title: string;
  source: string;
  original: string;
}

interface Props {
  onSelectStyle: (style: CreativeStyle, imageUrl: string) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "professional", label: "Professional" },
  { id: "creative", label: "Creative" },
  { id: "minimal", label: "Minimal" },
  { id: "modern", label: "Modern" },
  { id: "executive", label: "Executive" },
];

export default function TemplateGallery({ onSelectStyle, onClose }: Props) {
  const [category, setCategory] = useState("professional");
  const [images, setImages] = useState<TemplateImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisMsg, setAnalysisMsg] = useState("");

  const fetchTemplates = useCallback(async (cat: string) => {
    setLoading(true);
    setImages([]);
    setSelectedIdx(null);
    try {
      const res = await fetch(`/api/search-templates?category=${cat}`);
      const data = await res.json();
      if (data.images) setImages(data.images);
    } catch {
      console.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates(category);
  }, [category, fetchTemplates]);

  const handleApplyStyle = async () => {
    if (selectedIdx === null) return;
    const img = images[selectedIdx];
    setAnalyzing(true);
    setAnalysisMsg("🔍 Groq Vision is analyzing your template...");

    try {
      const res = await fetch("/api/vision-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: img.thumbnail }),
      });
      const data = await res.json();
      setAnalysisMsg("✦ Style extracted! Applying to your resume...");
      await new Promise((r) => setTimeout(r, 800));
      onSelectStyle(data.style, img.thumbnail);
    } catch {
      setAnalysisMsg("⚠ Could not analyze — applying default creative style.");
      await new Promise((r) => setTimeout(r, 1200));
      onSelectStyle({
        primaryColor: "#1e1b4b",
        accentColor: "#7c3aed",
        textColor: "#1a202c",
        layout: "sidebar-left",
        fontStyle: "modern",
        hasSidebar: true,
        sidebarWidth: "32%",
        description: "Modern purple sidebar",
      }, img.thumbnail);
    } finally {
      setAnalyzing(false);
      setAnalysisMsg("");
    }
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.panel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={s.header}>
          <div>
            <h2 className={s.title}>Choose Your Style</h2>
            <p className={s.subtitle}>
              Groq AI Vision will analyze your chosen template and instantly style your resume to match it.
            </p>
          </div>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Category tabs */}
        <div className={s.categories}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`${s.catBtn} ${category === cat.id ? s.catActive : ""}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className={s.grid}>
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={s.skeleton} />
          ))}
          {!loading && images.map((img, i) => (
            <div
              key={i}
              className={`${s.card} ${selectedIdx === i ? s.cardSelected : ""}`}
              onClick={() => setSelectedIdx(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.thumbnail}
                alt={img.title}
                className={s.thumb}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280' viewBox='0 0 200 280'%3E%3Crect width='200' height='280' fill='%23141824'/%3E%3Ctext x='100' y='140' text-anchor='middle' fill='%234B5563' font-size='12'%3ETemplate%3C/text%3E%3C/svg%3E";
                }}
              />
              {selectedIdx === i && <div className={s.selectedBadge}>✓ Selected</div>}
            </div>
          ))}
          {!loading && images.length === 0 && (
            <div className={s.empty}>No templates found. Try another category.</div>
          )}
        </div>

        {/* Footer */}
        <div className={s.footer}>
          {analyzing ? (
            <div className={s.analyzingMsg}>
              <span className={s.spin} />
              {analysisMsg}
            </div>
          ) : (
            <button
              className={s.applyBtn}
              disabled={selectedIdx === null || analyzing}
              onClick={handleApplyStyle}
              id="apply-template-style"
            >
              {selectedIdx === null
                ? "Click a template to select"
                : "✦ Apply This Style with Groq Vision"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
