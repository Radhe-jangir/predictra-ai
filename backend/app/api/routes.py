import json
import os
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_token, current_user, hash_password, verify_password
from app.models.entities import Dataset, SavedReport, User
from app.models.schemas import (
    AuthResponse,
    ChartRequest,
    ChatRequest,
    CleanRequest,
    ForecastRequest,
    LoginRequest,
    MLRequest,
    SettingsRequest,
    SignupRequest,
)
from app.services.ai import chat_with_dataset, generate_ai_insights
from app.services.analytics import (
    chart_payload,
    clean_dataframe,
    export_pdf,
    export_csv as export_csv_file,
    forecast,
    json_dumps,
    json_loads,
    load_dataframe,
    preview_dataframe,
    profile_dataframe,
    run_ml,
    save_dataframe,
    write_upload,
    local_insights,
)

router = APIRouter()


def user_payload(user: User) -> dict:
    return {"id": user.id, "name": user.name, "email": user.email, "created_at": user.created_at.isoformat()}


def owned_dataset(dataset_id: int, user: User, db: Session) -> Dataset:
    dataset = db.get(Dataset, dataset_id)
    if not dataset or dataset.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset


def add_activity(dataset: Dataset, text: str) -> None:
    items = json_loads(dataset.activity_json or "[]")
    items.insert(0, {"text": text, "at": datetime.utcnow().isoformat()})
    dataset.activity_json = json_dumps(items[:20])
    dataset.updated_at = datetime.utcnow()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


