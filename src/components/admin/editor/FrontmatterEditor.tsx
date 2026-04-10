import { useState, useCallback, useRef } from 'react';

interface FrontmatterEditorProps {
  frontmatter: Record<string, any>;
  onChange: (fm: Record<string, any>) => void;
}

export function FrontmatterEditor({ frontmatter, onChange }: FrontmatterEditorProps) {
  const updateField = useCallback(
    (key: string, value: any) => {
      onChange({ ...frontmatter, [key]: value });
    },
    [frontmatter, onChange]
  );

  const isTemplate = frontmatter.useTemplate === true;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Frontmatter Editor</span>
      </div>

      <div style={styles.content}>
        <Section title="Basic Fields">
          <TextInput
            label="Title *"
            value={frontmatter.title || ''}
            onChange={(v) => updateField('title', v)}
            required
          />
          <TextInput
            label="Tagline"
            value={frontmatter.tagline || ''}
            onChange={(v) => updateField('tagline', v)}
          />
          <NumberInput
            label="Year"
            value={frontmatter.year}
            onChange={(v) => updateField('year', v)}
          />
          <TagEditor
            label="Tags"
            value={frontmatter.tags || []}
            onChange={(v) => updateField('tags', v)}
          />
          <FilePathInput
            label="Thumbnail"
            value={frontmatter.thumbnail || ''}
            onChange={(v) => updateField('thumbnail', v)}
          />
        </Section>

        <Section title="3D Models">
          <FilePathInput
            label="Model 3D"
            value={frontmatter.model3d || ''}
            onChange={(v) => updateField('model3d', v)}
          />
          <FilePathInput
            label="Model 3D iOS"
            value={frontmatter.model3d_ios || ''}
            onChange={(v) => updateField('model3d_ios', v)}
          />
        </Section>

        <Section title="Links">
          <Repeater
            value={frontmatter.links || []}
            onChange={(v) => updateField('links', v)}
            renderItem={(item, index, onItemChange) => (
              <LinkItem item={item} onChange={onItemChange} />
            )}
            addLabel="Add Link"
          />
        </Section>

        <Section title="Template Mode">
          <ToggleSwitch
            label="Use Template (Case Study)"
            checked={isTemplate}
            onChange={(v) => updateField('useTemplate', v)}
          />
        </Section>

        {isTemplate ? (
          <>
            <Section title="Case Study - Hero">
              <FilePathInput
                label="Hero Image"
                value={frontmatter.hero || ''}
                onChange={(v) => updateField('hero', v)}
              />
            </Section>

            <Section title="Case Study - Problem">
              <TextArea
                label="Problem Text"
                value={frontmatter.problem?.text || ''}
                onChange={(v) => updateField('problem', { ...frontmatter.problem, text: v })}
              />
              <FilePathInput
                label="Problem Image"
                value={frontmatter.problem?.image || ''}
                onChange={(v) => updateField('problem', { ...frontmatter.problem, image: v })}
              />
            </Section>

            <Section title="Case Study - Solution">
              <TextArea
                label="Solution Text"
                value={frontmatter.solution?.text || ''}
                onChange={(v) => updateField('solution', { ...frontmatter.solution, text: v })}
              />
              <FilePathInput
                label="Solution Image"
                value={frontmatter.solution?.image || ''}
                onChange={(v) => updateField('solution', { ...frontmatter.solution, image: v })}
              />
            </Section>

            <Section title="Case Study - Process (3 slots)">
              <FilePathInput
                label="Process Image 1"
                value={frontmatter.process?.[0] || ''}
                onChange={(v) => updateField('process', [v, frontmatter.process?.[1] || '', frontmatter.process?.[2] || ''])}
              />
              <FilePathInput
                label="Process Image 2"
                value={frontmatter.process?.[1] || ''}
                onChange={(v) => updateField('process', [frontmatter.process?.[0] || '', v, frontmatter.process?.[2] || ''])}
              />
              <FilePathInput
                label="Process Image 3"
                value={frontmatter.process?.[2] || ''}
                onChange={(v) => updateField('process', [frontmatter.process?.[0] || '', frontmatter.process?.[1] || '', v])}
              />
            </Section>

            <Section title="Case Study - Details">
              <TextArea
                label="Details Text"
                value={frontmatter.details?.text || ''}
                onChange={(v) => updateField('details', { ...frontmatter.details, text: v })}
              />
              <FilePathInput
                label="Details Image"
                value={frontmatter.details?.image || ''}
                onChange={(v) => updateField('details', { ...frontmatter.details, image: v })}
              />
            </Section>

            <Section title="Case Study - Final">
              <FilePathInput
                label="Final Main Image"
                value={frontmatter.final?.main || ''}
                onChange={(v) => updateField('final', { ...frontmatter.final, main: v })}
              />
              <FilePathInput
                label="Final Detail Image"
                value={frontmatter.final?.detail || ''}
                onChange={(v) => updateField('final', { ...frontmatter.final, detail: v })}
              />
              <FilePathInput
                label="Final Context Image"
                value={frontmatter.final?.context || ''}
                onChange={(v) => updateField('final', { ...frontmatter.final, context: v })}
              />
            </Section>
          </>
        ) : (
          <Section title="Legacy - Description">
            <TextArea
              label="Description"
              value={frontmatter.description || ''}
              onChange={(v) => updateField('description', v)}
            />
          </Section>
        )}

        <Section title="Gallery">
          <GalleryRepeater
            value={frontmatter.gallery || []}
            onChange={(v) => updateField('gallery', v)}
          />
        </Section>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>{title}</div>
      <div style={styles.sectionContent}>{children}</div>
    </div>
  );
}

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

