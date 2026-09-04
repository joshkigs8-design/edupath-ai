import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { EduPathLogo } from "../components/EduPathLogo";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Compass,
  Zap,
  Users,
  UploadCloud,
  Award,
  Bot,
  MessageSquare,
  Check,
  X,
  Menu,
  Send,
  MapPin,
  Lock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EduPath AI — AI-Powered Education, Career & University Guidance" },
      {
        name: "description",
        content:
          "EduPath AI turns your KCSE grades, interests and ambitions into a clearer path toward the right Kenyan university course and career.",
      },
      { property: "og:title", content: "EduPath AI — Find the Path That Fits Your Future" },
      {
        property: "og:description",
        content:
          "AI-powered education guidance for Kenyan students. Explore 2,084 degree programmes and 69 universities.",
      },
    ],
  }),
  component: HomePage,
});

interface CourseItem {
  id: string;
  title: string;
  category: "computing" | "health" | "engineering" | "business";
  image: string;
  match: string;
  reqs: string;
  unis: string[];
  career: string;
  clusterCutoff: number;
  marketDemand: "Very High" | "High" | "Moderate";
  description: string;
}

const SAMPLE_COURSES: CourseItem[] = [
  {
    id: "cs",
    title: "B.Sc. Computer Science",
    category: "computing",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
    match: "96% Match",
    reqs: "MAT B+, PHY B, ENG C+, KIS C+",
    unis: ["JKUAT (39.8 pts)", "UoN (41.2 pts)", "Strathmore (38.5 pts)", "KU (37.9 pts)"],
    career: "Software Architect, AI Engineer, Systems Developer",
    clusterCutoff: 39.8,
    marketDemand: "Very High",
    description: "A comprehensive computing degree covering algorithm design, artificial intelligence, software engineering, and cloud infrastructure.",
  },
  {
    id: "ds",
    title: "B.Sc. Data Science & Analytics",
    category: "computing",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    match: "94% Match",
    reqs: "MAT A-, CHE B, BIO B, PHY B",
    unis: ["UoN (40.5 pts)", "Dedan Kimathi (37.2 pts)", "KU (38.1 pts)"],
    career: "Data Scientist, Quantitative Analyst, ML Engineer",
    clusterCutoff: 38.5,
    marketDemand: "Very High",
    description: "Focuses on statistical modeling, big data architectures, predictive analytics, and deep learning algorithms for decision systems.",
  },
  {
    id: "se",
    title: "B.Sc. Software Engineering",
    category: "computing",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    match: "92% Match",
    reqs: "MAT B+, PHY B, ENG C+",
    unis: ["Strathmore (38.0 pts)", "JKUAT (39.1 pts)", "Moi University (36.4 pts)"],
    career: "Full-Stack Dev, Mobile Engineer, Tech Lead",
    clusterCutoff: 37.9,
    marketDemand: "Very High",
    description: "Emphasizes software architecture, devops, agile product development, testing methodologies, and secure cloud applications.",
  },
  {
    id: "med",
    title: "Bachelor of Medicine & Surgery (MBChB)",
    category: "health",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
    match: "95% Match",
    reqs: "BIO A, CHE A, MAT/PHY B+, ENG/KIS B+",
    unis: ["UoN (43.8 pts)", "Moi University (42.9 pts)", "KU (42.5 pts)", "Egerton (41.8 pts)"],
    career: "Medical Doctor, Surgeon, Clinical Specialist",
    clusterCutoff: 43.1,
    marketDemand: "Very High",
    description: "The premier clinical qualification preparing doctors to practice internal medicine, surgery, pediatrics, and public healthcare across Africa.",
  },
  {
    id: "mech",
    title: "B.Sc. Mechanical Engineering",
    category: "engineering",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    match: "91% Match",
    reqs: "MAT A-, PHY A-, CHE B+, ENG C+",
    unis: ["JKUAT (41.4 pts)", "UoN (42.0 pts)", "Technical University of Kenya (38.6 pts)"],
    career: "Robotics Engineer, Automotive Lead, Energy Analyst",
    clusterCutoff: 40.2,
    marketDemand: "High",
    description: "Covers thermodynamics, mechanical design, robotics, advanced materials, and renewable energy conversion systems.",
  },
  {
    id: "civil",
    title: "B.Sc. Civil Engineering",
    category: "engineering",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80",
    match: "89% Match",
    reqs: "MAT A-, PHY B+, CHE B, ENG C+",
    unis: ["UoN (41.7 pts)", "JKUAT (41.1 pts)", "KU (39.5 pts)"],
    career: "Structural Engineer, Project Manager, Urban Planner",
    clusterCutoff: 39.8,
    marketDemand: "High",
    description: "Equips engineers with structural analysis, geotechnical planning, transportation infrastructure, and sustainable water systems design.",
  },
  {
    id: "law",
    title: "Bachelor of Laws (LL.B)",
    category: "business",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    match: "93% Match",
    reqs: "ENG B+, KIS B, MAT C, HIS B+",
    unis: ["UoN (42.1 pts)", "Strathmore (39.5 pts)", "KU (40.8 pts)", "Moi (38.9 pts)"],
    career: "Corporate Advocate, Legal Advisor, Policy Counsel",
    clusterCutoff: 40.5,
    marketDemand: "High",
    description: "Rigorous legal training in constitutional, corporate, international, and commercial law leading to admission to the Kenyan Bar.",
  },
  {
    id: "econ",
    title: "B.Sc. Economics & Statistics",
    category: "business",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    match: "90% Match",
    reqs: "MAT A-, ENG B, BST B, GEO B",
    unis: ["UoN (39.6 pts)", "KU (38.2 pts)", "Chuka (34.5 pts)"],
    career: "Economic Analyst, Risk Consultant, Financial Modeler",
    clusterCutoff: 37.8,
    marketDemand: "High",
    description: "Blends macroeconomic forecasting, microeconomic principles, econometrics, and statistical computation for industry and policy.",
  },
];

