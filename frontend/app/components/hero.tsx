'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Terminal from './Terminal';

interface HeroProps {
  className?: string;
}

export function Hero({ className }: HeroProps) {
  const [isRendering, setIsRendering] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionPhase, setExtractionPhase] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [tokenCount, setTokenCount] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [browserContent, setBrowserContent] = useState<string | null>(null);

  const handleRender = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    setIsRendering(true);
    setError(null);
    setBrowserContent(null);
    
    try {
      console.log('Sending request to render URL:', url);
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        setUrl('https://' + url);
      }
      const response = await fetch('/api/browser/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to render page');
      }

      const data = await response.json();
      console.log('Received response with content length:', data.content?.length);
      if (!data.content) {
        throw new Error('No content received from server');
      }
      setBrowserContent(data.content);
    } catch (err) {
      console.error('Error rendering page:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsRendering(false);
    }
  };

  const handleExtract = async () => {
    if (!url || !description) {
      setError('Please enter both URL and description');
      return;
    }

    setIsExtracting(true);
    setExtractionPhase('Initializing extraction');
    setError(null);
    setExtractedData(null);

    try {
      console.log('Sending extraction request:', { url, description });
      
      const response = await fetch('/api/browser/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to extract data');
      }

      const data = await response.json();
      console.log('Received extraction result:', data);
      
      if (!data.result) {
        throw new Error('No data received from server');
      }
      
      setExtractedData(data.result);
      setTokenCount(data.tokenCount);
    } catch (err) {
      console.error('Error extracting data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsExtracting(false);
      setExtractionPhase('');
    }
  };

  return (
    <div className="mt-8 w-full min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto px-2 py-8">
        <div className="grid grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="w-[88vh] h-[80vh] flex flex-col">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 input-base"
              />
              <button
                onClick={handleRender}
                disabled={isRendering}
                className="button-base"
              >
                {isRendering ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Render'
                )}
              </button>
            </div>
            
            <div className="relative w-[88vh] h-[80vh] bg-[#1E1E1E] rounded-lg border border-black/[.08] dark:border-white/[.145] overflow-hidden">
              {isRendering ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              ) : browserContent ? (
                <>
                  <iframe
                    srcDoc={browserContent}
                    className="w-full h-full overflow-y-auto"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Browser Content"
                    onError={(e) => {
                      console.error('iframe error:', e);
                      setError('Failed to display content');
                    }}
                  />
                  {/* Add a debug button in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      onClick={() => console.log('Content:', browserContent)}
                      className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded text-xs"
                    >
                      Debug
                    </button>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                </div>
              )}
              {error && (
                <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white p-2 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="w-[88vh] h-[80vh] flex flex-col">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Describe what data to extract (e.g., 'product prices')"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 input-base"
              />
              <button
                onClick={handleExtract}
                disabled={isExtracting || !url.trim() || !description.trim()}
                className="button-base"
              >
                {isExtracting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Extract'
                )}
              </button>
            </div>

            <Terminal
              status={isExtracting ? 'running' : extractedData ? 'complete' : 'ready'}
              phase={extractionPhase.toLowerCase()}
              content={extractedData || error}
              isLoading={isExtracting}
              tokenCount={tokenCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
