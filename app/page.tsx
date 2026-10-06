"use client";

import { useMemo, useState } from "react";
import type { AnalysisResult } from "@/lib/types";
import { extractTextFromFile } from "@/lib/fileText";
import { downloadCvPdf, CV_THEMES } from "@/lib/pdf";
import {
  emptyBuilder,
  builderToCvText,
  isBuilderReady,
  type CvBuilderData
} from "@/lib/cvBuilder";
import {
  tailoredCvToPlainText,
  downloadPlainText,
  copyToClipboard
} from "@/lib/exportText";
import { analysisFromBuilder } from "@/lib/buildResult";

type CvMode = "upload" | "build";

export default function Home() {
  const [cvMode, setCvMode] = useState<CvMode>("upload");
  const [cv, setCv] = useState("");
  const [builder, setBuilder] = useState<CvBuilderData>(emptyBuilder);
  const [advert, setAdvert] = useState("");
  const [advertUrl, setAdvertUrl] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [profileConsent, setProfileConsent] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [pdfTheme, setPdfTheme] = useState("classic_clean");
  const [copyMsg, setCopyMsg] = useState("");

  const effectiveCv = useMemo(() => {
    if (cvMode === "build") return builderToCvText(builder);
    return cv;
  }, [cvMode, cv, builder]);

  const canDownloadBuilder = useMemo(
    () => isBuilderReady(builder) && !loading,
    [builder, loading]
  );

  const blockedReason = useMemo(() => {
    if (loading || fetchingUrl) return "";
    if (cvMode === "build" && !isBuilderReady(builder)) {
      return "Add at least your name and enough detail (40+ characters) in the builder.";
    }
    if (cvMode === "upload" && effectiveCv.trim().length < 40) {
      return "Add or upload a CV (at least 40 characters).";
    }
    if (advert.trim().length < 40) {
      return "Paste or load a job advert (at least 40 characters) to analyse & tailor.";
    }
    return "";
  }, [loading, fetchingUrl, cvMode, builder, effectiveCv, advert]);

  const canRun = useMemo(() => {
    const cvOk =
      cvMode === "build"
        ? isBuilderReady(builder)
        : effectiveCv.trim().length >= 40;
    return (
      cvOk && advert.trim().length >= 40 && !loading && !fetchingUrl
    );
  }, [cvMode, builder, effectiveCv, advert, loading, fetchingUrl]);

  function updateBuilder<K extends keyof CvBuilderData>(
    key: K,
    value: CvBuilderData[K]
  ) {
    setBuilder((b) => ({ ...b, [key]: value }));
  }

  async function onCvFile(file?: File) {
    if (!file) return;
    setError("");
    setStatus(`Reading ${file.name}…`);
    try {
      setCv(await extractTextFromFile(file));
      setCvMode("upload");
      setStatus("CV loaded.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read file.");
      setStatus("");
    }
  }

  async function onAdvertFile(file?: File) {
    if (!file) return;
    setError("");
    setStatus(`Reading advert from ${file.name}…`);
    try {
      setAdvert(await extractTextFromFile(file));
      setStatus("Job advert loaded from file.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read file.");
      setStatus("");
    }
  }

  async function fetchFromUrl(
    url: string,
    target: "advert" | "profile"
  ) {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a URL first.");
      return;
    }
    if (target === "profile" && !profileConsent) {
      setError(
        "Please confirm you have permission to import that public profile page."
      );
      return;
    }

    setFetchingUrl(true);
    setError("");
    setStatus(
      target === "advert"
        ? "Fetching job advert from link…"
        : "Fetching public profile text…"
    );

    try {
      const res = await fetch("/api/fetch-advert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed })
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || data.error) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      if (!data.text || data.text.length < 40) {
        throw new Error(
          "Could not extract enough text. Try pasting the content manually."
        );
      }

      if (target === "advert") {
        setAdvert(data.text);
        setStatus("Job advert loaded from link.");
      } else {
        setCv(data.text);
        setCvMode("upload");
        setStatus(
          "Profile text loaded. Review it carefully — only public page text was imported."
        );
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not fetch URL. LinkedIn and some sites often block automated access — paste text instead."
      );
      setStatus("");
    } finally {
      setFetchingUrl(false);
    }
  }

  function applyBuilderToCvField() {
    const text = builderToCvText(builder);
    setCv(text);
    setCvMode("upload");
    setStatus("Builder content applied to CV field.");
  }

  function downloadBuilderCv() {
    if (!isBuilderReady(builder)) {
      setError("Fill in your name and enough CV details first.");
      return;
    }
    const built = analysisFromBuilder(builder);
    setResult(built);
    setError("");
    setStatus("CV ready — choose a theme and download PDF or TXT below.");
    // auto-download default theme
    downloadCvPdf(built, pdfTheme);
  }

  async function analyse() {
    setLoading(true);
    setError("");
    setResult(null);
    setStatus("Starting analysis…");

    const cvText =
      cvMode === "build" ? builderToCvText(builder) : cv;

    if (cvText.trim().length < 40) {
      setError("CV is too short.");
      setLoading(false);
      setStatus("");
      return;
    }
    if (advert.trim().length < 40) {
      setError("Job advert is too short.");
      setLoading(false);
      setStatus("");
      return;
    }

    try {
      setStatus("Comparing CV to job advert…");
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: cvText, advert })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          (data && typeof data === "object" && "error" in data
            ? String((data as { error: string }).error)
            : "") || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      if (!data || typeof data !== "object" || !("tailoredCv" in data)) {
        throw new Error("Unexpected response from server.");
      }

      setResult(data as AnalysisResult);
      setStatus("Analysis complete — scroll down to download your CV.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(text: string, label: string) {
    const ok = await copyToClipboard(text);
    setCopyMsg(ok ? `${label} copied.` : "Could not copy — select text manually.");
    setTimeout(() => setCopyMsg(""), 2500);
  }

  return (
    <main>
      <header className="hero">
        <div>
          <span className="eyebrow">ATS CV STUDIO</span>
          <h1>Tailor the CV to the job — without making things up.</h1>
          <p>
            Upload a CV, build one from scratch, or import public profile text
            with permission. Paste or load a job advert, then get a match score,
            gaps, timing advice, cover letter, and an ATS-safe PDF.
          </p>
        </div>
        <div className="principle">
          <strong>Truth &gt; keyword stuffing</strong>
          <span>No invented skills, dates, certificates or achievements.</span>
        </div>
      </header>

      {/* CV mode switch */}
      <div className="modeTabs">
        <button
          type="button"
          className={cvMode === "upload" ? "modeTab active" : "modeTab"}
          onClick={() => setCvMode("upload")}
        >
          I have a CV
        </button>
        <button
          type="button"
          className={cvMode === "build" ? "modeTab active" : "modeTab"}
          onClick={() => setCvMode("build")}
        >
          Build CV from scratch
        </button>
      </div>

      <section className="grid two">
        {/* LEFT: CV */}
        <article className="card">
          <div className="cardHead">
            <div>
              <span className="step">1</span>
              <h2>{cvMode === "build" ? "Build your CV" : "Your CV"}</h2>
            </div>
            {cvMode === "upload" && (
              <label className="upload">
                Upload PDF/DOCX
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={(e) => onCvFile(e.target.files?.[0])}
                />
              </label>
            )}
          </div>

          {cvMode === "upload" ? (
            <>
              <div className="urlRow profileImport">
                <input
                  type="url"
                  className="urlInput"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="Optional: public profile page URL…"
                  disabled={fetchingUrl || loading}
                />
                <button
                  type="button"
                  className="secondary urlBtn"
                  disabled={fetchingUrl || loading || !profileUrl.trim()}
                  onClick={() => void fetchFromUrl(profileUrl, "profile")}
                >
                  {fetchingUrl ? "Fetching…" : "Import page text"}
                </button>
              </div>
              <label className="consent">
                <input
                  type="checkbox"
                  checked={profileConsent}
                  onChange={(e) => setProfileConsent(e.target.checked)}
                />
                <span>
                  I have permission to import text from this public page. I
                  understand LinkedIn and many sites block automated access —
                  pasting profile text works more reliably.
                </span>
              </label>

              <textarea
                value={cv}
                onChange={(e) => setCv(e.target.value)}
                placeholder="Upload your CV, paste text, or import from a public page…"
              />
              <small className={cv.length > 450_000 ? "warn" : undefined}>
                {cv.length.toLocaleString()} characters
                {cv.length > 450_000 ? " (near limit)" : ""}
              </small>
            </>
          ) : (
            <div className="builder">
              <div className="builderGrid">
                <label>
                  Full name *
                  <input
                    value={builder.name}
                    onChange={(e) => updateBuilder("name", e.target.value)}
                    placeholder="Jane Doe"
                  />
                </label>
                <label>
                  Headline
                  <input
                    value={builder.headline}
                    onChange={(e) => updateBuilder("headline", e.target.value)}
                    placeholder="e.g. Marketing Coordinator"
                  />
                </label>
                <label>
                  Email
                  <input
                    value={builder.email}
                    onChange={(e) => updateBuilder("email", e.target.value)}
                    placeholder="jane@email.com"
                  />
                </label>
                <label>
                  Phone
                  <input
                    value={builder.phone}
                    onChange={(e) => updateBuilder("phone", e.target.value)}
                  />
                </label>
                <label>
                  Location
                  <input
                    value={builder.location}
                    onChange={(e) => updateBuilder("location", e.target.value)}
                    placeholder="City, Country"
                  />
                </label>
                <label>
                  LinkedIn (optional)
                  <input
                    value={builder.linkedin}
                    onChange={(e) => updateBuilder("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/…"
                  />
                </label>
              </div>

              <label className="full">
                Professional summary
                <textarea
                  className="builderArea"
                  value={builder.summary}
                  onChange={(e) => updateBuilder("summary", e.target.value)}
                  placeholder="2–4 sentences about your background…"
                />
              </label>

              <label className="full">
                Skills (comma or line separated)
                <textarea
                  className="builderArea short"
                  value={builder.skills}
                  onChange={(e) => updateBuilder("skills", e.target.value)}
                  placeholder="Excel, stakeholder communication, Python…"
                />
              </label>

              <div className="builderSection">
                <div className="builderSectionHead">
                  <strong>Work experience</strong>
                  <button
                    type="button"
                    className="secondary miniBtn"
                    onClick={() =>
                      updateBuilder("experience", [
                        ...builder.experience,
                        { role: "", organisation: "", dates: "", bullets: "" }
                      ])
                    }
                  >
                    + Add role
                  </button>
                </div>
                {builder.experience.map((exp, i) => (
                  <div className="builderBlock" key={i}>
                    <div className="builderGrid">
                      <label>
                        Role
                        <input
                          value={exp.role}
                          onChange={(e) => {
                            const next = [...builder.experience];
                            next[i] = { ...exp, role: e.target.value };
                            updateBuilder("experience", next);
                          }}
                        />
                      </label>
                      <label>
                        Organisation
                        <input
                          value={exp.organisation}
                          onChange={(e) => {
                            const next = [...builder.experience];
                            next[i] = { ...exp, organisation: e.target.value };
                            updateBuilder("experience", next);
                          }}
                        />
                      </label>
                      <label>
                        Dates
                        <input
                          value={exp.dates}
                          onChange={(e) => {
                            const next = [...builder.experience];
                            next[i] = { ...exp, dates: e.target.value };
                            updateBuilder("experience", next);
                          }}
                          placeholder="Jan 2022 – Present"
                        />
                      </label>
                    </div>
                    <label className="full">
                      Bullet points (one per line)
                      <textarea
                        className="builderArea short"
                        value={exp.bullets}
                        onChange={(e) => {
                          const next = [...builder.experience];
                          next[i] = { ...exp, bullets: e.target.value };
                          updateBuilder("experience", next);
                        }}
                        placeholder={"Led weekly reporting for 3 teams\nImproved response time by prioritising tickets"}
                      />
                    </label>
                    {builder.experience.length > 1 && (
                      <button
                        type="button"
                        className="linkish"
                        onClick={() =>
                          updateBuilder(
                            "experience",
                            builder.experience.filter((_, j) => j !== i)
                          )
                        }
                      >
                        Remove role
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="builderSection">
                <div className="builderSectionHead">
                  <strong>Education</strong>
                  <button
                    type="button"
                    className="secondary miniBtn"
                    onClick={() =>
                      updateBuilder("education", [
                        ...builder.education,
                        { qualification: "", institution: "", dates: "" }
                      ])
                    }
                  >
                    + Add education
                  </button>
                </div>
                {builder.education.map((ed, i) => (
                  <div className="builderBlock" key={i}>
                    <div className="builderGrid">
                      <label>
                        Qualification
                        <input
                          value={ed.qualification}
                          onChange={(e) => {
                            const next = [...builder.education];
                            next[i] = { ...ed, qualification: e.target.value };
                            updateBuilder("education", next);
                          }}
                        />
                      </label>
                      <label>
                        Institution
                        <input
                          value={ed.institution}
                          onChange={(e) => {
                            const next = [...builder.education];
                            next[i] = { ...ed, institution: e.target.value };
                            updateBuilder("education", next);
                          }}
                        />
                      </label>
                      <label>
                        Dates
                        <input
                          value={ed.dates}
                          onChange={(e) => {
                            const next = [...builder.education];
                            next[i] = { ...ed, dates: e.target.value };
                            updateBuilder("education", next);
                          }}
                        />
                      </label>
                    </div>
                    {builder.education.length > 1 && (
                      <button
                        type="button"
                        className="linkish"
                        onClick={() =>
                          updateBuilder(
                            "education",
                            builder.education.filter((_, j) => j !== i)
                          )
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <label className="full">
                Certifications (one per line)
                <textarea
                  className="builderArea short"
                  value={builder.certifications}
                  onChange={(e) =>
                    updateBuilder("certifications", e.target.value)
                  }
                />
              </label>
              <label className="full">
                Additional information (languages, interests, etc.)
                <textarea
                  className="builderArea short"
                  value={builder.additional}
                  onChange={(e) => updateBuilder("additional", e.target.value)}
                />
              </label>

              <div className="builderActions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setBuilder(emptyBuilder())}
                >
                  Clear form
                </button>
                <button type="button" className="secondary" onClick={applyBuilderToCvField}>
                  Preview as text
                </button>
                <small>
                  {builderToCvText(builder).length.toLocaleString()} characters
                  generated
                </small>
              </div>
            </div>
          )}
        </article>

        {/* RIGHT: Job advert */}
        <article className="card">
          <div className="cardHead">
            <div>
              <span className="step">2</span>
              <h2>Job advert</h2>
            </div>
            <label className="upload">
              Upload PDF/DOCX
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={(e) => onAdvertFile(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="urlRow">
            <input
              type="url"
              className="urlInput"
              value={advertUrl}
              onChange={(e) => setAdvertUrl(e.target.value)}
              placeholder="Or paste a job advert URL…"
              disabled={fetchingUrl || loading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void fetchFromUrl(advertUrl, "advert");
                }
              }}
            />
            <button
              type="button"
              className="secondary urlBtn"
              disabled={fetchingUrl || loading || !advertUrl.trim()}
              onClick={() => void fetchFromUrl(advertUrl, "advert")}
            >
              {fetchingUrl ? "Fetching…" : "Load from link"}
            </button>
          </div>

          <textarea
            value={advert}
            onChange={(e) => setAdvert(e.target.value)}
            placeholder="Paste the full advert, upload a file, or load from a link…"
          />
          <small className={advert.length > 450_000 ? "warn" : undefined}>
            {advert.length.toLocaleString()} characters
            {advert.length > 450_000 ? " (near limit)" : ""}
          </small>
        </article>
      </section>

      <div className="actionBar">
        <div>
          <strong>{status || "Ready when you are."}</strong>
          <span>
            {blockedReason ||
              "CV data is sent only when you press Analyse. Nothing is stored beyond this request."}
          </span>
        </div>
        <div className="actionButtons">
          {cvMode === "build" && (
            <button
              type="button"
              className="secondary"
              disabled={!canDownloadBuilder}
              onClick={downloadBuilderCv}
            >
              Download CV now
            </button>
          )}
          <button disabled={!canRun} onClick={() => void analyse()}>
            {loading ? "Analysing…" : "Analyse & Tailor CV"}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {copyMsg && <div className="toast">{copyMsg}</div>}

      {result && (
        <>
          <section className="grid three results">
            <article className="card scoreCard">
              <span className="eyebrow">HEURISTIC MATCH</span>
              <div className="score">
                {result.score}
                <small>/100</small>
              </div>
              <p>This is an internal estimate, not an employer ATS score.</p>
              <div className="bars">
                {Object.entries(result.scoreBreakdown).map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="card">
              <span className="eyebrow">APPLICATION TIMING</span>
              <h2>{result.timing.recommendation}</h2>
              <p>{result.timing.reasoning}</p>
              <div className={`badge ${result.timing.urgency}`}>
                {result.timing.urgency.replaceAll("_", " ")}
              </div>
            </article>

            <article className="card">
              <span className="eyebrow">JOB DETECTED</span>
              <h2>{result.job.title || "Role"}</h2>
              <p>{result.job.company || "Company not detected"}</p>
              <dl>
                <div>
                  <dt>Location</dt>
                  <dd>{result.job.location || "—"}</dd>
                </div>
                <div>
                  <dt>Posted</dt>
                  <dd>{result.job.postingDate || "—"}</dd>
                </div>
                <div>
                  <dt>Closes</dt>
                  <dd>{result.job.closingDate || "—"}</dd>
                </div>
              </dl>
            </article>
          </section>

          <section className="grid two">
            <article className="card">
              <span className="eyebrow">MATCHED LANGUAGE</span>
              <h2>Relevant keywords already supported</h2>
              <div className="chips">
                {(result.matchedKeywords ?? []).map((k) => (
                  <span key={k}>{k}</span>
                ))}
              </div>
            </article>

            <article className="card">
              <span className="eyebrow">GAPS</span>
              <h2>Keywords and requirements to review</h2>
              <div className="gapList">
                {(result.missingKeywords ?? []).map((x, i) => (
                  <div key={`${x.keyword}-${i}`} className="gap">
                    <div>
                      <strong>{x.keyword}</strong>
                      <span className={`mini ${x.type}`}>
                        {x.type.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p>{x.reason}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {(result.risks ?? []).length > 0 && (
            <section className="card warning">
              <span className="eyebrow">BEFORE YOU APPLY</span>
              <h2>Potential weaknesses / red flags</h2>
              <ul>
                {result.risks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </section>
          )}

          {(result.coverLetter ?? "").trim().length > 0 && (
            <section className="card">
              <div className="cardHead">
                <div>
                  <span className="eyebrow">COVER LETTER</span>
                  <h2>Truthful draft</h2>
                </div>
                <button
                  type="button"
                  className="secondary"
                  onClick={() =>
                    void handleCopy(result.coverLetter, "Cover letter")
                  }
                >
                  Copy
                </button>
              </div>
              <p className="coverBody">{result.coverLetter}</p>
            </section>
          )}

          <section className="card cvPreview">
            <div className="cardHead">
              <div>
                <span className="eyebrow">TAILORED CV</span>
                <h2>ATS-safe version</h2>
              </div>
            </div>

            <div className="themeBar">
              <label className="themeLabel" htmlFor="pdf-theme">
                PDF theme
                <span>All themes are single-column and ATS-friendly</span>
              </label>
              <select
                id="pdf-theme"
                className="themeSelect"
                value={pdfTheme}
                onChange={(e) => setPdfTheme(e.target.value)}
              >
                {CV_THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.description}
                  </option>
                ))}
              </select>
              <button
                className="secondary"
                onClick={() => downloadCvPdf(result, pdfTheme)}
              >
                Download PDF
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  const text = tailoredCvToPlainText(result);
                  const name = (result.tailoredCv.name || "candidate")
                    .replace(/[^a-z0-9]+/gi, "-")
                    .toLowerCase();
                  downloadPlainText(`${name}-cv.txt`, text);
                }}
              >
                Download TXT
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  void handleCopy(tailoredCvToPlainText(result), "CV text")
                }
              >
                Copy text
              </button>
            </div>

            <div className="paper">
              <h1>{result.tailoredCv.name}</h1>
              <h3>{result.tailoredCv.headline}</h3>
              <p className="contact">
                {(result.tailoredCv.contact ?? []).join(" | ")}
              </p>

              <CvSection title="Professional Summary">
                <p>{result.tailoredCv.summary}</p>
              </CvSection>

              <CvSection title="Core Skills">
                <p>{(result.tailoredCv.skills ?? []).join(" • ")}</p>
              </CvSection>

              <CvSection title="Experience">
                {(result.tailoredCv.experience ?? []).map((x, i) => (
                  <div className="cvItem" key={i}>
                    <strong>
                      {x.role} — {x.organisation}
                    </strong>
                    <span>{x.dates}</span>
                    <ul>
                      {(x.bullets ?? []).map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CvSection>

              <CvSection title="Education">
                {(result.tailoredCv.education ?? []).map((x, i) => (
                  <div className="cvItem" key={i}>
                    <strong>
                      {x.qualification} — {x.institution}
                    </strong>
                    <span>{x.dates}</span>
                  </div>
                ))}
              </CvSection>

              {(result.tailoredCv.certifications ?? []).length > 0 && (
                <CvSection title="Certifications">
                  <ul>
                    {result.tailoredCv.certifications.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </CvSection>
              )}

              {(result.tailoredCv.additional ?? []).length > 0 && (
                <CvSection title="Additional Information">
                  <ul>
                    {result.tailoredCv.additional.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </CvSection>
              )}
            </div>
          </section>
        </>
      )}

      <footer>
        Built as a decision-support tool. Always review the final CV and cover
        letter before submitting. We do not store your CV after the request
        completes.
      </footer>
    </main>
  );
}

function CvSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="cvSection">
      <h4>{title}</h4>
      {children}
    </section>
  );
}
