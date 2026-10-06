import { jsPDF } from "jspdf";
import type { AnalysisResult } from "./types";

export type CvThemeId =
  | "classic_clean"
  | "professional_navy"
  | "modern_minimal"
  | "executive_serif"
  | "compact_pro"
  | "academic"
  | "corporate_blue"
  | "forest"
  | "charcoal"
  | "wide_formal"
  | "dense_compact"
  | "underline_sections"
  | "bold_name"
  | "letterspaced"
  | "soft_gray"
  | "strict_bw"
  | "readable_large"
  | "startup_clean"
  | "government"
  | "courier_plain";

export type CvTheme = {
  id: CvThemeId;
  name: string;
  description: string;
  font: "helvetica" | "times" | "courier";
  nameSize: number;
  headlineSize: number;
  bodySize: number;
  headingSize: number;
  margin: number;
  sectionGap: number;
  lineGap: number;
  nameColor: [number, number, number];
  headingColor: [number, number, number];
  bodyColor: [number, number, number];
  mutedColor: [number, number, number];
  ruleColor: [number, number, number];
  uppercaseHeadings: boolean;
  headingLetterSpacing: number;
  ruleUnderHeading: boolean;
  ruleUnderName: boolean;
  boldHeadline: boolean;
};

/** All themes are single-column, standard fonts, no tables/columns/icons — ATS-safe. */
export const CV_THEMES: CvTheme[] = [
  {
    id: "classic_clean",
    name: "Classic Clean",
    description: "Neutral Helvetica, balanced spacing",
    font: "helvetica",
    nameSize: 18,
    headlineSize: 11,
    bodySize: 10,
    headingSize: 11,
    margin: 48,
    sectionGap: 8,
    lineGap: 14,
    nameColor: [21, 27, 35],
    headingColor: [21, 27, 35],
    bodyColor: [49, 57, 67],
    mutedColor: [100, 112, 128],
    ruleColor: [29, 39, 51],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  },
  {
    id: "professional_navy",
    name: "Professional Navy",
    description: "Navy headings, clean body",
    font: "helvetica",
    nameSize: 18,
    headlineSize: 11,
    bodySize: 10,
    headingSize: 11,
    margin: 48,
    sectionGap: 8,
    lineGap: 14,
    nameColor: [15, 40, 80],
    headingColor: [15, 40, 80],
    bodyColor: [40, 48, 58],
    mutedColor: [90, 100, 115],
    ruleColor: [15, 40, 80],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  },
  {
    id: "modern_minimal",
    name: "Modern Minimal",
    description: "Airy spacing, thin rules",
    font: "helvetica",
    nameSize: 20,
    headlineSize: 11,
    bodySize: 10,
    headingSize: 10,
    margin: 54,
    sectionGap: 12,
    lineGap: 15,
    nameColor: [20, 20, 20],
    headingColor: [40, 40, 40],
    bodyColor: [55, 55, 55],
    mutedColor: [120, 120, 120],
    ruleColor: [200, 200, 200],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: true,
    boldHeadline: false
  },
  {
    id: "executive_serif",
    name: "Executive Serif",
    description: "Times-style, formal",
    font: "times",
    nameSize: 20,
    headlineSize: 12,
    bodySize: 11,
    headingSize: 11,
    margin: 50,
    sectionGap: 10,
    lineGap: 15,
    nameColor: [20, 20, 20],
    headingColor: [20, 20, 20],
    bodyColor: [35, 35, 35],
    mutedColor: [90, 90, 90],
    ruleColor: [20, 20, 20],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  },
  {
    id: "compact_pro",
    name: "Compact Pro",
    description: "Tighter spacing for longer CVs",
    font: "helvetica",
    nameSize: 16,
    headlineSize: 10,
    bodySize: 9.5,
    headingSize: 10,
    margin: 40,
    sectionGap: 5,
    lineGap: 12,
    nameColor: [21, 27, 35],
    headingColor: [21, 27, 35],
    bodyColor: [45, 52, 60],
    mutedColor: [100, 110, 120],
    ruleColor: [40, 40, 40],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  },
  {
    id: "academic",
    name: "Academic",
    description: "Traditional serif, scholarly",
    font: "times",
    nameSize: 18,
    headlineSize: 11,
    bodySize: 10.5,
    headingSize: 11,
    margin: 52,
    sectionGap: 9,
    lineGap: 14,
    nameColor: [0, 0, 0],
    headingColor: [0, 0, 0],
    bodyColor: [30, 30, 30],
    mutedColor: [80, 80, 80],
    ruleColor: [0, 0, 0],
    uppercaseHeadings: false,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  },
  {
    id: "corporate_blue",
    name: "Corporate Blue",
    description: "Blue accent headings",
    font: "helvetica",
    nameSize: 18,
    headlineSize: 11,
    bodySize: 10,
    headingSize: 11,
    margin: 48,
    sectionGap: 8,
    lineGap: 14,
    nameColor: [0, 70, 140],
    headingColor: [0, 70, 140],
    bodyColor: [40, 48, 56],
    mutedColor: [100, 110, 120],
    ruleColor: [0, 70, 140],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  },
  {
    id: "forest",
    name: "Forest",
    description: "Deep green headings",
    font: "helvetica",
    nameSize: 18,
    headlineSize: 11,
    bodySize: 10,
    headingSize: 11,
    margin: 48,
    sectionGap: 8,
    lineGap: 14,
    nameColor: [20, 70, 45],
    headingColor: [20, 70, 45],
    bodyColor: [40, 48, 45],
    mutedColor: [90, 105, 95],
    ruleColor: [20, 70, 45],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  },
  {
    id: "charcoal",
    name: "Charcoal Elegant",
    description: "Dark gray, refined",
    font: "helvetica",
    nameSize: 19,
    headlineSize: 11,
    bodySize: 10,
    headingSize: 10.5,
    margin: 50,
    sectionGap: 9,
    lineGap: 14,
    nameColor: [40, 40, 40],
    headingColor: [50, 50, 50],
    bodyColor: [55, 55, 55],
    mutedColor: [110, 110, 110],
    ruleColor: [80, 80, 80],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: true,
    boldHeadline: true
  },
  {
    id: "wide_formal",
    name: "Wide Formal",
    description: "Generous margins, formal",
    font: "times",
    nameSize: 18,
    headlineSize: 11,
    bodySize: 10.5,
    headingSize: 11,
    margin: 64,
    sectionGap: 10,
    lineGap: 15,
    nameColor: [0, 0, 0],
    headingColor: [0, 0, 0],
    bodyColor: [30, 30, 30],
    mutedColor: [90, 90, 90],
    ruleColor: [0, 0, 0],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  },
  {
    id: "dense_compact",
    name: "Dense Compact",
    description: "Maximum content density",
    font: "helvetica",
    nameSize: 15,
    headlineSize: 9.5,
    bodySize: 9,
    headingSize: 9.5,
    margin: 36,
    sectionGap: 4,
    lineGap: 11,
    nameColor: [21, 27, 35],
    headingColor: [21, 27, 35],
    bodyColor: [40, 45, 50],
    mutedColor: [100, 105, 110],
    ruleColor: [60, 60, 60],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  },
  {
    id: "underline_sections",
    name: "Underline Sections",
    description: "Strong section underlines",
    font: "helvetica",
    nameSize: 18,
    headlineSize: 11,
    bodySize: 10,
    headingSize: 11,
    margin: 48,
    sectionGap: 8,
    lineGap: 14,
    nameColor: [21, 27, 35],
    headingColor: [21, 27, 35],
    bodyColor: [45, 52, 60],
    mutedColor: [100, 112, 128],
    ruleColor: [21, 27, 35],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: true,
    boldHeadline: true
  },
  {
    id: "bold_name",
    name: "Bold Name Focus",
    description: "Large name, simple body",
    font: "helvetica",
    nameSize: 22,
    headlineSize: 11,
    bodySize: 10,
    headingSize: 10.5,
    margin: 48,
    sectionGap: 8,
    lineGap: 14,
    nameColor: [10, 10, 10],
    headingColor: [30, 30, 30],
    bodyColor: [50, 50, 50],
    mutedColor: [110, 110, 110],
    ruleColor: [180, 180, 180],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: false
  },
  {
    id: "letterspaced",
    name: "Letterspaced Heads",
    description: "Spaced section titles",
    font: "helvetica",
    nameSize: 17,
    headlineSize: 10.5,
    bodySize: 10,
    headingSize: 10,
    margin: 48,
    sectionGap: 9,
    lineGap: 14,
    nameColor: [21, 27, 35],
    headingColor: [21, 27, 35],
    bodyColor: [49, 57, 67],
    mutedColor: [100, 112, 128],
    ruleColor: [29, 39, 51],
    uppercaseHeadings: true,
    headingLetterSpacing: 1.5,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  },
  {
    id: "soft_gray",
    name: "Soft Gray",
    description: "Muted gray hierarchy",
    font: "helvetica",
    nameSize: 18,
    headlineSize: 11,
    bodySize: 10,
    headingSize: 10.5,
    margin: 48,
    sectionGap: 8,
    lineGap: 14,
    nameColor: [60, 60, 60],
    headingColor: [80, 80, 80],
    bodyColor: [70, 70, 70],
    mutedColor: [130, 130, 130],
    ruleColor: [160, 160, 160],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  },
  {
    id: "strict_bw",
    name: "Strict Black & White",
    description: "Pure B&W, maximum ATS safety",
    font: "helvetica",
    nameSize: 18,
    headlineSize: 11,
    bodySize: 10,
    headingSize: 11,
    margin: 48,
    sectionGap: 8,
    lineGap: 14,
    nameColor: [0, 0, 0],
    headingColor: [0, 0, 0],
    bodyColor: [0, 0, 0],
    mutedColor: [60, 60, 60],
    ruleColor: [0, 0, 0],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  },
  {
    id: "readable_large",
    name: "Readable Large",
    description: "Larger body text, accessible",
    font: "helvetica",
    nameSize: 18,
    headlineSize: 12,
    bodySize: 11.5,
    headingSize: 12,
    margin: 50,
    sectionGap: 10,
    lineGap: 16,
    nameColor: [21, 27, 35],
    headingColor: [21, 27, 35],
    bodyColor: [35, 40, 48],
    mutedColor: [90, 100, 110],
    ruleColor: [40, 40, 40],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  },
  {
    id: "startup_clean",
    name: "Startup Clean",
    description: "Contemporary, light rules",
    font: "helvetica",
    nameSize: 19,
    headlineSize: 11,
    bodySize: 10,
    headingSize: 10,
    margin: 48,
    sectionGap: 10,
    lineGap: 14,
    nameColor: [15, 15, 20],
    headingColor: [30, 90, 200],
    bodyColor: [45, 50, 60],
    mutedColor: [110, 115, 125],
    ruleColor: [220, 225, 235],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: false
  },
  {
    id: "government",
    name: "Government Formal",
    description: "Plain serif, no colour accents",
    font: "times",
    nameSize: 16,
    headlineSize: 11,
    bodySize: 10.5,
    headingSize: 11,
    margin: 54,
    sectionGap: 8,
    lineGap: 14,
    nameColor: [0, 0, 0],
    headingColor: [0, 0, 0],
    bodyColor: [0, 0, 0],
    mutedColor: [50, 50, 50],
    ruleColor: [0, 0, 0],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  },
  {
    id: "courier_plain",
    name: "Courier Plain",
    description: "Monospace, highly parseable",
    font: "courier",
    nameSize: 16,
    headlineSize: 10,
    bodySize: 9.5,
    headingSize: 10,
    margin: 44,
    sectionGap: 7,
    lineGap: 13,
    nameColor: [0, 0, 0],
    headingColor: [0, 0, 0],
    bodyColor: [20, 20, 20],
    mutedColor: [70, 70, 70],
    ruleColor: [0, 0, 0],
    uppercaseHeadings: true,
    headingLetterSpacing: 0,
    ruleUnderHeading: true,
    ruleUnderName: false,
    boldHeadline: true
  }
];

