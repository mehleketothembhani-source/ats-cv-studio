import OpenAI from "openai";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
import { parseAnalysisResult } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function event(type: string, data: unknown) {
  return encoder.encode(
    `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`
  );
}

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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { cv, advert } = (body ?? {}) as {
    cv?: unknown;
    advert?: unknown;
  };

  try {
    assertInput(cv, "CV");
    assertInput(advert, "Job advert");
  } catch (e) {
    return new Response(
      e instanceof Error ? e.message : "Invalid input",
      { status: 400 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(event("status", { message: "Reading CV…" }));
        controller.enqueue(
          event("status", { message: "Comparing job requirements…" })
        );

        if (!process.env.OPENAI_API_KEY) {
          throw new Error("OPENAI_API_KEY is not configured.");
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

        controller.enqueue(
          event("status", { message: "Building ATS-safe tailored CV…" })
        );

        const raw = (response.output_text ?? "").trim();
        let result;
        try {
          result = parseAnalysisResult(raw);
        } catch (parseErr) {
          console.error("Raw model output:", raw.slice(0, 500));
          throw new Error(
            parseErr instanceof Error
              ? `Could not parse AI response: ${parseErr.message}`
              : "Could not parse AI response."
          );
        }

        controller.enqueue(event("result", result));
        controller.enqueue(event("done", { ok: true }));
      } catch (error) {
        controller.enqueue(
          event("error", {
            message:
              error instanceof Error ? error.message : "Unknown error"
          })
        );
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
