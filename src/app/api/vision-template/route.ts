import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const DEFAULT_STYLE = {
  primaryColor: "#1e1b4b",
  accentColor: "#7c3aed",
  textColor: "#1a202c",
  layout: "sidebar-left" as const,
  fontStyle: "modern" as const,
  hasSidebar: true,
  sidebarWidth: "32%",
  description: "Modern purple sidebar template",
};

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL required" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url" as const,
              image_url: { url: imageUrl as string },
            },
            {
              type: "text" as const,
              text: `Analyze this resume template image and extract its design style.
Return ONLY a valid JSON object with these exact fields:
{
  "primaryColor": "(main background/sidebar hex color, e.g. #1a365d)",
  "accentColor":  "(accent/highlight hex color, e.g. #3182ce)",
  "textColor":    "(main text hex color, e.g. #1a202c)",
  "layout":       "(one of: sidebar-left, sidebar-right, top-banner, two-column, minimal-clean)",
  "fontStyle":    "(one of: modern, classic, elegant, tech, bold)",
  "hasSidebar":   true or false,
  "sidebarWidth": "(percentage like 30% or 35%)",
  "description":  "(10 word max description of the style)"
}
Return ONLY valid JSON. No explanation.`,
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let style = null;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) style = JSON.parse(jsonMatch[0]);
    } catch {
      style = DEFAULT_STYLE;
    }

    return NextResponse.json({ style: style ?? DEFAULT_STYLE, raw });
  } catch (error) {
    console.error("Vision template error:", error);
    return NextResponse.json({ style: DEFAULT_STYLE });
  }
}
