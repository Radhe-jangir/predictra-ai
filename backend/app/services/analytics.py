import json
import math
import os
import re
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest, RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import accuracy_score, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor

DATASET_DIR = Path("storage/datasets")
REPORT_DIR = Path("storage/reports")
DATASET_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)


def safe_filename(filename: str) -> str:
    stem = re.sub(r"[^a-zA-Z0-9_.-]+", "-", Path(filename).stem).strip("-") or "dataset"
    suffix = Path(filename).suffix.lower()
    return f"{stem}-{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}{suffix}"


def load_dataframe(path: str) -> pd.DataFrame:
    suffix = Path(path).suffix.lower()
    if suffix in {".xlsx", ".xls"}:
        return pd.read_excel(path)
    return pd.read_csv(path)


def save_dataframe(df: pd.DataFrame, path: str) -> None:
    if Path(path).suffix.lower() in {".xlsx", ".xls"}:
        df.to_excel(path, index=False)
    else:
        df.to_csv(path, index=False)


def write_upload(fileobj: Any, filename: str) -> str:
    target = DATASET_DIR / safe_filename(filename)
    with target.open("wb") as buffer:
        shutil.copyfileobj(fileobj, buffer)
    return str(target)


def _jsonable(value: Any) -> Any:
    if pd.isna(value):
        return None
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        if math.isinf(float(value)) or math.isnan(float(value)):
            return None
        return float(value)
    if isinstance(value, (datetime, pd.Timestamp)):
        return value.isoformat()
    return value


def _category(series: pd.Series) -> str:
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    unique_ratio = series.nunique(dropna=True) / max(len(series), 1)
    if unique_ratio < 0.2:
        return "categorical"
    return "text"


def profile_dataframe(df: pd.DataFrame) -> dict[str, Any]:
    missing = int(df.isna().sum().sum())
    duplicates = int(df.duplicated().sum())
    total_cells = max(int(df.shape[0] * df.shape[1]), 1)
    missing_score = 1 - missing / total_cells
    duplicate_score = 1 - duplicates / max(int(df.shape[0]), 1)
    quality = round(max(0, min(100, (missing_score * 0.65 + duplicate_score * 0.35) * 100)), 1)
    columns = []
    suggestions = []

    for name in df.columns:
        series = df[name]
        missing_count = int(series.isna().sum())
        category = _category(series)
        columns.append(
            {
                "name": str(name),
                "dtype": str(series.dtype),
                "category": category,
                "missing": missing_count,
                "unique": int(series.nunique(dropna=True)),
                "sample": [_jsonable(v) for v in series.dropna().head(5).tolist()],
            }
        )
        if missing_count:
            suggestions.append(f"Fill or drop {missing_count} missing values in {name}.")
        if category == "numeric" and series.nunique(dropna=True) > 10:
            suggestions.append(f"Normalize or standardize {name} before ML modeling.")

    if duplicates:
        suggestions.append(f"Remove {duplicates} duplicate rows.")
    if not suggestions:
        suggestions.append("Dataset is clean enough for immediate exploration.")

    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "missing_values": missing,
        "duplicate_rows": duplicates,
        "unique_values": int(sum(df[col].nunique(dropna=True) for col in df.columns)),
        "memory_usage_mb": round(float(df.memory_usage(deep=True).sum()) / 1024 / 1024, 3),
        "data_quality_score": quality,
        "columns_meta": columns,
        "cleaning_suggestions": suggestions[:8],
    }


def preview_dataframe(df: pd.DataFrame, limit: int = 50) -> dict[str, Any]:
    return {
        "columns": [str(c) for c in df.columns],
        "rows": [{str(k): _jsonable(v) for k, v in row.items()} for row in df.head(limit).to_dict("records")],
    }


