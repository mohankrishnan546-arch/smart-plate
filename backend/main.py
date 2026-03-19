"""
Smart Plate — FastAPI Backend + Frontend (Combined)
Food Recognition + Nutrition + Health Rule Engine
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routers import recognition, nutrition, health, meals, auth
from app.database import engine, Base
import os

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Plate API",
    description="Food Recognition & Health Analytics Platform",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"DEBUG: {request.method} {request.url}")
    response = await call_next(request)
    print(f"DEBUG: Response {response.status_code}")
    return response

# ── API Routers ───────────────────────────────────────────────────────────────
app.include_router(auth.router,        prefix="/api/v1/auth",       tags=["Auth"])
app.include_router(recognition.router, prefix="/api/v1/recognize",  tags=["Food Recognition"])
app.include_router(nutrition.router,   prefix="/api/v1/nutrition",  tags=["Nutrition"])
app.include_router(health.router,      prefix="/api/v1/health",     tags=["Health Engine"])
app.include_router(meals.router,       prefix="/api/v1/meals",      tags=["Meal Log"])

# ── Serve React Build ─────────────────────────────────────────────────────────
DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.isdir(DIST):
    ASSETS = os.path.join(DIST, "assets")
    if os.path.isdir(ASSETS):
        app.mount("/assets", StaticFiles(directory=ASSETS), name="assets")

    @app.get("/")
    async def index():
        return FileResponse(os.path.join(DIST, "index.html"))

    @app.get("/{full_path:path}")
    async def spa_catch_all(full_path: str):
        # Let API & Swagger handle themselves
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json"):
            raise HTTPException(status_code=404, detail="Not found")
        # Serve real static file if it exists (logo.png, vite.svg, etc.)
        candidate = os.path.join(DIST, full_path)
        if os.path.isfile(candidate):
            return FileResponse(candidate)
        # Otherwise hand off to React Router
        return FileResponse(os.path.join(DIST, "index.html"))

else:
    @app.get("/")
    async def root():
        return {
            "service": "Smart Plate",
            "status": "running",
            "note": "Frontend not built. Run: cd frontend && npm run build",
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
