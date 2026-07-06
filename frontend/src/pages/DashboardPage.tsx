import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Database, FileText, Sparkles, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedNumber } from "../components/ui/AnimatedNumber";
import { Reveal } from "../components/ui/Reveal";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { formatNumber } from "../lib/utils";
import { fadeUp, fadeUpSm, stagger } from "../lib/motion";

export function DashboardPage() {
  const { token, user } = useAuth();
  const datasets = useQuery({ queryKey: ["datasets"], queryFn: () => api.datasets(token!), enabled: Boolean(token) });
  const items = datasets.data?.datasets ?? [];
  const rows = items.reduce((sum, item) => sum + item.summary.rows, 0);
  const quality = items.length ? Math.round(items.reduce((sum, item) => sum + item.summary.data_quality_score, 0) / items.length) : 0;

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge className="mb-3 bg-primary/10 text-primary"><Sparkles size={14} /> AI data workspace</Badge>
          <h1 className="text-3xl font-semibold">Good to see you, {user?.name.split(" ")[0]}</h1>
          <p className="mt-2 text-muted-foreground">Upload a dataset and Predictra will profile, visualize, model, forecast, and explain it.</p>
        </div>
        <Link to="/app/datasets"><Button><UploadCloud size={18} /> Upload dataset</Button></Link>
      </motion.div>

      <motion.div className="grid gap-4 md:grid-cols-4" variants={stagger}>
        {datasets.isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />) : (
          [
            { label: "Datasets", value: items.length, isNumeric: true, icon: Database },
            { label: "Rows analyzed", value: rows, isNumeric: true, icon: Activity },
            { label: "Average quality", value: `${quality || 0}%`, isNumeric: false, icon: Sparkles },
            { label: "Saved reports", value: "PDF ready", isNumeric: false, icon: FileText },
          ].map(({ label, value, isNumeric, icon: Icon }) => (
            <motion.div key={label} variants={fadeUpSm}>
              <Card animate>
                <Icon className="mb-4 text-primary" />
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold">
                  {isNumeric ? <AnimatedNumber value={value as number} /> : value}
                </p>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <Reveal>
          <Card>
            <CardHeader><CardTitle>Recent uploads</CardTitle><Link to="/app/datasets" className="text-sm text-primary">View all</Link></CardHeader>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
              {items.slice(0, 5).map((item) => (
                <motion.div key={item.id} variants={fadeUpSm}>
                  <Link to="/app/datasets" className="flex items-center justify-between rounded-md border border-border p-3 transition hover:bg-muted">
                    <div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">{item.summary.rows} rows · {item.summary.columns} columns</p></div>
                    <ArrowRight size={18} />
                  </Link>
                </motion.div>
              ))}
              {!items.length && <p className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">No datasets yet. Upload a CSV or Excel file to begin.</p>}
            </motion.div>
          </Card>
        </Reveal>
        <Reveal delay={0.1}>
          <Card>
            <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
            <div className="grid gap-3">
              <div className="glow-border rounded-lg"><Link to="/app/datasets"><Button variant="secondary" className="w-full justify-start"><Database size={18} /> Upload and profile</Button></Link></div>
              <div className="glow-border rounded-lg"><Link to="/app/insights"><Button variant="secondary" className="w-full justify-start"><Sparkles size={18} /> Generate insights</Button></Link></div>
              <div className="glow-border rounded-lg"><Link to="/app/chat"><Button variant="secondary" className="w-full justify-start"><Activity size={18} /> Ask a question</Button></Link></div>
            </div>
          </Card>
        </Reveal>
      </div>
    </motion.div>
  );
}
