from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl

from utils.validators import validate_platform_and_url
from services.downloader_service import downloader_service

router = APIRouter()


class ValidateRequest(BaseModel):
    platform: str
    url: str


@router.post("/validate")
async def validate_url(req: ValidateRequest):
    is_valid, err_msg = validate_platform_and_url(req.platform, req.url)
    if not is_valid:
        return {"valid": False, "error": err_msg}

    # Fetch preliminary info from downloader service
    info = downloader_service.validate_and_extract_info(req.url)
    return info
