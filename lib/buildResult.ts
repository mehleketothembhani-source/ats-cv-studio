import type { AnalysisResult } from "./types";
import type { CvBuilderData } from "./cvBuilder";

/** Build a downloadable AnalysisResult from the form (no AI, no job advert). */
export function analysisFromBuilder(data: CvBuilderData): AnalysisResult {
  const contact = [
    data.email.trim(),
    data.phone.trim(),
    data.location.trim(),
    data.linkedin.trim(),
    data.website.trim()
  ].filter(Boolean);

  const experience = data.experience
    .filter((e) => e.role.trim() || e.organisation.trim())
    .map((e) => ({
      role: e.role.trim() || "Role",
      organisation: e.organisation.trim() || "Organisation",
      dates: e.dates.trim(),
      bullets: e.bullets
        .split("\n")
        .map((b) => b.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean)
    }));

  const education = data.education
    .filter((e) => e.qualification.trim() || e.institution.trim())
    .map((e) => ({
      qualification: e.qualification.trim() || "Qualification",
      institution: e.institution.trim() || "Institution",
      dates: e.dates.trim()
    }));

  const skills = data.skills
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const certifications = data.certifications
    .split("\n")
    .map((c) => c.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  const additional = data.additional
    .split("\n")
    .map((a) => a.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  return {
    job: {
      title: "",
      company: "",
      location: "",
      closingDate: null,
      postingDate: null
    },
    score: 0,
    scoreBreakdown: {
      skills: 0,
      experience: 0,
      education: 0,
      keywords: 0,
      formatting: 15
    },
    matchedKeywords: [],
    missingKeywords: [],
    risks: [],
    timing: {
      recommendation: "Add a job advert to get timing advice.",
      urgency: "unknown",
      reasoning: "No job advert was provided for this download."
    },
    coverLetter: "",
    tailoredCv: {
      name: data.name.trim() || "Candidate",
      contact,
      headline: data.headline.trim(),
      summary: data.summary.trim(),
      skills,
      experience,
      education,
      certifications,
      additional
    }
  };
}

/** Minimal structured result from free-text CV when user only wants a quick PDF shell. */
export function analysisFromPlainCv(text: string, nameHint?: string): AnalysisResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const name = nameHint?.trim() || lines[0] || "Candidate";

  return {
    job: {
      title: "",
      company: "",
      location: "",
      closingDate: null,
      postingDate: null
    },
    score: 0,
    scoreBreakdown: {
      skills: 0,
      experience: 0,
      education: 0,
      keywords: 0,
      formatting: 10
    },
    matchedKeywords: [],
    missingKeywords: [],
    risks: [
      "This PDF was generated from plain text without AI tailoring. Prefer Build CV or full Analyse for a structured result."
    ],
    timing: {
      recommendation: "Add a job advert and run Analyse for a tailored version.",
      urgency: "unknown",
      reasoning: "Plain export only."
    },
    coverLetter: "",
    tailoredCv: {
      name,
      contact: [],
      headline: lines[1] && lines[1].length < 120 ? lines[1] : "",
      summary: text.slice(0, 1200),
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      additional: lines.slice(0, 40)
    }
  };
}
