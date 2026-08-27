// KCSE grade → points and matching helpers.
export const KCSE_GRADES = [
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "E",
] as const;
export type Grade = (typeof KCSE_GRADES)[number];

export const GRADE_POINTS: Record<Grade, number> = {
  A: 12,
  "A-": 11,
  "B+": 10,
  B: 9,
  "B-": 8,
  "C+": 7,
  C: 6,
  "C-": 5,
  "D+": 4,
  D: 3,
  "D-": 2,
  E: 1,
};

// Standard KCSE subjects grouped
export const KCSE_SUBJECTS = [
  { code: "ENG", name: "English", group: "Languages" },
  { code: "KIS", name: "Kiswahili", group: "Languages" },
  { code: "MAT", name: "Mathematics", group: "Sciences" },
  { code: "BIO", name: "Biology", group: "Sciences" },
  { code: "CHE", name: "Chemistry", group: "Sciences" },
  { code: "PHY", name: "Physics", group: "Sciences" },
  { code: "HIS", name: "History & Government", group: "Humanities" },
  { code: "GEO", name: "Geography", group: "Humanities" },
  { code: "CRE", name: "CRE", group: "Humanities" },
  { code: "IRE", name: "IRE", group: "Humanities" },
  { code: "BST", name: "Business Studies", group: "Applied" },
  { code: "AGR", name: "Agriculture", group: "Applied" },
  { code: "COM", name: "Computer Studies", group: "Applied" },
  { code: "HSC", name: "Home Science", group: "Applied" },
  { code: "ART", name: "Art & Design", group: "Applied" },
  { code: "MUS", name: "Music", group: "Applied" },
  { code: "FRE", name: "French", group: "Foreign" },
  { code: "GER", name: "German", group: "Foreign" },
  { code: "ARA", name: "Arabic", group: "Foreign" },
] as const;

export type SubjectCode = (typeof KCSE_SUBJECTS)[number]["code"];
export type Grades = Partial<Record<SubjectCode, Grade>>;

// PDF requirement subject tokens → our canonical SubjectCode(s)
const SUBJECT_ALIASES: Record<string, SubjectCode[]> = {
  ENG: ["ENG"],
  KIS: ["KIS"],
  "MAT A": ["MAT"],
  "MAT B": ["MAT"],
  MAT: ["MAT"],
  BIO: ["BIO"],
  CHE: ["CHE"],
  PHY: ["PHY"],
  "BIO/PHY/CHE": ["BIO", "PHY", "CHE"],
  "PHY/CHE": ["PHY", "CHE"],
  "PHY/BIO": ["PHY", "BIO"],
  "BIO/CHE": ["BIO", "CHE"],
  HIS: ["HIS"],
  GEO: ["GEO"],
  CRE: ["CRE"],
  IRE: ["IRE"],
  "CRE/IRE": ["CRE", "IRE"],
  BST: ["BST"],
  AGR: ["AGR"],
  COM: ["COM"],
  HSC: ["HSC"],
  ART: ["ART"],
  MUS: ["MUS"],
  FRE: ["FRE"],
  GER: ["GER"],
  ARA: ["ARA"],
  // Combined language token from PDF
  "ENG/KIS": ["ENG", "KIS"],
};

export function resolveSubjects(token: string): SubjectCode[] {
  const key = token.toUpperCase().trim();
  return SUBJECT_ALIASES[key] ?? [];
}

export interface PdfRequirement {
  subjects: string[]; // e.g. ["ENG", "KIS"] alternatives, min grade
  min_grade: string;
}

// Compute mean grade points (0-12).
export function meanPoints(grades: Grades): number {
  const values = Object.values(grades).filter(Boolean) as Grade[];
  if (values.length === 0) return 0;
  const total = values.reduce((s, g) => s + GRADE_POINTS[g], 0);
  return total / values.length;
}

// Best-N KCSE point sum
export function bestN(grades: Grades, n: number): number {
  const pts = (Object.values(grades).filter(Boolean) as Grade[])
    .map((g) => GRADE_POINTS[g])
    .sort((a, b) => b - a)
    .slice(0, n);
  return pts.reduce((s, p) => s + p, 0);
}

// Best-4 KCSE point sum (0-48)
export function bestFour(grades: Grades): number {
  return bestN(grades, 4);
}

// Best-7 KCSE point sum (0-84) — used as `t` in the cluster formula
export function bestSeven(grades: Grades): number {
  return bestN(grades, 7);
}