def chart_payload(df: pd.DataFrame, chart_type: str, x: str | None, y: str | None, group_by: str | None = None) -> dict[str, Any]:
    numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
    categorical_cols = [c for c in df.columns if not pd.api.types.is_numeric_dtype(df[c])]
    x = x or (categorical_cols[0] if categorical_cols else str(df.columns[0]))
    y = y or (numeric_cols[0] if numeric_cols else str(df.columns[-1]))

    if chart_type == "heatmap":
        corr = df[numeric_cols].corr(numeric_only=True).fillna(0) if numeric_cols else pd.DataFrame()
        return {"chart_type": chart_type, "columns": list(corr.columns), "matrix": corr.round(3).values.tolist()}

    if chart_type == "histogram":
        series = pd.to_numeric(df[y], errors="coerce").dropna()
        counts, bins = np.histogram(series, bins=min(12, max(3, int(np.sqrt(max(len(series), 1))))))
        data = [{"name": f"{round(float(bins[i]), 2)}", "value": int(counts[i])} for i in range(len(counts))]
        return {"chart_type": chart_type, "x": y, "y": "count", "data": data}

    if chart_type == "box":
        series = pd.to_numeric(df[y], errors="coerce").dropna()
        return {
            "chart_type": chart_type,
            "x": y,
            "data": [
                {"name": "min", "value": float(series.min())},
                {"name": "q1", "value": float(series.quantile(0.25))},
                {"name": "median", "value": float(series.median())},
                {"name": "q3", "value": float(series.quantile(0.75))},
                {"name": "max", "value": float(series.max())},
            ],
        }

    if chart_type in {"scatter", "line", "area"}:
        data = df[[x, y]].dropna().head(500)
        return {
            "chart_type": chart_type,
            "x": x,
            "y": y,
            "data": [{"name": _jsonable(row[x]), "x": _jsonable(row[x]), "value": _jsonable(row[y])} for _, row in data.iterrows()],
        }

    if group_by and group_by in df.columns:
        grouped = df.groupby([x, group_by], dropna=False)[y].sum(numeric_only=True).reset_index().head(50)
        data = [{str(k): _jsonable(v) for k, v in row.items()} for row in grouped.to_dict("records")]
    elif pd.api.types.is_numeric_dtype(df[y]):
        grouped = df.groupby(x, dropna=False)[y].sum().sort_values(ascending=False).head(20).reset_index()
        data = [{"name": _jsonable(row[x]), "value": _jsonable(row[y])} for _, row in grouped.iterrows()]
    else:
        counts = df[x].value_counts(dropna=False).head(20)
        data = [{"name": _jsonable(index), "value": int(value)} for index, value in counts.items()]

    return {"chart_type": chart_type, "x": x, "y": y, "data": data}


def clean_dataframe(df: pd.DataFrame, operation: str, column: str | None = None, value: Any = None, new_name: str | None = None, target_type: str | None = None) -> pd.DataFrame:
    result = df.copy()
    if operation == "remove_duplicates":
        return result.drop_duplicates()
    if operation == "drop_missing":
        return result.dropna(subset=[column] if column else None)
    if operation == "fill_missing":
        if column and column in result.columns:
            fill = value if value is not None else (result[column].median() if pd.api.types.is_numeric_dtype(result[column]) else "Unknown")
            result[column] = result[column].fillna(fill)
        else:
            for col in result.columns:
                fill = result[col].median() if pd.api.types.is_numeric_dtype(result[col]) else "Unknown"
                result[col] = result[col].fillna(fill)
        return result
    if operation == "normalize":
        cols = [column] if column else [c for c in result.columns if pd.api.types.is_numeric_dtype(result[c])]
        for col in cols:
            if col in result.columns:
                minimum, maximum = result[col].min(), result[col].max()
                if maximum != minimum:
                    result[col] = (result[col] - minimum) / (maximum - minimum)
        return result
    if operation == "standardize":
        cols = [column] if column else [c for c in result.columns if pd.api.types.is_numeric_dtype(result[c])]
        for col in cols:
            if col in result.columns and result[col].std() != 0:
                result[col] = (result[col] - result[col].mean()) / result[col].std()
        return result
    if operation == "rename_column" and column and new_name:
        return result.rename(columns={column: new_name})
    if operation == "convert_types" and column and target_type:
        if target_type == "number":
            result[column] = pd.to_numeric(result[column], errors="coerce")
        elif target_type == "date":
            result[column] = pd.to_datetime(result[column], errors="coerce")
        elif target_type == "boolean":
            result[column] = result[column].astype(str).str.lower().isin(["true", "1", "yes", "y"])
        else:
            result[column] = result[column].astype(str)
    return result


