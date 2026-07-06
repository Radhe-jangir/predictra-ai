import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart3, Brain, Download, Eraser, FileSpreadsheet, Loader2, RefreshCw, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnimatedNumber } from "../components/ui/AnimatedNumber";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Reveal } from "../components/ui/Reveal";
import { Select } from "../components/ui/Input";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { fadeUp, fadeUpSm, stagger, fadeIn } from "../lib/motion";
import { downloadBlob, formatNumber } from "../lib/utils";
import type { Dataset, DatasetDetail } from "../types";

const palette = ["#14b8a6", "#0ea5e9", "#8b5cf6", "#f43f5e", "#f59e0b", "#84cc16"];

/* ---------- Custom chart tooltip ---------- */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="label">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="value" style={{ color: entry.color }}>
          {entry.name}: {new Intl.NumberFormat().format(entry.value)}
        </p>
      ))}
    </div>
  );
}

/* ---------- SVG gradient definitions ---------- */
function ChartGradients() {
  return (
    <defs>
      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.6} />
      </linearGradient>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
      </linearGradient>
      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#14b8a6" />
        <stop offset="50%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  );
}

/* ---------- Shared axis / grid props ---------- */
const gridProps = { strokeDasharray: "3 6", stroke: "rgba(128,128,128,0.15)" } as const;
const axisTickProps = { fontSize: 12, fill: "hsl(var(--muted-foreground))" } as const;
const axisProps = { axisLine: false, tickLine: false, tick: axisTickProps } as const;

