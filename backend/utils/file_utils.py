import os
import platform
import subprocess
from pathlib import Path
from typing import Union


def get_user_downloads_dir() -> Path:
    """Return the absolute path to the current user's OS Downloads folder."""
    home = Path.home()
    downloads = home / "Downloads"
    if downloads.exists():
        return downloads.resolve()
    return home.resolve()


def format_bytes(size: Union[int, float, None]) -> str:
    """Format byte size into human-readable string (KB, MB, GB)."""
    if size is None or size <= 0:
        return "Unknown size"
    
    units = ["B", "KB", "MB", "GB", "TB"]
    unit_index = 0
    val = float(size)
    while val >= 1024.0 and unit_index < len(units) - 1:
        val /= 1024.0
        unit_index += 1
    
    return f"{val:.1f} {units[unit_index]}"


def format_speed(speed_bytes: Union[int, float, None]) -> str:
    """Format download speed into human-readable string (MB/s, KB/s)."""
    if speed_bytes is None or speed_bytes <= 0:
        return "0 B/s"
    return f"{format_bytes(speed_bytes)}/s"


def format_seconds(seconds: Union[int, float, None]) -> str:
    """Format duration in seconds to MM:SS or HH:MM:SS format."""
    if seconds is None or seconds < 0:
        return "N/A"
    sec = int(seconds)
    hours = sec // 3600
    minutes = (sec % 3600) // 60
    remaining_sec = sec % 60
    
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{remaining_sec:02d}"
    return f"{minutes:02d}:{remaining_sec:02d}"


def open_in_file_explorer(target_path: Path) -> bool:
    """
    Open the given file or directory in the system's native file explorer.
    Returns True if successfully launched.
    """
    try:
        path_str = str(target_path.resolve())
        current_os = platform.system()
        
        if current_os == "Windows":
            if target_path.is_file():
                # Highlight file in Explorer
                subprocess.run(["explorer", "/select,", path_str], check=False)
            else:
                os.startfile(path_str)
            return True
        elif current_os == "Darwin":  # macOS
            subprocess.run(["open", "-R" if target_path.is_file() else "", path_str], check=False)
            return True
        else:  # Linux/Unix
            parent = path_str if target_path.is_dir() else str(target_path.parent)
            subprocess.run(["xdg-open", parent], check=False)
            return True
    except Exception as e:
        print(f"Error opening file explorer for {target_path}: {e}")
        return False
