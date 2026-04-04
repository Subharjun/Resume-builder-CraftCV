"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Dashboard.module.css";

interface Resume {
  _id: string;
  title: string;
  template: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      // Get current user
      const userResponse = await fetch("/api/auth/me");
      if (!userResponse.ok) {
        router.push("/auth/login");
        return;
      }
      const userData = await userResponse.json();
      setUser(userData.user);

      // Get resumes
      const resumesResponse = await fetch("/api/resumes");
      if (resumesResponse.ok) {
        const resumesData = await resumesResponse.json();
        setResumes(resumesData.resumes || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this resume?")) return;
    
    try {
      await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      console.error("Error deleting resume:", error);
    }
  };

  const firstName = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const templateEmoji: Record<string, string> = {
    minimalist: "📄",
    executive: "💼",
  };

  return (
    <div className={styles.dashboard}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoDot} />
            <span className={styles.logoText}>CraftCV</span>
          </Link>
        </div>
        <div className={styles.topBarRight}>
          <span className={styles.userEmail}>{user?.email}</span>
          <button className={styles.signOutBtn} onClick={handleSignOut} id="sign-out-btn">
            Sign Out
          </button>
        </div>
      </div>

      <main className={styles.main}>
        {/* Welcome */}
        <div className={styles.welcomeRow}>
          <div className={styles.welcomeText}>
            <h1 className={styles.greeting}>
              Hey, <span className={styles.greetingSpan}>{firstName}</span> 👋
            </h1>
            <p className={styles.greetingSub}>
              {resumes.length === 0
                ? "Create your first resume and land your dream job."
                : `You have ${resumes.length} resume${resumes.length !== 1 ? "s" : ""}. Keep crafting!`}
            </p>
          </div>
          <Link href="/builder" className={styles.newResumeBtn} id="new-resume-btn">
            ✦ New Resume
          </Link>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{resumes.length}</div>
            <div className={styles.statLabel}>Resumes Created</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              {resumes.filter((r) => r.template === "minimalist").length}
            </div>
            <div className={styles.statLabel}>Minimalist Template</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              {resumes.filter((r) => r.template === "executive").length}
            </div>
            <div className={styles.statLabel}>Executive Template</div>
          </div>
        </div>

        {/* Resumes */}
        <div className={styles.sectionHeading}>Your Resumes</div>

        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
          </div>
        ) : (
          <div className={styles.resumesGrid}>
            {/* Create New card */}
            <Link href="/builder" className={styles.createCard} id="create-resume-card">
              <div className={styles.createIcon}>✦</div>
              Create New Resume
            </Link>

            {resumes.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📋</div>
                <h2 className={styles.emptyTitle}>No resumes yet</h2>
                <p className={styles.emptyDesc}>
                  Click the button above to create your first AI-powered resume in minutes.
                </p>
              </div>
            ) : (
              resumes.map((resume) => (
                <Link
                  key={resume._id}
                  href={`/builder?id=${resume._id}`}
                  className={styles.resumeCard}
                  id={`resume-card-${resume._id}`}
                >
                  <div className={styles.resumePreview}>
                    {templateEmoji[resume.template] ?? "📄"}
                  </div>
                  <div className={styles.resumeInfo}>
                    <div className={styles.resumeTitle}>{resume.title}</div>
                    <div className={styles.resumeMeta}>
                      <span>{timeAgo(resume.updated_at)}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className={styles.templateBadge}>{resume.template}</span>
                        <button
                          className={styles.deleteBtn}
                          onClick={(e) => handleDelete(resume._id, e)}
                          title="Delete resume"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
