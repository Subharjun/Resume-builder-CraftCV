import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || text.trim().length < 20) {
      return NextResponse.json({ error: "Please paste more LinkedIn profile content" }, { status: 400 });
    }

    const systemPrompt = `You are an expert resume writer and career coach. The user has pasted text from their LinkedIn profile. 
Extract and structure the information into a JSON resume object with these exact keys:
{
  "fullName": string or "",
  "title": string or "",
  "summary": string (professional 2-3 sentence summary based on their About/headline),
  "skills": string (comma-separated relevant skills extracted from their profile),
  "experience": [
    {
      "company": string,
      "position": string,
      "startDate": string (e.g. "Jan 2022"),
      "endDate": string (e.g. "Present" or "Dec 2023"),
      "description": string (3-4 bullet points starting with •, each on new line)
    }
  ],
  "education": [
    {
      "school": string,
      "degree": string,
      "field": string,
      "startDate": string,
      "endDate": string,
      "gpa": ""
    }
  ]
}
Return ONLY valid JSON. If information is missing, use empty string or empty array. Do not invent information.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Parse this LinkedIn profile content into resume JSON:\n\n${text.slice(0, 4000)}` },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // Extract JSON from response
    let structured = null;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) structured = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: "AI could not parse the profile. Try pasting more text." }, { status: 422 });
    }

    return NextResponse.json({ structured, raw });
  } catch (error) {
    console.error("LinkedIn import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
