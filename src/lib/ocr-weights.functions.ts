import { createServerFn } from "@tanstack/react-start";

type ExtractInput = { imageDataUrl: string };

export interface ExtractResult {
  weights: Record<number, number | null>;
  candidateName?: string;
}

const OCR_PROMPT =
  'You are an expert OCR AI specializing in Kenyan education documents (KUCCPS cluster points tables and KCSE result slips). ' +
  'Extract the exact numerical cluster points (0.000 to 48.000) for all 23 clusters (Cluster 1 through Cluster 23) and candidate name if present. ' +
  'If a cluster is not visible or blank, return null for that cluster. ' +
  'Return ONLY strict JSON with this exact structure: ' +
  '{"candidateName": "Candidate Name", "weights": {"1": 41.234, "2": null, ..., "23": 38.900}} ' +
  'with keys "1" through "23". Do not include markdown or commentary.';

export const extractWeightsFromImage = createServerFn({ method: "POST" })
  .validator((input: unknown): ExtractInput => {
    const i = input as ExtractInput;
    if (!i || typeof i.imageDataUrl !== "string" || !i.imageDataUrl.startsWith("data:image/")) {
      throw new Error("Invalid image format. Please upload a PNG or JPG.");
    }
    if (i.imageDataUrl.length > 15_000_000) {
      throw new Error("Image too large (max 12MB).");
    }
    return { imageDataUrl: i.imageDataUrl };
  })
  .handler(async ({ data }): Promise<ExtractResult> => {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!geminiKey) {
      throw new Error(
        "Missing GEMINI_API_KEY. Please add GEMINI_API_KEY to your .env file or Vercel Environment Variables."
      );
    }

    const base64Data = data.imageDataUrl.split(",")[1] || "";
    const mimeMatch = data.imageDataUrl.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: OCR_PROMPT },
                { inline_data: { mime_type: mimeType, data: base64Data } },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.1,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini Vision OCR failed (${res.status}): ${errText.slice(0, 150)}`);
      }

      const json = await res.json();
      const rawJsonText: string = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      let parsed: { candidateName?: string; weights?: Record<string, number | null> } = {};
      try {
        parsed = JSON.parse(rawJsonText);
      } catch {
        const match = rawJsonText.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }

      const out: Record<number, number | null> = {};
      for (let i = 1; i <= 23; i++) {
        const val = parsed.weights?.[String(i)];
        if (typeof val === "number" && Number.isFinite(val)) {
          out[i] = Math.min(Math.max(Math.round(val * 1000) / 1000, 0), 48);
        } else {
          out[i] = null;
        }
      }

      return {
        weights: out,
        candidateName: parsed.candidateName ? String(parsed.candidateName).trim() : undefined,
      };
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error("Failed to process image with Gemini Vision.");
    }
  });
