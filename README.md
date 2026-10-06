# ATS CV Studio

Tailor a CV to a job advert for **ATS readability**, then **download** a single-column PDF in one of 20 ATS-safe themes.

> Truth over keyword stuffing. No invented skills, jobs, dates, or certificates.

## Main goal

1. User provides a **CV** (upload, paste, or build from scratch)
2. User provides a **job advert** (paste, upload, or URL)
3. App produces a **tailored ATS-safe CV** aligned to the advert (only using real CV facts)
4. User **downloads** the final CV as PDF (20 themes) or TXT

Supporting features: match score, keyword gaps, risks, timing, cover letter, CV builder.

## Quick start (local)

```bash
cd ats-cv-studio
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```
OPENAI_API_KEY=sk-your-real-key
OPENAI_MODEL=gpt-6-luna
```

```bash
npm run dev
```

Open http://localhost:3000

### Happy path

1. Paste or upload your CV **or** use **Build CV from scratch**
2. Paste the full job advert (or load from URL / file)
3. Click **Analyse & Tailor CV**
4. Scroll to **Tailored CV**
5. Pick a **PDF theme** → **Download PDF**

Optional: **Download CV now** on the builder exports a structured PDF without a job advert (not tailored).

## Deploy on Netlify

1. Push this folder to GitHub / GitLab / Bitbucket
2. Netlify → Add new site → Import repository
3. Build settings (also in `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node: `22`
4. **Environment variables** (required):
   - `OPENAI_API_KEY` = your OpenAI API key
   - `OPENAI_MODEL` = `gpt-6-luna` (optional)
5. Deploy

Without `OPENAI_API_KEY`, Analyse will fail. Builder **Download CV now** still works offline in the browser.

## Project structure

```
ats-cv-studio/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # UI: upload, builder, analyse, download
│   ├── globals.css
│   └── api/
│       ├── analyse/route.ts     # Main JSON analyse endpoint (use this)
│       ├── stream/route.ts      # Optional SSE variant
│       └── fetch-advert/route.ts# Fetch public job/profile page text
├── lib/
│   ├── prompts.ts               # ATS system + user prompts
│   ├── types.ts
│   ├── validate.ts              # Zod validation of model JSON
│   ├── pdf.ts                   # 20 ATS-safe PDF themes (jsPDF)
│   ├── fileText.ts              # PDF/DOCX/TXT extraction
│   ├── cvBuilder.ts             # Form → CV text
│   ├── buildResult.ts           # Builder → downloadable result
│   └── exportText.ts            # TXT + clipboard
├── types/mammoth.d.ts
├── package.json
├── tsconfig.json
├── next.config.ts
├── netlify.toml
├── .env.example
└── README.md
```

## ATS-safe PDF rules (all themes)

- Single column
- Standard fonts only: Helvetica, Times, or Courier
- No tables, columns, icons, graphics, or text boxes
- Plain text headings and bullets (selectable text)

## Environment

| Variable       | Required | Default    |
|----------------|----------|------------|
| OPENAI_API_KEY | Yes*     | —          |
| OPENAI_MODEL   | No       | gpt-6-luna |

\*Required for **Analyse & Tailor CV**. Not required for builder-only PDF download.

## Notes

- Job adverts and profile pages are treated as untrusted input (prompt-injection hardened).
- LinkedIn and many sites block automated page fetch; pasting text is more reliable.
- The match score is a **heuristic**, not a guarantee of passing any employer’s ATS.
- Always review the final CV before applying.
