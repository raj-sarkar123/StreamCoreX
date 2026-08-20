export const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface ValidationResponse {
  valid: boolean;
  title?: string;
  duration?: number;
  thumbnail?: string;
  uploader?: string;
  error?: string;
  ffmpeg_available?: boolean;
}

export interface DownloadResponse {
  job_id: string;
  status: string;
}

export interface ProgressResponse {
  id: string;
  url: string;
  platform: string;
  status: 'validating' | 'processing' | 'downloading' | 'completed' | 'error';
  progress: number;
  downloaded_bytes: number;
  total_bytes: number;
  downloaded_size_str: string;
  total_size_str: string;
  speed: number;
  speed_str: string;
  eta: number | null;
  title: string;
  file_name: string;
  file_size_str: string;
  file_path: string;
  error_message: string;
}

export async function validateUrl(platform: 'youtube' | 'instagram', url: string): Promise<ValidationResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, url }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { valid: false, error: errData.detail || 'Unable to process this URL.' };
    }
    return await res.json();
  } catch (err) {
    return { valid: false, error: 'Failed to connect to backend server. Make sure FastAPI server is running.' };
  }
}

export async function startDownload(platform: 'youtube' | 'instagram', url: string): Promise<DownloadResponse> {
  const res = await fetch(`${API_BASE_URL}/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, url }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Unable to start download.');
  }
  return await res.json();
}

export async function getJobProgress(jobId: string): Promise<ProgressResponse> {
  const res = await fetch(`${API_BASE_URL}/progress/${jobId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch download status.');
  }
  return await res.json();
}

/**
 * Returns the direct URL for downloading the completed file.
 * Opening this URL in the browser triggers Chrome's native download
 * via Content-Disposition: attachment header from FastAPI.
 */
export function getFileDownloadUrl(jobId: string): string {
  return `${API_BASE_URL}/download/${jobId}/file`;
}

/**
 * Trigger a browser-native file download by navigating to the file endpoint.
 * This causes Chrome to handle the download natively (showing its download UI)
 * without loading the file into JavaScript memory.
 */
export function triggerBrowserDownload(jobId: string): void {
  const url = getFileDownloadUrl(jobId);
  // Create a temporary anchor element to trigger the browser download
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  // Clean up the anchor after a short delay
  setTimeout(() => {
    document.body.removeChild(anchor);
  }, 100);
}
