import { useState } from 'react';

interface ReportCardProps {
  title: string;
  lines: string[];
  glossary?: Array<{ term: string; definition: string }>;
  onCopy: () => void;
}

// Helper function to parse markdown bold syntax and return JSX
function parseMarkdownBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index} className="font-semibold">{boldText}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

export function ReportCard({ title, lines, glossary, onCopy }: ReportCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Remove markdown syntax for plain text copy
    const plainText = lines.map(line => line.replace(/\*\*/g, '')).join('\n');
    navigator.clipboard.writeText(plainText);
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
            ▪ {parseMarkdownBold(line)}
          </div>
        ))}
      </div>

      {glossary && glossary.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-sm font-semibold text-slate-400 mb-3">Glossary</h4>
          <div className="space-y-2">
            {glossary.map((item, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-slate-300">{item.term}:</span>{' '}
                <span className="text-slate-400">{item.definition}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
