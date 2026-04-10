import { useRef, useCallback } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ value, onChange, readOnly = false }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleScroll = useCallback(() => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace", fontSize: 13, lineHeight: '1.7' }}>
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        style={{
          minWidth: 40,
          padding: '10px 6px',
          background: '#f8fafc',
          borderRight: '1px solid #e2e8f0',
          color: '#cbd5e1',
          textAlign: 'right',
          userSelect: 'none',
          overflowY: 'hidden',
          flexShrink: 0,
        }}
      >
        {lineNumbers.map(n => (
          <div key={n} style={{ height: '1.7em' }}>{n}</div>
        ))}
      </div>
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onScroll={handleScroll}
        readOnly={readOnly}
        spellCheck={false}
        style={{
          flex: 1,
          padding: '10px 12px',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          color: '#334155',
          background: '#ffffff',
          overflowY: 'auto',
        }}
      />
    </div>
  );
}
