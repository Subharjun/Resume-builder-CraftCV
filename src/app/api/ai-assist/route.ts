import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { type, context } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "summary") {
      systemPrompt =
        "You are an expert resume writer. Write professional, impactful resume summaries in 2-3 sentences. Use active voice, quantify achievements where possible, and avoid generic phrases. Never use 'I'. Return ONLY the summary text, nothing else.";
      userPrompt = `Write a professional resume summary for: ${context}`;
    } else if (type === "experience") {
      systemPrompt =
        "You are an expert resume writer. Rewrite job descriptions as 3-4 strong bullet points starting with powerful action verbs. Quantify impact where possible. Return ONLY bullet points starting with •, nothing else.";
      userPrompt = `Improve this work experience description: ${context}`;
    } else if (type === "skills") {
      systemPrompt =
        "You are a career coach. Suggest 8-10 relevant technical and soft skills as a comma-separated list. Return ONLY the comma-separated skills, nothing else.";
      userPrompt = `Suggest skills for this profile: ${context}`;
    } else {
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 500,
    });

    const result = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Groq API error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