export interface Programme {
  id: string;
  code: string;
  name: string;
  category: string;
  university_id: string;
  cutoff_2023: number | null;
  cutoff_2022: number | null;
  requirements: PdfRequirement[];
  university?: { name: string; is_private: boolean; county: string | null };
}

export interface MatchResult {
  programme: Programme;
  clusterPoints: number; // 0-48, weighted cluster formula
  rawClusterSum: number; // r: sum of 4 cluster subject points (0-48)
  bestSevenTotal: number; // t: best-7 KCSE points (0-84)
  meetsRequirements: boolean;
  qualified: boolean;
  delta: number;
  cutoff: number | null;
  chance: "high" | "moderate" | "competitive" | "unlikely";
  failedSubjects: string[];
}

// Check if student meets a single requirement (alternatives OR-ed)
function meetsRequirement(req: PdfRequirement, grades: Grades): boolean {
  const minPoints = GRADE_POINTS[req.min_grade as Grade] ?? 0;
  return req.subjects.some((token) => {
    const codes = resolveSubjects(token);
    return codes.some((code) => {
      const g = grades[code];
      if (!g) return false;
      return GRADE_POINTS[g] >= minPoints;
    });
  });
}

/**
 * Compute the raw cluster subject sum `r` (0-48) for a programme.
 * For each programme requirement take the best resolved subject grade;
 * pad to 4 slots using the student's next-best remaining subjects.
 */
function computeRawCluster(programme: Programme, grades: Grades): number {
  const reqs = programme.requirements ?? [];
  const usedCodes = new Set<string>();
  const contributions: number[] = [];

  for (const req of reqs) {
    let bestPts = 0;
    let bestCode: string | null = null;
    for (const token of req.subjects) {
      for (const code of resolveSubjects(token)) {
        const g = grades[code];
        if (!g) continue;
        const p = GRADE_POINTS[g];
        if (p > bestPts) {
          bestPts = p;
          bestCode = code;
        }
      }
    }
    if (bestCode) usedCodes.add(bestCode);
    contributions.push(bestPts);
  }

  // Pad to 4 with the student's best remaining (non-cluster) subjects
  const remaining = (Object.entries(grades) as [string, Grade | undefined][])
    .filter(([code, g]) => g && !usedCodes.has(code))
    .map(([, g]) => GRADE_POINTS[g as Grade])
    .sort((a, b) => b - a);
  while (contributions.length < 4 && remaining.length) {
    contributions.push(remaining.shift()!);
  }
  return contributions.slice(0, 4).reduce((s, p) => s + p, 0);
}

/**
 * Weighted cluster point formula:
 *   C = sqrt((r / 48) * (t / 84)) * 48
 * r = sum of 4 cluster subject points, t = best-7 KCSE points.
 */
export function weightedCluster(r: number, t: number): number {
  if (r <= 0 || t <= 0) return 0;
  return Math.sqrt((r / 48) * (t / 84)) * 48;
}

export function matchProgramme(programme: Programme, grades: Grades): MatchResult {
  const r = computeRawCluster(programme, grades);
  const t = bestSeven(grades);
  const cluster = weightedCluster(r, t);
  const failedSubjects: string[] = [];
  let meets = true;
  for (const req of programme.requirements ?? []) {
    if (!meetsRequirement(req, grades)) {
      meets = false;
      failedSubjects.push(`${req.subjects.join("/")} ≥ ${req.min_grade}`);
    }
  }
  const cutoff = programme.cutoff_2023 ?? programme.cutoff_2022;
  let chance: MatchResult["chance"] = "moderate";
  if (!meets) chance = "unlikely";
  else if (cutoff == null) chance = "moderate";
  else if (cluster >= cutoff + 3) chance = "high";
  else if (cluster >= cutoff) chance = "moderate";
  else if (cluster >= cutoff - 2) chance = "competitive";
  else chance = "unlikely";

  const delta = +(cluster - (cutoff ?? 0)).toFixed(3);

  return {
    programme,
    clusterPoints: cluster,
    rawClusterSum: r,
    bestSevenTotal: t,
    meetsRequirements: meets,
    qualified: meets,
    delta,
    cutoff,
    chance,
    failedSubjects,
  };
}

/**
 * Official KUCCPS 23 Cluster Subjects Calculation Engine.
 * Computes exact cluster points (0-48) for all 23 clusters from KCSE grades.
 */