def local_insights(df: pd.DataFrame) -> dict[str, Any]:
    profile = profile_dataframe(df)
    numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
    categorical_cols = [c for c in df.columns if not pd.api.types.is_numeric_dtype(df[c])]
    findings = []
    anomalies = []
    recommendations = []

    if numeric_cols:
        variances = df[numeric_cols].var(numeric_only=True).sort_values(ascending=False)
        top_metric = str(variances.index[0])
        findings.append(f"{top_metric} shows the strongest spread and is likely a key performance driver.")
        for col in numeric_cols[:6]:
            series = df[col].dropna()
            if len(series) > 4:
                z = np.abs((series - series.mean()) / (series.std() or 1))
                outliers = int((z > 3).sum())
                if outliers:
                    anomalies.append(f"{col} has {outliers} statistical outliers beyond 3 standard deviations.")
        recommendations.append(f"Use {top_metric} as a primary KPI in dashboards and forecasting.")

    if categorical_cols and numeric_cols:
        cat, metric = categorical_cols[0], numeric_cols[0]
        leaders = df.groupby(cat)[metric].sum(numeric_only=True).sort_values(ascending=False).head(3)
        if not leaders.empty:
            findings.append(f"Top {cat} values by {metric}: {', '.join(map(str, leaders.index.tolist()))}.")
            recommendations.append(f"Segment strategy around the strongest {cat} groups.")

    if profile["data_quality_score"] < 85:
        recommendations.append("Improve data quality before executive reporting or model training.")

    return {
        "executive_summary": f"Analyzed {profile['rows']} rows across {profile['columns']} columns with a {profile['data_quality_score']} data quality score.",
        "dataset_explanation": "Predictra categorized columns, inspected missingness, duplicates, distributions, outliers, and relationships.",
        "key_findings": findings or ["Dataset is structurally valid and ready for exploratory analysis."],
        "patterns": findings[:3] or ["No dominant pattern was detected from local statistics."],
        "anomalies": anomalies or ["No major statistical anomalies detected."],
        "recommendations": recommendations or ["Upload additional historical data to improve forecasting confidence."],
        "potential_risks": profile["cleaning_suggestions"],
        "next_actions": ["Review chart correlations", "Apply cleaning suggestions", "Run ML with the strongest target column"],
    }


def answer_question(df: pd.DataFrame, question: str) -> str:
    q = question.lower()
    numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
    categorical_cols = [c for c in df.columns if not pd.api.types.is_numeric_dtype(df[c])]

    mentioned_numeric = next((c for c in numeric_cols if c.lower() in q), numeric_cols[0] if numeric_cols else None)
    mentioned_category = next((c for c in categorical_cols if c.lower() in q), categorical_cols[0] if categorical_cols else None)

    if not mentioned_numeric:
        return f"The dataset has {len(df)} rows and {len(df.columns)} columns. Ask about a column name for a more specific answer."

    series = pd.to_numeric(df[mentioned_numeric], errors="coerce")
    if any(word in q for word in ["highest", "max", "top", "best"]):
        if mentioned_category:
            grouped = df.groupby(mentioned_category)[mentioned_numeric].sum(numeric_only=True).sort_values(ascending=False).head(5)
            return f"The highest {mentioned_numeric} by {mentioned_category} is {grouped.index[0]} with {round(float(grouped.iloc[0]), 2)}. Top groups: {', '.join(map(str, grouped.index.tolist()))}."
        idx = series.idxmax()
        return f"The highest {mentioned_numeric} is {round(float(series.max()), 2)} at row {int(idx) + 1}."
    if any(word in q for word in ["lowest", "min", "worst"]):
        idx = series.idxmin()
        return f"The lowest {mentioned_numeric} is {round(float(series.min()), 2)} at row {int(idx) + 1}."
    if any(word in q for word in ["average", "mean"]):
        return f"The average {mentioned_numeric} is {round(float(series.mean()), 2)}."
    if any(word in q for word in ["trend", "growth"]):
        x = np.arange(len(series.dropna())).reshape(-1, 1)
        y = series.dropna().values
        if len(y) < 2:
            return "There is not enough numeric history to calculate a trend."
        slope = LinearRegression().fit(x, y).coef_[0]
        direction = "upward" if slope > 0 else "downward" if slope < 0 else "flat"
        return f"{mentioned_numeric} shows a {direction} trend with an estimated change of {round(float(slope), 3)} per row."
    return f"{mentioned_numeric} totals {round(float(series.sum()), 2)}, averages {round(float(series.mean()), 2)}, and ranges from {round(float(series.min()), 2)} to {round(float(series.max()), 2)}."