/* ---------- Chart panel ---------- */
function ChartPanel({ chart }: { chart: Record<string, unknown> | undefined }) {
  const data = ((chart?.data as Record<string, unknown>[] | undefined) ?? []).map((row) => ({ ...row, value: Number(row.value ?? 0) }));
  const type = chart?.chart_type;

  if (!chart) {
    return (
      <div className="grid h-80 place-items-center text-center">
        <div className="space-y-3">
          <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Choose columns and generate a chart.</p>
        </div>
      </div>
    );
  }

  if (type === "heatmap") {
    const columns = (chart.columns as string[]) ?? [];
    const matrix = (chart.matrix as number[][]) ?? [];
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="show" className="overflow-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-1 text-xs">
          <tbody>
            <tr><td />{columns.map((c) => <th key={c} className="p-2 text-left">{c}</th>)}</tr>
            {matrix.map((row, i) => (
              <tr key={columns[i]}>
                <th className="p-2 text-left">{columns[i]}</th>
                {row.map((value, j) => (
                  <td
                    key={`${i}-${j}`}
                    className="rounded-md p-2 text-center transition-colors duration-200"
                    style={{ background: `rgba(20,184,166,${Math.abs(value)})` }}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    );
  }

  if (type === "pie") {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="show">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              innerRadius={55}
              paddingAngle={3}
              strokeWidth={2}
              stroke="hsl(var(--background))"
            >
              {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  if (type === "line") {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="show">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <ChartGradients />
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#lineGrad)"
              strokeWidth={3}
              dot={{ r: 4, fill: "#14b8a6", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  if (type === "area") {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="show">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <ChartGradients />
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              fill="url(#areaGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  if (type === "scatter") {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="show">
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="x" name="x" {...axisProps} />
            <YAxis dataKey="value" {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={data}
              fill="#8b5cf6"
              opacity={0.7}
              shape={<circle r={5} />}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  // Default: bar chart
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <ChartGradients />
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function DatasetsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [chartType, setChartType] = useState("bar");
  const [xColumn, setXColumn] = useState("");
  const [yColumn, setYColumn] = useState("");
  const [chart, setChart] = useState<Record<string, unknown>>();
  const [mlResult, setMlResult] = useState<Record<string, unknown>>();
  const [forecastResult, setForecastResult] = useState<Record<string, unknown>>();
  const [cleanPreview, setCleanPreview] = useState<Record<string, unknown>>();

  const datasets = useQuery({ queryKey: ["datasets"], queryFn: () => api.datasets(token!), enabled: Boolean(token) });
  const selected = useMemo<Dataset | undefined>(() => datasets.data?.datasets.find((item) => item.id === (selectedId ?? datasets.data?.datasets[0]?.id)), [datasets.data, selectedId]);
  const detail = useQuery({ queryKey: ["dataset", selected?.id], queryFn: () => api.dataset(token!, selected!.id), enabled: Boolean(token && selected) });
  const columns = detail.data?.preview.columns ?? selected?.summary.columns_meta.map((c) => c.name) ?? [];
  const numericColumns = selected?.summary.columns_meta.filter((c) => c.category === "numeric").map((c) => c.name) ?? columns;

  const upload = useMutation({
    mutationFn: (file: File) => api.upload(token!, file),
    onSuccess: (data: DatasetDetail) => {
      setSelectedId(data.dataset.id);
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
  });

  async function generateChart() {
    if (!selected) return;
    const payload = await api.chart(token!, selected.id, { chart_type: chartType, x: xColumn || undefined, y: yColumn || undefined });
    setChart(payload);
  }

  async function runClean(operation: string, preview = true) {
    if (!selected) return;
    const result = await api.clean(token!, selected.id, { operation, column: yColumn || xColumn || undefined, preview });
    setCleanPreview(result);
    if (!preview) queryClient.invalidateQueries({ queryKey: ["dataset", selected.id] });
  }

  async function runMl(task: string) {
    if (!selected) return;
    setMlResult(await api.ml(token!, selected.id, { task, target: yColumn || undefined }));
  }

  async function runForecast() {
    if (!selected) return;
    setForecastResult(await api.forecast(token!, selected.id, { value_column: yColumn || numericColumns[0], periods: 10 }));
  }

  async function exportFile(kind: "csv" | "pdf") {
    if (!selected) return;
    const blob = await api.exportBlob(token!, selected.id, kind);
    downloadBlob(blob, `${selected.name}.${kind}`);
  }

  return (
    <div className="space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><h1 className="text-3xl font-semibold">Dataset intelligence</h1><p className="mt-2 text-muted-foreground">Upload, clean, visualize, model, forecast, and export real data.</p></div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">
          {upload.isPending ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />} Upload CSV or Excel
          <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={(event) => event.target.files?.[0] && upload.mutate(event.target.files[0])} />
        </label>
      </motion.div>
      {upload.error && <p className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">{upload.error.message}</p>}

      <motion.div className="grid gap-4 md:grid-cols-4" variants={stagger} initial="hidden" animate="show">
        {datasets.isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />) : datasets.data?.datasets.map((dataset) => (
          <motion.div key={dataset.id} variants={fadeUpSm}>
            <button onClick={() => setSelectedId(dataset.id)} className={`glow-border w-full rounded-lg border p-4 text-left transition hover:bg-muted ${selected?.id === dataset.id ? "border-primary bg-primary/10" : "border-border bg-background"}`}>
              <FileSpreadsheet className="mb-3 text-primary" />
              <p className="truncate font-semibold">{dataset.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{formatNumber(dataset.summary.rows)} rows · {dataset.summary.data_quality_score}% quality</p>
            </button>
          </motion.div>
        ))}
      </motion.div>

      {selected ? (
        <>
          <motion.div className="grid gap-4 md:grid-cols-6" variants={stagger} initial="hidden" animate="show">
            {([
              ["Rows", selected.summary.rows, true],
              ["Columns", selected.summary.columns, true],
              ["Missing", selected.summary.missing_values, true],
              ["Duplicates", selected.summary.duplicate_rows, true],
              ["Unique", selected.summary.unique_values, true],
              ["Quality", `${selected.summary.data_quality_score}%`, false],
            ] as [string, number | string, boolean][]).map(([label, value, isNumeric]) => (
              <motion.div key={label} variants={fadeUpSm}>
                <Card animate>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {isNumeric ? <AnimatedNumber value={value as number} /> : value}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <Reveal>
            <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
              <Card>
                <CardHeader><CardTitle>Preview</CardTitle><Badge>{detail.data?.preview.rows.length ?? 0} rows shown</Badge></CardHeader>
                <div className="max-h-96 overflow-auto rounded-md border border-border">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="sticky top-0 bg-muted"><tr>{columns.map((column) => <th key={column} className="p-3 font-medium">{column}</th>)}</tr></thead>
                    <tbody>{detail.data?.preview.rows.map((row, i) => <tr key={i} className="border-t border-border">{columns.map((column) => <td key={column} className="max-w-48 truncate p-3">{String(row[column] ?? "")}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <CardHeader><CardTitle>Visualizations</CardTitle><Button size="sm" onClick={generateChart}><BarChart3 size={16} /> Generate</Button></CardHeader>
                <div className="mb-4 grid gap-3 md:grid-cols-3">
                  <Select value={chartType} onChange={(e) => setChartType(e.target.value)}>{["bar", "line", "pie", "scatter", "histogram", "area", "box", "heatmap"].map((item) => <option key={item}>{item}</option>)}</Select>
                  <Select value={xColumn} onChange={(e) => setXColumn(e.target.value)}><option value="">Auto X</option>{columns.map((column) => <option key={column}>{column}</option>)}</Select>
                  <Select value={yColumn} onChange={(e) => setYColumn(e.target.value)}><option value="">Auto Y</option>{numericColumns.map((column) => <option key={column}>{column}</option>)}</Select>
                </div>
                <ChartPanel chart={chart} />
              </Card>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-5 lg:grid-cols-3">
              <Card>
                <CardHeader><CardTitle>Cleaning</CardTitle><Eraser className="text-primary" /></CardHeader>
                <div className="grid gap-2">
                  {["remove_duplicates", "fill_missing", "drop_missing", "normalize", "standardize"].map((operation) => <Button key={operation} variant="secondary" onClick={() => runClean(operation)}>{operation.replace(/_/g, " ")}</Button>)}
                  <Button onClick={() => runClean("remove_duplicates", false)}><RefreshCw size={16} /> Apply duplicate removal</Button>
                </div>
                {cleanPreview && <pre className="mt-4 max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(cleanPreview.summary ?? cleanPreview, null, 2)}</pre>}
              </Card>
              <Card>
                <CardHeader><CardTitle>Machine learning</CardTitle><Brain className="text-primary" /></CardHeader>
                <div className="grid gap-2">{["auto", "regression", "classification", "clustering", "outlier"].map((task) => <Button key={task} variant="secondary" onClick={() => runMl(task)}>{task}</Button>)}</div>
                {mlResult && <pre className="mt-4 max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(mlResult, null, 2)}</pre>}
              </Card>
              <Card>
                <CardHeader><CardTitle>Forecast and export</CardTitle><Download className="text-primary" /></CardHeader>
                <Button className="w-full" onClick={runForecast}>Generate forecast</Button>
                <div className="mt-3 grid grid-cols-2 gap-2"><Button variant="secondary" onClick={() => exportFile("csv")}>CSV</Button><Button variant="secondary" onClick={() => exportFile("pdf")}>PDF</Button></div>
                {forecastResult && <pre className="mt-4 max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(forecastResult, null, 2)}</pre>}
              </Card>
            </div>
          </Reveal>
        </>
      ) : (
        <Reveal>
          <Card className="grid min-h-64 place-items-center text-center text-muted-foreground">
            <div className="space-y-3">
              <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p>Upload your first dataset to activate analytics.</p>
            </div>
          </Card>
        </Reveal>
      )}
    </div>
  );
}
