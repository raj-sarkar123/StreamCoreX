import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.validate import router as validate_router
from routes.download import router as download_router


app = FastAPI(
    title="Video Downloader API",
    description="Authorized video downloader backend service for YouTube and Instagram media.",
    version="1.0.0",
)


# ============================================================
# CORS Configuration
# ============================================================

# Local development fallback.
# In production, Render will provide FRONTEND_URL as an
# environment variable containing your Vercel frontend URL.
frontend_url = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000",
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",

    # Production frontend URL from Render environment variable
    frontend_url,

    # Tauri desktop application
    "tauri://localhost",
    "http://tauri.localhost",
]


# Remove duplicates while preserving order
origins = list(dict.fromkeys(origins))


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

    # Required so the browser can access the download filename
    # from the Content-Disposition response header.
    expose_headers=["Content-Disposition"],
)


# ============================================================
# API Routes
# ============================================================

app.include_router(
    validate_router,
    prefix="/api",
    tags=["Validation"],
)

app.include_router(
    download_router,
    prefix="/api",
    tags=["Download"],
)


# ============================================================
# Root Endpoint
# ============================================================

@app.get("/")
async def root():
    return {
        "app": "Video Downloader Backend API",
        "status": "online",
        "version": "1.0.0",
    }


# ============================================================
# Local Development
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )