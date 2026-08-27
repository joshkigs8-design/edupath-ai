// Simple sessionStorage store for the student's grade entry and cluster mode.
import type { Grades } from "./kcse";

const KEY = "edupath.grades.v1";
const NAME_KEY = "edupath.name.v1";
const MODE_KEY = "edupath.mode.v1";
const WEIGHTS_KEY = "edupath.weights.v1";
const ACTIVE_WEIGHT_KEY = "edupath.activeWeight.v1";

export type MatchMode = "official" | "estimate";

export function saveGrades(grades: Grades, name?: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(grades));
  if (name !== undefined) sessionStorage.setItem(NAME_KEY, name);
}
export function loadGrades(): { grades: Grades; name: string } {
  if (typeof window === "undefined") return { grades: {}, name: "" };
  try {
    const grades = JSON.parse(sessionStorage.getItem(KEY) ?? "{}");
    const name = sessionStorage.getItem(NAME_KEY) ?? "";
    return { grades, name };
  } catch {
    return { grades: {}, name: "" };
  }
}
export function clearGrades() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
  sessionStorage.removeItem(NAME_KEY);
}

export function saveMode(mode: MatchMode) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(MODE_KEY, mode);
}
export function loadMode(): MatchMode | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(MODE_KEY);
  return v === "official" || v === "estimate" ? v : null;
}

export const CLUSTER_COUNT = 23;
export type ClusterWeights = Record<number, number | null>;

export function saveWeights(weights: ClusterWeights, name?: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
  if (name !== undefined) sessionStorage.setItem(NAME_KEY, name);
}
export function loadWeights(): { weights: ClusterWeights; name: string } {
  if (typeof window === "undefined") return { weights: {}, name: "" };
  try {
    const weights = JSON.parse(sessionStorage.getItem(WEIGHTS_KEY) ?? "{}");
    const name = sessionStorage.getItem(NAME_KEY) ?? "";
    return { weights, name };
  } catch {
    return { weights: {}, name: "" };
  }
}
export function saveActiveWeight(cluster: number) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ACTIVE_WEIGHT_KEY, String(cluster));
}
export function loadActiveWeight(): number | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(ACTIVE_WEIGHT_KEY);
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : null;
}
