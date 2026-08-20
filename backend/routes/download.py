import mimetypes
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional

from utils.validators import validate_platform_and_url
from services.downloader_service import downloader_service

router = APIRouter()


class DownloadRequest(BaseModel):
    platform: str
    url: str


@router.post("/download")
async def start_download(req: DownloadRequest):
    is_valid, err_msg = validate_platform_and_url(req.platform, req.url)
    if not is_valid:
        raise HTTPException(status_code=400, detail=err_msg)

    job = downloader_service.create_job(platform=req.platform, url=req.url)
    downloader_service.start_download_bg(job.id)

    return {"job_id": job.id, "status": job.status}


@router.get("/progress/{job_id}")
async def get_progress(job_id: str):
    job = downloader_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return job.to_dict()


@router.get("/download/{job_id}/file")
async def download_file(job_id: str, background_tasks: BackgroundTasks):
    """
    Serve the completed download as an HTTP attachment.
    Chrome will handle the actual file download via Content-Disposition: attachment.
    After the response is sent, the temporary file is cleaned up.
    """
    job = downloader_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Download is not yet complete")

    if not job.file_path or not os.path.exists(job.file_path):
        raise HTTPException(status_code=404, detail="Downloaded file not found on server")

    # Determine content type from file extension
    content_type, _ = mimetypes.guess_type(job.file_path)
    if not content_type:
        content_type = "application/octet-stream"

    # Use the original filename for the download
    download_filename = job.file_name or os.path.basename(job.file_path)

    # Schedule temp file cleanup after the response is sent
    background_tasks.add_task(cleanup_temp_file, job.file_path)

    return FileResponse(
        path=job.file_path,
        filename=download_filename,
        media_type=content_type,
        headers={
            "Content-Disposition": f'attachment; filename="{download_filename}"',
        },
    )


def cleanup_temp_file(file_path: str):
    """Remove the temporary file after it has been served."""
    try:
        if os.path.exists(file_path):
            os.unlink(file_path)
    except OSError:
        pass
