'use client';

import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

interface TerminalProps {
  content: string | object | null;
  status?: 'ready' | 'running' | 'complete';
  phase?: string;
  progress?: number;
  isLoading?: boolean;
  tokenCount?: number;
}

export default function Terminal({ content, status = 'ready', phase, progress, tokenCount }: TerminalProps) {
  const [copied, setCopied] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(50000); // Initialize with 50,000 tokens

  // Update token balance when tokenCount changes
  useEffect(() => {
    if (tokenCount && tokenCount > 0) {
      setTokenBalance(prevBalance => {
        const newBalance = Math.max(0, prevBalance - tokenCount);
        return newBalance;
      });
    }
  }, [tokenCount]);
  
  const statusMessages = {
    ready: 'Terminal ready. Click Extract to begin...',
    running: {
      init: 'Initializing extraction chain...',
      analyze: 'Analyzing content structure...',
      extract: 'Extracting requested data...',
      validate: 'Validating extracted data...',
      render: 'Rendering webpage content...',
      fetch: 'Fetching webpage data...'
    },
    complete: 'Operation complete.'
  };

  const formattedContent = content 
    ? typeof content === 'object' 
      ? JSON.stringify(content, null, 2)
      : typeof content === 'string' && content.trim().startsWith('{')
        ? JSON.stringify(JSON.parse(content), null, 2)
        : content
    : status === 'ready' 
      ? statusMessages.ready
      : status === 'running' && phase
      ? statusMessages.running[phase as keyof typeof statusMessages.running] || 'Processing...'
      : statusMessages.complete;

  const hasContent = Boolean(content);

  const statusColors = {
    ready: 'text-gray-400',
    running: 'text-blue-400',
    complete: 'text-green-400'
  };

  const getStatusText = () => {
    if (status === 'running' && phase) {
      return `${phase.charAt(0).toUpperCase() + phase.slice(1)}${progress ? ` (${progress}%)` : ''}`;
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="w-[88vh] h-[80vh] flex flex-col rounded-lg border border-black/[.08] dark:border-white/[.145] overflow-hidden bg-[#1E1E1E] shadow-lg">
      <div className={`flex-1 p-6 font-mono text-sm overflow-y-auto bg-gradient-to-b from-[#1E1E1E] to-[#252525] ${hasContent ? 'text-white/90' : 'text-white/50 italic'}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${statusColors[status]}`}>
              <span className="animate-[blink_1s_ease-in-out_infinite]">●</span>
              {getStatusText()}
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 text-sm">
                <Coins className="w-6 h-6" style={{ color: '#FFD700' }} />
                <span style={{ color: '#FFFFFF' }}>{tokenBalance.toLocaleString()}</span>
              </div>
              <button
                onClick={() => {
                navigator.clipboard.writeText(formattedContent);
                setCopied(true);
                setTimeout(() => setCopied(false), 1000);
              }}
              className={`transition-colors p-1.5 rounded border ${
                copied 
                  ? 'text-green-400 border-green-700 hover:border-green-500' 
                  : 'text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
              }`}
              aria-label="Copy to clipboard"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </div>
          
          {status === 'running' && progress !== undefined && (
            <div className="space-y-2">
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">{progress}%</div>
            </div>
          )}
          
          <pre className="whitespace-pre-wrap leading-relaxed mt-4">{formattedContent}</pre>
        </div>
      </div>
    </div>
  );
}
