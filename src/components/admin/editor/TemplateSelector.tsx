import { type TemplateType } from '../templates';

interface TemplateSelectorProps {
  selected: TemplateType;
  onSelect: (templateType: TemplateType) => void;
}

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div style={styles.container}>
      <label style={styles.label}>Template</label>
      <div style={styles.options}>
        <button
          onClick={() => onSelect('case-study')}
          style={{
            ...styles.option,
            ...(selected === 'case-study' ? styles.optionSelected : {}),
          }}
        >
          <div style={styles.optionIcon}>
            <DocumentIcon />
          </div>
          <div style={styles.optionContent}>
            <div style={styles.optionName}>Case Study</div>
            <div style={styles.optionDesc}>
              Structured format with hero section, problem/solution, process steps, details, and final showcase.
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect('legacy')}
          style={{
            ...styles.option,
            ...(selected === 'legacy' ? styles.optionSelected : {}),
          }}
        >
          <div style={styles.optionIcon}>
            <ImageIcon />
          </div>
          <div style={styles.optionContent}>
            <div style={styles.optionName}>Legacy Gallery</div>
            <div style={styles.optionDesc}>
              Simple gallery format with description text and image gallery.
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

function DocumentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
      <polyline points="21 15 16 10 5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  option: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '12px 16px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  optionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  optionIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    backgroundColor: '#e0e7ff',
    borderRadius: 6,
    color: '#4f46e5',
    flexShrink: 0,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 1.4,
  },
};