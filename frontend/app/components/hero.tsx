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
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
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

  const handleExtract = () => {
    setIsExtracting(true);
    setExtractionPhase('Initializing');
    // TODO: Implement extraction logic
    setTimeout(() => {
      setExtractionPhase('Analyzing');
      setTimeout(() => {
        setExtractionPhase('Extracting');
        setTimeout(() => {
          setExtractedData({ example: 'Extracted data will appear here' });
          setIsExtracting(false);
          setExtractionPhase('');
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleRender}
                disabled={isRendering}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 border border-white"
              >
                {isRendering ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Render'
                )}
              </button>
            </div>
            
            <div className="relative aspect-video bg-white rounded-lg border border-gray-200 overflow-hidden">
              {isRendering ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              ) : browserContent ? (
                <>
                  <iframe
                    srcDoc={browserContent}
                    className="w-full h-full"
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
                  Enter a URL and click Render
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
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Describe what data to extract (e.g., 'product prices')"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleExtract}
                disabled={isExtracting}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 border border-white"
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
