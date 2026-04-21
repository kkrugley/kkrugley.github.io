import { useState, useRef, useCallback, useEffect } from 'react';
import type { GitHubClient } from '../auth/GitHubClient';
import { useIsMobile } from '../utils/useIsMobile';

type EditorMode = 'visual' | 'code' | 'preview';

interface UploadedFile {
  name: string;
  path: string;
  publicPath: string;
  size: number;
  type: '3d' | 'image';
  sha: string;
  previewUrl?: string; // ObjectURL for freshly uploaded files
}

interface AssetsPanelProps {
  slug: string;
  client: GitHubClient;
  mode: EditorMode;
}

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const MODEL_EXTS = ['.glb', '.usdz', '.gltf'];
const MAX_SIZE_MB = 25;

function getFileType(name: string): '3d' | 'image' | null {
  const ext = name.toLowerCase().slice(name.lastIndexOf('.'));
  if (IMAGE_EXTS.includes(ext)) return 'image';
  if (MODEL_EXTS.includes(ext)) return '3d';
  return null;
}

function getTargetPath(name: string, slug: string): { repoPath: string; publicPath: string } {
  const type = getFileType(name);
  if (type === '3d') {
    return {
      repoPath: `public/assets/3d_assets/${name}`,
      publicPath: `/assets/3d_assets/${name}`,
    };
  }
  return {
    repoPath: `public/gallery/${slug}/img/${name}`,
    publicPath: `/gallery/${slug}/img/${name}`,
  };
}

function getNextAssetNumber(existingFiles: UploadedFile[], slug: string): number {
  const pattern = new RegExp(`^${slug}_asset_(\\d+)\\.[^.]+$`);
  let max = 0;
  for (const f of existingFiles) {
    const m = f.name.match(pattern);
    if (m) max = Math.max(max, parseInt(m[1]));
  }
  return max + 1;
}

function renameFile(file: File, newName: string): File {
  return new File([file], newName, { type: file.type });
}

