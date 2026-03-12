import { NextRequest, NextResponse } from "next/server";

const CATEGORIES: Record<string, string> = {
  professional: "professional resume template clean ATS 2024",
  creative: "creative designer resume template modern colorful",
  minimal: "minimal resume template simple elegant",
  modern: "modern tech resume template two column",
  executive: "executive senior resume template corporate",
};

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") || "professional";
  const query = CATEGORIES[category] || CATEGORIES.professional;
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "SerpAPI key not configured" }, { status: 500 });
  }

  try {
    const url = new URL("https://serpapi.com/search");
    url.searchParams.set("engine", "google_images");
    url.searchParams.set("q", query);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("num", "12");
    url.searchParams.set("safe", "active");
    url.searchParams.set("ijn", "0");
    url.searchParams.set("imgsz", "large");

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`SerpAPI error: ${res.status}`);

    const data = await res.json();

    const images = (data.images_results ?? []).slice(0, 12).map(
      (item: {
        thumbnail: string;
        title: string;
        link: string;
        original?: string;
      }) => ({
        thumbnail: item.thumbnail,
        title: item.title || "Resume Template",
        source: item.link,
        original: item.original || item.thumbnail,
      })
    );

    return NextResponse.json({ images, category });
  } catch (error) {
    console.error("Search templates error:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}
