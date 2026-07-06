import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { 
  ArrowRight, BarChart3, Brain, DatabaseZap, FileText, MessageSquareText, 
  ShieldCheck, Sparkles, UploadCloud, TrendingUp, Bot, User, RefreshCw, 
  CheckCircle2, Activity, ChevronDown, Settings, Search, MessageSquare, 
  Terminal, FileSpreadsheet
} from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Reveal } from "../components/ui/Reveal";
import { AnimatedNumber } from "../components/ui/AnimatedNumber";
import { GlowCard } from "../components/ui/GlowCard";
import { ParticleField } from "../components/ui/ParticleField";
import { TypeWriter } from "../components/ui/TypeWriter";
import { fadeUp, stagger, fadeUpSm, scaleIn } from "../lib/motion";

function InteractiveSaaSPreview() {
  const [chatStep, setChatStep] = useState(0); // 0: idle, 1: typing query, 2: thinking, 3: typing response
  const [queryText, setQueryText] = useState("");
  const [responseText, setResponseText] = useState("");

  const targetQuery = "Search for Q3 revenue anomalies...";
  const targetResponse = "Found 1 anomaly on Aug 14: a -18% drop. Automated cleanup corrected a duplicate entry in Regional CRM ingestion. Data quality is now 98.4%.";

  useEffect(() => {
    let timer: any;
    
    if (chatStep === 0) {
      timer = setTimeout(() => {
        setChatStep(1);
      }, 1500);
    } else if (chatStep === 1) {
      if (queryText.length < targetQuery.length) {
        timer = setTimeout(() => {
          setQueryText(targetQuery.slice(0, queryText.length + 1));
        }, 50);
      } else {
        timer = setTimeout(() => {
          setChatStep(2);
        }, 800);
      }
    } else if (chatStep === 2) {
      timer = setTimeout(() => {
        setChatStep(3);
      }, 1500);
    } else if (chatStep === 3) {
      if (responseText.length < targetResponse.length) {
        timer = setTimeout(() => {
          setResponseText(targetResponse.slice(0, responseText.length + 1));
        }, 25);
      } else {
        timer = setTimeout(() => {
          setChatStep(0);
          setQueryText("");
          setResponseText("");
        }, 6000);
      }
    }

    return () => clearTimeout(timer);
  }, [chatStep, queryText, responseText]);

  return (
    <div className="preview-window flex h-[480px] w-full flex-col font-sans">
      {/* Window Controls */}
      <div className="flex items-center justify-between border-b border-border/80 bg-background/50 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-rose-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-500/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
          <Activity size={12} className="text-primary" />
          <span>predictra.ai/dashboard</span>
        </div>
        <div className="w-12" />
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden w-16 flex-col items-center gap-5 border-r border-border/60 bg-background/30 py-5 sm:flex">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">P</div>
          <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center"><Activity size={14} /></div>
          <div className="h-7 w-7 text-muted-foreground flex items-center justify-center hover:bg-muted/50 rounded-md transition-colors"><FileSpreadsheet size={14} /></div>
          <div className="h-7 w-7 text-muted-foreground flex items-center justify-center hover:bg-muted/50 rounded-md transition-colors"><MessageSquare size={14} /></div>
          <div className="mt-auto h-7 w-7 text-muted-foreground flex items-center justify-center hover:bg-muted/50 rounded-md transition-colors"><Settings size={14} /></div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden bg-background/20 p-5">
          {/* Header */}
          <div className="mb-4 flex flex-col justify-between gap-2 border-b border-border/40 pb-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Intelligence Panel</p>
              <h4 className="text-base font-semibold">Q3 Sales Forecast</h4>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">+18.4% growth</Badge>
              <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px]">Model: Prophet</Badge>
            </div>
          </div>

          {/* Spark Cards */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/50 bg-background/60 p-3 shadow-sm">
              <span className="text-[10px] text-muted-foreground">Estimated Revenue</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-bold">$2.48M</span>
                <span className="text-[10px] text-emerald-600 font-semibold">↑ 12%</span>
              </div>
            </div>
            <div className="rounded-lg border border-border/50 bg-background/60 p-3 shadow-sm">
              <span className="text-[10px] text-muted-foreground">Anomalies Detected</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-bold text-amber-500">1</span>
                <span className="text-[10px] text-amber-600 font-semibold">Corrected</span>
              </div>
            </div>
          </div>

          {/* SVG Animated Chart */}
          <div className="relative h-36 w-full rounded-lg border border-border/40 bg-background/40 p-2 shadow-inner">
            <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
            <svg className="h-full w-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Fill under chart path */}
              <motion.path 
                d="M0 30 L0 18 L15 15 L30 22 L45 10 L60 14 L75 5 L90 8 L100 2 L100 30 Z" 
                fill="url(#chartGlow)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              />
              {/* Main Line */}
              <motion.path
                d="M0 18 L15 15 L30 22 L45 10 L60 14 L75 5 L90 8 L100 2"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              {/* Dotted forecast area line */}
              <line x1="60" y1="0" x2="60" y2="30" stroke="hsl(var(--border))" strokeDasharray="1.5" strokeWidth="0.5" />
              {/* Pulse Anomaly Indicator */}
              <circle cx="45" cy="10" r="1.5" fill="hsl(var(--accent-2))" />
              <circle cx="45" cy="10" r="3.5" fill="none" stroke="hsl(var(--accent-2))" strokeWidth="0.5" className="animate-ping" />
            </svg>
            <div className="absolute left-[62%] top-2 text-[8px] bg-background/80 px-1 border border-border/50 rounded text-muted-foreground">Forecast</div>
          </div>

          {/* Interactive Chat Console */}
          <div className="mt-4 flex flex-1 flex-col justify-end gap-2 border-t border-border/40 pt-3">
            {/* Input Line */}
            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-background/80 px-3 py-2 text-xs">
              <Search size={12} className="text-muted-foreground" />
              <div className="flex-1 text-muted-foreground font-mono">
                {queryText || <span className="text-muted-foreground/40">Query system...</span>}
                {chatStep === 1 && <span className="animate-pulse font-bold text-primary">|</span>}
              </div>
              <div className="h-4 w-4 rounded bg-primary/10 flex items-center justify-center"><Terminal size={10} className="text-primary" /></div>
            </div>

            {/* AI Response Bubble */}
            <AnimatePresence>
              {chatStep >= 2 && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="rounded-md border border-primary/20 bg-primary/5 p-2 text-[11px] leading-relaxed shadow-sm"
                >
                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-primary">
                    <Bot size={12} />
                    <span>Predictra AI Agent</span>
                    {chatStep === 2 && (
                      <span className="flex gap-0.5 ml-1">
                        <span className="h-1 w-1 rounded-full bg-primary animate-bounce" />
                        <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                        <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground font-mono">
                    {responseText}
                    {chatStep === 3 && responseText.length < targetResponse.length && <span className="animate-pulse font-bold text-primary">|</span>}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  { title: "Upload intelligence", body: "CSV and Excel profiling, type detection, quality scores, and cleaning suggestions.", icon: UploadCloud },
  { title: "ML autopilot (Upcoming)", body: "Regression, classification, clustering, outliers, forecasts, and model metrics.", icon: Brain },
  { title: "Ask your data", body: "Natural language answers powered by OpenRouter or local statistical reasoning.", icon: MessageSquareText },
  { title: "Executive exports", body: "Download clean CSVs and board-ready PDF intelligence reports.", icon: FileText },
];

const stats = [
  { value: 98, suffix: "% uptime" },
  { value: 8, suffix: " chart modes" },
  { value: 4, suffix: " ML workflows" },
];

const barHeights = [38, 48, 44, 58, 66, 64, 78, 72, 86, 92, 88, 98];

const faqs = [
  {
    q: "Does it work without an AI key?",
    a: "Yes. Predictra is built with local statistical reasoning fallbacks. If your OpenRouter or OpenAI keys are missing or hit limits, the dashboard continues to compute regression forecasts, outliers, and data cleanups completely locally without breaking the user experience."
  },
  {
    q: "Can it analyze Excel spreadsheets?",
    a: "Absolutely. We support both raw CSV and modern Excel (.xlsx, .xls) uploads. The engine automatically parses binary sheets, converts column schemas, and profiles data quality metrics instantaneously."
  },
  {
    q: "Is it deployment ready?",
    a: "Yes, the frontend is built on type-safe Vite-React, ready to be built into static assets for Vercel, Netlify, or AWS. The backend runs on a lightweight Node/Express structure making it perfect for rapid deployment."
  }
];

export function LandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <nav className="glass fixed left-0 right-0 top-0 z-40 border-b border-border bg-background/82 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-black">P</span>
            <span className="text-lg font-semibold">Predictra AI</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login"><Button variant="secondary">Login</Button></Link>
            <Link to="/signup"><Button>Start free <ArrowRight size={16} /></Button></Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[92vh] pt-28">
        <div className="aurora" />
        <div className="premium-grid absolute inset-0 z-0" />
        <ParticleField className="absolute inset-0 z-0" />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 pb-12 md:grid-cols-[1.03fr_0.97fr] md:px-6">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp}>
              <Badge className="mb-5 bg-primary/10 text-primary"><Sparkles size={14} /> AI-Powered Data Intelligence Platform</Badge>
            </motion.div>
            <motion.h1 variants={fadeUp} className="max-w-4xl text-5xl font-semibold leading-tight tracking-normal md:text-7xl">
              Turn data into <span className="text-gradient">decisions.</span>
            </motion.h1>
            <motion.div variants={fadeUp}>
              <TypeWriter words={["insights", "forecasts", "decisions", "intelligence"]} className="text-gradient text-2xl font-semibold mt-2 inline-block md:text-3xl" />
            </motion.div>
            <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Upload messy business data and get instant dashboards, machine learning signals, anomaly detection, forecasts, explanations, and recommendations.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup"><Button className="h-12 px-6">Analyze a dataset <ArrowRight size={18} /></Button></Link>
              <a href="#screenshots"><Button variant="secondary" className="h-12 px-6">View product</Button></a>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-10 grid max-w-xl grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.suffix} className="rounded-lg border border-border bg-background/70 p-4 text-sm font-medium shadow-sm">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
              ))}
            </motion.div>
          </motion.div>
          <motion.div variants={scaleIn} initial="hidden" animate="show" className="glass rounded-xl p-2 shadow-glow">
            <InteractiveSaaSPreview />
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <Reveal>
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold">From upload to boardroom-ready insight</h2>
            <p className="mt-3 text-muted-foreground">Every feature is backed by the API, so the demo behaves like a real product.</p>
          </div>
        </Reveal>
        <motion.div className="grid gap-6 md:grid-cols-3 md:grid-rows-2 font-sans" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          {/* Card 1: Upload Intelligence (Large, Col-span 2) */}
          <motion.div variants={fadeUpSm} className="md:col-span-2 md:row-span-1">
            <GlowCard className="h-full flex flex-col justify-between">
              <div className="flex gap-4 items-start">
                <div className="rounded-lg bg-primary/10 p-3 text-primary"><UploadCloud size={24} /></div>
                <div>
                  <h3 className="text-lg font-semibold">Upload intelligence</h3>
                  <p className="mt-1 text-sm text-muted-foreground">CSV and Excel profiling, type detection, quality scores, and cleaning suggestions.</p>
                </div>
              </div>
              
              {/* Interactive Uploader Mock */}
              <div className="mt-6 rounded-lg border border-border/60 bg-muted/30 p-4 font-mono text-[11px] relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><FileSpreadsheet size={14} className="text-primary" /> sales_data_2026.csv</span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">98% Clean</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-muted-foreground">Columns parsed: 8</span>
                  <span className="text-muted-foreground">Nulls auto-corrected: 12</span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-border rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </GlowCard>
          </motion.div>

          {/* Card 2: ML Autopilot (Small, Col-span 1) */}
          <motion.div variants={fadeUpSm} className="md:col-span-1 md:row-span-1">
            <GlowCard className="h-full flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="self-start rounded-lg bg-primary/10 p-3 text-primary"><Brain size={24} /></div>
                <div>
                  <h3 className="text-lg font-semibold">ML autopilot</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Regression, classification, clustering, forecasts, and auto-tuning model metrics.</p>
                </div>
              </div>
              
              {/* Interactive Training Dial Mock */}
              <div className="mt-6 flex justify-center items-center h-24">
                <div className="relative h-20 w-20 flex items-center justify-center">
                  <svg className="absolute inset-0 h-full w-full -rotate-90">
                    <circle cx="40" cy="40" r="32" stroke="hsl(var(--border) / 0.5)" strokeWidth="4" fill="none" />
                    <motion.circle 
                      cx="40" 
                      cy="40" 
                      r="32" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth="4" 
                      fill="none" 
                      strokeDasharray="200"
                      initial={{ strokeDashoffset: 200 }}
                      whileInView={{ strokeDashoffset: 40 }}
                      transition={{ duration: 1.8, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold font-mono">XGBoost</span>
                    <span className="text-[9px] text-muted-foreground">R²: 0.94</span>
                  </div>
                </div>
              </div>
            </GlowCard>
          </motion.div>

          {/* Card 3: Ask Your Data (Small, Col-span 1) */}
          <motion.div variants={fadeUpSm} className="md:col-span-1 md:row-span-1">
            <GlowCard className="h-full flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="self-start rounded-lg bg-primary/10 p-3 text-primary"><MessageSquareText size={24} /></div>
                <div>
                  <h3 className="text-lg font-semibold">Ask your data</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Natural language answers powered by OpenRouter or local statistical reasoning.</p>
                </div>
              </div>
              
              {/* Interactive Chat bubble mock */}
              <div className="mt-6 flex flex-col gap-2 font-mono text-[10px]">
                <div className="self-end bg-primary text-primary-foreground rounded-lg rounded-tr-none px-2.5 py-1.5 max-w-[85%]">
                  "Find sales outlier in June"
                </div>
                <div className="self-start bg-muted rounded-lg rounded-tl-none px-2.5 py-1.5 max-w-[85%] border border-border/40">
                  "Aug 14 has a -18% drop ($420 vs $1.2k expected)."
                </div>
              </div>
            </GlowCard>
          </motion.div>

          {/* Card 4: Executive Exports (Large, Col-span 2) */}
          <motion.div variants={fadeUpSm} className="md:col-span-2 md:row-span-1">
            <GlowCard className="h-full flex flex-col justify-between">
              <div className="flex gap-4 items-start">
                <div className="rounded-lg bg-primary/10 p-3 text-primary"><FileText size={24} /></div>
                <div>
                  <h3 className="text-lg font-semibold">Executive exports</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Download clean CSVs and board-ready PDF intelligence reports on demand.</p>
                </div>
              </div>
              
              {/* Interactive PDF report mock */}
              <div className="mt-6 rounded-lg border border-border/60 bg-muted/30 p-4 font-mono text-[10px] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-8 rounded border border-red-500/30 bg-red-500/5 flex items-center justify-center text-red-500 font-bold text-[9px]">PDF</div>
                  <div>
                    <div className="font-semibold text-foreground">board_preview_q3.pdf</div>
                    <div className="text-[9px] text-muted-foreground">2.4 MB • Generated just now</div>
                  </div>
                </div>
                <motion.button 
                  className="rounded bg-primary text-primary-foreground px-3 py-1.5 font-bold hover:brightness-110 flex items-center gap-1.5 transition-all text-[11px]"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <CheckCircle2 size={12} />
                  <span>Download</span>
                </motion.button>
              </div>
            </GlowCard>
          </motion.div>
        </motion.div>
      </section>

      <section id="workflow" className="border-y border-border bg-muted/20 py-24 relative overflow-hidden font-sans">
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
        <Reveal>
          <div className="mx-auto max-w-3xl text-center mb-16 px-4">
            <Badge className="bg-primary/10 text-primary border border-primary/20 mb-3">Data Pipeline</Badge>
            <h2 className="text-3xl font-semibold tracking-tight">The 3-Step Predictive Workflow</h2>
            <p className="mt-3 text-muted-foreground">How Predictra transforms raw inputs into executive decisions seamlessly.</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
            {/* Connecting Track Line for Desktop */}
            <div className="absolute top-8 left-[12%] right-[12%] hidden h-[3px] bg-border/40 md:block rounded-full overflow-hidden">
              <div className="timeline-line h-full w-[200%] absolute left-0" />
            </div>

            <motion.div className="grid gap-8 md:grid-cols-3 relative z-10" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
              {/* Step 1 */}
              <motion.div variants={fadeUpSm} className="flex flex-col items-center text-center group">
                <div className="h-16 w-16 rounded-full border-2 border-primary bg-background flex items-center justify-center text-primary font-bold shadow-lg transition-transform group-hover:scale-105 relative z-10">
                  <UploadCloud size={24} />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">1</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold">Upload spreadsheet</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
                  Drag and drop Excel or CSV files. Auto-profiling detects columns, types, and flags issues.
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div variants={fadeUpSm} className="flex flex-col items-center text-center group">
                <div className="h-16 w-16 rounded-full border-2 border-primary bg-background flex items-center justify-center text-primary font-bold shadow-lg transition-transform group-hover:scale-105 relative z-10">
                  <Brain size={24} />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">2</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold">Explore analytics & ML</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
                  Generate instant cleaning suggestions, train ML models on autopilot, and chat with your dataset.
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div variants={fadeUpSm} className="flex flex-col items-center text-center group">
                <div className="h-16 w-16 rounded-full border-2 border-primary bg-background flex items-center justify-center text-primary font-bold shadow-lg transition-transform group-hover:scale-105 relative z-10">
                  <FileText size={24} />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">3</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold">Export decisions</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
                  Download clean CSV packages and generate comprehensive executive PDF reports for stakeholders.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </Reveal>
      </section>

      <section id="screenshots" className="mx-auto max-w-7xl px-4 py-24 md:px-6 font-sans">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <Badge className="bg-primary/10 text-primary border border-primary/20 mb-3">Product Previews</Badge>
            <h2 className="text-3xl font-semibold tracking-tight">Designed for Data Storytelling</h2>
            <p className="mt-3 text-muted-foreground">Get a glimpse of the rich layouts and automated workspaces inside Predictra.</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Mock Dashboard Card */}
            <GlowCard className="flex flex-col justify-between min-h-[380px] bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <div className="mb-6">
                <h3 className="text-xl font-semibold">Premium Dashboard</h3>
                <p className="mt-2 text-sm text-muted-foreground">Upload history, data logs, health trends, and activity tracking in one workspace.</p>
              </div>

              {/* High-fidelity Mock Table */}
              <div className="rounded-lg border border-border bg-background/80 shadow-md overflow-hidden font-mono text-[11px]">
                <div className="flex items-center justify-between bg-muted/50 border-b border-border px-4 py-2.5 font-semibold text-foreground">
                  <span>Recent Datasets</span>
                  <Activity size={12} className="text-primary" />
                </div>
                <div className="divide-y divide-border">
                  <div className="flex justify-between items-center px-4 py-3 hover:bg-muted/30 transition-colors">
                    <span className="flex items-center gap-2"><FileSpreadsheet size={12} className="text-primary" /> Q3_Sales_Forecast.csv</span>
                    <span className="text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">98% Perfect</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 hover:bg-muted/30 transition-colors">
                    <span className="flex items-center gap-2"><FileSpreadsheet size={12} className="text-primary" /> User_Churn_Data.xlsx</span>
                    <span className="text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">84% Cleaned</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 hover:bg-muted/30 transition-colors">
                    <span className="flex items-center gap-2"><FileSpreadsheet size={12} className="text-primary" /> Marketing_Campaign.csv</span>
                    <span className="text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">100% Ready</span>
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Mock Intelligence Card */}
            <GlowCard className="flex flex-col justify-between min-h-[380px] bg-gradient-to-br from-accent-2/5 via-background to-primary/5">
              <div className="mb-6">
                <h3 className="text-xl font-semibold">Dataset Intelligence</h3>
                <p className="mt-2 text-sm text-muted-foreground">Interactive charts, automated type-corrections, null cleanup, and AI reasoning.</p>
              </div>

              {/* High-fidelity Mock Cleaning Panel */}
              <div className="rounded-lg border border-border bg-background/80 shadow-md p-4 font-mono text-[11px]">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <span className="font-semibold text-foreground flex items-center gap-1.5"><Brain size={13} className="text-primary" /> Data Profiler Warnings</span>
                  <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-bold border border-rose-500/25">12 anomalies</span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="rounded border border-border/80 bg-muted/20 p-2 flex items-center justify-between">
                    <span className="text-muted-foreground">Null values in 'Revenue'</span>
                    <Badge className="bg-primary/10 text-primary text-[9px]">Auto-Filled (Median)</Badge>
                  </div>
                  <div className="rounded border border-border/80 bg-muted/20 p-2 flex items-center justify-between">
                    <span className="text-muted-foreground">Duplicate rows in 'Customer ID'</span>
                    <button className="bg-primary text-primary-foreground hover:brightness-110 px-2 py-0.5 rounded font-bold transition-all text-[10px]">Resolve duplicates</button>
                  </div>
                </div>
              </div>
            </GlowCard>
          </div>
        </Reveal>
      </section>

      {/* <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {["This turns raw CSVs into a narrative my team can act on.", "The fallback analytics make demos feel bulletproof.", "A recruiter-ready AI SaaS project with real substance."].map((quote) => (
            <Card key={quote}><p className="text-sm leading-6 text-muted-foreground">"{quote}"</p><p className="mt-4 font-semibold">Hackathon judge</p></Card>
          ))}
        </div>
      </section> */}

      <section id="faq" className="mx-auto max-w-3xl px-4 py-24 md:px-6 font-sans">
        <Reveal>
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary border border-primary/20 mb-3">FAQ</Badge>
            <h2 className="text-3xl font-semibold tracking-tight">Frequently Asked Questions</h2>
          </div>
        </Reveal>
        <motion.div className="space-y-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          {faqs.map(({ q, a }, index) => {
            const isOpen = expandedFaq === index;
            return (
              <motion.div key={q} variants={fadeUpSm} className="rounded-xl border border-border bg-background/50 overflow-hidden shadow-sm hover:border-primary/20 transition-all">
                <button 
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left font-medium text-foreground hover:bg-muted/30 transition-colors"
                >
                  <span>{q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-muted-foreground"
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      variants={expandCollapse}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                    >
                      <div className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/10">
                        {a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <Reveal>
        <footer className="border-t border-border py-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between md:px-6">
            <p className="text-sm text-muted-foreground">© 2026 Predictra AI. Built for serious data storytelling.</p>
            <Link to="/signup"><Button>Launch dashboard</Button></Link>
          </div>
        </footer>
      </Reveal>
    </div>
  );
}