export function getTheme(id: string | undefined): CvTheme {
  return CV_THEMES.find((t) => t.id === id) ?? CV_THEMES[0];
}

function spaceHeading(text: string, letterSpacing: number): string {
  if (!letterSpacing || letterSpacing <= 0) return text;
  return text.split("").join(" ");
}

export function downloadCvPdf(
  result: AnalysisResult,
  themeId: string = "classic_clean"
) {
  const theme = getTheme(themeId);
  const cv = result.tailoredCv;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const margin = theme.margin;
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const width = pageWidth - margin * 2;
  let y = margin + 8;

  const setColor = (rgb: [number, number, number]) => {
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const line = (
    text: string,
    size: number,
    bold: boolean,
    gap: number,
    color: [number, number, number]
  ) => {
    doc.setFont(theme.font, bold ? "bold" : "normal");
    doc.setFontSize(size);
    setColor(color);
    const parts = doc.splitTextToSize(text || "", width) as string[];
    ensureSpace(parts.length * gap);
    doc.text(parts, margin, y);
    y += parts.length * gap;
  };

  const rule = () => {
    doc.setDrawColor(
      theme.ruleColor[0],
      theme.ruleColor[1],
      theme.ruleColor[2]
    );
    doc.setLineWidth(0.8);
    doc.line(margin, y - 4, pageWidth - margin, y - 4);
  };

  const heading = (text: string) => {
    y += theme.sectionGap;
    let label = theme.uppercaseHeadings ? text.toUpperCase() : text;
    if (theme.headingLetterSpacing > 0) {
      label = spaceHeading(label, theme.headingLetterSpacing);
    }
    line(label, theme.headingSize, true, theme.lineGap + 1, theme.headingColor);
    if (theme.ruleUnderHeading) {
      rule();
      y += 6;
    }
  };

  line(cv.name || "Candidate", theme.nameSize, true, theme.lineGap + 6, theme.nameColor);
  if (theme.ruleUnderName) {
    rule();
    y += 6;
  }

  if (cv.headline) {
    line(
      cv.headline,
      theme.headlineSize,
      theme.boldHeadline,
      theme.lineGap + 1,
      theme.headingColor
    );
  }

  if (cv.contact?.length) {
    line(
      cv.contact.join(" | "),
      theme.bodySize - 0.5,
      false,
      theme.lineGap,
      theme.mutedColor
    );
  }

  heading("Professional Summary");
  line(cv.summary || "", theme.bodySize, false, theme.lineGap, theme.bodyColor);

  if (cv.skills?.length) {
    heading("Core Skills");
    line(cv.skills.join(" • "), theme.bodySize, false, theme.lineGap, theme.bodyColor);
  }

  if (cv.experience?.length) {
    heading("Experience");
    for (const item of cv.experience) {
      line(
        `${item.role} — ${item.organisation}`,
        theme.bodySize,
        true,
        theme.lineGap,
        theme.bodyColor
      );
      if (item.dates) {
        line(item.dates, theme.bodySize - 0.5, false, theme.lineGap - 1, theme.mutedColor);
      }
      for (const bullet of item.bullets || []) {
        line(`• ${bullet}`, theme.bodySize - 0.5, false, theme.lineGap, theme.bodyColor);
      }
      y += 3;
    }
  }

  if (cv.education?.length) {
    heading("Education");
    for (const item of cv.education) {
      line(
        `${item.qualification} — ${item.institution}`,
        theme.bodySize,
        true,
        theme.lineGap,
        theme.bodyColor
      );
      if (item.dates) {
        line(item.dates, theme.bodySize - 0.5, false, theme.lineGap - 1, theme.mutedColor);
      }
    }
  }

  if (cv.certifications?.length) {
    heading("Certifications");
    for (const item of cv.certifications) {
      line(`• ${item}`, theme.bodySize - 0.5, false, theme.lineGap, theme.bodyColor);
    }
  }

  if (cv.additional?.length) {
    heading("Additional Information");
    for (const item of cv.additional) {
      line(`• ${item}`, theme.bodySize - 0.5, false, theme.lineGap, theme.bodyColor);
    }
  }

  const safeName = (cv.name || "candidate")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  const themeSlug = theme.id.replace(/_/g, "-");
  doc.save(`${safeName}-cv-${themeSlug}.pdf`);
}
