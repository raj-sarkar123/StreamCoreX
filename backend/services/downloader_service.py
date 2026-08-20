import asyncio
import os
import shutil
import tempfile
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
import yt_dlp

from utils.file_utils import format_bytes, format_speed


# Application-managed temp directory for in-progress downloads
TEMP_DIR = Path(__file__).resolve().parent.parent / "temp"
TEMP_DIR.mkdir(exist_ok=True)


def get_ffmpeg_path() -> Optional[str]:
    """Find FFmpeg executable from system PATH or imageio-ffmpeg package."""
    # 1. Check system PATH
    sys_ffmpeg = shutil.which('ffmpeg')
    if sys_ffmpeg:
        return sys_ffmpeg

    # 2. Check imageio-ffmpeg package
    try:
        import imageio_ffmpeg
        exe = imageio_ffmpeg.get_ffmpeg_exe()
        if exe and os.path.exists(exe):
            return exe
    except Exception:
        pass

    return None


def is_ffmpeg_available() -> bool:
    """Check if FFmpeg is available on system PATH or via imageio-ffmpeg."""
    return get_ffmpeg_path() is not None


def sanitize_filename(name: str) -> str:
    """Sanitize a filename for safe filesystem use."""
    # Remove characters that are problematic on Windows
    bad_chars = '<>:"/\\|?*'
    for ch in bad_chars:
        name = name.replace(ch, '_')
    # Collapse whitespace and strip
    name = '_'.join(name.split())
    # Limit length
    if len(name) > 200:
        name = name[:200]
    return name or 'video'


@dataclass
class DownloadJob:
    id: str
    url: str
    platform: str
    status: str = "validating"  # validating, processing, downloading, completed, error
    progress: float = 0.0
    downloaded_bytes: int = 0
    total_bytes: int = 0
    speed: float = 0.0
    eta: Optional[int] = None
    title: str = ""
    file_name: str = ""
    file_size_str: str = ""
    file_path: str = ""  # Temp file path on backend
    error_message: str = ""
    created_at: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "url": self.url,
            "platform": self.platform,
            "status": self.status,
            "progress": round(self.progress, 1),
            "downloaded_bytes": self.downloaded_bytes,
            "total_bytes": self.total_bytes,
            "downloaded_size_str": format_bytes(self.downloaded_bytes),
            "total_size_str": format_bytes(self.total_bytes) if self.total_bytes > 0 else "Unknown",
            "speed": round(self.speed, 1),
            "speed_str": format_speed(self.speed),
            "eta": self.eta,
            "title": self.title,
            "file_name": self.file_name,
            "file_size_str": self.file_size_str,
            "file_path": self.file_path,
            "error_message": self.error_message,
        }


