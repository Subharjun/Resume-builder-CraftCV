import { NextRequest, NextResponse } from "next/server";

const CATEGORIES: Record<string, string> = {
  professional: "professional resume template",
  creative: "creative designer resume template",
  minimal: "minimalist resume template modern",
  modern: "modern tech resume template",
  executive: "corporate executive resume template",
};

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") || "professional";
  const query = CATEGORIES[category] || CATEGORIES.professional;
  const apiKey = (process.env.SERPAPI_KEY || "").trim();

  if (!apiKey) {
    return NextResponse.json({ error: "SerpAPI key not configured" }, { status: 500 });
  }

  try {
    const url = new URL("https://serpapi.com/search");
    url.searchParams.set("engine", "google_images");
    url.searchParams.set("q", query);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("num", "16");
    url.searchParams.set("safe", "active");

    console.log("Fetching from SerpAPI:", url.toString().replace(apiKey, "HIDDEN"));
    const res = await fetch(url.toString(), {
      headers: { "Accept": "application/json" },
      cache: 'no-store'
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("SerpAPI error response:", errText);
      throw new Error(`SerpAPI error: ${res.status}`);
    }

    const data = await res.json();
    console.log("SerpAPI data keys:", Object.keys(data));

    const images = (data.images_results ?? []).slice(0, 12).map(
      (item: any) => ({
        thumbnail: item.thumbnail,
        title: item.title || "Resume Template",
        source: item.link,
        original: item.original || item.thumbnail,
      })
    );

    return NextResponse.json({ images, category });
  } catch (error: any) {
    console.error("Search templates error:", error.message, error.stack);
    return NextResponse.json({ error: error.message || "Failed to fetch templates" }, { status: 500 });
  }
}
