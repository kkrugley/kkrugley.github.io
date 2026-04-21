import { useState, useCallback, useEffect } from 'react';
import { parseFrontmatter, serializeMDX } from '../utils/frontmatter';
import type { GitHubClient } from '../auth/GitHubClient';
import { CodeEditor } from './CodeEditor';
import { FrontmatterEditor } from './FrontmatterEditor';
import { AssetsPanel } from '../assets/AssetsPanel';
import { useIsMobile } from '../utils/useIsMobile';

export type EditorMode = 'visual' | 'code' | 'preview';

interface EditorLayoutProps {
  client: GitHubClient;
  filePath: string;
  initialContent: string;
  initialSha: string;
  onSaveSuccess: () => void;
  onDeleteSuccess: () => void;
}

export function EditorLayout({ client, filePath, initialContent, initialSha, onSaveSuccess, onDeleteSuccess }: EditorLayoutProps) {
  const [mode, setMode] = useState<EditorMode>('visual');
  const [previewKey, setPreviewKey] = useState(0);
  const [content, setContent] = useState(initialContent);
  const [sha, setSha] = useState(initialSha);
  const [commitMsg, setCommitMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);

  const isMobile = useIsMobile();
  const isDirty = content !== initialContent;
  const slug = filePath.split('/').at(-2) ?? '';

  useEffect(() => {
    setContent(initialContent);
    setSha(initialSha);
    setCommitMsg('');
    setMode('visual');
    setShowDeleteConfirm(false);
    setAssetsOpen(false);
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

  const showAssetPanel = mode !== 'preview' && (!isMobile || assetsOpen);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: isMobile ? 'calc(100vh - 45px)' : '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* Top bar */}
      <div style={{ padding: isMobile ? '6px 10px' : '7px 14px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 6, flexShrink: 0, flexWrap: 'nowrap', minWidth: 0 }}>
        {!isMobile && (
          <>
            <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>projects /</span>
            <span style={{ fontSize: 11, color: '#0f172a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{breadcrumb}</span>
            <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>/ index.mdx</span>
          </>
        )}
        {isMobile && (
          <span style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{breadcrumb}</span>
        )}

        {/* Mode switcher */}
        <div style={{ marginLeft: isMobile ? 'auto' : 'auto', display: 'flex', border: '1px solid #e2e8f0', borderRadius: 5, overflow: 'hidden', flexShrink: 0 }}>
          {(['visual', 'code', 'preview'] as EditorMode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); if (m === 'preview') setPreviewKey(k => k + 1); }}
              style={{
                padding: isMobile ? '5px 8px' : '3px 12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: isMobile ? 10 : 11,
                background: mode === m ? '#1e293b' : '#f8fafc',
                color: mode === m ? '#ffffff' : '#64748b',
                fontWeight: mode === m ? 500 : 400,
              }}
            >
              {m === 'visual' ? (isMobile ? 'Vis' : 'Visual') : m === 'code' ? 'Code' : (isMobile ? 'Pre' : 'Preview')}
            </button>
          ))}
        </div>

        {/* Assets toggle (mobile only) */}
        {isMobile && mode !== 'preview' && (
          <button
            onClick={() => setAssetsOpen(o => !o)}
            title="Toggle assets"
            style={{
              padding: '5px 8px',
              border: '1px solid #e2e8f0',
              borderRadius: 5,
              background: assetsOpen ? '#1e293b' : '#f8fafc',
              color: assetsOpen ? '#ffffff' : '#64748b',
              fontSize: 10,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            📁
          </button>
        )}

        {mode === 'preview' && !isMobile && (
          <button
            onClick={() => setPreviewKey(k => k + 1)}
            title="Refresh preview"
            style={{ marginLeft: 6, padding: '3px 8px', border: '1px solid #e2e8f0', borderRadius: 5, background: '#f8fafc', color: '#64748b', fontSize: 11, cursor: 'pointer' }}
          >
            ↺
          </button>
        )}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden' }}>

        {/* Editor area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          {mode === 'code' ? (
            <CodeEditor value={content} onChange={setContent} />
          ) : mode === 'visual' ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : 16 }}>
              <FrontmatterEditor
                frontmatter={parsed.frontmatter}
                onChange={handleFrontmatterChange}
              />
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
              {isDirty && (
                <div style={{ padding: '4px 12px', background: '#fef3c7', borderBottom: '1px solid #fde68a', fontSize: 10, color: '#92400e' }}>
                  Есть несохранённые изменения — preview показывает последнее сохранённое состояние
                </div>
              )}
              <iframe
                key={previewKey}
                src={`/gallery/${slug}`}
                style={{ flex: 1, border: 'none', width: '100%' }}
                title="Page preview"
              />
            </div>
          )}
        </div>

        {/* Assets panel */}
        {showAssetPanel && (
          <div style={isMobile ? {
            borderTop: '1px solid #e2e8f0',
            maxHeight: '40vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          } : {}}>
            <AssetsPanel slug={slug} client={client} mode={mode} />
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div style={{ padding: isMobile ? '6px 10px' : '6px 14px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, flexShrink: 0, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
        {/* Dirty indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: isDirty ? '#f59e0b' : '#22c55e', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#78716c' }}>{isDirty ? 'Unsaved' : 'Saved'}</span>
        </div>

        {!isMobile && <span style={{ fontSize: 11, color: '#e2e8f0' }}>|</span>}

        {/* Commit message */}
        <input
          value={commitMsg}
          onChange={e => setCommitMsg(e.target.value)}
          placeholder={`Update ${slug}`}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 11, color: '#64748b', background: 'transparent', minWidth: 0, width: isMobile ? '100%' : undefined, order: isMobile ? 10 : undefined }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: isMobile ? 4 : 6, flexShrink: 0, alignItems: 'center' }}>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ padding: isMobile ? '5px 8px' : '4px 10px', border: '1px solid #fecaca', color: '#ef4444', background: 'none', borderRadius: 4, fontSize: isMobile ? 12 : 11, cursor: 'pointer' }}
            >
              {isMobile ? '🗑' : 'Удалить'}
            </button>
          ) : (
            <>
              <span style={{ fontSize: 11, color: '#ef4444' }}>Точно?</span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ padding: isMobile ? '5px 8px' : '4px 10px', background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: 4, fontSize: isMobile ? 12 : 11, cursor: 'pointer' }}
              >
                {isDeleting ? '...' : 'Да'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{ padding: isMobile ? '5px 8px' : '4px 10px', border: '1px solid #e2e8f0', background: 'none', borderRadius: 4, fontSize: isMobile ? 12 : 11, cursor: 'pointer' }}
              >
                Нет
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            style={{
              padding: isMobile ? '5px 12px' : '4px 14px',
              background: isSaving || !isDirty ? '#94a3b8' : '#1e293b',
              color: '#ffffff',
              border: 'none',
              borderRadius: 4,
              fontSize: isMobile ? 12 : 11,
              cursor: isSaving || !isDirty ? 'not-allowed' : 'pointer',
              fontWeight: 500,
            }}
          >
            {isSaving ? '...' : isMobile ? 'Save' : 'Save & Push'}
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
          maxWidth: 'calc(100% - 28px)',
        }}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