class DownloaderService:
    def __init__(self):
        self.jobs: Dict[str, DownloadJob] = {}
        # Clean up any leftover temp files from previous runs
        self._cleanup_temp_dir()

    def _cleanup_temp_dir(self):
        """Remove all files from the temp directory on startup."""
        if TEMP_DIR.exists():
            for f in TEMP_DIR.iterdir():
                try:
                    if f.is_file():
                        f.unlink()
                except OSError:
                    pass

    def get_job(self, job_id: str) -> Optional[DownloadJob]:
        return self.jobs.get(job_id)

    def create_job(self, platform: str, url: str) -> DownloadJob:
        job_id = str(uuid.uuid4())
        job = DownloadJob(id=job_id, url=url, platform=platform)
        self.jobs[job_id] = job
        return job

    def cleanup_job_file(self, job_id: str):
        """Remove the temporary file for a completed job."""
        job = self.jobs.get(job_id)
        if job and job.file_path and os.path.exists(job.file_path):
            try:
                os.unlink(job.file_path)
            except OSError:
                pass

    def validate_and_extract_info(self, url: str) -> Dict[str, Any]:
        """Fetch metadata for URL safely without downloading video content."""
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
            # No 'format' option — metadata extraction does not need format selection
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                if not info:
                    raise ValueError("Failed to retrieve media information.")
                
                title = info.get('title') or info.get('description') or "Video"
                duration = info.get('duration', 0)
                thumbnail = info.get('thumbnail', '')
                uploader = info.get('uploader') or info.get('uploader_id') or ''
                
                return {
                    "valid": True,
                    "title": title,
                    "duration": duration,
                    "thumbnail": thumbnail,
                    "uploader": uploader,
                    "ffmpeg_available": is_ffmpeg_available(),
                }
        except yt_dlp.utils.DownloadError as e:
            err_str = str(e).lower()
            if "private" in err_str or "login" in err_str or "sign in" in err_str:
                msg = "This video is private or requires authentication."
            elif "copyright" in err_str or "unavailable" in err_str:
                msg = "This video is unavailable or restricted."
            else:
                msg = "Unable to process this URL. Please verify that the link is public and accessible."
            return {"valid": False, "error": msg}
        except Exception as e:
            return {"valid": False, "error": "Unable to process this URL."}

    def start_download_bg(self, job_id: str):
        """Run the download in a background worker task."""
        asyncio.create_task(self._run_download_task(job_id))

    async def _run_download_task(self, job_id: str):
        job = self.jobs.get(job_id)
        if not job:
            return

        # Download to application-controlled temp directory
        TEMP_DIR.mkdir(exist_ok=True)
        outtmpl = str(TEMP_DIR / '%(title)s.%(ext)s')

        def progress_hook(d):
            if d['status'] == 'downloading':
                job.status = "downloading"
                total = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
                downloaded = d.get('downloaded_bytes') or 0
                speed = d.get('speed') or 0.0
                eta = d.get('eta')

                job.downloaded_bytes = downloaded
                job.total_bytes = total
                job.speed = speed
                job.eta = eta

                if total > 0:
                    job.progress = (downloaded / total) * 100.0
                else:
                    pct_str = d.get('_percent_str', '').strip().replace('%', '')
                    try:
                        job.progress = float(pct_str)
                    except ValueError:
                        pass
            elif d['status'] == 'finished':
                job.status = "processing"

        # --- Format selection strategy ---
        # Prefer H.264/AVC video + AAC audio merged into MP4 for full video & audio compatibility
        ffmpeg_path = get_ffmpeg_path()
        has_ffmpeg = ffmpeg_path is not None

        if has_ffmpeg:
            # FFmpeg available: prefer H.264 + AAC merge into MP4
            # Fallback chain: H.264+AAC → any video+any audio → best single
            format_str = (
                'bestvideo[vcodec^=avc1]+bestaudio[acodec^=mp4a]/'
                'bestvideo[vcodec^=avc1]+bestaudio/'
                'bestvideo+bestaudio/'
                'best'
            )
        else:
            format_str = 'best'

        ydl_opts = {
            'outtmpl': outtmpl,
            'format': format_str,
            'progress_hooks': [progress_hook],
            'quiet': True,
            'no_warnings': True,
            'restrictfilenames': True,
            'windowsfilenames': True,
        }

        # If FFmpeg available, pass executable location and request MP4 container output
        if ffmpeg_path:
            ydl_opts['ffmpeg_location'] = ffmpeg_path
            ydl_opts['merge_output_format'] = 'mp4'

        loop = asyncio.get_event_loop()

        try:
            job.status = "processing"
            
            def perform_download():
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(job.url, download=True)
                    # Prepare final filename from info dictionary
                    target_path = ydl.prepare_filename(info)
                    base_path, _ = os.path.splitext(target_path)
                    
                    # If merged into MP4 container, check for .mp4 extension
                    mp4_path = base_path + '.mp4'
                    if os.path.exists(mp4_path):
                        resolved_path = mp4_path
                    elif os.path.exists(target_path):
                        resolved_path = target_path
                    else:
                        # Fallback to any file created in TEMP_DIR matching base_path
                        resolved_path = target_path
                        for f in TEMP_DIR.glob(os.path.basename(base_path) + '.*'):
                            if f.is_file() and not str(f).endswith(('.part', '.ytdl')):
                                resolved_path = str(f)
                                break
                    return info, resolved_path

            info, resolved_path = await loop.run_in_executor(None, perform_download)
            
            if info:
                job.title = info.get('title', 'Downloaded Video')
                job.file_path = resolved_path
                job.file_name = os.path.basename(resolved_path)
                
                if os.path.exists(resolved_path):
                    file_size = os.path.getsize(resolved_path)
                    job.file_size_str = format_bytes(file_size)
                    job.total_bytes = file_size
                elif not job.file_size_str:
                    job.file_size_str = format_bytes(job.total_bytes)

                job.progress = 100.0
                job.status = "completed"
            else:
                job.status = "error"
                job.error_message = "Unable to process this URL."

        except yt_dlp.utils.DownloadError as e:
            job.status = "error"
            err_str = str(e).lower()
            if "private" in err_str or "login" in err_str:
                job.error_message = "This video is private or requires authorization."
            elif "geo" in err_str or "restricted" in err_str:
                job.error_message = "This content is geographically restricted or unavailable."
            elif "ffmpeg" in err_str or "merge" in err_str:
                job.error_message = "FFmpeg is required to merge video and audio into MP4. Please install FFmpeg and restart the backend."
            elif "format" in err_str and "not available" in err_str:
                job.error_message = "The requested video format is not available for this video."
            else:
                job.error_message = "Unable to process this URL."
        except Exception as e:
            job.status = "error"
            job.error_message = "An error occurred while downloading the video."


# Global service singleton
downloader_service = DownloaderService()
