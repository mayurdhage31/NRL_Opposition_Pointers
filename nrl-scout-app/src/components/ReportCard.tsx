import { useState } from 'react';

interface ReportCardProps {
  title: string;
  lines: string[];
  onCopy: () => void;
}

export function ReportCard({ title, lines, onCopy }: ReportCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = lines.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy();
  };

  return (
    <div className="rounded-lg border border-white/10 p-6" style={{ backgroundColor: 'var(--color-panel-darker)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-md transition-colors text-sm font-medium"
          style={{ 
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            color: 'var(--color-accent-teal)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(20, 184, 166, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(20, 184, 166, 0.1)'}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="space-y-3">
        {lines.map((line, index) => (
          <div key={index} className="text-slate-300 leading-relaxed">
            • {line}
          </div>
        ))}
      </div>
    </div>
  );
}