def run_ml(df: pd.DataFrame, task: str = "auto", target: str | None = None) -> dict[str, Any]:
    usable = df.dropna().copy()
    if len(usable) < 5:
        return {"task": task, "message": "Need at least 5 complete rows for modeling.", "metrics": {}}

    numeric_cols = [c for c in usable.columns if pd.api.types.is_numeric_dtype(usable[c])]
    if task == "outlier":
        features = usable[numeric_cols]
        if features.empty:
            return {"task": "outlier", "message": "No numeric columns available.", "metrics": {}}
        preds = IsolationForest(contamination="auto", random_state=42).fit_predict(features)
        return {"task": "outlier", "metrics": {"outliers": int((preds == -1).sum()), "inliers": int((preds == 1).sum())}}

    if task == "clustering" or (task == "auto" and not target):
        features = usable[numeric_cols]
        if features.shape[1] < 1:
            return {"task": "clustering", "message": "No numeric columns available.", "metrics": {}}
        scaled = StandardScaler().fit_transform(features)
        k = min(4, max(2, len(usable) // 10))
        labels = KMeans(n_clusters=k, n_init=10, random_state=42).fit_predict(scaled)
        return {"task": "clustering", "metrics": {"clusters": k, "cluster_sizes": pd.Series(labels).value_counts().sort_index().to_dict()}}

    target = target or (numeric_cols[-1] if numeric_cols else str(usable.columns[-1]))
    if target not in usable.columns:
        return {"task": task, "message": "Target column not found.", "metrics": {}}

    X = pd.get_dummies(usable.drop(columns=[target]), drop_first=True)
    y = usable[target]
    if X.empty:
        return {"task": task, "message": "No usable feature columns.", "metrics": {}}
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

    is_classification = task == "classification" or (task == "auto" and (not pd.api.types.is_numeric_dtype(y) or y.nunique() <= 12))
    if is_classification:
        y_train, y_test = y_train.astype(str), y_test.astype(str)
        rf = RandomForestClassifier(n_estimators=80, random_state=42).fit(X_train, y_train)
        tree = DecisionTreeClassifier(random_state=42).fit(X_train, y_train)
        rf_pred, tree_pred = rf.predict(X_test), tree.predict(X_test)
        importances = sorted(zip(X.columns, rf.feature_importances_), key=lambda item: item[1], reverse=True)[:8]
        return {
            "task": "classification",
            "metrics": {"random_forest_accuracy": round(float(accuracy_score(y_test, rf_pred)), 3), "decision_tree_accuracy": round(float(accuracy_score(y_test, tree_pred)), 3)},
            "important_features": [{"feature": f, "importance": round(float(v), 3)} for f, v in importances],
        }

    y_train_num, y_test_num = pd.to_numeric(y_train, errors="coerce"), pd.to_numeric(y_test, errors="coerce")
    lr = LinearRegression().fit(X_train, y_train_num)
    rf = RandomForestRegressor(n_estimators=80, random_state=42).fit(X_train, y_train_num)
    tree = DecisionTreeRegressor(random_state=42).fit(X_train, y_train_num)
    lr_pred, rf_pred, tree_pred = lr.predict(X_test), rf.predict(X_test), tree.predict(X_test)
    importances = sorted(zip(X.columns, rf.feature_importances_), key=lambda item: item[1], reverse=True)[:8]
    return {
        "task": "regression",
        "metrics": {
            "linear_regression_r2": round(float(r2_score(y_test_num, lr_pred)), 3),
            "random_forest_mae": round(float(mean_absolute_error(y_test_num, rf_pred)), 3),
            "decision_tree_mae": round(float(mean_absolute_error(y_test_num, tree_pred)), 3),
        },
        "important_features": [{"feature": f, "importance": round(float(v), 3)} for f, v in importances],
    }


def forecast(df: pd.DataFrame, date_column: str | None, value_column: str | None, periods: int) -> dict[str, Any]:
    numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
    value_column = value_column or (numeric_cols[0] if numeric_cols else None)
    if not value_column:
        return {"message": "No numeric column available for forecasting.", "forecast": []}
    series = pd.to_numeric(df[value_column], errors="coerce").dropna().reset_index(drop=True)
    if len(series) < 2:
        return {"message": "Need at least two numeric values for forecasting.", "forecast": []}
    x = np.arange(len(series)).reshape(-1, 1)
    model = LinearRegression().fit(x, series.values)
    future_x = np.arange(len(series), len(series) + periods).reshape(-1, 1)
    values = model.predict(future_x)
    growth = (values[-1] - series.iloc[-1]) / (abs(series.iloc[-1]) or 1) * 100
    return {
        "value_column": value_column,
        "trend": "up" if model.coef_[0] > 0 else "down" if model.coef_[0] < 0 else "flat",
        "growth_estimate_percent": round(float(growth), 2),
        "forecast": [{"period": i + 1, "value": round(float(v), 2)} for i, v in enumerate(values)],
    }


def export_pdf(df: pd.DataFrame, insights: dict[str, Any], dataset_name: str) -> str:
    target = REPORT_DIR / f"{safe_filename(dataset_name).rsplit('.', 1)[0]}.pdf"
    doc = SimpleDocTemplate(str(target), pagesize=letter)
    styles = getSampleStyleSheet()
    profile = profile_dataframe(df)
    story = [
        Paragraph("Predictra AI Dataset Intelligence Report", styles["Title"]),
        Spacer(1, 14),
        Paragraph(dataset_name, styles["Heading2"]),
        Paragraph(insights["executive_summary"], styles["BodyText"]),
        Spacer(1, 12),
    ]
    table = Table(
        [
            ["Rows", profile["rows"]],
            ["Columns", profile["columns"]],
            ["Missing Values", profile["missing_values"]],
            ["Duplicate Rows", profile["duplicate_rows"]],
            ["Quality Score", profile["data_quality_score"]],
        ]
    )
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#edf2ff")), ("GRID", (0, 0), (-1, -1), 0.5, colors.grey)]))
    story.extend([table, Spacer(1, 14), Paragraph("Recommendations", styles["Heading2"])])
    for item in insights["recommendations"]:
        story.append(Paragraph(f"- {item}", styles["BodyText"]))
    story.extend([Spacer(1, 12), Paragraph("Key Findings", styles["Heading2"])])
    for item in insights["key_findings"]:
        story.append(Paragraph(f"- {item}", styles["BodyText"]))
    doc.build(story)
    return str(target)


def export_csv(df: pd.DataFrame, dataset_name: str) -> str:
    target = REPORT_DIR / f"{safe_filename(dataset_name).rsplit('.', 1)[0]}.csv"
    df.to_csv(target, index=False)
    return str(target)


def json_dumps(data: Any) -> str:
    return json.dumps(data, default=str)


def json_loads(data: str) -> Any:
    return json.loads(data or "{}")