export function calculateAll23Clusters(grades: Grades): Record<number, number> {
  const t = bestSeven(grades);
  if (t === 0) return {};

  const getPt = (code: SubjectCode): number => (grades[code] ? GRADE_POINTS[grades[code]!] : 0);
  const bestOf = (codes: SubjectCode[]): number => Math.max(0, ...codes.map(getPt));

  const bestRemaining = (excludeCodes: SubjectCode[], count: number): number[] => {
    const excluded = new Set(excludeCodes);
    return (Object.entries(grades) as [SubjectCode, Grade | undefined][])
      .filter(([code, g]) => g && !excluded.has(code))
      .map(([, g]) => GRADE_POINTS[g!])
      .sort((a, b) => b - a)
      .slice(0, count);
  };

  const compute = (mandatoryPts: number[], usedCodes: SubjectCode[]): number => {
    const rem = bestRemaining(usedCodes, 4 - mandatoryPts.length);
    const sum4 = [...mandatoryPts, ...rem].slice(0, 4).reduce((a, b) => a + b, 0);
    return +(weightedCluster(sum4, t).toFixed(3));
  };

  const results: Record<number, number> = {};

  // Cluster 1: Law (ENG/KIS, MAT/MAT B, Best Group III, Best other)
  results[1] = compute([bestOf(["ENG", "KIS"]), getPt("MAT"), bestOf(["HIS", "GEO", "CRE", "IRE"])], ["ENG", "KIS", "MAT", "HIS", "GEO", "CRE", "IRE"]);

  // Cluster 2: Business & Hospitality (ENG/KIS, MAT, Best Group III/IV/V, Best other)
  results[2] = compute([bestOf(["ENG", "KIS"]), getPt("MAT"), bestOf(["BST", "GEO", "HIS", "AGR", "HSC"])], ["ENG", "KIS", "MAT", "BST", "GEO", "HIS", "AGR", "HSC"]);

  // Cluster 3: Social Sciences & Media (ENG/KIS, MAT/PHY/CHE/BIO, Best Group III, Best other)
  results[3] = compute([bestOf(["ENG", "KIS"]), bestOf(["MAT", "PHY", "CHE", "BIO"]), bestOf(["HIS", "GEO", "CRE", "IRE"])], ["ENG", "KIS", "MAT", "PHY", "CHE", "BIO", "HIS", "GEO", "CRE", "IRE"]);

  // Cluster 4: Geosciences (MAT, PHY, Best of CHE/GEO/BIO, Best other)
  results[4] = compute([getPt("MAT"), getPt("PHY"), bestOf(["CHE", "GEO", "BIO"])], ["MAT", "PHY", "CHE", "GEO", "BIO"]);

  // Cluster 5: Special Education (ENG/KIS, MAT/Science, Group III, Best other)
  results[5] = compute([bestOf(["ENG", "KIS"]), bestOf(["MAT", "BIO", "CHE", "PHY"]), bestOf(["HIS", "GEO", "CRE", "IRE"])], ["ENG", "KIS", "MAT", "BIO", "CHE", "PHY", "HIS", "GEO", "CRE", "IRE"]);

  // Cluster 6: French & Foreign Languages (FRE, ENG/KIS, Group II/III, Best other)
  results[6] = compute([getPt("FRE"), bestOf(["ENG", "KIS"])], ["FRE", "ENG", "KIS"]);

  // Cluster 7: German (GER, ENG/KIS, Group II/III, Best other)
  results[7] = compute([getPt("GER"), bestOf(["ENG", "KIS"])], ["GER", "ENG", "KIS"]);

  // Cluster 8: Arabic (ARA, ENG/KIS, Group II/III, Best other)
  results[8] = compute([getPt("ARA"), bestOf(["ENG", "KIS"])], ["ARA", "ENG", "KIS"]);

  // Cluster 9: Music (MUS, ENG/KIS, Group II/III, Best other)
  results[9] = compute([getPt("MUS"), bestOf(["ENG", "KIS"])], ["MUS", "ENG", "KIS"]);

  // Cluster 10: Education (Arts) (ENG/KIS, Two teaching subjects from Group III/Applied)
  results[10] = compute([bestOf(["ENG", "KIS"]), bestOf(["HIS", "GEO", "CRE", "IRE", "BST", "AGR", "LIT" as any])], ["ENG", "KIS", "HIS", "GEO", "CRE", "IRE", "BST", "AGR"]);

  // Cluster 11: Education (Science) (Two science subjects, ENG/KIS, Best other)
  results[11] = compute([getPt("MAT"), bestOf(["BIO", "CHE", "PHY"]), bestOf(["ENG", "KIS"])], ["MAT", "BIO", "CHE", "PHY", "ENG", "KIS"]);

  // Cluster 12: Social Work & Humanities (ENG/KIS, Group III, Group II/III, Best other)
  results[12] = compute([bestOf(["ENG", "KIS"]), bestOf(["HIS", "GEO", "CRE", "IRE"])], ["ENG", "KIS", "HIS", "GEO", "CRE", "IRE"]);

  // Cluster 13: Agriculture & Food Science (BIO, CHE, MAT/PHY/GEO, Best other)
  results[13] = compute([getPt("BIO"), getPt("CHE"), bestOf(["MAT", "PHY", "GEO", "AGR"])], ["BIO", "CHE", "MAT", "PHY", "GEO", "AGR"]);

  // Cluster 14: Medicine, Nursing, Pharmacy & Health (BIO, CHE, MAT/PHY, ENG/KIS)
  results[14] = compute([getPt("BIO"), getPt("CHE"), bestOf(["MAT", "PHY"]), bestOf(["ENG", "KIS"])], ["BIO", "CHE", "MAT", "PHY", "ENG", "KIS"]);

  // Cluster 15: Dental Surgery (BIO, CHE, MAT/PHY, ENG/KIS)
  results[15] = compute([getPt("BIO"), getPt("CHE"), bestOf(["MAT", "PHY"]), bestOf(["ENG", "KIS"])], ["BIO", "CHE", "MAT", "PHY", "ENG", "KIS"]);

  // Cluster 16: Construction & Real Estate (MAT, PHY, Best Group III/IV/V, Best other)
  results[16] = compute([getPt("MAT"), getPt("PHY"), bestOf(["CHE", "GEO", "BST", "COM"])], ["MAT", "PHY", "CHE", "GEO", "BST", "COM"]);

  // Cluster 17: Computing, Computer Science & IT (MAT, PHY, Best Science, Best other)
  results[17] = compute([getPt("MAT"), getPt("PHY"), bestOf(["CHE", "BIO", "COM", "GEO"])], ["MAT", "PHY", "CHE", "BIO", "COM", "GEO"]);

  // Cluster 18: General Science & Mathematics (MAT, Science 1, Science 2, Best other)
  results[18] = compute([getPt("MAT"), bestOf(["PHY", "CHE"]), bestOf(["BIO", "GEO"])], ["MAT", "PHY", "CHE", "BIO", "GEO"]);

  // Cluster 19: Actuarial Science (MAT, ENG/KIS, Best Group II/III, Best other)
  results[19] = compute([getPt("MAT"), bestOf(["ENG", "KIS"]), bestOf(["PHY", "CHE", "BST", "GEO"])], ["MAT", "ENG", "KIS", "PHY", "CHE", "BST", "GEO"]);

  // Cluster 20: Engineering & Technology (MAT, PHY, CHE, Best other)
  results[20] = compute([getPt("MAT"), getPt("PHY"), getPt("CHE")], ["MAT", "PHY", "CHE"]);

  // Cluster 21: Architecture & Building (MAT, PHY, Best Group III/IV, Best other)
  results[21] = compute([getPt("MAT"), getPt("PHY"), bestOf(["GEO", "CHE", "BST", "ART"])], ["MAT", "PHY", "GEO", "CHE", "BST", "ART"]);

  // Cluster 22: Environmental Sciences & Forestry (BIO, CHE/GEO, MAT/PHY, Best other)
  results[22] = compute([getPt("BIO"), bestOf(["CHE", "GEO"]), bestOf(["MAT", "PHY", "AGR"])], ["BIO", "CHE", "GEO", "MAT", "PHY", "AGR"]);

  // Cluster 23: Applied Physical Sciences (MAT, PHY, CHE, Best other)
  results[23] = compute([getPt("MAT"), getPt("PHY"), getPt("CHE")], ["MAT", "PHY", "CHE"]);

  return results;
}


