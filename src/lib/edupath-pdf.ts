import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { meanPoints, bestFour, bestSeven, type Grades, type MatchResult } from "./kcse";

export function downloadReport({
  name,
  grades,
  matches,
}: {
  name: string;
  grades: Grades;
  matches: MatchResult[];
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const now = new Date().toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Header band with Deep Royal Purple #0F52FF
  doc.setFillColor(15, 82, 255);
  doc.rect(0, 0, pageWidth, 95, "F");

  // Secondary accent line (Electric Orange #059669)
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 92, pageWidth, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("EduPath AI", 40, 45);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Smart KCSE Course Guidance · Official KUCCPS 2025/2026 Admissions Report", 40, 68);

  doc.setFontSize(9);
  doc.text(`Generated: ${now}`, pageWidth - 40, 45, { align: "right" });

  // Student Section Card
  doc.setTextColor(11, 11, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(name ? `Candidate: ${name}` : "Candidate Report Summary", 40, 130);

  const mean = meanPoints(grades);
  const best4 = bestFour(grades);
  const best7 = bestSeven(grades);
  const eligibleUniCount = new Set(matches.map((m) => m.programme.university?.name)).size;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 107, 120);
  doc.text(`Mean Grade Points: ${mean.toFixed(2)} pts`, 40, 152);
  doc.text(
    `Best-4 Aggregate (r): ${best4} / 48 pts   ·   Best-7 Aggregate (t): ${best7} / 84 pts`,
    40,
    170,
  );
  doc.text(`Official Cluster Formula: C = √((r/48) × (t/84)) × 48`, 40, 188);
  doc.text(
    `Eligible Degree Programmes: ${matches.length}   ·   Offering Universities: ${eligibleUniCount}`,
    40,
    206,
  );

  // Grades table
  autoTable(doc, {
    startY: 224,
    head: [["Subject Code", "Grade", "Point Equivalent (0-12)"]],
    body: Object.entries(grades)
      .filter(([, g]) => Boolean(g))
      .map(([code, g]) => [code, g as string, `${gradePoints(g as string)} points`]),
    theme: "grid",
    headStyles: { fillColor: [15, 82, 255], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 5 },
    margin: { left: 40, right: 40 },
  });

  // Matches table
  const startY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(11, 11, 20);
  doc.text("Qualified Degree Programmes", 40, startY);

  autoTable(doc, {
    startY: startY + 10,
    head: [["Code", "Programme Name", "University", "2023 Cut-off", "Your Cluster", "Chance"]],
    body: matches
      .slice()
      .sort((a, b) => b.clusterPoints - a.clusterPoints)
      .map((m) => [
        m.programme.code,
        m.programme.name,
        m.programme.university?.name ?? "—",
        m.cutoff != null ? m.cutoff.toFixed(2) : "—",
        m.clusterPoints.toFixed(2),
        m.chance.toUpperCase(),
      ]),
    theme: "striped",
    headStyles: { fillColor: [15, 82, 255], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 180 },
      2: { cellWidth: 140 },
      3: { cellWidth: 60, halign: "right" },
      4: { cellWidth: 65, halign: "right" },
      5: { cellWidth: 70, halign: "center" },
    },
    margin: { left: 40, right: 40 },
    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setTextColor(107, 107, 120);
      doc.text(
        "Data compiled from KUCCPS 2025/2026 Degree Placement Booklet. Cluster points are guidance estimates.",
        40,
        pageHeight - 20,
      );
    },
  });

  const safeName = (name || "student").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  doc.save(`edupath_report_${safeName}.pdf`);
}

const PTS: Record<string, number> = {
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
function gradePoints(g: string): number {
  return PTS[g] ?? 0;
}
