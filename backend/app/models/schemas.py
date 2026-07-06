from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict[str, Any]


class CleanRequest(BaseModel):
    operation: Literal[
        "remove_duplicates",
        "fill_missing",
        "drop_missing",
        "normalize",
        "standardize",
        "rename_column",
        "convert_types",
        "undo",
    ]
    column: str | None = None
    value: str | float | int | None = None
    new_name: str | None = None
    target_type: Literal["string", "number", "date", "boolean"] | None = None
    preview: bool = True


class ChartRequest(BaseModel):
    chart_type: Literal["bar", "line", "pie", "scatter", "histogram", "area", "box", "heatmap"]
    x: str | None = None
    y: str | None = None
    group_by: str | None = None


class MLRequest(BaseModel):
    task: Literal["auto", "regression", "classification", "clustering", "outlier"] = "auto"
    target: str | None = None


class ForecastRequest(BaseModel):
    date_column: str | None = None
    value_column: str | None = None
    periods: int = Field(default=7, ge=1, le=60)


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=1000)


class SettingsRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    openrouter_api_key: str | None = Field(default=None, max_length=500)
