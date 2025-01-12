'use client';

interface TerminalProps {
  content: any;
  status?: 'ready' | 'running' | 'complete';
  phase?: string;
  progress?: number;
  isLoading?: boolean;
}

export default function Terminal({ content, status = 'ready', phase, progress, isLoading }: TerminalProps) {
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
    <div className="w-full h-full rounded-lg border border-black/[.08] dark:border-white/[.145] overflow-hidden bg-[#1E1E1E] shadow-lg">
      <div className={`p-6 font-mono text-sm overflow-auto h-full bg-gradient-to-b from-[#1E1E1E] to-[#252525] ${hasContent ? 'text-white/90' : 'text-white/50 italic'}`}>
        <div className="space-y-4">
          <div className={`flex items-center gap-2 ${statusColors[status]}`}>
            <span className="animate-[blink_1s_ease-in-out_infinite]">●</span>
            {getStatusText()}
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