function TextInput({ label, value, onChange, required }: TextInputProps) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

function NumberInput({ label, value, onChange }: NumberInputProps) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        style={styles.input}
      />
    </div>
  );
}

interface FilePathInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function FilePathInput({ label, value, onChange }: FilePathInputProps) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
        placeholder="/path/to/file"
      />
    </div>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function TextArea({ label, value, onChange }: TextAreaProps) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.textarea}
        rows={4}
      />
    </div>
  );
}

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          ...styles.toggle,
          ...(checked ? styles.toggleOn : styles.toggleOff),
        }}
      >
        <span
          style={{
            ...styles.toggleKnob,
            ...(checked ? styles.toggleKnobOn : styles.toggleKnobOff),
          }}
        />
      </button>
    </div>
  );
}

interface TagEditorProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}

function TagEditor({ label, value, onChange }: TagEditorProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <div style={styles.tagContainer}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          style={styles.tagInput}
          placeholder="Add tag and press Enter"
        />
        {value.length > 0 && (
          <div style={styles.tagList}>
            {value.map((tag, index) => (
              <span key={index} style={styles.tag}>
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  style={styles.tagRemove}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface LinkItemData {
  label: string;
  url: string;
}

interface RepeaterProps<T> {
  value: T[];
  onChange: (value: T[]) => void;
  renderItem: (item: T, index: number, onItemChange: (item: T) => void) => React.ReactNode;
  addLabel: string;
}

function Repeater<T extends LinkItemData>({
  value,
  onChange,
  renderItem,
  addLabel,
}: RepeaterProps<T>) {
  const addItem = () => {
    onChange([...value, { label: '', url: '' } as T]);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, item: T) => {
    const newValue = [...value];
    newValue[index] = item;
    onChange(newValue);
  };

  return (
    <div style={styles.field}>
      <div style={styles.repeaterList}>
        {value.map((item, index) => (
          <div key={index} style={styles.repeaterItem}>
            {renderItem(item, index, (newItem) => updateItem(index, newItem))}
            <button
              type="button"
              onClick={() => removeItem(index)}
              style={styles.removeButton}
            >
              −
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addItem} style={styles.addButton}>
        + {addLabel}
      </button>
    </div>
  );
}

function LinkItem({ item, onChange }: { item: LinkItemData; onChange: (item: LinkItemData) => void }) {
  return (
    <div style={styles.linkItem}>
      <input
        type="text"
        value={item.label}
        onChange={(e) => onChange({ ...item, label: e.target.value })}
        style={styles.input}
        placeholder="Label"
      />
      <input
        type="text"
        value={item.url}
        onChange={(e) => onChange({ ...item, url: e.target.value })}
        style={styles.input}
        placeholder="URL"
      />
    </div>
  );
}

interface GalleryRepeaterProps {
  value: string[];
  onChange: (value: string[]) => void;
}

function GalleryRepeater({ value, onChange }: GalleryRepeaterProps) {
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItemRef.current = index;
  };

  const handleDragEnd = () => {
    if (dragItemRef.current === null || dragOverItemRef.current === null) return;
    if (dragItemRef.current === dragOverItemRef.current) return;

    const newValue = [...value];
    const dragItem = newValue[dragItemRef.current];
    newValue.splice(dragItemRef.current, 1);
    newValue.splice(dragOverItemRef.current, 0, dragItem);
    onChange(newValue);

    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  const addItem = () => {
    onChange([...value, '']);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, val: string) => {
    const newValue = [...value];
    newValue[index] = val;
    onChange(newValue);
  };

  return (
    <div style={styles.field}>
      <div style={styles.repeaterList}>
        {value.map((item, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            style={styles.draggableItem}
          >
            <span style={styles.dragHandle}>⋮⋮</span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              style={styles.input}
              placeholder="/path/to/image"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              style={styles.removeButton}
            >
              −
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addItem} style={styles.addButton}>
        + Add Image
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 12,
  },
  sectionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
  },
  required: {
    color: '#ef4444',
    marginLeft: 2,
  },
  input: {
    padding: '8px 10px',
    fontSize: 13,
    border: '1px solid #d1d5db',
    borderRadius: 4,
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '8px 10px',
    fontSize: 13,
    border: '1px solid #d1d5db',
    borderRadius: 4,
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  toggle: {
    position: 'relative',
    width: 44,
    height: 24,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  toggleOn: {
    backgroundColor: '#10b981',
  },
  toggleOff: {
    backgroundColor: '#d1d5db',
  },
  toggleKnob: {
    position: 'absolute',
    top: 2,
    width: 20,
    height: 20,
    borderRadius: '50%',
    transition: 'left 0.2s',
  },
  toggleKnobOn: {
    left: 22,
    backgroundColor: '#fff',
  },
  toggleKnobOff: {
    left: 2,
    backgroundColor: '#fff',
  },
  tagContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  tagInput: {
    padding: '8px 10px',
    fontSize: 13,
    border: '1px solid #d1d5db',
    borderRadius: 4,
    outline: 'none',
    boxSizing: 'border-box',
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    fontSize: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    color: '#374151',
  },
  tagRemove: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1,
  },
  repeaterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  repeaterItem: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  },
  linkItem: {
    display: 'flex',
    gap: 8,
    flex: 1,
  },
  addButton: {
    padding: '8px 12px',
    fontSize: 13,
    border: '1px dashed #d1d5db',
    borderRadius: 4,
    backgroundColor: '#f9fafb',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  removeButton: {
    padding: '8px 10px',
    fontSize: 13,
    border: '1px solid #d1d5db',
    borderRadius: 4,
    backgroundColor: '#fff',
    color: '#6b7280',
    cursor: 'pointer',
  },
  draggableItem: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    padding: 4,
    border: '1px solid #e5e7eb',
    borderRadius: 4,
    backgroundColor: '#f9fafb',
    cursor: 'grab',
  },
  dragHandle: {
    color: '#9ca3af',
    cursor: 'grab',
    userSelect: 'none',
  },
};
