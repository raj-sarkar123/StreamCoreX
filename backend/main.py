from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.validate import router as validate_router
from routes.download import router as download_router

app = FastAPI(
    title="Video Downloader API",
    description="Authorized video downloader backend service for YouTube and Instagram media.",
    version="1.0.0",
)

# CORS configuration for desktop and dev environments
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "tauri://localhost",
    "http://tauri.localhost",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(validate_router, prefix="/api", tags=["Validation"])
app.include_router(download_router, prefix="/api", tags=["Download"])


@app.get("/")
async def root():
    return {
        "app": "Video Downloader Backend API",
        "status": "online",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