const SAMPLE_UNIVERSITIES = [
  {
    name: "University of Nairobi (UoN)",
    type: "public",
    typeLabel: "Public University",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    county: "Nairobi County",
    courses: "180+ Programmes",
    match: "Top Ranked",
    cutoffSample: "Medicine: 43.8 · Law: 42.1 · Comp Sci: 41.2",
    description: "Kenya's flagship university, world-renowned for health sciences, law, and physical sciences research.",
  },
  {
    name: "JKUAT (Jomo Kenyatta)",
    type: "public",
    typeLabel: "Public University",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    county: "Kiambu County",
    courses: "145+ Programmes",
    match: "Engineering & Tech",
    cutoffSample: "Comp Sci: 39.8 · Mech Eng: 41.4 · Elec Eng: 42.0",
    description: "The premier innovation and engineering powerhouse situated in Juja, leading technological research in East Africa.",
  },
  {
    name: "Strathmore University",
    type: "private",
    typeLabel: "Chartered Private",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    county: "Nairobi County",
    courses: "45+ Programmes",
    match: "Business & IT",
    cutoffSample: "Software Eng: 38.0 · Law: 39.5 · BCom: 34.0",
    description: "A globally accredited private institution in Madaraka known for elite business, law, and computing faculties.",
  },
  {
    name: "Kenyatta University (KU)",
    type: "public",
    typeLabel: "Public University",
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=600&q=80",
    county: "Nairobi County",
    courses: "160+ Programmes",
    match: "Research & Medicine",
    cutoffSample: "Civil Eng: 39.5 · Nursing: 39.0 · Pharmacy: 41.5",
    description: "A sprawling, state-of-the-art campus along Thika Road with leading teaching hospitals and digital library systems.",
  },
  {
    name: "USIU-Africa",
    type: "private",
    typeLabel: "Chartered Private",
    image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=600&q=80",
    county: "Nairobi County",
    courses: "35+ Programmes",
    match: "International Focus",
    cutoffSample: "Applied Computer Tech: 36.2 · IR: 35.0",
    description: "Dual-accredited in the United States and Kenya, offering world-class international relations and business curricula.",
  },
  {
    name: "The Kabete National Polytechnic",
    type: "tvet",
    typeLabel: "TVET / College",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    county: "Nairobi County",
    courses: "60+ Diplomas",
    match: "Technical Skills",
    cutoffSample: "Diploma in ICT: C- Entry · Mechanical: C- Entry",
    description: "One of Kenya's oldest and most prestigious national polytechnics offering hands-on technical diplomas and artisan certificates.",
  },
];

const CAREER_DOMAINS = {
  computing: {
    title: "Computing & Software Intelligence",
    tagline: "From entry-level developer to global technology executive.",
    nodes: [
      {
        id: "sw-dev",
        stage: "Stage 01 · Entry",
        title: "Software Developer",
        salary: "KES 80K - 180K/mo",
        skills: "TypeScript, React, Python, REST APIs, Git",
        growth: "+32% 5-Yr Demand",
        desc: "Builds modern web and mobile applications, writes unit tests, and contributes to agile codebases.",
      },
      {
        id: "ai-eng",
        stage: "Stage 02 · Specialization",
        title: "AI / ML Engineer",
        salary: "KES 180K - 350K/mo",
        skills: "PyTorch, LLM Fine-Tuning, Vector DBs, Cloud MLOps",
        growth: "+48% 5-Yr Demand",
        desc: "Designs intelligent agents, natural language interfaces, and computer vision pipelines for production.",
      },
      {
        id: "data-lead",
        stage: "Stage 03 · Analytical",
        title: "Data Science & Analytics Lead",
        salary: "KES 250K - 450K/mo",
        skills: "Statistical Modeling, SQL, Spark, BigQuery",
        growth: "+28% 5-Yr Demand",
        desc: "Derives actionable intelligence from massive datasets to drive strategic business growth.",
      },
      {
        id: "cloud-arch",
        stage: "Stage 04 · Infrastructure",
        title: "Cloud Solutions Architect",
        salary: "KES 350K - 600K/mo",
        skills: "AWS/GCP, Kubernetes, Distributed Systems, Security",
        growth: "+35% 5-Yr Demand",
        desc: "Designs resilient, fault-tolerant infrastructure handling millions of daily customer transactions.",
      },
      {
        id: "founder-cto",
        stage: "Stage 05 · Leadership",
        title: "Technology Founder / CTO",
        salary: "Equity + KES 600K+/mo",
        skills: "Product Vision, Team Scaling, Capital Allocation",
        growth: "Global Scalability",
        desc: "Directs technology strategy, builds engineering cultures, and leads venture-backed startups.",
      },
    ],
  },
  health: {
    title: "Clinical Medicine & Health Innovation",
    tagline: "From medical intern to specialist consultant and healthcare leader.",
    nodes: [
      {
        id: "med-intern",
        stage: "Stage 01 · Entry",
        title: "Medical Officer / Intern",
        salary: "KES 120K - 220K/mo",
        skills: "Clinical Diagnosis, Patient Management, ER Care",
        growth: "High Continuous Demand",
        desc: "Diagnoses illnesses, manages patient wards, and performs emergency triage in national hospitals.",
      },
      {
        id: "resident",
        stage: "Stage 02 · Specialization",
        title: "Senior Resident Specialist",
        salary: "KES 250K - 380K/mo",
        skills: "Specialist Diagnostics, Surgical Skills, Pharmacology",
        growth: "+22% Specialist Deficit",
        desc: "Completes advanced post-graduate residency in pediatrics, cardiology, or general surgery.",
      },
      {
        id: "consultant",
        stage: "Stage 03 · Consultant",
        title: "Consultant Physician / Surgeon",
        salary: "KES 400K - 800K/mo",
        skills: "Complex Surgery, Clinical Leadership, Sub-specialties",
        growth: "Top Tier Medical Rank",
        desc: "Leads clinical departments, performs complex procedures, and mentors junior clinicians.",
      },
      {
        id: "health-dir",
        stage: "Stage 04 · Leadership",
        title: "Hospital Medical Director / WHO Lead",
        salary: "KES 700K - 1.2M/mo",
        skills: "Healthcare Policy, Hospital Ops, Epidemiology",
        growth: "Pan-African Impact",
        desc: "Governs multi-million-dollar medical centers and implements national health interventions.",
      },
    ],
  },
  engineering: {
    title: "Engineering & Built Infrastructure",
    tagline: "From graduate engineer to principal architect and infrastructure director.",
    nodes: [
      {
        id: "grad-eng",
        stage: "Stage 01 · Entry",
        title: "Graduate Project Engineer",
        salary: "KES 90K - 160K/mo",
        skills: "AutoCAD, SolidWorks, Structural Math, Site Audits",
        growth: "+18% Annual Demand",
        desc: "Supervises site construction, reviews technical blueprints, and ensures compliance with EBK standards.",
      },
      {
        id: "pe-eng",
        stage: "Stage 02 · Chartered",
        title: "Professional Engineer (PE / EBK)",
        salary: "KES 200K - 380K/mo",
        skills: "Licensed Sign-Off, Geotechnical Design, Energy Systems",
        growth: "Chartered Prestige",
        desc: "Holds official legal sign-off authority for high-rise commercial structures and mega-civil projects.",
      },
      {
        id: "lead-consult",
        stage: "Stage 03 · Consulting",
        title: "Principal Engineering Consultant",
        salary: "KES 350K - 650K/mo",
        skills: "Feasibility Studies, Environmental Impact, Megaprojects",
        growth: "+24% Infrastructure Growth",
        desc: "Advises government bodies, energy consortiums, and private developers on major transport and energy grids.",
      },
    ],
  },
};