@router.post("/auth/signup", response_model=AuthResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> AuthResponse:
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(name=payload.name.strip(), email=payload.email.lower(), password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(token=create_token(user.id), user=user_payload(user))


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return AuthResponse(token=create_token(user.id), user=user_payload(user))


@router.get("/me")
def me(user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    datasets = db.query(Dataset).filter(Dataset.owner_id == user.id).order_by(Dataset.created_at.desc()).limit(5).all()
    reports = db.query(SavedReport).filter(SavedReport.owner_id == user.id).order_by(SavedReport.created_at.desc()).limit(5).all()
    return {
        "user": user_payload(user),
        "recent_uploads": [{"id": d.id, "name": d.name, "created_at": d.created_at.isoformat()} for d in datasets],
        "saved_reports": [{"id": r.id, "title": r.title, "created_at": r.created_at.isoformat()} for r in reports],
    }


@router.patch("/settings")
def update_settings(payload: SettingsRequest, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    if payload.name:
        user.name = payload.name.strip()
    if payload.openrouter_api_key is not None:
        user.openrouter_api_key = payload.openrouter_api_key.strip()
    db.commit()
    return {"user": user_payload(user), "has_openrouter_key": bool(user.openrouter_api_key)}


@router.delete("/account")
def delete_account(user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    for dataset in db.query(Dataset).filter(Dataset.owner_id == user.id).all():
        if os.path.exists(dataset.stored_path):
            os.remove(dataset.stored_path)
        db.delete(dataset)
    db.delete(user)
    db.commit()
    return {"status": "deleted"}


@router.post("/datasets")
async def upload_dataset(file: UploadFile = File(...), user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".csv", ".xlsx", ".xls"}:
        raise HTTPException(status_code=400, detail="Upload a CSV or Excel file")
    contents = await file.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.max_upload_mb} MB limit")
    from io import BytesIO

    stored_path = write_upload(BytesIO(contents), file.filename or "dataset.csv")
    try:
        df = load_dataframe(stored_path)
    except Exception as exc:
        os.remove(stored_path)
        raise HTTPException(status_code=400, detail="Could not read the uploaded dataset") from exc
    if df.empty:
        os.remove(stored_path)
        raise HTTPException(status_code=400, detail="Dataset is empty")
    summary = profile_dataframe(df)
    dataset = Dataset(
        owner_id=user.id,
        name=Path(file.filename or "Dataset").stem,
        original_filename=file.filename or "dataset.csv",
        stored_path=stored_path,
        summary_json=json_dumps(summary),
        activity_json=json_dumps([{"text": "Dataset uploaded and profiled", "at": datetime.utcnow().isoformat()}]),
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return {"dataset": {"id": dataset.id, "name": dataset.name, "summary": summary}, "preview": preview_dataframe(df)}


@router.get("/datasets")
def list_datasets(user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    datasets = db.query(Dataset).filter(Dataset.owner_id == user.id).order_by(Dataset.updated_at.desc()).all()
    return {
        "datasets": [
            {
                "id": d.id,
                "name": d.name,
                "original_filename": d.original_filename,
                "created_at": d.created_at.isoformat(),
                "updated_at": d.updated_at.isoformat(),
                "summary": json.loads(d.summary_json),
            }
            for d in datasets
        ]
    }


@router.get("/datasets/{dataset_id}")
def dataset_detail(dataset_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    dataset = owned_dataset(dataset_id, user, db)
    df = load_dataframe(dataset.stored_path)
    return {
        "dataset": {
            "id": dataset.id,
            "name": dataset.name,
            "original_filename": dataset.original_filename,
            "summary": json.loads(dataset.summary_json),
            "activity": json_loads(dataset.activity_json),
        },
        "preview": preview_dataframe(df),
    }


@router.post("/datasets/{dataset_id}/charts")
def charts(dataset_id: int, payload: ChartRequest, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    dataset = owned_dataset(dataset_id, user, db)
    df = load_dataframe(dataset.stored_path)
    return chart_payload(df, payload.chart_type, payload.x, payload.y, payload.group_by)


@router.post("/datasets/{dataset_id}/clean")
def clean(dataset_id: int, payload: CleanRequest, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    dataset = owned_dataset(dataset_id, user, db)
    df = load_dataframe(dataset.stored_path)
    if payload.operation == "undo":
        backup = f"{dataset.stored_path}.bak"
        if not os.path.exists(backup):
            raise HTTPException(status_code=400, detail="No previous cleaning operation to undo")
        os.replace(backup, dataset.stored_path)
        df = load_dataframe(dataset.stored_path)
        add_activity(dataset, "Undid last cleaning change")
    else:
        cleaned = clean_dataframe(df, payload.operation, payload.column, payload.value, payload.new_name, payload.target_type)
        if payload.preview:
            return {"before": preview_dataframe(df, 8), "after": preview_dataframe(cleaned, 8), "summary": profile_dataframe(cleaned)}
        backup = f"{dataset.stored_path}.bak"
        save_dataframe(df, backup)
        save_dataframe(cleaned, dataset.stored_path)
        df = cleaned
        add_activity(dataset, f"Applied cleaning operation: {payload.operation}")
    dataset.summary_json = json_dumps(profile_dataframe(df))
    db.commit()
    return {"summary": json.loads(dataset.summary_json), "preview": preview_dataframe(df)}


@router.post("/datasets/{dataset_id}/ml")
def ml(dataset_id: int, payload: MLRequest, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    dataset = owned_dataset(dataset_id, user, db)
    result = run_ml(load_dataframe(dataset.stored_path), payload.task, payload.target)
    add_activity(dataset, f"Ran ML task: {result.get('task', payload.task)}")
    db.commit()
    return result


@router.post("/datasets/{dataset_id}/forecast")
def make_forecast(dataset_id: int, payload: ForecastRequest, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    dataset = owned_dataset(dataset_id, user, db)
    result = forecast(load_dataframe(dataset.stored_path), payload.date_column, payload.value_column, payload.periods)
    add_activity(dataset, "Generated forecast")
    db.commit()
    return result


@router.post("/datasets/{dataset_id}/insights")
async def insights(dataset_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    dataset = owned_dataset(dataset_id, user, db)
    df = load_dataframe(dataset.stored_path)
    result = await generate_ai_insights(df, json.loads(dataset.summary_json), user.openrouter_api_key)
    add_activity(dataset, f"Generated insights with {result.get('source')}")
    db.commit()
    return result


@router.post("/datasets/{dataset_id}/chat")
async def chat(dataset_id: int, payload: ChatRequest, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    dataset = owned_dataset(dataset_id, user, db)
    result = await chat_with_dataset(load_dataframe(dataset.stored_path), payload.question, json.loads(dataset.summary_json), user.openrouter_api_key)
    add_activity(dataset, "Asked a data question")
    db.commit()
    return result


@router.get("/datasets/{dataset_id}/export/csv")
def export_csv_route(dataset_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    dataset = owned_dataset(dataset_id, user, db)
    csv_path = export_csv_file(load_dataframe(dataset.stored_path), dataset.name)
    return FileResponse(csv_path, filename=f"{dataset.name}.csv", media_type="text/csv")


@router.get("/datasets/{dataset_id}/export/pdf")
def export_report(dataset_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    dataset = owned_dataset(dataset_id, user, db)
    df = load_dataframe(dataset.stored_path)
    report_path = export_pdf(df, local_insights(df), dataset.name)
    report = SavedReport(owner_id=user.id, dataset_id=dataset.id, title=f"{dataset.name} AI Report", path=report_path)
    db.add(report)
    add_activity(dataset, "Exported PDF report")
    db.commit()
    return FileResponse(report_path, filename=f"{dataset.name}-predictra-report.pdf", media_type="application/pdf")