export function getProgrammeCluster(p: Programme | { name?: string; category?: string }): number {
  const text = `${p.name || ''} ${p.category || ''}`.toUpperCase();

  if (text.includes("LAW") || text.includes("LLB") || text.includes("LEGAL")) return 1;
  if (text.includes("DENTAL") || text.includes("DENTISTRY")) return 14;
  if (text.includes("MEDICINE") || text.includes("SURGERY") || text.includes("MBCHB") || text.includes("NURSING") || text.includes("PHARMACY") || text.includes("CLINICAL") || text.includes("PUBLIC HEALTH") || text.includes("MEDICAL")) return 13;
  if (text.includes("VETERINARY")) return 18;
  if (text.includes("ENGINEERING") || text.includes("CIVIL") || text.includes("ELECTRICAL") || text.includes("MECHANICAL") || text.includes("MECHATRONIC") || text.includes("PETROLEUM") || text.includes("AERONAUTICAL") || text.includes("GEOMATIC")) return 16;
  if (text.includes("ARCHITECTURE") || text.includes("ARCHITECTURAL") || text.includes("QUANTITY SURVEY") || text.includes("CONSTRUCTION") || text.includes("BUILDING") || text.includes("URBAN PLANNING") || text.includes("REAL ESTATE") || text.includes("LAND ECONOMICS")) return 15;
  if (text.includes("COMPUTER") || text.includes("SOFTWARE") || text.includes("INFORMATION TECHNOLOGY") || text.includes("INFORMATICS") || text.includes("DATA SCIENCE") || text.includes("CYBER") || text.includes("ARTIFICIAL INTELLIGENCE")) return 19;
  if (text.includes("FRENCH") || text.includes("GERMAN") || text.includes("ARABIC") || text.includes("CHINESE")) return 6;
  if (text.includes("SPECIAL EDUCATION") || text.includes("SPECIAL NEEDS")) return 5;
  if (text.includes("EDUCATION") || text.includes("BED") || text.includes("TEACHING")) return 11;
  if (text.includes("THEOLOGY") || text.includes("BIBLICAL") || text.includes("RELIGIOUS") || text.includes("ISLAMIC") || text.includes("DIVINITY") || text.includes("PASTORAL")) return 12;
  if (text.includes("HOSPITALITY") || text.includes("TOURISM") || text.includes("HOTEL") || text.includes("ECOTOURISM")) return 8;
  if (text.includes("FASHION") || text.includes("TEXTILE") || text.includes("CLOTHING") || text.includes("INTERIOR DESIGN")) return 9;
  if (text.includes("PHYSICAL EDUCATION") || text.includes("SPORTS")) return 10;
  if (text.includes("FILM") || text.includes("ANIMATION") || text.includes("THEATRE") || text.includes("MUSIC") || text.includes("FINE ART") || text.includes("GRAPHIC") || text.includes("PERFORMING") || text.includes("DESIGN")) return 7;
  if (text.includes("NUTRITION") || text.includes("DIETETICS")) return 22;
  if (text.includes("AGRIBUSINESS") || text.includes("AGRICULTURAL ECONOMICS")) return 20;
  if (text.includes("AGRICULTUR") || text.includes("HORTICULTUR") || text.includes("AGRONOMY") || text.includes("ANIMAL SCIENCE") || text.includes("SOIL") || text.includes("CROP") || text.includes("FORESTRY") || text.includes("AGROFORESTRY") || text.includes("FISHERIES") || text.includes("AQUACULTURE")) return 17;
  if (text.includes("GEOLOGY") || text.includes("METEOROLOGY") || text.includes("MINING") || text.includes("GEO-SCIENCE") || text.includes("GEOPHYSICS") || text.includes("ENVIRONMENT") || text.includes("WILDLIFE") || text.includes("NATURAL RESOURCE")) return 4;
  if (text.includes("BUSINESS") || text.includes("COMMERCE") || text.includes("ECONOMICS") || text.includes("ACCOUNTING") || text.includes("FINANCE") || text.includes("MARKETING") || text.includes("PROCUREMENT") || text.includes("SUPPLY CHAIN") || text.includes("HUMAN RESOURCE") || text.includes("BBA") || text.includes("BCOM") || text.includes("ENTREPRENEURSHIP")) return 2;
  if (text.includes("ACTUARIAL") || text.includes("MATHEMATIC") || text.includes("STATISTIC") || text.includes("CHEMISTRY") || text.includes("PHYSIC") || text.includes("BIOLOGY") || text.includes("BIOCHEMISTRY") || text.includes("MICROBIOLOGY") || text.includes("BIOTECHNOLOGY") || text.includes("INDUSTRIAL CHEMISTRY") || text.includes("ANALYTICAL") || text.includes("APPLIED SCIENCE") || text.includes("BSC") || text.includes("BACHELOR OF SCIENCE")) return 21;
  
  return 3;
}
