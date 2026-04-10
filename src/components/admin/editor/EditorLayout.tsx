import { useState, useCallback, useEffect } from 'react';
import { parseFrontmatter, serializeMDX } from '../utils/frontmatter';
import type { GitHubClient } from '../auth/GitHubClient';
import { CodeEditor } from './CodeEditor';
import { FrontmatterEditor } from './FrontmatterEditor';
import { AssetsPanel } from '../assets/AssetsPanel';

export type EditorMode = 'visual' | 'code';

interface EditorLayoutProps {
  client: GitHubClient;
  filePath: string;
  initialContent: string;
  initialSha: string;
  onSaveSuccess: () => void;
  onDeleteSuccess: () => void;
}

export function EditorLayout({ client, filePath, initialContent, initialSha, onSaveSuccess, onDeleteSuccess }: EditorLayoutProps) {
  const [mode, setMode] = useState<EditorMode>('code');
  const [content, setContent] = useState(initialContent);
  const [sha, setSha] = useState(initialSha);
  const [commitMsg, setCommitMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isDirty = content !== initialContent;
  const slug = filePath.split('/').at(-2) ?? '';

  useEffect(() => {
    setContent(initialContent);
    setSha(initialSha);
    setCommitMsg('');
    setMode('code');
    setShowDeleteConfirm(false);
  }, [filePath, initialContent, initialSha]);

  const showToast = (text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const parsed = parseFrontmatter(content);

  const handleFrontmatterChange = useCallback((fm: Record<string, any>) => {
    setContent(serializeMDX(fm, parseFrontmatter(content).body));
  }, [content]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await client.saveFile(
        filePath,
        content,
        commitMsg || `Update ${slug}`,
        sha,
      );
      setSha((result as any).commit?.sha ?? sha);
      showToast('Saved & pushed ✓');
      onSaveSuccess();
    } catch (err: any) {
      if (err.message?.includes('409') || err.message?.toLowerCase().includes('conflict')) {
        showToast('Conflict — file changed on GitHub. Reload to get latest.', false);
      } else {
        showToast(err.message || 'Save failed', false);
      }
    } finally {
      setIsSaving(false);
    }
  }, [client, filePath, content, commitMsg, sha, slug, onSaveSuccess]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await client.deleteFile(filePath, sha, `Delete project: ${slug}`);
      showToast('Deleted ✓');
      onDeleteSuccess();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', false);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [client, filePath, sha, slug, onDeleteSuccess]);

  const breadcrumb = filePath
    .replace('src/content/projects/', '')
    .replace('/index.mdx', '')
    .replace('/index.md', '');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* Top bar */}
      <div style={{ padding: '7px 14px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>projects /</span>
        <span style={{ fontSize: 11, color: '#0f172a', fontWeight: 500 }}>{breadcrumb}</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>/ index.mdx</span>

        {/* Mode switcher */}
        <div style={{ marginLeft: 'auto', display: 'flex', border: '1px solid #e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
          {(['visual', 'code'] as EditorMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '3px 12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                background: mode === m ? '#1e293b' : '#f8fafc',
                color: mode === m ? '#ffffff' : '#64748b',
                fontWeight: mode === m ? 500 : 400,
              }}
            >
              {m === 'visual' ? 'Visual' : 'Code'}
            </button>
          ))}
        </div>
      </div>

      {/* Content: editor (left) + assets (right) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: editor area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {mode === 'code' ? (
            <CodeEditor value={content} onChange={setContent} />
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              <FrontmatterEditor
                frontmatter={parsed.frontmatter}
                onChange={handleFrontmatterChange}
              />
            </div>
          )}
        </div>

        {/* Right: assets panel */}
        <AssetsPanel slug={slug} client={client} mode={mode} />
      </div>

      {/* Bottom status bar */}
      <div style={{ padding: '6px 14px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {/* Dirty indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: isDirty ? '#f59e0b' : '#22c55e', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#78716c' }}>{isDirty ? 'Unsaved' : 'Saved'}</span>
        </div>

        <span style={{ fontSize: 11, color: '#e2e8f0' }}>|</span>

        {/* Commit message */}
        <input
          value={commitMsg}
          onChange={e => setCommitMsg(e.target.value)}
          placeholder={`Update ${slug}`}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 11, color: '#64748b', background: 'transparent', minWidth: 0 }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ padding: '4px 10px', border: '1px solid #fecaca', color: '#ef4444', background: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
            >
              Удалить
            </button>
          ) : (
            <>
              <span style={{ fontSize: 11, color: '#ef4444' }}>Точно?</span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ padding: '4px 10px', background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
              >
                {isDeleting ? '...' : 'Да'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{ padding: '4px 10px', border: '1px solid #e2e8f0', background: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
              >
                Нет
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            style={{
              padding: '4px 14px',
              background: isSaving || !isDirty ? '#94a3b8' : '#1e293b',
              color: '#ffffff',
              border: 'none',
              borderRadius: 4,
              fontSize: 11,
              cursor: isSaving || !isDirty ? 'not-allowed' : 'pointer',
              fontWeight: 500,
            }}
          >
            {isSaving ? 'Saving...' : 'Save & Push'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute',
          bottom: 52,
          right: 14,
          background: toast.ok ? '#1e293b' : '#dc2626',
          color: '#ffffff',
          padding: '8px 14px',
          borderRadius: 6,
          fontSize: 12,
          zIndex: 200,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
