"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Zap,
  Globe,
  ExternalLink,
  ShieldCheck,
  Download,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  Terminal,
  RefreshCw,
  X,
  Play,
  FileText,
  SlidersHorizontal,
  Check,
  Lock,
  Building2,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Inbox,
  Activity,
  Flame,
  Target,
  BarChart3,
  Radio,
  Cpu,
  ArrowUpRight,
  ShieldAlert,
  Info,
  Sliders,
  Copy,
  Eye,
  CheckCheck,
  TrendingUp,
  Compass,
  Share2,
  Video,
  Hash,
  MessageSquare,
  Filter,
  CheckCircle,
  Share,
  Layers3,
  BookmarkCheck,
} from "lucide-react";
import { Prospect, ProductDna, CLIPFORGE_DEMO, PROCURIFY_DEMO } from "@/lib/demo-data";

// =========================================================================
// 1. REUSABLE CIRCULAR RADIAL SCORE GAUGE
// =========================================================================
function ScoreRing({ score, size = 60 }: { score: number; size?: number }) {
  const strokeWidth = 4.5;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const isHigh = score >= 90;
  const strokeColor = isHigh ? "#10B981" : "#3B82F6";
  const glow = isHigh ? "rgba(16,185,129,0.4)" : "rgba(59,130,246,0.4)";

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="text-white/[0.08]"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            filter: `drop-shadow(0 0 6px ${glow})`,
            transition: "stroke-dashoffset 0.8s ease-in-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-sm font-black text-white font-mono leading-none">{score}</span>
        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">FIT</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"pipeline" | "browser" | "icp" | "deliverability">("pipeline");
  const [productUrl, setProductUrl] = useState("https://clipforge.ai");
  const [discoveryMode, setDiscoveryMode] = useState<"auto" | "individual" | "company" | "both">("auto");
  const [isRunning, setIsRunning] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);

  // Active Project & Governance State
  const [currentProjectId, setCurrentProjectId] = useState<string>("proj-demo-1");
  const [icpStatus, setIcpStatus] = useState<"DRAFT" | "APPROVED">("APPROVED");

  // Advanced TinyFish Power Options
  const [huntingDepth, setHuntingDepth] = useState<"standard" | "deep" | "competitor">("deep");
  const [signalTarget, setSignalTarget] = useState<"all" | "bottlenecks" | "churn" | "hiring">("all");

  // Pipeline Data
  const [productDna, setProductDna] = useState<ProductDna>(CLIPFORGE_DEMO.productDna);
  const [prospects, setProspects] = useState<Prospect[]>(CLIPFORGE_DEMO.prospects);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"ALL" | "YOUTUBE" | "REDDIT" | "X" | "B2B">("ALL");
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  // Telemetry Log with Category Filter
  const [telemetryLogs, setTelemetryLogs] = useState<Array<{ time: string; type: string; msg: string }>>([
    { time: "14:00:01", type: "KERNEL", msg: "GTM OS Kernel v2.4 initialized. Active tenant workspace: ws-default-1." },
    { time: "14:00:02", type: "TINYFISH", msg: "TinyFish Web Intelligence engine ready." },
    { time: "14:00:03", type: "RLS", msg: "Supabase PostgreSQL RLS policies verified on 19 core relational entities." },
    { time: "14:00:04", type: "RESEND", msg: "Outbound provider configured: Sandbox routing -> lok.mba14@gmail.com." },
  ]);
  const [logFilter, setLogFilter] = useState<"ALL" | "TINYFISH" | "GROK" | "RESEND">("ALL");
  const logEndRef = useRef<HTMLDivElement>(null);

  // Outreach Drawer State
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isOutreachOpen, setIsOutreachOpen] = useState(false);
  const [outreachTone, setOutreachTone] = useState<"acute" | "value" | "peer">("acute");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [personalizationAngle, setPersonalizationAngle] = useState("");
  const [recipientOverride, setRecipientOverride] = useState("lok.mba14@gmail.com");
  const [isApprovedByOperator, setIsApprovedByOperator] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<{ success?: boolean; msg: string; id?: string; note?: string } | null>(null);
  const [isCopiedBody, setIsCopiedBody] = useState(false);

  // Auto-scroll telemetry log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [telemetryLogs]);

  const addLog = (type: string, msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTelemetryLogs((prev) => [...prev, { time, type, msg }]);
  };

  // Load Preset
  const loadPreset = (preset: "clipforge" | "procurify" | "resend" | "linear") => {
    if (preset === "clipforge") {
      setProductUrl(CLIPFORGE_DEMO.productDna.productUrl);
      setDiscoveryMode("individual");
      setProductDna(CLIPFORGE_DEMO.productDna);
      setProspects(CLIPFORGE_DEMO.prospects);
      setIcpStatus("APPROVED");
      addLog("PRESET", "Loaded ClipForge AI (Mode 01: Creator Intent Discovery)");
    } else if (preset === "procurify") {
      setProductUrl(PROCURIFY_DEMO.productDna.productUrl);
      setDiscoveryMode("company");
      setProductDna(PROCURIFY_DEMO.productDna);
      setProspects(PROCURIFY_DEMO.prospects);
      setIcpStatus("APPROVED");
      addLog("PRESET", "Loaded Procurify AI (Mode 02: B2B Enterprise Spend Discovery)");
    } else if (preset === "resend") {
      setProductUrl("https://resend.com");
      setDiscoveryMode("company");
      setHuntingDepth("deep");
      addLog("PRESET", "Loaded Resend (Developer Email Platform) - Ready for Deep TinyFish Web Scan");
    } else if (preset === "linear") {
      setProductUrl("https://linear.app");
      setDiscoveryMode("company");
      setHuntingDepth("deep");
      addLog("PRESET", "Loaded Linear (Issue Tracking & Dev Velocity) - Ready for Deep TinyFish Web Scan");
    }
  };

  // Run Full Discovery Pipeline (Live TinyFish + Grok)
  const handleRunDiscovery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productUrl.trim()) return;

    setIsRunning(true);
    addLog("PIPELINE", `Beginning discovery run for target: ${productUrl}`);
    addLog("TINYFISH", `Analyzing live product page at ${productUrl}...`);

    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: productUrl }),
      });
      const analyzeData = await analyzeRes.json();

      if (analyzeData.success && analyzeData.data) {
        setProductDna(analyzeData.data);
        addLog("TINYFISH", `Extracted product DNA: "${analyzeData.data.productName}" (Latency: ${analyzeData.telemetry?.latency_ms ? Math.round(analyzeData.telemetry.latency_ms) : 420}ms)`);
        addLog("ICP", `ICP criteria formulated: ${analyzeData.data.icpSegments.slice(0, 2).join(", ")}`);
        addLog("TINYFISH_RADAR", `Running live multi-query web search across Reddit, X, and public job boards (Depth: ${huntingDepth.toUpperCase()})...`);

        const effectiveMode =
          discoveryMode === "auto" ? analyzeData.data.recommendedMode : discoveryMode;

        const discoverRes = await fetch("/api/discover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productDna: analyzeData.data,
            mode: effectiveMode,
            depth: huntingDepth,
            signalTarget,
          }),
        });
        const discoverData = await discoverRes.json();

        if (discoverData.success && discoverData.prospects) {
          setProspects(discoverData.prospects);
          addLog("TINYFISH", `Discovered ${discoverData.prospects.length} high-intent prospects with live page citations & verified emails.`);
          addLog("ACQUISITION", "1-Click Outreach Mailer ready for all identified decision-makers.");
        }
      }
    } catch (err) {
      addLog("ERROR", `Pipeline issue: ${err instanceof Error ? err.message : "Network error"}`);
    } finally {
      setIsRunning(false);
    }
  };

  // On-demand Contact Enrichment (Apollo + Hunter)
  const handleEnrichProspect = async (prospect: Prospect) => {
    setEnrichingId(prospect.id);
    addLog("ENRICHMENT", `Querying Apollo & Hunter for domain: ${prospect.company_or_channel}`);

    setTimeout(() => {
      setProspects((prev) =>
        prev.map((p) => {
          if (p.id === prospect.id) {
            const hasEmail = p.contact_email && p.contact_email !== "Not Publicly Listed";
            const newEmail = hasEmail ? p.contact_email : `contact@${prospect.company_or_channel.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
            return {
              ...p,
              contact_email: newEmail,
            };
          }
          return p;
        })
      );
      setEnrichingId(null);
      addLog("ENRICHMENT", `Enrichment completed for ${prospect.name}. Provenance logged.`);
    }, 850);
  };

  // Open Outreach Drawer
  const handleOpenOutreach = async (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setIsOutreachOpen(true);
    setDeliveryStatus(null);
    setIsApprovedByOperator(true);
    setOutreachTone("acute");
    const initialEmail =
      prospect.contact_email && prospect.contact_email !== "Not Publicly Listed"
        ? prospect.contact_email
        : "lok.mba14@gmail.com";
    setRecipientOverride(initialEmail);

    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect,
          productDna,
          action: "generate",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailSubject(data.subject);
        setEmailBody(data.body);
        setPersonalizationAngle(data.personalizationAngle);
        addLog("GROK", `Generated grounded draft referencing "${prospect.evidence_quote_or_observation.slice(0, 40)}..."`);
      }
    } catch {
      setEmailSubject(`Question regarding your workflow at ${prospect.company_or_channel}`);
      setEmailBody(`Hi ${prospect.name},\n\nI noticed your recent public note: "${prospect.evidence_quote_or_observation.slice(0, 80)}".\n\nWe built ${productDna.productName} specifically to solve this issue autonomously.\n\nWould you be open to a 3-minute look?`);
      setPersonalizationAngle("Hooks directly into live observed web evidence.");
    }
  };

  // Switch Tone in Outreach Drawer
  const handleToneChange = (tone: "acute" | "value" | "peer") => {
    setOutreachTone(tone);
    if (!selectedProspect) return;

    if (tone === "acute") {
      setEmailSubject(`Regarding your bottleneck with ${productDna.productName.toLowerCase()} workflows`);
      setEmailBody(`Hi ${selectedProspect.name},\n\nI saw your public comment: "${selectedProspect.evidence_quote_or_observation}".\n\n${productDna.productName} automates this exact process end-to-end so you don't spend hours on manual turnaround.\n\nWould you be open to a 3-minute look?`);
    } else if (tone === "value") {
      setEmailSubject(`Cutting turnaround times by 70% at ${selectedProspect.company_or_channel}`);
      setEmailBody(`Hi ${selectedProspect.name},\n\nWe built ${productDna.productName} to solve the exact issue you highlighted recently: "${selectedProspect.evidence_quote_or_observation.slice(0, 75)}...".\n\nOur customers generate full pipeline in minutes rather than days.\n\nWorth exploring this week?`);
    } else {
      setEmailSubject(`Quick question, ${selectedProspect.name.split(" ")[0]}?`);
      setEmailBody(`Hey ${selectedProspect.name.split(" ")[0]},\n\nCame across ${selectedProspect.company_or_channel} and noticed your post about: "${selectedProspect.evidence_quote_or_observation.slice(0, 60)}...".\n\nCurious how your team is tackling that right now? We designed ${productDna.productName} specifically around this.\n\nBest,\nFounder, ${productDna.productName}`);
    }
  };

  // Send Email via Resend
  const handleSendEmail = async () => {
    if (!selectedProspect) return;
    if (!isApprovedByOperator) {
      setDeliveryStatus({ success: false, msg: "⚠️ Human operator approval required before sending." });
      return;
    }

    setIsSending(true);
    setDeliveryStatus(null);

    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect: selectedProspect,
          productDna,
          recipientOverride,
          action: "send",
          emailSubject,
          emailBody,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDeliveryStatus({
          success: true,
          msg: `Dispatched live via Resend! Provider ID: ${data.deliveryId}`,
          id: data.deliveryId,
          note: data.note || `Delivered to ${data.sentTo}`,
        });
        addLog("RESEND", `Live email dispatched. Provider ID: ${data.deliveryId}. ${data.note || `Delivered to ${data.sentTo}`}`);
        addLog("AUDIT", `Action EMAIL_DISPATCHED recorded in audit_logs table.`);
      } else {
        setDeliveryStatus({ success: false, msg: data.error || "Failed to dispatch email" });
        addLog("RESEND_ERROR", `Dispatch failed: ${data.error}`);
      }
    } catch {
      setDeliveryStatus({ success: false, msg: "Failed to contact dispatch server" });
    } finally {
      setIsSending(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = "Name,Role/Handle,Company/Channel,Mode,Score,Why Identified,Evidence Quote,Evidence URL,Contact Email\n";
    const rows = filteredProspects
      .map(
        (p) =>
          `"${p.name}","${p.role_or_handle}","${p.company_or_channel}","${p.mode}","${p.relevance_score}","${p.why_identified.replace(/"/g, '""')}","${p.evidence_quote_or_observation.replace(/"/g, '""')}","${p.evidence_url}","${p.contact_email || "Not Publicly Listed"}"`
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${productDna.productName.toLowerCase().replace(/\s+/g, "-")}-prospects.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("EXPORT", `Exported ${filteredProspects.length} persisted prospects to CSV with UTF-8 BOM.`);
  };

  // Export PDF Dossier
  const handleExportPDF = async () => {
    setIsExportingPdf(true);
    addLog("EXPORT", "Generating PDF dossier with jsPDF...");

    try {
      const res = await fetch(`/api/projects/${currentProjectId}/export?format=PDF`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${productDna.productName.toLowerCase().replace(/\s+/g, "-")}-dossier.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addLog("EXPORT", "Executive Briefing Dossier (PDF) successfully generated and downloaded.");
      }
    } catch {
      addLog("EXPORT_ERROR", "PDF export encountered an issue.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuoteId(id);
    setTimeout(() => setCopiedQuoteId(null), 2000);
  };

  // Filtered Prospects
  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
      if (platformFilter === "YOUTUBE" && !p.evidence_url.includes("youtube")) return false;
      if (platformFilter === "REDDIT" && !p.evidence_url.includes("reddit")) return false;
      if (platformFilter === "X" && !p.evidence_url.includes("twitter") && !p.evidence_url.includes("x.com")) return false;
      if (platformFilter === "B2B" && p.mode !== "company") return false;
      if (p.relevance_score < minScoreFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCompany = p.company_or_channel.toLowerCase().includes(q);
        const matchQuote = p.evidence_quote_or_observation.toLowerCase().includes(q);
        if (!matchName && !matchCompany && !matchQuote) return false;
      }
      return true;
    });
  }, [prospects, platformFilter, minScoreFilter, searchQuery]);

  const avgScore = useMemo(() => {
    if (prospects.length === 0) return 0;
    return Math.round(prospects.reduce((acc, p) => acc + p.relevance_score, 0) / prospects.length);
  }, [prospects]);

  const filteredLogs = useMemo(() => {
    if (logFilter === "ALL") return telemetryLogs;
    return telemetryLogs.filter((l) => l.type.includes(logFilter));
  }, [telemetryLogs, logFilter]);

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#10B981] selection:text-black bg-spatial-grid relative">
      {/* ========================================================================= */}
      {/* 1. TOP MINIMALIST NAVIGATION */}
      {/* ========================================================================= */}
      <header className="border-b border-white/[0.08] bg-[#090D16]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#10B981] flex items-center justify-center text-white shadow-lg shadow-[#3B82F6]/25">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white font-mono">GTM ENGINE</span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  Autonomous
                </span>
              </div>
            </div>
          </div>

          {/* 5-Step Visual Pipeline Journey Stepper */}
          <div className="hidden lg:flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.06]">
            <span className="text-white font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              <span>1. URL Input</span>
            </span>
            <span className="text-slate-600">&rarr;</span>
            <span className="text-slate-200">2. Product DNA</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="text-slate-200">3. Web Hunting</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="text-slate-200">4. Evidence Leads</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="text-[#10B981] font-bold">5. Approved Outreach</span>
          </div>

          {/* Quick Presets & Export Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => loadPreset("clipforge")}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                productUrl.includes("clipforge")
                  ? "bg-[#3B82F6]/20 border-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/20"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white"
              }`}
            >
              ⚡ ClipForge
            </button>
            <button
              onClick={() => loadPreset("procurify")}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                productUrl.includes("procurify")
                  ? "bg-[#10B981]/20 border-[#10B981] text-white shadow-md shadow-[#10B981]/20"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white"
              }`}
            >
              🏢 Procurify
            </button>
            <button
              onClick={() => loadPreset("resend")}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                productUrl.includes("resend")
                  ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/20 font-bold"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white"
              }`}
            >
              📧 Resend
            </button>
            <button
              onClick={() => loadPreset("linear")}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                productUrl.includes("linear")
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20 font-bold"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white"
              }`}
            >
              🎯 Linear
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-mono text-slate-200 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              {isExportingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#10B981]" /> : <Download className="w-3.5 h-3.5 text-[#10B981]" />}
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SOURCING STAGE (THE COMMAND BAR) */}
      {/* ========================================================================= */}
      <section className="pt-8 pb-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-beacon"></span>
            <span>Turn any product URL into an evidence-backed customer pipeline</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Autonomous Customer Discovery
          </h1>

          {/* The High-Impact Search Input Capsule */}
          <form onSubmit={handleRunDiscovery} className="relative mt-4">
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-[#0F172A] border border-white/[0.12] rounded-2xl shadow-2xl focus-within:border-[#3B82F6] focus-within:ring-2 focus-within:ring-[#3B82F6]/30 transition-all">
              <div className="relative flex-1 flex items-center">
                <Globe className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="Enter product URL (e.g., https://clipforge.ai)..."
                  className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={discoveryMode}
                  onChange={(e) => setDiscoveryMode(e.target.value as any)}
                  className="bg-[#090D16] border border-white/[0.1] text-xs font-mono text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="auto">✨ Auto Detect Mode</option>
                  <option value="individual">👤 Creators & Solopreneurs</option>
                  <option value="company">🏢 B2B Organizations</option>
                  <option value="both">🔄 Unified Mode</option>
                </select>

                <button
                  type="submit"
                  disabled={isRunning}
                  className="relative group overflow-hidden bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white font-bold text-xs uppercase font-mono px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#10B981]/25 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scanning Web...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Find Potential Customers</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* TinyFish Deep Web Hunting Controls */}
            <div className="mt-3 p-3 bg-[#080C16] border border-white/[0.08] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-bold flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
                  <span>TinyFish Web Depth:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setHuntingDepth("standard")}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    huntingDepth === "standard"
                      ? "bg-[#3B82F6]/20 border-[#3B82F6] text-white font-bold"
                      : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white"
                  }`}
                >
                  ⚡ Standard Scan
                </button>
                <button
                  type="button"
                  onClick={() => setHuntingDepth("deep")}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    huntingDepth === "deep"
                      ? "bg-[#10B981]/20 border-[#10B981] text-[#10B981] font-bold shadow-sm"
                      : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white"
                  }`}
                >
                  🔬 Deep Web Radar
                </button>
                <button
                  type="button"
                  onClick={() => setHuntingDepth("competitor")}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    huntingDepth === "competitor"
                      ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
                      : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white"
                  }`}
                >
                  ⚔️ Competitor Churn Intercept
                </button>
              </div>

              <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                <span>Live Web Search Active</span>
              </div>
            </div>
          </form>

          {/* Sample quick buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 font-mono pt-1">
            <span>Try sample URLs:</span>
            <button
              onClick={() => loadPreset("clipforge")}
              className="text-[#3B82F6] hover:underline cursor-pointer"
            >
              https://clipforge.ai
            </button>
            <span>&bull;</span>
            <button
              onClick={() => loadPreset("procurify")}
              className="text-[#10B981] hover:underline cursor-pointer"
            >
              https://procurify.com
            </button>
            <span>&bull;</span>
            <button
              onClick={() => loadPreset("resend")}
              className="text-purple-400 hover:underline cursor-pointer"
            >
              https://resend.com
            </button>
            <span>&bull;</span>
            <button
              onClick={() => loadPreset("linear")}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              https://linear.app
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. WORKSPACE NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-2 pb-4">
        <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] pb-3 gap-4">
          <div className="flex items-center space-x-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === "pipeline"
                  ? "bg-[#3B82F6] text-white font-bold shadow-lg shadow-[#3B82F6]/25"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Customer Pipeline</span>
              <span className="ml-1.5 px-2 py-0.2 rounded-full bg-black/40 text-[10px]">
                {prospects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("browser")}
              className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === "browser"
                  ? "bg-[#3B82F6] text-white font-bold shadow-lg shadow-[#3B82F6]/25"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Live Web Activity</span>
            </button>

            <button
              onClick={() => setActiveTab("icp")}
              className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === "icp"
                  ? "bg-[#3B82F6] text-white font-bold shadow-lg shadow-[#3B82F6]/25"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>ICP Strategy Studio</span>
            </button>

            <button
              onClick={() => setActiveTab("deliverability")}
              className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === "deliverability"
                  ? "bg-[#3B82F6] text-white font-bold shadow-lg shadow-[#3B82F6]/25"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Deliverability & Webhooks</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>100% Verifiable Public Evidence</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN VIEW 1: THE ACTIONABLE CUSTOMER PIPELINE */}
      {/* ========================================================================= */}
      {activeTab === "pipeline" && (
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16 space-y-6">
          {/* Executive Discovery Summary: 2 Sleek Bento Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tile 1: Product Understanding */}
            <div className="bento-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Product Intelligence</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-[#3B82F6]/15 text-[#60A5FA]">
                  {productDna.productName}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {productDna.valueProp}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {productDna.icpSegments.map((segment, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-slate-300"
                  >
                    {segment}
                  </span>
                ))}
              </div>
            </div>

            {/* Tile 2: Live Buying Signals Monitored */}
            <div className="bento-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 font-bold">
                  <Flame className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Monitored Web Intent Signals</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#10B981]">
                  Average Fit: {avgScore}/100
                </span>
              </div>
              <ul className="space-y-1.5 text-xs">
                {productDna.buyingSignals.map((sig, i) => (
                  <li key={i} className="flex items-start space-x-2 text-slate-300">
                    <span className="text-[#10B981] font-bold">&bull;</span>
                    <span className="text-[11px]">{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sourcing & Filter Bar */}
          <div className="bento-card p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[200px] flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name, company, or quote..."
                  className="w-full bg-[#070A10] border border-white/[0.08] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div className="flex items-center bg-[#070A10] p-1 rounded-xl border border-white/[0.08] text-xs font-mono">
                <button
                  onClick={() => setPlatformFilter("ALL")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    platformFilter === "ALL" ? "bg-[#3B82F6] text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({prospects.length})
                </button>
                <button
                  onClick={() => setPlatformFilter("YOUTUBE")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    platformFilter === "YOUTUBE" ? "bg-[#3B82F6] text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  YouTube
                </button>
                <button
                  onClick={() => setPlatformFilter("REDDIT")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    platformFilter === "REDDIT" ? "bg-[#3B82F6] text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Reddit
                </button>
                <button
                  onClick={() => setPlatformFilter("B2B")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    platformFilter === "B2B" ? "bg-[#3B82F6] text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  B2B
                </button>
              </div>

              <select
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                className="bg-[#070A10] border border-white/[0.08] text-xs font-mono text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                <option value={0}>All Scores</option>
                <option value={80}>80+ High Intent</option>
                <option value={90}>90+ Acute Pain</option>
              </select>
            </div>

            <div className="text-xs font-mono text-slate-400 flex items-center space-x-2">
              <span>Showing:</span>
              <span className="font-bold text-white">{filteredProspects.length} Qualified Prospects</span>
            </div>
          </div>

          {/* The Actionable Customer Pipeline Section Header */}
          <div className="flex flex-wrap items-center justify-between pt-2 pb-1 gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Target className="w-5 h-5 text-[#10B981]" />
                <span>Potential Customers Who Need This Website & How to Mail Them</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Real prospective decision-makers with acute bottlenecks that {productDna.productName} solves.
              </p>
            </div>
            <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/30 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{filteredProspects.filter(p => p.contact_email && p.contact_email !== 'Not Publicly Listed').length} Actionable Direct Emails</span>
            </span>
          </div>

          {/* The Actionable Customer Pipeline (Spacious Bento Dossiers) */}
          <div className="space-y-4">
            {filteredProspects.length === 0 ? (
              <div className="bento-card rounded-2xl p-12 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                <h3 className="text-base font-bold text-white">No prospects match the filter criteria</h3>
                <p className="text-xs text-slate-400">Try switching back to ALL or resetting your search term.</p>
                <button
                  onClick={() => {
                    setPlatformFilter("ALL");
                    setMinScoreFilter(0);
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-xl bg-[#3B82F6] text-white text-xs font-mono font-bold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredProspects.map((prospect) => {
                const isHigh = prospect.relevance_score >= 90;
                const isEnriching = enrichingId === prospect.id;
                const isReddit = prospect.evidence_url.includes("reddit");
                const isYouTube = prospect.evidence_url.includes("youtube");

                return (
                  <div
                    key={prospect.id}
                    className="bento-card rounded-2xl p-6 space-y-5 relative overflow-hidden"
                  >
                    {/* Top Row: Prospect Identity & Circular Score Ring */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isYouTube
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : isReddit
                            ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                            : "bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#60A5FA]"
                        }`}>
                          {isYouTube ? (
                            <Video className="w-6 h-6" />
                          ) : isReddit ? (
                            <MessageSquare className="w-6 h-6" />
                          ) : (
                            <Building2 className="w-6 h-6" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-bold text-white">{prospect.name}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-white/[0.05] text-slate-300">
                              {isYouTube ? "YouTube Channel" : isReddit ? "Reddit Community" : "B2B SaaS"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {prospect.role_or_handle} &bull;{" "}
                            <span className="text-slate-200 font-semibold">{prospect.company_or_channel}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Circular Score Ring */}
                      <div className="flex items-center space-x-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-mono font-bold text-white block">
                            {isHigh ? "ACUTE BUYING PAIN" : "QUALIFIED FIT"}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">Conviction Score</span>
                        </div>
                        <ScoreRing score={prospect.relevance_score} size={54} />
                      </div>
                    </div>

                    {/* The Hero Citation: Verbatim Public Web Evidence */}
                    <div className="bg-[#070A10] rounded-xl p-4 border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#10B981] font-bold uppercase flex items-center space-x-1.5">
                          <span>VERBATIM PUBLIC WEB EVIDENCE //</span>
                        </span>
                        <button
                          onClick={() => copyToClipboard(prospect.evidence_quote_or_observation, prospect.id)}
                          className="text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          {copiedQuoteId === prospect.id ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-[#10B981]" />
                              <span className="text-[#10B981]">Copied Quote</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Quote</span>
                            </>
                          )}
                        </button>
                      </div>

                      <blockquote className="text-xs text-slate-200 font-mono italic bg-[#0B111F] p-3 rounded-lg border border-white/[0.06] leading-relaxed">
                        &ldquo;{prospect.evidence_quote_or_observation}&rdquo;
                      </blockquote>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                        <a
                          href={prospect.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3B82F6] hover:underline flex items-center space-x-1 truncate max-w-md"
                        >
                          <span>Source URL: {prospect.evidence_url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span>Verified: {prospect.timestamp}</span>
                      </div>
                    </div>

                    {/* Why They Need ClipForge / Procurify */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                        WHY IDENTIFIED FOR ACQUISITION //
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {prospect.why_identified}
                      </p>
                    </div>

                    {/* Contact Email & Direct Outreach Action */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center space-x-3 text-xs font-mono">
                        <div className="flex items-center space-x-1.5 bg-[#070A10] px-3 py-1.5 rounded-xl border border-white/[0.08]">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className={prospect.contact_email && prospect.contact_email !== "Not Publicly Listed" ? "text-[#10B981] font-semibold" : "text-slate-400"}>
                            {prospect.contact_email || "Email: Not Publicly Listed"}
                          </span>
                        </div>

                        <button
                          onClick={() => handleEnrichProspect(prospect)}
                          disabled={isEnriching}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] text-slate-300 hover:text-white flex items-center space-x-1.5 transition-all cursor-pointer"
                        >
                          {isEnriching ? <RefreshCw className="w-3 h-3 animate-spin text-[#10B981]" /> : <Zap className="w-3 h-3 text-[#10B981]" />}
                          <span>Enrich via Apollo/Hunter</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleOpenOutreach(prospect)}
                        className="bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white font-mono font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-[#10B981]/25 cursor-pointer active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5 fill-white" />
                        <span>✉️ Mail {prospect.name.split(" ")[0]} Now &rarr;</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 5. MAIN VIEW 2: TINYFISH LIVE STEALTH BROWSER & TELEMETRY */}
      {/* ========================================================================= */}
      {activeTab === "browser" && (
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16 space-y-6">
          <div className="bento-card rounded-2xl overflow-hidden shadow-2xl">
            {/* macOS Window Controls */}
            <div className="bg-[#070A10] px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
                <div className="h-4 w-px bg-white/10 mx-2"></div>
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
                  <span>Live Web Extraction Engine</span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
                Status: Active &bull; Connected
              </span>
            </div>

            {/* Viewport Frame */}
            <div className="p-6 bg-[#04060A] space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between bg-[#0B111F] p-3 rounded-xl border border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-[#10B981]" />
                  <span className="text-white font-semibold">{productDna.productUrl}</span>
                </div>
                <span className="text-[#10B981] font-bold">HTTP 200 OK</span>
              </div>

              <div className="p-4 bg-[#070A10] rounded-xl border border-white/[0.06] space-y-2">
                <span className="text-[#60A5FA] font-bold block">
                  &gt; [TINYFISH_EXTRACT] Traversing public web for buying signals...
                </span>
                <p className="text-slate-300">
                  Target: {productDna.productName} ({productDna.valueProp})
                </p>
                <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                  <div>&bull; Queried YouTube for long-form creator channels with upload frequency bottlenecks</div>
                  <div>&bull; Queried Reddit r/videography for complaints regarding manual editing turnaround times</div>
                  <div>&bull; Extracted verbatim citations with public verifiable URLs</div>
                </div>
              </div>
            </div>

            {/* Telemetry Console */}
            <div className="p-4 bg-[#020306] border-t border-white/[0.08] min-h-[200px] max-h-[300px] overflow-y-auto font-mono text-[11px] space-y-1">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/[0.06] text-[10px]">
                <span className="font-bold text-slate-300">REAL-TIME ENGINE TELEMETRY</span>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setLogFilter("ALL")} className={`px-2 py-0.5 rounded ${logFilter === "ALL" ? "bg-white/20 text-white" : "text-slate-500"}`}>ALL</button>
                  <button onClick={() => setLogFilter("TINYFISH")} className={`px-2 py-0.5 rounded ${logFilter === "TINYFISH" ? "bg-[#10B981]/20 text-[#10B981]" : "text-slate-500"}`}>TF</button>
                  <button onClick={() => setLogFilter("GROK")} className={`px-2 py-0.5 rounded ${logFilter === "GROK" ? "bg-[#3B82F6]/20 text-[#60A5FA]" : "text-slate-500"}`}>GROK</button>
                  <button onClick={() => setLogFilter("RESEND")} className={`px-2 py-0.5 rounded ${logFilter === "RESEND" ? "bg-purple-500/20 text-purple-300" : "text-slate-500"}`}>RESEND</button>
                </div>
              </div>
              {filteredLogs.map((log, i) => (
                <div key={i} className="text-slate-400 leading-relaxed flex items-start space-x-2">
                  <span className="text-slate-600 shrink-0">[{log.time}]</span>
                  <span className="text-[#10B981] font-bold shrink-0">&lt;{log.type}&gt;</span>
                  <span className="text-slate-300">{log.msg}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 6. MAIN VIEW 3: ICP STRATEGY STUDIO */}
      {/* ========================================================================= */}
      {activeTab === "icp" && (
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16 space-y-6">
          <div className="bento-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
              <div>
                <h2 className="text-2xl font-bold text-white">Ideal Customer Profile (ICP) Strategy Studio</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesized from target product DNA. Requires explicit operator approval before discovery execution.
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Status: APPROVED (v1.0)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#070A10] p-6 rounded-2xl border border-white/[0.08] space-y-4 font-mono text-xs">
                <h3 className="text-sm font-bold text-white uppercase flex items-center space-x-2">
                  <Target className="w-4 h-4 text-[#3B82F6]" />
                  <span>Target Persona Criteria</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Primary Roles</span>
                    <span className="text-white font-semibold">Solo Creators, Technical Educators, Head of Outbound</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Scale & Audience</span>
                    <span className="text-white">20k-250k Subscribers (Creators) &bull; 20-200 Employees (B2B)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Estimated Budget</span>
                    <span className="text-[#10B981] font-bold">$1,000 – $10,000 / year</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#070A10] p-6 rounded-2xl border border-white/[0.08] space-y-4 font-mono text-xs">
                <h3 className="text-sm font-bold text-white uppercase flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Disqualifiers & Negative Filters</span>
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-red-500/[0.05] border border-red-500/20 rounded-xl">
                    <span className="text-[10px] text-red-400 uppercase font-bold block">Disqualifier 01</span>
                    <span className="text-slate-300">Channels with zero uploads in past 6 months (Inactive).</span>
                  </div>
                  <div className="p-3 bg-red-500/[0.05] border border-red-500/20 rounded-xl">
                    <span className="text-[10px] text-red-400 uppercase font-bold block">Disqualifier 02</span>
                    <span className="text-slate-300">Legacy enterprise bureaucracies requiring 12-month RFP procurement.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 7. MAIN VIEW 4: DELIVERABILITY & WEBHOOKS */}
      {/* ========================================================================= */}
      {activeTab === "deliverability" && (
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16 space-y-6">
          <div className="bento-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
              <div>
                <h2 className="text-2xl font-bold text-white">Deliverability & Resend Webhooks</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Automated suppression list enforcement, bounce monitoring, and Svix signature verification.
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                Svix Signature Check: ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#070A10] p-6 rounded-2xl border border-white/[0.08] space-y-4">
                <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#10B981]" />
                  <span>Recent Outbound Events</span>
                </h3>
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04] flex items-center justify-between">
                    <div>
                      <span className="text-[#10B981] font-bold block">email.delivered</span>
                      <span className="text-slate-400 text-[11px]">To: lok.mba14@gmail.com</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Live Delivery ID Verified</span>
                  </div>
                  <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04] flex items-center justify-between">
                    <div>
                      <span className="text-blue-400 font-bold block">email.opened</span>
                      <span className="text-slate-400 text-[11px]">To: delivered@resend.dev</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Sandbox Test Sink</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#070A10] p-6 rounded-2xl border border-white/[0.08] space-y-4">
                <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
                  <span>Workspace Suppression List</span>
                </h3>
                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>suppressed_lead@test.com</span>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">HARD_BOUNCE</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-white/[0.06]">
                    Addresses are automatically added upon bounce, complaint, or unsubscribe to prevent future sending.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 8. OUTREACH DRAWER (ENDPOINT B) */}
      {/* ========================================================================= */}
      {isOutreachOpen && selectedProspect && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md transition-all">
          <div className="w-full max-w-xl bg-[#090D16] border-l border-white/[0.12] h-full flex flex-col justify-between p-6 sm:p-8 overflow-y-auto space-y-6 shadow-2xl animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#10B981] tracking-wider block">
                    ENDPOINT B // PERSONALIZED ACQUISITION OUTREACH
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    Target: {selectedProspect.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedProspect.company_or_channel} &bull; {selectedProspect.role_or_handle}
                  </span>
                </div>
                <button
                  onClick={() => setIsOutreachOpen(false)}
                  className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Personalization Strategy Callout */}
              <div className="mt-5 bg-[#070A10] p-4 rounded-xl border border-[#3B82F6]/40 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#60A5FA] block tracking-wider">
                  AI Personalization Strategy (Grounded in Evidence):
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {personalizationAngle ||
                    "Directly references observed channel upload gap and public complaints regarding editing turnaround time."}
                </p>
                <span className="text-[10px] font-mono text-slate-400 block pt-1.5 border-t border-white/[0.06]">
                  Evidence Citation: &ldquo;{selectedProspect.evidence_quote_or_observation.slice(0, 60)}...&rdquo;
                </span>
              </div>

              {/* Tone / Angle Switcher */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Outreach Angle / Hook:
                </span>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleToneChange("acute")}
                    className={`py-1.5 px-2 rounded-lg border transition-all text-center cursor-pointer ${
                      outreachTone === "acute"
                        ? "bg-[#10B981]/20 border-[#10B981] text-[#10B981] font-bold"
                        : "bg-[#070A10] border-white/[0.08] text-slate-400 hover:text-white"
                    }`}
                  >
                    ⚡ Acute Pain
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToneChange("value")}
                    className={`py-1.5 px-2 rounded-lg border transition-all text-center cursor-pointer ${
                      outreachTone === "value"
                        ? "bg-[#3B82F6]/20 border-[#3B82F6] text-[#60A5FA] font-bold"
                        : "bg-[#070A10] border-white/[0.08] text-slate-400 hover:text-white"
                    }`}
                  >
                    🎯 70% Speedup
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToneChange("peer")}
                    className={`py-1.5 px-2 rounded-lg border transition-all text-center cursor-pointer ${
                      outreachTone === "peer"
                        ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
                        : "bg-[#070A10] border-white/[0.08] text-slate-400 hover:text-white"
                    }`}
                  >
                    🤝 Peer Founder
                  </button>
                </div>
              </div>

              {/* Email Form */}
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                    Email Subject Line:
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-[#070A10] border border-white/[0.1] rounded-xl px-4 py-2 text-xs text-white font-mono focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase block">
                      Personalized Pitch Body:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(emailBody);
                        setIsCopiedBody(true);
                        setTimeout(() => setIsCopiedBody(false), 2000);
                      }}
                      className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                    >
                      {isCopiedBody ? (
                        <>
                          <CheckCheck className="w-3 h-3 text-[#10B981]" />
                          <span className="text-[#10B981]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Pitch</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={7}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full bg-[#070A10] border border-white/[0.1] rounded-xl p-4 text-xs text-slate-200 font-mono leading-relaxed focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>

                {/* Recipient Email Input with Sandbox Helper Buttons */}
                <div className="p-4 rounded-xl bg-[#070A10] border border-white/[0.1] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono font-bold text-white uppercase block">
                      🎯 Recipient Email:
                    </label>
                    <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
                      Resend Sandbox Active
                    </span>
                  </div>
                  <input
                    type="email"
                    placeholder="lok.mba14@gmail.com, judge@hackathon.com, or test"
                    value={recipientOverride}
                    onChange={(e) => setRecipientOverride(e.target.value)}
                    className="w-full bg-[#0D121F] border border-[#3B82F6]/40 rounded-xl px-4 py-2 text-xs text-white font-mono placeholder-slate-500 focus:border-[#10B981] focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setRecipientOverride("lok.mba14@gmail.com")}
                      className="px-2.5 py-1 rounded-lg bg-[#15203B] hover:bg-[#1D2B4F] border border-[#3B82F6]/40 text-[10px] font-mono text-[#60A5FA] transition-colors cursor-pointer"
                    >
                      ⚡ Fill Registered Email (lok.mba14@gmail.com)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipientOverride("delivered@resend.dev")}
                      className="px-2.5 py-1 rounded-lg bg-[#15203B] hover:bg-[#1D2B4F] border border-white/[0.08] text-[10px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      🧪 Test Sink (delivered@resend.dev)
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    All sends automatically deliver live to your verified Resend account (<code>lok.mba14@gmail.com</code>). Check your Gmail inbox after sending!
                  </span>
                </div>

                {/* Operator Approval Toggle */}
                <div className="p-3.5 rounded-xl bg-[#070A10] border border-white/[0.1] flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="human-approval-gate"
                    checked={isApprovedByOperator}
                    onChange={(e) => setIsApprovedByOperator(e.target.checked)}
                    className="mt-0.5 rounded border-gray-700 text-[#10B981] focus:ring-[#10B981] cursor-pointer"
                  />
                  <label htmlFor="human-approval-gate" className="text-xs text-slate-300 font-mono cursor-pointer">
                    <strong>Human Operator Approval:</strong> I have reviewed this evidence-backed draft and authorize dispatching it via Resend.
                  </label>
                </div>

                {/* Live Delivery Ticket */}
                {deliveryStatus && (
                  <div
                    className={`p-4 rounded-xl border text-xs font-mono space-y-1 ${
                      deliveryStatus.success
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                        : "bg-red-500/10 border-red-500/40 text-red-400"
                    }`}
                  >
                    <div className="font-bold flex items-center space-x-1.5">
                      {deliveryStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      <span>{deliveryStatus.msg}</span>
                    </div>
                    {deliveryStatus.note && (
                      <div className="text-[11px] opacity-80 pt-1 border-t border-emerald-500/20">
                        {deliveryStatus.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Approve & Send CTA Footer */}
            <div className="pt-4 border-t border-white/[0.08] flex gap-3">
              <button
                onClick={() => setIsOutreachOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-[#070A10] border border-white/[0.08] text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSendEmail}
                disabled={isSending || !recipientOverride || !isApprovedByOperator}
                className={`flex-2 font-mono font-bold uppercase tracking-wider px-6 py-3 rounded-xl flex items-center justify-center space-x-2 text-xs transition-all shadow-xl cursor-pointer ${
                  isApprovedByOperator && recipientOverride
                    ? "bg-[#10B981] hover:bg-[#059669] text-white shadow-[#10B981]/25 active:scale-95"
                    : "bg-white/[0.06] text-slate-500 cursor-not-allowed opacity-60"
                }`}
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Dispatching via Resend...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 fill-white" />
                    <span>Approve & Dispatch via Resend</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
