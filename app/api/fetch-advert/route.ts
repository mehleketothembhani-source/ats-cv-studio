export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const TIMEOUT_MS = 30_000;

function isPrivateOrLocalHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "0.0.0.0" ||
    h === "::1" ||
    h.endsWith(".local") ||
    h.endsWith(".internal")
  ) {
    return true;
  }
  // Basic private IPv4 ranges
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true;
  }
  return false;
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|h[1-6]|li|br|tr|section|article)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const urlRaw = typeof body?.url === "string" ? body.url.trim() : "";

    if (!urlRaw) {
      return Response.json({ error: "URL is required." }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(urlRaw);
    } catch {
      return Response.json({ error: "Invalid URL." }, { status: 400 });
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return Response.json(
        { error: "Only http and https URLs are allowed." },
        { status: 400 }
      );
    }

    if (isPrivateOrLocalHost(parsed.hostname)) {
      return Response.json(
        { error: "That host is not allowed." },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(parsed.toString(), {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent":
            "ATS-CV-Studio/1.0 (job-advert fetch; +https://example.local)",
          Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8"
        }
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      return Response.json(
        { error: `Could not fetch page (HTTP ${res.status}).` },
        { status: 400 }
      );
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) {
      return Response.json(
        { error: "Page is too large to process." },
        { status: 400 }
      );
    }

    const raw = buf.toString("utf8");
    let text: string;

    if (
      contentType.includes("text/plain") ||
      contentType.includes("text/markdown")
    ) {
      text = raw.trim();
    } else {
      // Treat as HTML (most job boards)
      text = htmlToPlainText(raw);
    }

    if (text.length < 40) {
      return Response.json(
        {
          error:
            "Could not extract enough text from that page. Try pasting the advert manually."
        },
        { status: 400 }
      );
    }

    if (text.length > 500_000) {
      text = text.slice(0, 500_000);
    }

    return Response.json({ text, source: parsed.toString() });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Timed out while fetching the page."
        : error instanceof Error
          ? error.message
          : "Failed to fetch advert.";
    return Response.json({ error: message }, { status: 400 });
  }
}
