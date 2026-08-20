import re
from typing import Tuple

YOUTUBE_PATTERN = re.compile(
    r'^(https?://)?(www\.|m\.|music\.)?(youtube\.com/(watch\?.*v=|shorts/|embed/)|youtu\.be/)[a-zA-Z0-9_-]+'
)

INSTAGRAM_PATTERN = re.compile(
    r'^(https?://)?(www\.)?(instagram\.com|instagr\.am)/(reel|p|tv)/[a-zA-Z0-9_-]+'
)


def is_youtube_url(url: str) -> bool:
    """Check if the provided URL matches standard YouTube video/shorts formats."""
    clean_url = url.strip()
    return bool(YOUTUBE_PATTERN.search(clean_url))


def is_instagram_url(url: str) -> bool:
    """Check if the provided URL matches standard Instagram post/reel formats."""
    clean_url = url.strip()
    return bool(INSTAGRAM_PATTERN.search(clean_url))


def validate_platform_and_url(platform: str, url: str) -> Tuple[bool, str]:
    """
    Validate that url is non-empty, well-formed, and matches the target platform.
    Returns (is_valid, error_message).
    """
    url = url.strip()
    if not url:
        return False, "URL cannot be empty."

    if not (url.startswith("http://") or url.startswith("https://")):
        url = "https://" + url

    platform = platform.lower().strip()
    if platform == "youtube":
        if not is_youtube_url(url):
            return False, "Provided URL is not a valid YouTube video or Shorts link."
        return True, ""
    elif platform == "instagram":
        if not is_instagram_url(url):
            return False, "Provided URL is not a valid Instagram reel or post link."
        return True, ""
    else:
        return False, f"Unsupported platform: '{platform}'. Must be 'youtube' or 'instagram'."
