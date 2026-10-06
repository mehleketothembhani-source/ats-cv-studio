export type AnalysisResult = {
  job: {
    title: string;
    company: string;
    location: string;
    closingDate: string | null;
    postingDate: string | null;
  };
  score: number;
  scoreBreakdown: {
    skills: number;
    experience: number;
    education: number;
    keywords: number;
    formatting: number;
  };
  matchedKeywords: string[];
  missingKeywords: Array<{
    keyword: string;
    type: "safe_to_add" | "needs_evidence" | "not_applicable";
    reason: string;
  }>;
  risks: string[];
  timing: {
    recommendation: string;
    urgency: "apply_now" | "soon" | "prepare_first" | "unknown";
    reasoning: string;
  };
  coverLetter: string;
  tailoredCv: {
    name: string;
    contact: string[];
    headline: string;
    summary: string;
    skills: string[];
    experience: Array<{
      role: string;
      organisation: string;
      dates: string;
      bullets: string[];
    }>;
    education: Array<{
      qualification: string;
      institution: string;
      dates: string;
    }>;
    certifications: string[];
    additional: string[];
  };
};