function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [selectedCourseModal, setSelectedCourseModal] = useState<CourseItem | null>(null);
  const [selectedHubItem, setSelectedHubItem] = useState<{ title: string; desc: string } | null>(null);

  const [activeCourseCategory, setActiveCourseCategory] = useState<string>("all");
  const [activeUniType, setActiveUniType] = useState<"all" | "public" | "private" | "tvet">("all");
  const [uniSearchQuery, setUniSearchQuery] = useState("");
  const [activeCareerDomain, setActiveCareerDomain] = useState<keyof typeof CAREER_DOMAINS>("computing");
  const [activeCareerNodeId, setActiveCareerNodeId] = useState("sw-dev");

  const [ocrStep, setOcrStep] = useState<number>(0);
  const [isSimulatingOcr, setIsSimulatingOcr] = useState(false);

  const [chatMessages, setChatMessages] = useState<Array<{ sender: "bot" | "user"; text: string; time: string }>>([
    {
      sender: "bot",
      text: "Hi Josh 👋 I've analyzed your academic profile. You have strong Mathematics (A-) and Biology (A-) grades. What would you like to explore first?",
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  const triggerOcrSimulation = () => {
    setIsSimulatingOcr(true);
    setOcrStep(1);
    setTimeout(() => {
      setOcrStep(2);
      setTimeout(() => {
        setOcrStep(3);
        setTimeout(() => {
          setOcrStep(4);
          setTimeout(() => {
            setOcrStep(5);
            setIsSimulatingOcr(false);
          }, 800);
        }, 800);
      }, 800);
    }, 900);
  };

  const handleChatAction = (prompt: string) => {
    const userMsg = { sender: "user" as const, text: prompt, time: "Just now" };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsBotTyping(true);

    setTimeout(() => {
      let botResponse = "";
      if (prompt.includes("best courses")) {
        botResponse = "Based on your 41.4 cluster points, your top eligible matches include: 1) Computer Science at JKUAT (96% fit) and 2) Medicine at UoN (95% fit), along with 48+ other programmes.";
      } else if (prompt.includes("universities")) {
        botResponse = "You qualify for 12 public universities including JKUAT, UoN, KU, and Moi, plus chartered private institutions like Strathmore and USIU-Africa.";
      } else if (prompt.includes("careers")) {
        botResponse = "Your analytical scores excel in Software Engineering, AI Research, and Clinical Medicine. Software Engineering offers a 48% five-year demand surge across East Africa.";
      } else if (prompt.includes("eligibility")) {
        botResponse = "Verified ✓! You satisfy all mandatory prerequisite gates for engineering, computing, and health sciences (ENG ≥ C+, MAT ≥ B+, PHY ≥ B).";
      } else {
        botResponse = "Great question! With your KCSE profile (Mean Grade A-), you're positioned well above the national median cutoff for over 180 degree options.";
      }
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot" as const, text: botResponse, time: "Just now" },
      ]);
      setIsBotTyping(false);
    }, 700);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput("");
    handleChatAction(text);
  };

  const filteredCourses = SAMPLE_COURSES.filter((c) => {
    if (activeCourseCategory === "all") return true;
    return c.category === activeCourseCategory;
  });

  const filteredUniversities = SAMPLE_UNIVERSITIES.filter((u) => {
    if (activeUniType !== "all" && u.type !== activeUniType) return false;
    if (uniSearchQuery) {
      const q = uniSearchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.county.toLowerCase().includes(q) ||
        u.match.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeDomain = CAREER_DOMAINS[activeCareerDomain];
  const activeNode =
    activeDomain.nodes.find((n) => n.id === activeCareerNodeId) ?? activeDomain.nodes[0];

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-[#0B0F19] antialiased selection:bg-[#0F52FF] selection:text-white relative">
      {/* 1. SOPHISTICATED FLOATING CAPSULE NAVIGATION */}
      <header className="sticky top-4 z-50 mx-auto max-w-6xl px-4">
        <nav className="capsule-navbar rounded-full px-5 py-3.5 flex items-center justify-between shadow-subtle border border-black/[0.08]">
          <Link to="/" className="flex items-center">
            <EduPathLogo size="sm" />
          </Link>

          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#64748B]">
            <a href="#discover" className="hover:text-[#0F52FF] transition-colors">Discover</a>
            <a href="#courses" className="hover:text-[#0F52FF] transition-colors">Courses</a>
            <a href="#universities" className="hover:text-[#0F52FF] transition-colors">Universities</a>
            <a href="#careers" className="hover:text-[#0F52FF] transition-colors">Career Paths</a>
            <a href="#hub" className="hover:text-[#0F52FF] transition-colors">Student Hub</a>
            <a href="#pricing" className="hover:text-[#0F52FF] transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              search={{ mode: "signin" }}
              className="hidden sm:inline-flex text-xs font-bold text-[#0B0F19] hover:text-[#0F52FF] px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="hidden md:inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-bold btn-outline-clean"
            >
              Sign Up
            </Link>
            <Link
              to="/start"
              className="inline-flex items-center gap-1.5 rounded-full px-4 sm:px-5 py-2 text-xs font-bold btn-primary-tech"
            >
              <span>Match Courses</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-full p-2 text-[#0B0F19] hover:bg-black/5"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 p-5 rounded-3xl bg-white/95 backdrop-blur-xl border border-border shadow-elevated animate-fade-in space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <a href="#discover" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-2xl bg-[#FAFAFB] hover:bg-[#EEF4FF] hover:text-[#0F52FF] transition text-center">Discover</a>
              <a href="#courses" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-2xl bg-[#FAFAFB] hover:bg-[#EEF4FF] hover:text-[#0F52FF] transition text-center">Courses</a>
              <a href="#universities" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-2xl bg-[#FAFAFB] hover:bg-[#EEF4FF] hover:text-[#0F52FF] transition text-center">Universities</a>
              <a href="#careers" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-2xl bg-[#FAFAFB] hover:bg-[#EEF4FF] hover:text-[#0F52FF] transition text-center">Career Paths</a>
              <a href="#hub" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-2xl bg-[#FAFAFB] hover:bg-[#EEF4FF] hover:text-[#0F52FF] transition text-center">Student Hub</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-2xl bg-[#FAFAFB] hover:bg-[#EEF4FF] hover:text-[#0F52FF] transition text-center">Pricing</a>
            </div>
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Link to="/auth" search={{ mode: "signin" }} onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 rounded-xl text-xs font-bold btn-outline-clean">Sign In</Link>
                <Link to="/auth" search={{ mode: "signup" }} onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 rounded-xl text-xs font-bold bg-[#EEF4FF] text-[#0F52FF] border border-[#0F52FF]/20">Sign Up</Link>
              </div>
              <Link to="/start" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 rounded-2xl text-xs font-bold btn-primary-tech">Start Course Matching →</Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section id="discover" className="pt-12 pb-20 px-4 sm:pt-20 sm:pb-28 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full badge-blue px-4 py-1.5 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5 text-[#0F52FF]" />
              <span>✦ AI-POWERED EDUCATION GUIDANCE</span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] text-[#0B0F19]">
              Find the path <br />
              that fits your future.
            </h1>
            <p className="text-base sm:text-lg text-[#64748B] max-w-xl leading-relaxed">
              EduPath AI turns your grades, interests and ambitions into a clearer path toward the right course, university and career.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link to="/start" className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-sm sm:text-base font-bold btn-primary-tech">
                <span>Explore My Path</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#experience" className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold btn-outline-clean">
                <span>See How It Works</span>
              </a>
            </div>
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-[#64748B]">
              <span className="flex items-center gap-1.5 text-[#0B0F19] font-semibold">
                <Check className="h-4 w-4 text-[#059669]" /> 100% Free Open Access for Kenyan Students
              </span>
              <span>•</span>
              <span>KCSE • Universities • TVET • Careers</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-border shadow-elevated bg-white">
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80" alt="Kenyan university students" className="h-full w-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full">Nairobi Academic Hub</span>
                  <div className="font-display font-bold text-sm sm:text-base mt-1">Connecting KCSE Candidates with 69 Top Universities</div>
                </div>
              </div>
              <div className="p-6 space-y-4 bg-white">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">YOUR EDU PATH</span>
                    <div className="font-display font-extrabold text-sm text-[#0B0F19]">KCSE PROFILE</div>
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 text-xs border border-emerald-200">Verified ✓</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-[#FAFAFB] border border-border p-2 text-center">
                    <div className="font-display font-extrabold text-sm text-[#0F52FF]">A-</div>
                    <div className="text-[9px] font-semibold text-[#64748B]">Mathematics</div>
                  </div>
                  <div className="rounded-xl bg-[#FAFAFB] border border-border p-2 text-center">
                    <div className="font-display font-extrabold text-sm text-[#0F52FF]">B+</div>
                    <div className="text-[9px] font-semibold text-[#64748B]">English</div>
                  </div>
                  <div className="rounded-xl bg-[#FAFAFB] border border-border p-2 text-center">
                    <div className="font-display font-extrabold text-sm text-[#0F52FF]">A-</div>
                    <div className="text-[9px] font-semibold text-[#64748B]">Biology</div>
                  </div>
                </div>
                <div className="rounded-xl bg-[#EEF4FF] p-3 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#0F52FF]">AI MATCH</div>
                    <div className="font-display font-extrabold text-lg text-[#0B0F19]">94% <span className="text-xs font-normal text-[#64748B]">PATH MATCH</span></div>
                  </div>
                  <span className="rounded-lg bg-[#0F52FF] text-white px-2.5 py-1 text-xs font-bold">Top Match</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {[
                    { name: "Medicine (MBChB)", uni: "UoN" },
                    { name: "Computer Science", uni: "JKUAT" },
                    { name: "Data Science & Analytics", uni: "Dedan Kimathi" },
                    { name: "Software Engineering", uni: "Strathmore" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-[#FAFAFB] border border-border/60 hover:border-[#0F52FF]/40 transition">
                      <div className="font-bold text-[#0B0F19] flex items-center gap-1.5">
                        {i >= 2 ? <Lock className="h-3 w-3 text-[#64748B]" /> : null}
                        <span>{item.name}</span>
                      </div>
                      <div className="text-[10px] text-[#64748B] font-semibold">{item.uni}</div>
                    </div>
                  ))}
                </div>
                <Link to="/start" className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#0F52FF] hover:underline transition pt-1">
                  <span>→ Explore your top matches</span>
                </Link>
              </div>
            </div>
            <div className="hidden sm:block absolute -top-4 -left-4 rounded-2xl bg-white border border-border px-3.5 py-2 shadow-card text-xs font-bold text-[#0B0F19]">
              <span className="text-[#059669] mr-1">✦</span> 94% Course Match
            </div>
            <div className="hidden sm:block absolute -bottom-4 -right-4 rounded-2xl bg-white border border-border px-3.5 py-2 shadow-card text-xs font-bold text-[#0B0F19]">
              <span className="text-[#0F52FF] mr-1">●</span> 12 Universities Matched
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST & STATS */}
      <section className="py-16 border-y border-border bg-white px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0F52FF] mb-1.5">Empirical Credibility</p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0B0F19]">
              Making career decisions less confusing — and more intelligent.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1 p-4 rounded-2xl bg-[#FAFAFB] border border-border">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F52FF]">50K+</div>
              <div className="text-xs font-bold text-[#0B0F19]">Students Guided</div>
              <div className="text-[11px] text-[#64748B]">Across all 47 counties</div>
            </div>
            <div className="space-y-1 p-4 rounded-2xl bg-[#FAFAFB] border border-border">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#059669]">500+</div>
              <div className="text-xs font-bold text-[#0B0F19]">Courses Explored</div>
              <div className="text-[11px] text-[#64748B]">Degrees & TVET pathways</div>
            </div>
            <div className="space-y-1 p-4 rounded-2xl bg-[#FAFAFB] border border-border">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F52FF]">100+</div>
              <div className="text-xs font-bold text-[#0B0F19]">Institutions</div>
              <div className="text-[11px] text-[#64748B]">Public & chartered private</div>
            </div>
            <div className="space-y-1 p-4 rounded-2xl bg-[#FAFAFB] border border-border">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B0F19]">AI-Powered</div>
              <div className="text-xs font-bold text-[#0B0F19]">Personalized Guidance</div>
              <div className="text-[11px] text-[#64748B]">Zero manual calculations</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="group relative h-48 rounded-2xl overflow-hidden border border-border shadow-subtle">
              <img src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=600&q=80" alt="University Library Study" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white text-xs font-bold">Campus Research Libraries</div>
            </div>
            <div className="group relative h-48 rounded-2xl overflow-hidden border border-border shadow-subtle">
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80" alt="Tech & Engineering Labs" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white text-xs font-bold">Computing & Engineering Labs</div>
            </div>
            <div className="group relative h-48 rounded-2xl overflow-hidden border border-border shadow-subtle">
              <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80" alt="University Campuses" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white text-xs font-bold">Kenyan University Campuses</div>
            </div>
            <div className="group relative h-48 rounded-2xl overflow-hidden border border-border shadow-subtle">
              <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80" alt="Graduation Day Convocation" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white text-xs font-bold">Graduation & Career Success</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DILEMMA */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F52FF] mb-2">The Admissions Dilemma</p>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B0F19]">Choosing your future shouldn't feel like guessing.</h2>
          <p className="mt-3 text-sm text-[#64748B] leading-relaxed">Every year, thousands of capable students pick the wrong courses due to confusing booklets, hidden subject gates, and lack of career clarity.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="edupath-card p-7 space-y-3 bg-white border border-border hover:border-[#0F52FF]/30 transition">
            <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 font-bold grid place-items-center text-sm border border-red-100">01</div>
            <h3 className="font-display text-lg font-bold text-[#0B0F19]">Too many choices</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">Hundreds of courses and institutions can make decision-making overwhelming. Students often settle for familiar brand names without exploring high-potential fields.</p>
          </div>
          <div className="edupath-card p-7 space-y-3 bg-white border border-border hover:border-[#0F52FF]/30 transition">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 font-bold grid place-items-center text-sm border border-amber-100">02</div>
            <h3 className="font-display text-lg font-bold text-[#0B0F19]">Unclear eligibility</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">Students struggle to understand which courses match their grades. Complex cluster formulas and prerequisite gates lead to missed placement cycles.</p>
          </div>
          <div className="edupath-card p-7 space-y-3 bg-white border border-border hover:border-[#0F52FF]/30 transition">
            <div className="h-10 w-10 rounded-xl bg-[#EEF4FF] text-[#0F52FF] font-bold grid place-items-center text-sm border border-[#0F52FF]/20">03</div>
            <h3 className="font-display text-lg font-bold text-[#0B0F19]">No clear direction</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">Grades alone don't tell students which careers could fit their strengths. There is little visibility into salary benchmarks, required skills, and growth outlook.</p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full badge-emerald px-5 py-2 text-xs font-extrabold">
            <span>EduPath AI connects the dots.</span>
          </div>
        </div>
      </section>

      {/* 5. PRODUCT EXPERIENCE */}
      <section id="experience" className="py-20 bg-white border-t border-border px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0F52FF] mb-2">The Product Interface</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B0F19]">Meet your intelligent education guide.</h2>
            <p className="mt-2 text-sm text-[#64748B]">A centralized intelligence command center tailored to your unique academic profile.</p>
          </div>
          <div className="edupath-card bg-[#FAFAFB] border border-border p-6 sm:p-9 shadow-elevated rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F52FF]">Your EduPath</span>
                <h3 className="font-display text-2xl font-extrabold text-[#0B0F19] mt-0.5">Good afternoon, Josh.</h3>
                <p className="text-xs text-[#64748B]">Your personalized education journey is ready.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#EEF4FF] text-[#0F52FF] border border-[#0F52FF]/20 px-3.5 py-1 text-xs font-bold">KCSE 2024 Verified ✓</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="rounded-2xl bg-white border border-border p-5 shadow-subtle">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Academic Profile</div>
                <div className="font-display text-lg font-extrabold text-[#0B0F19] mt-1">KCSE Results</div>
                <div className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Verified ✓</div>
              </div>
              <div className="rounded-2xl bg-white border border-border p-5 shadow-subtle">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Top Course Match</div>
                <div className="font-display text-lg font-extrabold text-[#0F52FF] mt-1 truncate">Computer Science</div>
                <div className="text-xs text-[#059669] font-bold mt-2">96% Match</div>
              </div>
              <div className="rounded-2xl bg-white border border-border p-5 shadow-subtle">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">University Match</div>
                <div className="font-display text-lg font-extrabold text-[#0B0F19] mt-1">JKUAT</div>
                <div className="text-xs text-[#0F52FF] font-bold mt-2">92% Match</div>
              </div>
              <div className="rounded-2xl bg-white border border-border p-5 shadow-subtle">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Career Direction</div>
                <div className="font-display text-lg font-extrabold text-[#0B0F19] mt-1 truncate">Software Engineering</div>
                <div className="text-xs text-emerald-600 font-bold mt-2">95% Alignment</div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-border">
              <div className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-4">YOUR JOURNEY</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                <div className="p-3.5 rounded-xl bg-[#EEF4FF] text-[#0F52FF] font-bold border border-[#0F52FF]/20">Results ✓</div>
                <div className="p-3.5 rounded-xl bg-[#EEF4FF] text-[#0F52FF] font-bold border border-[#0F52FF]/20">Profile ✓</div>
                <div className="p-3.5 rounded-xl bg-white border-2 border-[#0F52FF] text-[#0F52FF] font-bold shadow-sm">Course Discovery</div>
                <div className="p-3.5 rounded-xl bg-white border border-border text-[#64748B] font-medium">University Matching</div>
                <div className="p-3.5 rounded-xl bg-white border border-border text-[#64748B] font-medium">Career Direction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. AI RECOMMENDATION ENGINE (MIDNIGHT SLATE #0B0F19 SECTION) */}
      <section className="py-24 bg-[#0B0F19] text-white px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-[#60A5FA]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Multi-Dimensional Analysis</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Not just search. <br />
                <span className="text-[#60A5FA]">Understand.</span>
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
                EduPath AI analyzes your complete academic profile to evaluate real-world placement chances:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-[#E2E8F0]">
                {[
                  "KCSE performance",
                  "Subject strengths",
                  "Course requirements",
                  "University options",
                  "Career interests",
                  "Eligibility validation",
                  "Academic pathways",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#34D399] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="edupath-midnight-card p-6 sm:p-8 space-y-6 bg-[#121826] border border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#94A3B8]">
                    <Bot className="h-4 w-4 text-[#60A5FA]" />
                    <span>ANALYZING YOUR PROFILE...</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-bold">✓ READY</span>
                </div>
                <div className="space-y-2 text-xs text-[#94A3B8]">
                  <div className="flex items-center gap-2 text-emerald-400"><span>✓</span> Academic performance</div>
                  <div className="flex items-center gap-2 text-emerald-400"><span>✓</span> Subject strengths (MAT A-, ENG B+, BIO A-)</div>
                  <div className="flex items-center gap-2 text-emerald-400"><span>✓</span> Course requirements & prerequisite gates</div>
                  <div className="flex items-center gap-2 text-emerald-400"><span>✓</span> University availability (69 institutions)</div>
                  <div className="flex items-center gap-2 text-emerald-400"><span>✓</span> Career alignment</div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#60A5FA]">TOP MATCH PREVIEW</div>
                  <div className="flex items-center justify-between">
                    <div className="font-display font-extrabold text-xl sm:text-2xl text-white">Computer Science</div>
                    <span className="rounded-full bg-[#0F52FF] text-white font-extrabold px-3 py-1 text-xs">94% Match</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 text-xs text-[#94A3B8] space-y-1">
                    <div className="font-semibold text-white">Why?</div>
                    <p>• Strong Mathematics performance</p>
                    <p>• Strong analytical profile</p>
                    <p>• High career alignment</p>
                  </div>
                </div>
                <Link to="/start" className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs sm:text-sm font-bold btn-primary-tech">
                  <span>Generate Your Recommendation</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COURSE DISCOVERY */}
      <section id="courses" className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F52FF] mb-2">Academic Explorer</p>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B0F19]">Discover what you're capable of.</h2>
          <p className="mt-2 text-sm text-[#64748B]">Explore Kenya's degree programmes with transparent prerequisites, cut-offs, and matching probabilities.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              { key: "all", label: "All Programmes" },
              { key: "computing", label: "Computing & AI" },
              { key: "health", label: "Health Sciences" },
              { key: "engineering", label: "Engineering" },
              { key: "business", label: "Business & Law" },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCourseCategory(cat.key)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeCourseCategory === cat.key
                    ? "bg-[#0F52FF] text-white"
                    : "bg-white border border-border text-[#64748B] hover:text-[#0B0F19]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="edupath-card-interactive overflow-hidden flex flex-col justify-between bg-white border border-border group">
              <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                <img src={course.image} alt={course.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute top-3 left-3 rounded-full bg-white text-[#0B0F19] px-2.5 py-0.5 text-[10px] font-extrabold shadow-sm">{course.match}</span>
                <span className="absolute top-3 right-3 rounded-full bg-black/40 backdrop-blur-md text-white px-2.5 py-0.5 text-[10px] font-bold">{course.marketDemand}</span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-display text-base font-bold text-[#0B0F19] group-hover:text-[#0F52FF] transition line-clamp-1">{course.title}</h3>
                  <div className="mt-2.5 space-y-1.5 text-xs text-[#64748B]">
                    <div><strong className="text-[#0B0F19]">Requirements:</strong> {course.reqs}</div>
                    <div className="truncate"><strong className="text-[#0B0F19]">Universities:</strong> {course.unis.slice(0, 2).join(", ")}</div>
                    <div className="truncate"><strong className="text-[#0B0F19]">Careers:</strong> {course.career}</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <button onClick={() => setSelectedCourseModal(course)} className="inline-flex items-center gap-1 text-xs font-bold text-[#0F52FF] hover:text-[#0043e0] transition">
                    <span>Quick View</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  <Link to="/start" className="text-xs font-semibold text-[#64748B] hover:underline">Match Grade →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/start" className="inline-flex items-center gap-2 text-sm font-bold text-[#0F52FF] hover:underline transition">
            <span>Explore all courses →</span>
          </Link>
        </div>
      </section>

      {/* 8. UNIVERSITY DISCOVERY */}
      <section id="universities" className="py-20 bg-white border-t border-border px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#059669] mb-2">Institution Directory</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B0F19]">Find the university where your path comes alive.</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#FAFAFB] border border-border self-start">
              <button onClick={() => setActiveUniType("all")} className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${activeUniType === "all" ? "bg-[#0F52FF] text-white" : "text-[#64748B] hover:text-[#0B0F19]"}`}>All (69)</button>
              <button onClick={() => setActiveUniType("public")} className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${activeUniType === "public" ? "bg-[#0F52FF] text-white" : "text-[#64748B] hover:text-[#0B0F19]"}`}>Universities</button>
              <button onClick={() => setActiveUniType("private")} className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${activeUniType === "private" ? "bg-[#0F52FF] text-white" : "text-[#64748B] hover:text-[#0B0F19]"}`}>Colleges</button>
              <button onClick={() => setActiveUniType("tvet")} className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${activeUniType === "tvet" ? "bg-[#0F52FF] text-white" : "text-[#64748B] hover:text-[#0B0F19]"}`}>TVET</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredUniversities.map((uni, i) => (
              <div key={i} className="edupath-card overflow-hidden bg-white border border-border hover:shadow-elevated transition group">
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img src={uni.image} alt={uni.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-white text-[#0B0F19] px-2.5 py-0.5 text-xs font-bold shadow-sm">{uni.typeLabel}</span>
                  <span className="absolute top-3 right-3 rounded-full bg-black/40 backdrop-blur-md text-white px-2.5 py-0.5 text-xs font-bold">{uni.match}</span>
                  <div className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{uni.county}</span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="font-display text-lg font-bold text-[#0B0F19]">{uni.name}</h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">{uni.description}</p>
                  <div className="text-[11px] text-[#64748B] pt-1"><strong className="text-[#0B0F19]">Cut-off Benchmarks:</strong> {uni.cutoffSample}</div>
                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#0B0F19]">{uni.courses}</span>
                    <Link to="/start" className="text-[#0F52FF] hover:underline font-bold">View Cut-offs →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CAREER EXPLORER */}
      <section id="careers" className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F52FF] mb-2">Long-Term Vision</p>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B0F19]">Your course is only the beginning.</h2>
          <p className="mt-2 text-sm text-[#64748B]">See how your degree choice unfolds into real career milestones, required skills, and market opportunities.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {(Object.keys(CAREER_DOMAINS) as Array<keyof typeof CAREER_DOMAINS>).map((dom) => (
              <button
                key={dom}
                onClick={() => {
                  setActiveCareerDomain(dom);
                  setActiveCareerNodeId(CAREER_DOMAINS[dom].nodes[0].id);
                }}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  activeCareerDomain === dom
                    ? "bg-[#0F52FF] text-white"
                    : "bg-white border border-border text-[#64748B] hover:text-[#0B0F19]"
                }`}
              >
                {CAREER_DOMAINS[dom].title}
              </button>
            ))}
          </div>
        </div>
        <div className="edupath-card p-6 sm:p-8 bg-white shadow-elevated border border-border">
          <div className="text-center mb-8">
            <span className="badge-blue px-4 py-1.5 text-xs font-bold">PATHWAY: {activeDomain.title.toUpperCase()}</span>
            <p className="text-xs text-[#64748B] mt-2">{activeDomain.tagline}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-center">
            {activeDomain.nodes.map((node) => (
              <button
                key={node.id}
                onClick={() => setActiveCareerNodeId(node.id)}
                className={`p-4 rounded-2xl border text-center transition ${
                  activeCareerNodeId === node.id
                    ? "border-[#0F52FF] bg-[#EEF4FF] text-[#0F52FF] font-bold shadow-sm"
                    : "border-border bg-[#FAFAFB] text-[#0B0F19] hover:border-[#0F52FF]/40"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">{node.stage}</div>
                <div className="text-xs sm:text-sm font-extrabold">{node.title}</div>
              </button>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-2xl bg-[#FAFAFB] border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F52FF]">{activeNode.stage}</span>
                <h4 className="font-display font-extrabold text-xl text-[#0B0F19] mt-0.5">{activeNode.title}</h4>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1">{activeNode.desc}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">{activeNode.growth}</span>
                <span className="text-xs font-bold text-[#0F52FF] bg-[#EEF4FF] border border-[#0F52FF]/20 px-3 py-1 rounded-full">{activeNode.salary}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div><strong className="text-[#0B0F19]">Core Skills Required:</strong> <span className="text-[#64748B]">{activeNode.skills}</span></div>
              <div><strong className="text-[#0B0F19]">Relevant Courses:</strong> <span className="text-[#64748B]">Computer Science, Software Engineering, Data Science</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. OCR SHOWCASE */}
      <section className="py-20 bg-white border-t border-border px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full badge-emerald px-3.5 py-1 text-xs font-bold mb-3">
            <Zap className="h-3.5 w-3.5" />
            <span>Instant Analysis</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B0F19]">Turn your results into possibilities.</h2>
          <p className="mt-2 text-sm text-[#64748B] max-w-xl mx-auto">Upload your KCSE result slip or KUCCPS cluster weights screenshot. Our AI reads your grades in seconds.</p>
          <div className="mt-8 edupath-card p-8 sm:p-12 border-2 border-dashed border-border/80 hover:border-[#0F52FF]/50 transition bg-[#FAFAFB] flex flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#EEF4FF] text-[#0F52FF] grid place-items-center"><UploadCloud className="h-8 w-8" /></div>
            <div>
              <div className="font-display font-extrabold text-base sm:text-lg text-[#0B0F19]">Upload Results</div>
              <div className="text-xs text-[#64748B] mt-0.5">Drop your KCSE slip here</div>
            </div>
            <button onClick={triggerOcrSimulation} disabled={isSimulatingOcr} className="rounded-2xl px-6 py-3.5 text-xs font-bold btn-primary-tech disabled:opacity-50">
              {isSimulatingOcr ? "Reading your results..." : "Browse Files • JPG • PNG • PDF"}
            </button>
            {ocrStep > 0 && (
              <div className="w-full max-w-md mt-4 p-5 rounded-2xl bg-white border border-border shadow-subtle text-left space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#0F52FF] uppercase tracking-wider">AI OCR Engine</span>
                  <span className="font-mono text-emerald-600">{ocrStep === 5 ? "100%" : `${ocrStep * 20}%`}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className={`flex items-center gap-2 ${ocrStep >= 1 ? "text-emerald-600 font-bold" : "text-[#64748B]"}`}><span>{ocrStep >= 1 ? "✓" : "○"}</span> Reading your results...</div>
                  <div className={`flex items-center gap-2 ${ocrStep >= 2 ? "text-emerald-600 font-bold" : "text-[#64748B]"}`}><span>{ocrStep >= 2 ? "✓" : "○"}</span> Analyzing your subjects...</div>
                  <div className={`flex items-center gap-2 ${ocrStep >= 3 ? "text-emerald-600 font-bold" : "text-[#64748B]"}`}><span>{ocrStep >= 3 ? "✓" : "○"}</span> Matching eligible courses...</div>
                  <div className={`flex items-center gap-2 ${ocrStep >= 4 ? "text-emerald-600 font-bold" : "text-[#64748B]"}`}><span>{ocrStep >= 4 ? "✓" : "○"}</span> Finding your best pathways...</div>
                </div>
                {ocrStep === 5 && (
                  <div className="pt-3 border-t border-border">
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between">
                      <span>Your personalized EduPath is ready.</span>
                      <Link to="/start" className="text-[#0F52FF] underline">View Results →</Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 11. STUDENT HUB */}
      <section id="hub" className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F52FF] mb-2">Student Ecosystem</p>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B0F19]">Everything you need for your next chapter.</h2>
          <p className="mt-2 text-sm text-[#64748B]">Your personal command center for academic transitions, applications, and financing.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users, title: "My Profile", desc: "Verified KCSE grades, subject strengths, and cluster scores." },
            { icon: BookOpen, title: "My Courses", desc: "Explore 2,084 degree and diploma programmes matching your points." },
            { icon: Building2, title: "University Matches", desc: "69 public and chartered private institutions with historic cut-offs." },
            { icon: Compass, title: "Career Paths", desc: "Salary expectations, market demand, and skill growth roadmaps." },
            { icon: Award, title: "Saved Options", desc: "Bookmark top choices to compare and share with parents." },
            { icon: TrendingUp, title: "Application Journey", desc: "Step-by-step KUCCPS revision and registration roadmap." },
            { icon: Sparkles, title: "Scholarships", desc: "HEF, HELB, and private scholarship funding opportunities." },
            { icon: MessageSquare, title: "Student Community", desc: "Peer guidance, candidate forums, and alumni Q&A." },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={i} onClick={() => setSelectedHubItem({ title: item.title, desc: item.desc })} className="edupath-card-interactive p-5 space-y-2 bg-white text-center border border-border text-left">
                <div className="h-10 w-10 mx-auto rounded-xl bg-[#EEF4FF] text-[#0F52FF] grid place-items-center"><Icon className="h-5 w-5" /></div>
                <div className="font-display font-bold text-sm text-[#0B0F19]">{item.title}</div>
                <div className="text-[11px] text-[#64748B] line-clamp-2">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 12. AI ASSISTANT DIALOG */}
      <section className="py-16 bg-white border-y border-border px-4">
        <div className="max-w-4xl mx-auto">
          <div className="edupath-card p-6 sm:p-8 bg-[#FAFAFB] border border-border space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#0F52FF] text-white grid place-items-center font-bold"><Bot className="h-5 w-5" /></div>
                <div>
                  <div className="font-display font-extrabold text-base text-[#0B0F19]">EduPath Guide</div>
                  <div className="text-xs text-[#64748B]">Intelligent Admissions & Career Assistant</div>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 text-xs border border-emerald-200">Online</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm ${msg.sender === "user" ? "bg-[#0F52FF] text-white rounded-br-none" : "bg-white border border-border text-[#0B0F19] rounded-bl-none shadow-subtle"}`}>
                    <p>{msg.text}</p>
                    <div className={`text-[9px] mt-1 ${msg.sender === "user" ? "text-white/70" : "text-[#64748B]"}`}>{msg.time}</div>
                  </div>
                </div>
              ))}
              {isBotTyping && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-white border border-border text-xs text-[#64748B] flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#0F52FF] animate-ping" />
                    <span>EduPath Guide is thinking…</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button onClick={() => handleChatAction("Show my best courses")} className="rounded-xl px-3.5 py-2 text-xs font-bold bg-[#EEF4FF] text-[#0F52FF] hover:bg-[#dbe6fe] transition">Show my best courses</button>
              <button onClick={() => handleChatAction("Find universities")} className="rounded-xl px-3.5 py-2 text-xs font-bold bg-white border border-border text-[#0B0F19] hover:bg-[#FAFAFB] transition">Find universities</button>
              <button onClick={() => handleChatAction("Explore careers")} className="rounded-xl px-3.5 py-2 text-xs font-bold bg-white border border-border text-[#0B0F19] hover:bg-[#FAFAFB] transition">Explore careers</button>
              <button onClick={() => handleChatAction("Check eligibility")} className="rounded-xl px-3.5 py-2 text-xs font-bold bg-white border border-border text-[#0B0F19] hover:bg-[#FAFAFB] transition">Check eligibility</button>
            </div>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask EduPath Guide anything about KCSE cut-offs, careers or courses…" className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-xs sm:text-sm font-medium outline-none focus:border-[#0F52FF] focus:ring-2 focus:ring-[#0F52FF]/20" />
              <button type="submit" className="rounded-xl px-4 py-2.5 text-xs font-bold btn-primary-tech"><Send className="h-4 w-4" /></button>
            </form>
          </div>
        </div>
      </section>

      {/* 13. 100% FREE OPEN ACCESS */}
      <section id="pricing" className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F52FF] mb-2">Transparent Access</p>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B0F19]">100% Free for Every Student</h2>
          <p className="mt-2 text-sm text-[#64748B]">Explore all 2,084+ degree programmes, university cut-off margins, career roadmaps, and download your official PDF report — completely free.</p>
        </div>

        <div className="edupath-card p-8 sm:p-12 bg-white border-2 border-[#0F52FF] shadow-elevated rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 rounded-bl-2xl bg-[#0F52FF] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
            100% Free
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full badge-emerald px-3 py-1 text-xs font-bold">
                <Check className="h-3.5 w-3.5" />
                <span>100% Free Open Access for Kenyan Students</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0B0F19]">
                EduPath AI Open Access
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Full unrestricted access to every degree programme, university cut-off differential, 5-stage career roadmaps, and your official downloadable PDF report.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#0B0F19] font-semibold">
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#0F52FF] shrink-0" /> All 2,084+ Degree & Diploma Matches</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#0F52FF] shrink-0" /> 69 University Cut-off Margins</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#0F52FF] shrink-0" /> Full Career Roadmaps & Salaries</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#0F52FF] shrink-0" /> Official Downloadable PDF Report</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#0F52FF] shrink-0" /> Prerequisite Eligibility Validation</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#0F52FF] shrink-0" /> Unlimited Grade Recalculations</div>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#FAFAFB] border border-border text-center space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Open Access</div>
              <div className="font-display text-4xl sm:text-5xl font-extrabold text-[#0B0F19]">
                100% FREE
              </div>
              <p className="text-[11px] text-[#64748B]">No paywall. No hidden fees. Valid for your entire KUCCPS revision cycle.</p>
              
              <Link to="/start" className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold btn-primary-tech">
                <span>Start Free Matching</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="text-[10px] text-[#64748B]">Instant calculation for all 2,084+ degree programmes</div>
            </div>
          </div>
        </div>
      </section>

      {/* 14. TESTIMONIALS */}
      <section className="py-20 bg-white border-t border-border px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0F52FF] mb-2">Authentic Stories</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B0F19]">Real candidates. Clear paths.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "EduPath helped me understand options I didn't even know existed. I got placed in Mechanical Engineering at JKUAT.",
                author: "Dennis Kiprono",
                role: "Kenyan student · JKUAT",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
              },
              {
                quote: "The prerequisite warning prevented me from applying for a course where I missed Biology by one grade. Saved my first revision.",
                author: "Amina Mohamed",
                role: "Kenyan student · UoN",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
              },
              {
                quote: "Uploading the KUCCPS screenshot and getting a clean PDF report to discuss with my parents made the whole revision process painless.",
                author: "Brian Ochieng",
                role: "Kenyan student · KU",
                image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
              },
            ].map((t, i) => (
              <div key={i} className="edupath-card p-6 bg-[#FAFAFB] flex flex-col justify-between space-y-5 border border-border">
                <p className="text-xs sm:text-sm text-[#0B0F19] leading-relaxed italic">"{t.quote}"</p>
                <div className="pt-3 border-t border-border flex items-center gap-3">
                  <img src={t.image} alt={t.author} className="h-10 w-10 rounded-full object-cover border border-border" />
                  <div>
                    <div className="font-display font-bold text-sm text-[#0B0F19]">{t.author}</div>
                    <div className="text-[11px] text-[#64748B]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 15. FINAL CTA */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-elevated p-8 sm:p-14 text-center text-white bg-[#0B0F19]">
          <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80" alt="University Graduation Celebration" className="absolute inset-0 h-full w-full object-cover object-center opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/80 to-transparent" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Your future is too important <br className="hidden sm:inline" /> to leave to chance.
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">Discover the courses, universities and careers that fit you.</p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/start" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm sm:text-base font-bold btn-primary-tech">
                <span>Build My EduPath</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#discover" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition">
                <span>Explore EduPath AI</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 16. FOOTER */}
      <footer className="border-t border-border py-14 px-4 bg-white text-xs text-[#64748B]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 mb-10">
          <div className="space-y-3">
            <EduPathLogo size="sm" />
            <p className="leading-relaxed">Helping students make smarter decisions about their future.</p>
          </div>
          <div>
            <h4 className="font-bold text-[#0B0F19] uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2">
              <li><a href="#courses" className="hover:text-[#0F52FF] transition">Courses</a></li>
              <li><a href="#universities" className="hover:text-[#0F52FF] transition">Universities</a></li>
              <li><a href="#careers" className="hover:text-[#0F52FF] transition">Careers</a></li>
              <li><a href="#hub" className="hover:text-[#0F52FF] transition">Student Hub</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#0B0F19] uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/start" className="hover:text-[#0F52FF] transition">Guides</Link></li>
              <li><Link to="/start" className="hover:text-[#0F52FF] transition">FAQs</Link></li>
              <li><Link to="/start" className="hover:text-[#0F52FF] transition">Scholarships</Link></li>
              <li><Link to="/weights" className="hover:text-[#0F52FF] transition">KUCCPS Resources</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#0B0F19] uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2">
              <li><a href="#discover" className="hover:text-[#0F52FF] transition">About</a></li>
              <li><Link to="/auth" className="hover:text-[#0F52FF] transition">Candidate Portal</Link></li>
              <li><Link to="/admin" className="hover:text-[#0F52FF] transition">Admin Portal</Link></li>
              <li><Link to="/privacy" className="hover:text-[#0F52FF] transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#0F52FF] transition">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>© 2026 EduPath AI. All rights reserved.</div>
          <div className="font-medium text-[#0B0F19]">Don't just choose a course. Discover your path.</div>
        </div>
      </footer>

      {/* 17. MODALS */}
      {selectedCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="edupath-card bg-white w-full max-w-lg rounded-3xl p-6 shadow-elevated space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-[#EEF4FF] text-[#0F52FF] px-2.5 py-0.5 text-[10px] font-extrabold uppercase">{selectedCourseModal.match}</span>
                <h3 className="font-display text-xl font-extrabold text-[#0B0F19] mt-1">{selectedCourseModal.title}</h3>
              </div>
              <button onClick={() => setSelectedCourseModal(null)} className="p-1 rounded-full text-[#64748B] hover:bg-black/5"><X className="h-5 w-5" /></button>
            </div>
            <div className="h-40 w-full rounded-2xl overflow-hidden">
              <img src={selectedCourseModal.image} alt={selectedCourseModal.title} className="h-full w-full object-cover" />
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">{selectedCourseModal.description}</p>
            <div className="space-y-2 text-xs bg-[#FAFAFB] p-4 rounded-2xl border border-border">
              <div><strong className="text-[#0B0F19]">Required Subjects:</strong> {selectedCourseModal.reqs}</div>
              <div><strong className="text-[#0B0F19]">Offering Universities:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[#64748B]">
                  {selectedCourseModal.unis.map((u, idx) => (<li key={idx}>{u}</li>))}
                </ul>
              </div>
              <div><strong className="text-[#0B0F19]">Career Horizons:</strong> {selectedCourseModal.career}</div>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button onClick={() => setSelectedCourseModal(null)} className="px-4 py-2 text-xs font-semibold btn-outline-clean">Close</button>
              <Link to="/start" className="px-5 py-2 text-xs font-bold btn-primary-tech">Match My KCSE Grades →</Link>
            </div>
          </div>
        </div>
      )}

      {selectedHubItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="edupath-card bg-white w-full max-w-md rounded-3xl p-6 shadow-elevated space-y-4">
            <div className="flex items-start justify-between">
              <div className="font-display text-xl font-extrabold text-[#0B0F19]">{selectedHubItem.title}</div>
              <button onClick={() => setSelectedHubItem(null)} className="p-1 rounded-full text-[#64748B] hover:bg-black/5"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">{selectedHubItem.desc}</p>
            <div className="pt-3 flex justify-end">
              <Link to="/start" onClick={() => setSelectedHubItem(null)} className="px-5 py-2.5 text-xs font-bold btn-primary-tech">Access {selectedHubItem.title} →</Link>
            </div>
          </div>
        </div>
      )}

      {signInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="edupath-card bg-white w-full max-w-sm rounded-3xl p-6 shadow-elevated space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2"><EduPathLogo size="xs" showWordmark={false} /><span className="font-display font-extrabold text-[#0B0F19]">Sign In to EduPath</span></div>
              <button onClick={() => setSignInOpen(false)} className="p-1 rounded-full text-[#64748B] hover:bg-black/5"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-xs text-[#64748B]">Enter your KCSE candidate index number or email to access your saved pathway reports.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">KCSE Index or Email</label>
                <input type="text" placeholder="e.g. 11200001001 or name@gmail.com" className="w-full rounded-xl border border-border bg-[#FAFAFB] px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-[#0F52FF]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">Password / Access PIN</label>
                <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-border bg-[#FAFAFB] px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-[#0F52FF]" />
              </div>
              <Link to="/start" onClick={() => setSignInOpen(false)} className="w-full inline-flex items-center justify-center py-3 text-xs font-bold btn-primary-tech">Continue to Dashboard →</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
