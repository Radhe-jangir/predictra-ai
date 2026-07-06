export type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export type ColumnMeta = {
  name: string;
  dtype: string;
  category: "numeric" | "categorical" | "datetime" | "text";
  missing: number;
  unique: number;
  sample: unknown[];
};

export type DatasetSummary = {
  rows: number;
  columns: number;
  missing_values: number;
  duplicate_rows: number;
  unique_values: number;
  memory_usage_mb: number;
  data_quality_score: number;
  columns_meta: ColumnMeta[];
  cleaning_suggestions: string[];
};

export type Dataset = {
  id: number;
  name: string;
  original_filename: string;
  created_at?: string;
  updated_at?: string;
  summary: DatasetSummary;
  activity?: { text: string; at: string }[];
};

export type Preview = {
  columns: string[];
  rows: Record<string, unknown>[];
};

export type DatasetDetail = {
  dataset: Dataset;
  preview: Preview;
};

export type InsightResult = {
  executive_summary: string;
  dataset_explanation: string;
  key_findings: string[];
  patterns: string[];
  anomalies: string[];
  recommendations: string[];
  potential_risks: string[];
  next_actions: string[];
  ai_narrative?: string;
  source: string;
};
