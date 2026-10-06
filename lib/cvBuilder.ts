export type BuilderExperience = {
  role: string;
  organisation: string;
  dates: string;
  bullets: string;
};

export type BuilderEducation = {
  qualification: string;
  institution: string;
  dates: string;
};

export type CvBuilderData = {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  skills: string;
  experience: BuilderExperience[];
  education: BuilderEducation[];
  certifications: string;
  additional: string;
};

export const emptyBuilder = (): CvBuilderData => ({
  name: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  website: "",
  summary: "",
  skills: "",
  experience: [{ role: "", organisation: "", dates: "", bullets: "" }],
  education: [{ qualification: "", institution: "", dates: "" }],
  certifications: "",
  additional: ""
});

/** Turn structured form data into plain CV text for analysis / display. */
export function builderToCvText(data: CvBuilderData): string {
  const lines: string[] = [];

  if (data.name.trim()) lines.push(data.name.trim());
  if (data.headline.trim()) lines.push(data.headline.trim());

  const contact = [
    data.email.trim(),
    data.phone.trim(),
    data.location.trim(),
    data.linkedin.trim(),
    data.website.trim()
  ].filter(Boolean);
  if (contact.length) lines.push(contact.join(" | "));

  lines.push("");

  if (data.summary.trim()) {
    lines.push("PROFESSIONAL SUMMARY");
    lines.push(data.summary.trim());
    lines.push("");
  }

  if (data.skills.trim()) {
    lines.push("CORE SKILLS");
    lines.push(
      data.skills
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .join(" • ")
    );
    lines.push("");
  }

  const exp = data.experience.filter(
    (e) => e.role.trim() || e.organisation.trim() || e.bullets.trim()
  );
  if (exp.length) {
    lines.push("EXPERIENCE");
    for (const e of exp) {
      const title = [e.role.trim(), e.organisation.trim()]
        .filter(Boolean)
        .join(" — ");
      if (title) lines.push(title);
      if (e.dates.trim()) lines.push(e.dates.trim());
      for (const b of e.bullets.split("\n").map((x) => x.trim()).filter(Boolean)) {
        lines.push(b.startsWith("•") || b.startsWith("-") ? b : `• ${b}`);
      }
      lines.push("");
    }
  }

  const edu = data.education.filter(
    (e) => e.qualification.trim() || e.institution.trim()
  );
  if (edu.length) {
    lines.push("EDUCATION");
    for (const e of edu) {
      const title = [e.qualification.trim(), e.institution.trim()]
        .filter(Boolean)
        .join(" — ");
      if (title) lines.push(title);
      if (e.dates.trim()) lines.push(e.dates.trim());
      lines.push("");
    }
  }

  if (data.certifications.trim()) {
    lines.push("CERTIFICATIONS");
    for (const c of data.certifications
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean)) {
      lines.push(c.startsWith("•") || c.startsWith("-") ? c : `• ${c}`);
    }
    lines.push("");
  }

  if (data.additional.trim()) {
    lines.push("ADDITIONAL INFORMATION");
    for (const a of data.additional
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean)) {
      lines.push(a.startsWith("•") || a.startsWith("-") ? a : `• ${a}`);
    }
  }

  return lines.join("\n").trim();
}

export function isBuilderReady(data: CvBuilderData): boolean {
  const text = builderToCvText(data);
  return text.length >= 40 && Boolean(data.name.trim());
}
