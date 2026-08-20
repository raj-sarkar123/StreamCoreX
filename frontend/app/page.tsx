'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { PlatformSelector, Platform } from '@/components/PlatformSelector';
import { UrlInputSection } from '@/components/UrlInputSection';
import { StatusCard, AppStateStatus } from '@/components/StatusCard';
import { validateUrl, startDownload, getJobProgress, triggerBrowserDownload, ProgressResponse } from '@/lib/api';

export default function DashboardPage() {
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [url, setUrl] = useState<string>('');
  const [status, setStatus] = useState<AppStateStatus>('idle');
  const [progressInfo, setProgressInfo] = useState<ProgressResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track whether browser download has already been triggered for the current job
  const downloadTriggeredRef = useRef<boolean>(false);

  // Client-side quick regex validation
  const isValidUrl = React.useMemo(() => {
    const trimmed = url.trim();
    if (!trimmed) return false;
    if (platform === 'youtube') {
      return /(youtube\.com|youtu\.be)/i.test(trimmed);
    } else {
      return /(instagram\.com|instagr\.am)/i.test(trimmed);
    }
  }, [url, platform]);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const handleSelectPlatform = (newPlatform: Platform) => {
    setPlatform(newPlatform);
    setUrl('');
    setStatus('idle');
    setProgressInfo(null);
    setErrorMessage('');
  };

  const handleClearUrl = () => {
    setUrl('');
    if (status === 'idle' || status === 'error') {
      setStatus('idle');
    }
  };

  const handleDownload = async () => {
    if (!isValidUrl || status !== 'idle') return;

    setStatus('validating');
    setErrorMessage('');
    setProgressInfo(null);
    downloadTriggeredRef.current = false;

    // Step 1: Validate URL via API
    const validation = await validateUrl(platform, url);
    if (!validation.valid) {
      setStatus('error');
      setErrorMessage(validation.error || 'Unable to process this URL.');
      return;
    }

    // Step 2: Start download task
    try {
      setStatus('processing');
      const downloadRes = await startDownload(platform, url);
      const jobId = downloadRes.job_id;

      // Step 3: Poll progress every 500ms
      stopPolling();
      pollTimerRef.current = setInterval(async () => {
        try {
          const info = await getJobProgress(jobId);
          setProgressInfo(info);
          setStatus(info.status);

          if (info.status === 'completed') {
            stopPolling();
            // Trigger Chrome's native download exactly once
            if (!downloadTriggeredRef.current) {
              downloadTriggeredRef.current = true;
              triggerBrowserDownload(jobId);
            }
          } else if (info.status === 'error') {
            stopPolling();
            setErrorMessage(info.error_message || 'Unable to process this URL.');
          }
        } catch (err) {
          stopPolling();
          setStatus('error');
          setErrorMessage('Lost connection to backend service.');
        }
      }, 500);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Unable to initiate download.');
    }
  };

  const handleReset = () => {
    stopPolling();
    setStatus('idle');
    setProgressInfo(null);
    setErrorMessage('');
    setUrl('');
    downloadTriggeredRef.current = false;
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="w-full max-w-xl flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 shadow-2xl backdrop-blur-xl">
        <Header />

        <PlatformSelector
          selectedPlatform={platform}
          onSelect={handleSelectPlatform}
          disabled={status !== 'idle' && status !== 'error' && status !== 'completed'}
        />

        {status === 'idle' || status === 'error' || status === 'validating' ? (
          <UrlInputSection
            platform={platform}
            url={url}
            onChangeUrl={setUrl}
            onClear={handleClearUrl}
            onDownload={handleDownload}
            isDownloading={status === 'validating'}
            isValid={isValidUrl}
          />
        ) : null}

        <StatusCard
          status={status}
          progressInfo={progressInfo}
          errorMessage={errorMessage}
          onReset={handleReset}
        />

        {/* Footer info badge */}
        <p className="text-[11px] text-zinc-500 mt-6 text-center">
          Designed for authorized, user-owned content only. Respect platform terms of service.
        </p>
      </div>
    </main>
  );
}