export function AssetsPanel({ slug, client, mode }: AssetsPanelProps) {
  const isMobile = useIsMobile();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing files from repo on mount / when slug changes
  useEffect(() => {
    if (!slug) return;
    setLoadingExisting(true);
    const imgPrefix = `public/gallery/${slug}/img/`;
    client.listFiles(imgPrefix)
      .then(nodes => {
        const existing: UploadedFile[] = nodes
          .filter(n => n.path !== `${imgPrefix}.gitkeep`)
          .map(n => {
            const name = n.path.split('/').at(-1) ?? n.path;
            const ext = name.toLowerCase().slice(name.lastIndexOf('.'));
            const type = MODEL_EXTS.includes(ext) ? '3d' : 'image';
            return {
              name,
              path: n.path,
              publicPath: '/' + n.path.replace(/^public\//, ''),
              size: 0,
              type,
              sha: n.sha,
            };
          });
        setFiles(existing);
      })
      .catch(() => { /* silently ignore listing errors */ })
      .finally(() => setLoadingExisting(false));
  }, [slug, client]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const uploadFile = useCallback(async (file: File) => {
    const fileType = getFileType(file.name);
    if (!fileType) {
      setError(`Unsupported type: ${file.name}`);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`${file.name} exceeds 25 MB limit`);
      return;
    }
    setError(null);

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const n = getNextAssetNumber(files, slug);
    const renamedName = `${slug}_asset_${n}${ext}`;
    const renamedFile = renameFile(file, renamedName);

    setUploading(renamedName);
    const { repoPath, publicPath } = getTargetPath(renamedName, slug);
    const previewUrl = fileType === 'image' ? URL.createObjectURL(renamedFile) : undefined;
    try {
      const { sha } = await client.uploadBinary(repoPath, renamedFile, `Upload asset: ${renamedName}`);
      setFiles(prev => {
        const exists = prev.some(f => f.path === repoPath);
        const entry: UploadedFile = { name: renamedName, path: repoPath, publicPath, size: file.size, type: fileType, sha, previewUrl };
        return exists ? prev.map(f => f.path === repoPath ? entry : f) : [...prev, entry];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  }, [client, slug, files]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    Array.from(e.dataTransfer.files).forEach(uploadFile);
  }, [uploadFile]);

  const handleDelete = useCallback(async (file: UploadedFile) => {
    setDeleting(file.path);
    setError(null);
    try {
      await client.deleteFile(file.path, file.sha, `Delete asset: ${file.name}`);
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      setFiles(prev => prev.filter(f => f.path !== file.path));
      showToast('Deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(null);
    }
  }, [client]);

  const handleInsert = useCallback((publicPath: string) => {
    if (mode === 'code') {
      navigator.clipboard.writeText(publicPath).then(() => showToast('Path copied!'));
      return;
    }
    const focused = document.activeElement as HTMLInputElement | null;
    if (focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA')) {
      const start = focused.selectionStart ?? focused.value.length;
      const before = focused.value.slice(0, start);
      const after = focused.value.slice(start);
      const newVal = before + publicPath + after;
      const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      const nativeTextareaSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      (focused.tagName === 'TEXTAREA' ? nativeTextareaSetter : nativeInputSetter)?.call(focused, newVal);
      focused.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      navigator.clipboard.writeText(publicPath).then(() => showToast('Path copied!'));
    }
  }, [mode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: isMobile ? '100%' : 280, borderLeft: isMobile ? 'none' : '1px solid #e2e8f0', borderTop: isMobile ? '1px solid #e2e8f0' : 'none', background: '#f8fafc', flexShrink: 0, position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '8px 12px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', fontSize: 10, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Assets
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{ margin: 10, border: '1.5px dashed #cbd5e1', borderRadius: 6, padding: '16px 10px', textAlign: 'center', background: '#ffffff', cursor: 'pointer' }}
      >
        <div style={{ fontSize: 18, marginBottom: 4 }}>📁</div>
        <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.5 }}>
          {uploading ? `Uploading ${uploading}...` : 'Drag & drop or click'}
        </div>
        {uploading && (
          <div style={{ marginTop: 6, height: 3, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#3b82f6', width: '70%' }} />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={[...IMAGE_EXTS, ...MODEL_EXTS].join(',')}
          style={{ display: 'none' }}
          onChange={e => Array.from(e.target.files || []).forEach(uploadFile)}
        />
      </div>

      {error && (
        <div style={{ margin: '0 10px 8px', padding: '6px 8px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 4, fontSize: 10, color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* File list label */}
      {(files.length > 0 || loadingExisting) && (
        <div style={{ padding: '0 10px', fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          Files
        </div>
      )}

      {/* File list */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {loadingExisting && !files.length && (
          <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', padding: '8px 0' }}>Loading...</div>
        )}
        {files.map(f => (
          <div key={f.path} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
            {f.type === 'image' && (
              <div style={{ width: '100%', height: 80, background: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={f.previewUrl ?? f.publicPath}
                  alt={f.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <div style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              {f.type === '3d' && <span style={{ fontSize: 14 }}>📦</span>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.publicPath}>{f.name}</div>
                {f.size > 0 && <div style={{ fontSize: 9, color: '#94a3b8' }}>{(f.size / 1024).toFixed(0)} KB</div>}
              </div>
              <button
                onClick={() => handleInsert(f.publicPath)}
                title={mode === 'code' || mode === 'preview' ? `Copy: ${f.publicPath}` : `Insert: ${f.publicPath}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#94a3b8', padding: 2, lineHeight: 1, flexShrink: 0 }}
              >
                ⧉
              </button>
              <button
                onClick={() => handleDelete(f)}
                disabled={deleting === f.path}
                title="Delete asset"
                style={{ background: 'none', border: 'none', cursor: deleting === f.path ? 'not-allowed' : 'pointer', fontSize: 13, color: deleting === f.path ? '#cbd5e1' : '#f87171', padding: 2, lineHeight: 1, flexShrink: 0 }}
              >
                {deleting === f.path ? '…' : '×'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mode hint */}
      <div style={{ padding: '6px 10px', fontSize: 9, color: '#94a3b8', textAlign: 'center', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
        {mode === 'visual' ? '⧉ inserts path into focused field' : '⧉ copies path to clipboard'}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'absolute', bottom: 44, left: 10, right: 10, background: '#1e293b', color: '#ffffff', padding: '6px 12px', borderRadius: 6, fontSize: 11, textAlign: 'center', zIndex: 100 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
