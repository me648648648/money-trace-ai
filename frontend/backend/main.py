"""组长负责：路由层。"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

APP_DIR = Path(__file__).resolve().parent.parent
FRONTEND = APP_DIR / "frontend"

app = FastAPI(title="账页 mini API")


@app.post("/api/parse")
def api_parse(payload: dict) -> dict:
    raise NotImplementedError


@app.get("/api/transactions")
def api_list(limit: int = 20) -> dict:
    raise NotImplementedError


@app.post("/api/transactions")
def api_create(payload: dict) -> dict:
    raise NotImplementedError


@app.delete("/api/transactions/{tx_id}")
def api_delete(tx_id: int) -> dict:
    raise NotImplementedError


@app.get("/api/summary")
def api_summary(month: str = "2026-11") -> dict:
    raise NotImplementedError


@app.get("/api/categories")
def api_categories() -> dict:
    raise NotImplementedError


@app.post("/api/query")
def api_query(payload: dict) -> dict:
    raise NotImplementedError


@app.get("/api/budget")
def api_budget_get(month: str = "2026-11") -> dict:
    raise NotImplementedError


@app.put("/api/budget")
def api_budget_put(payload: dict) -> dict:
    raise NotImplementedError


@app.get("/")
def index() -> FileResponse:
    return FileResponse(FRONTEND / "index.html")


app.mount("/static", StaticFiles(directory=FRONTEND), name="static")
