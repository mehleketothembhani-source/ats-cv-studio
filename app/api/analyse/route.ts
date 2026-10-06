import OpenAI from "openai";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
import { parseAnalysisResult } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function assertInput(value: unknown, label: string) {
  if (typeof value !== "string" || value.trim().length < 40) {
    throw new Error(`${label} is too short or missing.`);
  }
  if (value.length > 500_000) {
    throw new Error(
      `${label} is too long. Please keep it under 500,000 characters.`
    );
  }
}

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { cv, advert } = (body ?? {}) as {
      cv?: unknown;
      advert?: unknown;
    };

    assertInput(cv, "CV");
    assertInput(advert, "Job advert");

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error:
            "OPENAI_API_KEY is not configured. Add it in Netlify → Site settings → Environment variables, then redeploy."
        },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-6-luna";

    const response = await client.responses.create({
      model,
      instructions: SYSTEM_PROMPT,
      input: buildUserPrompt(
        cv as string,
        advert as string,
        new Date().toISOString().slice(0, 10)
      )
    });

    const raw = (response.output_text ?? "").trim();
    if (!raw) {
      return Response.json(
        { error: "The model returned an empty response. Try again." },
        { status: 502 }
      );
    }

    try {
      const result = parseAnalysisResult(raw);
      return Response.json(result);
    } catch (parseErr) {
      console.error("Parse failed. Raw output start:", raw.slice(0, 800));
      return Response.json(
        {
          error:
            parseErr instanceof Error
              ? `Could not parse AI response: ${parseErr.message}`
              : "Could not parse AI response."
        },
        { status: 502 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Analyse error:", message);
    return Response.json({ error: message }, { status: 400 });
  }
}
