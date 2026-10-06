import { z } from "zod";
import type { AnalysisResult } from "./types";

const AnalysisSchema = z.object({
  job: z
    .object({
      title: z.string().default(""),
      company: z.string().default(""),
      location: z.string().default(""),
      closingDate: z.string().nullable().default(null),
      postingDate: z.string().nullable().default(null)
    })
    .default({
      title: "",
      company: "",
      location: "",
      closingDate: null,
      postingDate: null
    }),
  score: z.coerce.number().min(0).max(100).default(0),
  scoreBreakdown: z
    .object({
      skills: z.coerce.number().default(0),
      experience: z.coerce.number().default(0),
      education: z.coerce.number().default(0),
      keywords: z.coerce.number().default(0),
      formatting: z.coerce.number().default(0)
    })
    .default({
      skills: 0,
      experience: 0,
      education: 0,
      keywords: 0,
      formatting: 0
    }),
  matchedKeywords: z.array(z.string()).default([]),
  missingKeywords: z
    .array(
      z.object({
        keyword: z.string(),
        type: z.enum(["safe_to_add", "needs_evidence", "not_applicable"]),
        reason: z.string()
      })
    )
    .default([]),
  risks: z.array(z.string()).default([]),
  coverLetter: z.string().optional().transform((v) => v ?? ""),
  timing: z
    .object({
      recommendation: z.string().default(""),
      urgency: z
        .enum(["apply_now", "soon", "prepare_first", "unknown"])
        .default("unknown"),
      reasoning: z.string().default("")
    })
    .default({
      recommendation: "",
      urgency: "unknown",
      reasoning: ""
    }),
  tailoredCv: z.object({
    name: z.string().default("Candidate"),
    contact: z.array(z.string()).default([]),
    headline: z.string().default(""),
    summary: z.string().default(""),
    skills: z.array(z.string()).default([]),
    experience: z
      .array(
        z.object({
          role: z.string().default(""),
          organisation: z.string().default(""),
          dates: z.string().default(""),
          bullets: z.array(z.string()).default([])
        })
      )
      .default([]),
    education: z
      .array(
        z.object({
          qualification: z.string().default(""),
          institution: z.string().default(""),
          dates: z.string().default("")
        })
      )
      .default([]),
    certifications: z.array(z.string()).default([]),
    additional: z.array(z.string()).default([])
  })
});

export function parseAnalysisResult(raw: string): AnalysisResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error("Model returned invalid JSON.");
    }
    try {
      parsed = JSON.parse(raw.slice(start, end + 1));
    } catch {
      throw new Error("Model returned invalid JSON.");
    }
  }

  const result = AnalysisSchema.safeParse(parsed);
  if (!result.success) {
    console.error("Schema validation failed:", result.error.flatten());
    throw new Error(
      "Model returned JSON that does not match the expected schema."
    );
  }

  return result.data as AnalysisResult;
}
