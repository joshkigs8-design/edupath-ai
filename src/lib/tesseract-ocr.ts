import { createWorker } from "tesseract.js";

export interface OcrProgressUpdate {
  status: string;
  progress: number;
}

export interface ExtractedClusterResult {
  weights: Record<number, number | null>;
  candidateName?: string;
  rawText: string;
}

/**
 * Parses raw OCR text into the 23 KUCCPS cluster points (0 to 48).
 */
export function parseClusterText(text: string): {
  weights: Record<number, number | null>;
  candidateName?: string;
} {
  const weights: Record<number, number | null> = {};
  for (let i = 1; i <= 23; i++) {
    weights[i] = null;
  }

  // 1. Candidate Name Detection
  let candidateName: string | undefined;
  const nameMatch = text.match(/(?:Name|Candidate|Student)\s*[:=\-]?\s*([A-Za-z\s]{3,35})/i);
  if (nameMatch && nameMatch[1]) {
    candidateName = nameMatch[1].trim();
  }

  // 2. Multi-Pattern Cluster Weights Extraction
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Pattern A: "Cluster 1 ... 38.524" or "C 1 ... 38.524"
    const patternA = /(?:cluster|cl|c)\.?\s*([1-9]|1[0-9]|2[0-3])\b[^\d]*?(\d{1,2}(?:\.\d{1,4})?)/i;
    const matchA = trimmed.match(patternA);
    if (matchA) {
      const clusterNum = parseInt(matchA[1], 10);
      const val = parseFloat(matchA[2]);
      if (clusterNum >= 1 && clusterNum <= 23 && !isNaN(val) && val >= 0 && val <= 48) {
        weights[clusterNum] = Math.round(val * 1000) / 1000;
        continue;
      }
    }

    // Pattern B: "1. 38.524" or "1: 38.524" or "1 - 38.524"
    const patternB = /^\s*([1-9]|1[0-9]|2[0-3])\s*[\.\:\-\)]\s*(\d{1,2}(?:\.\d{1,4})?)/i;
    const matchB = trimmed.match(patternB);
    if (matchB) {
      const clusterNum = parseInt(matchB[1], 10);
      const val = parseFloat(matchB[2]);
      if (clusterNum >= 1 && clusterNum <= 23 && !isNaN(val) && val >= 0 && val <= 48) {
        weights[clusterNum] = Math.round(val * 1000) / 1000;
        continue;
      }
    }

    // Pattern C: Table row with cluster number and decimal points anywhere on the line
    const numbers = trimmed.match(/\b\d{1,2}(?:\.\d{1,4})?\b/g);
    if (numbers && numbers.length >= 2) {
      const firstInt = parseInt(numbers[0], 10);
      const secondFloat = parseFloat(numbers[1]);
      if (firstInt >= 1 && firstInt <= 23 && !isNaN(secondFloat) && secondFloat >= 5 && secondFloat <= 48) {
        weights[firstInt] = Math.round(secondFloat * 1000) / 1000;
      }
    }
  }

  // 3. Global Regex Fallback
  const globalMatches = text.matchAll(/(?:cluster\s*)?([1-9]|1[0-9]|2[0-3])\s*[:=\-]?\s*([0-4]?[0-9]\.[0-9]{1,4})/gi);
  for (const match of globalMatches) {
    const clusterNum = parseInt(match[1], 10);
    const val = parseFloat(match[2]);
    if (clusterNum >= 1 && clusterNum <= 23 && !isNaN(val) && val >= 0 && val <= 48) {
      if (weights[clusterNum] === null) {
        weights[clusterNum] = Math.round(val * 1000) / 1000;
      }
    }
  }

  return { weights, candidateName };
}

/**
 * Execute client-side OCR on an image file using Tesseract.js WebAssembly.
 * 100% free, zero external API keys needed.
 */
export async function performClientOcr(
  imageSource: File | string,
  onProgress?: (update: OcrProgressUpdate) => void
): Promise<ExtractedClusterResult> {
  onProgress?.({ status: "Initializing OCR Engine...", progress: 0.1 });

  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress?.({
          status: `Reading image: ${Math.round(m.progress * 100)}%`,
          progress: 0.2 + m.progress * 0.7,
        });
      }
    },
  });

  try {
    onProgress?.({ status: "Analyzing portal screenshot...", progress: 0.4 });
    const ret = await worker.recognize(imageSource);
    const rawText = ret.data.text || "";

    onProgress?.({ status: "Extracting 23 cluster weights...", progress: 0.95 });
    const parsed = parseClusterText(rawText);

    onProgress?.({ status: "Complete", progress: 1 });
    return {
      weights: parsed.weights,
      candidateName: parsed.candidateName,
      rawText,
    };
  } finally {
    await worker.terminate();
  }
}
