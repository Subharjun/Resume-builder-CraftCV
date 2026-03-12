"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "./Dashboard.module.css";

interface Resume {
  id: string;
  title: string;
  template: string;
  updated_at: string;
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
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }
    setUser(user);

    const { data } = await supabase
      .from("resumes")
      .select("id, title, template, updated_at")
      .order("updated_at", { ascending: false });

    setResumes(data ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this resume?")) return;
    const supabase = createClient();
    await supabase.from("resumes").delete().eq("id", id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

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
                  key={resume.id}
                  href={`/builder?id=${resume.id}`}
                  className={styles.resumeCard}
                  id={`resume-card-${resume.id}`}
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
                          onClick={(e) => handleDelete(resume.id, e)}
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
