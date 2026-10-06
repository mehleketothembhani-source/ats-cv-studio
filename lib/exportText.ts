import type { AnalysisResult } from "./types";

export function tailoredCvToPlainText(result: AnalysisResult): string {
  const cv = result.tailoredCv;
  const lines: string[] = [];

  lines.push(cv.name || "Candidate");
  if (cv.headline) lines.push(cv.headline);
  if (cv.contact?.length) lines.push(cv.contact.join(" | "));
  lines.push("");

  lines.push("PROFESSIONAL SUMMARY");
  lines.push(cv.summary || "");
  lines.push("");

  if (cv.skills?.length) {
    lines.push("CORE SKILLS");
    lines.push(cv.skills.join(" • "));
    lines.push("");
  }

  if (cv.experience?.length) {
    lines.push("EXPERIENCE");
    for (const item of cv.experience) {
      lines.push(`${item.role} — ${item.organisation}`);
      if (item.dates) lines.push(item.dates);
      for (const b of item.bullets || []) lines.push(`• ${b}`);
      lines.push("");
    }
  }

  if (cv.education?.length) {
    lines.push("EDUCATION");
    for (const item of cv.education) {
      lines.push(`${item.qualification} — ${item.institution}`);
      if (item.dates) lines.push(item.dates);
      lines.push("");
    }
  }

  if (cv.certifications?.length) {
    lines.push("CERTIFICATIONS");
    for (const c of cv.certifications) lines.push(`• ${c}`);
    lines.push("");
  }

  if (cv.additional?.length) {
    lines.push("ADDITIONAL INFORMATION");
    for (const a of cv.additional) lines.push(`• ${a}`);
  }

  return lines.join("\n").trim();
}

export function downloadPlainText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
