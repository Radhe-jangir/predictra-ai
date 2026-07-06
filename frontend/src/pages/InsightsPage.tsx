import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Select } from "../components/ui/Input";
import { Reveal } from "../components/ui/Reveal";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { fadeUp, fadeUpSm, stagger, scaleIn } from "../lib/motion";
import type { InsightResult } from "../types";

function InsightList({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <p key={item} className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{item}</p>
        ))}
      </div>
    </Card>
  );
}

export function InsightsPage() {
  const { token } = useAuth();
  const [datasetId, setDatasetId] = useState("");
  const datasets = useQuery({ queryKey: ["datasets"], queryFn: () => api.datasets(token!), enabled: Boolean(token) });
  const insights = useMutation<InsightResult, Error, number>({ mutationFn: (id) => api.insights(token!, id) });

  return (
    <div className="space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><h1 className="text-3xl font-semibold">AI insights</h1><p className="mt-2 text-muted-foreground">Generate executive summaries, key findings, anomalies, risks, and next actions.</p></div>
        <div className="flex gap-2">
          <Select value={datasetId} onChange={(e) => setDatasetId(e.target.value)} className="w-64"><option value="">Choose dataset</option>{datasets.data?.datasets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select>
          <Button disabled={!datasetId || insights.isPending} onClick={() => insights.mutate(Number(datasetId))}>{insights.isPending ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} Generate</Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {insights.error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600"
          >
            {insights.error.message}
          </motion.p>
        )}
      </AnimatePresence>

      {insights.data ? (
        <>
          <motion.div variants={scaleIn} initial="hidden" animate="show">
            <Card className="bg-primary/10">
              <CardHeader><CardTitle>Executive summary</CardTitle><Badge>{insights.data.source}</Badge></CardHeader>
              <p className="text-muted-foreground">{insights.data.executive_summary}</p>
              {insights.data.ai_narrative && <p className="mt-4 whitespace-pre-line text-sm leading-6">{insights.data.ai_narrative}</p>}
            </Card>
          </motion.div>
          <motion.div className="grid gap-4 md:grid-cols-2" variants={stagger} initial="hidden" animate="show">
            {[
              { title: "Key findings", items: insights.data.key_findings },
              { title: "Patterns", items: insights.data.patterns },
              { title: "Anomalies", items: insights.data.anomalies },
              { title: "Recommendations", items: insights.data.recommendations },
              { title: "Potential risks", items: insights.data.potential_risks },
              { title: "Next actions", items: insights.data.next_actions },
            ].map(({ title, items }) => (
              <motion.div key={title} variants={fadeUpSm}>
                <InsightList title={title} items={items} />
              </motion.div>
            ))}
          </motion.div>
        </>
      ) : (
        <Reveal>
          <Card className="grid min-h-72 place-items-center text-center text-muted-foreground">
            <div className="space-y-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="mx-auto h-10 w-10 text-primary/40" />
              </motion.div>
              <p>Select a dataset to generate business-ready insights.</p>
            </div>
          </Card>
        </Reveal>
      )}
    </div>
  );
}
