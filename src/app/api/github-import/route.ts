import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "GitHub username required" }, { status: 400 });
    }

    // Fetch profile, repos in parallel
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: { "Accept": "application/vnd.github+json", "User-Agent": "CraftCV" },
      }),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=8`, {
        headers: { "Accept": "application/vnd.github+json", "User-Agent": "CraftCV" },
      }),
    ]);

    if (!profileRes.ok) {
      return NextResponse.json({ error: "GitHub user not found" }, { status: 404 });
    }

    const profile = await profileRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    // Build a summary string of top repos
    const repoSummaries = (repos as {
      name: string;
      description: string | null;
      language: string | null;
      html_url: string;
      stargazers_count: number;
    }[])
      .filter((r) => !r.name.includes(username) && r.description) // skip profile readme repo
      .slice(0, 6)
      .map((r) => `${r.name}: ${r.description} [${r.language || ""}] ⭐${r.stargazers_count} ${r.html_url}`)
      .join("\n");

    // Extract unique languages
    const languages = [...new Set(
      (repos as { language: string | null }[])
        .map((r) => r.language)
        .filter(Boolean)
    )].join(", ");

    const githubData = {
      name: profile.name || username,
      bio: profile.bio || "",
      location: profile.location || "",
      blog: profile.blog || "",
      company: profile.company || "",
      publicRepos: profile.public_repos,
      languages,
      repos: repoSummaries,
      avatarUrl: profile.avatar_url,
      profileUrl: profile.html_url,
    };

    // Now call our own AI endpoint to generate resume content
    const aiRes = await fetch(`${req.nextUrl.origin}/api/ai-assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "github",
        context: JSON.stringify(githubData),
      }),
    });

    const aiData = await aiRes.json();

    // Parse AI JSON response
    let structured = null;
    try {
      const raw = aiData.result ?? "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) structured = JSON.parse(jsonMatch[0]);
    } catch {
      // fallback: return raw
    }

    return NextResponse.json({
      profile: githubData,
      structured,
      raw: aiData.result,
    });
  } catch (error) {
    console.error("GitHub import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
