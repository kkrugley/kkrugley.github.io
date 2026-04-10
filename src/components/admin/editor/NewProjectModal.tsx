import { useState, useCallback } from 'react';
import { TemplateSelector } from './TemplateSelector';
import { type TemplateType } from '../templates';

interface NewProjectModalProps {
  onSubmit: (slug: string, templateType: TemplateType) => void;
  onCancel: () => void;
}

export function NewProjectModal({ onSubmit, onCancel }: NewProjectModalProps) {
  const [slug, setSlug] = useState('');
  const [templateType, setTemplateType] = useState<TemplateType>('case-study');
  const [error, setError] = useState<string | null>(null);

  const validateSlug = useCallback((value: string): boolean => {
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(value)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens');
      return false;
    }
    setError(null);
    return true;
  }, []);

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(value);
    validateSlug(value);
  }, [validateSlug]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) {
      setError('Slug is required');
      return;
    }
    if (!validateSlug(slug)) {
      return;
    }
    onSubmit(slug, templateType);
  }, [slug, templateType, onSubmit, validateSlug]);

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create New Project</h2>
          <button onClick={onCancel} style={styles.closeButton}>
            <CloseIcon />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Project Slug</label>
            <input
              type="text"
              value={slug}
              onChange={handleSlugChange}
              placeholder="my-project"
              style={{
                ...styles.input,
                ...(error ? styles.inputError : {}),
              }}
            />
            <p style={styles.hint}>
              Lowercase letters, numbers, and hyphens only (e.g., "coffee-stool")
            </p>
            {error && <p style={styles.error}>{error}</p>}
          </div>

          <TemplateSelector selected={templateType} onSelect={setTemplateType} />

          <div style={styles.actions}>
            <button type="button" onClick={onCancel} style={styles.cancelButton}>
              Cancel
            </button>
            <button 
              type="submit" 
              style={styles.submitButton}
              disabled={!slug.trim() || !!error}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 480,
    width: '90%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    color: '#111827',
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    color: '#6b7280',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #d1d5db',
    borderRadius: 6,
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  hint: {
    margin: 0,
    fontSize: 12,
    color: '#6b7280',
  },
  error: {
    margin: 0,
    fontSize: 12,
    color: '#dc2626',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 500,
    color: '#fff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
};