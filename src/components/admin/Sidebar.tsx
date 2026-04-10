import { useState, useEffect, useMemo, useCallback } from 'react';
import type { GitHubClient } from './auth/GitHubClient';

interface Project {
  slug: string;
  path: string;
}

interface SidebarProps {
  client: GitHubClient;
  owner: string;
  contentPath: string;
  activeFile?: string;
  onSelectFile: (path: string) => void;
  onNewProject: () => void;
  onDisconnect: () => void;
  refreshKey?: number;
}

function filterProjects(tree: { path: string; type: string }[], contentPath: string): Project[] {
  return tree
    .filter(n => n.type === 'blob' && n.path.startsWith(contentPath) && /\.(md|mdx)$/.test(n.path))
    .map(n => {
      const rel = n.path.slice(contentPath.length + 1);
      const slug = rel.split('/')[0];
      return { slug, path: n.path };
    })
    .filter((p, i, arr) => arr.findIndex(x => x.slug === p.slug) === i)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function Sidebar({ client, owner, contentPath, activeFile, onSelectFile, onNewProject, onDisconnect, refreshKey }: SidebarProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tree = await client.getFileTree();
      setProjects(filterProjects(tree, contentPath));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [client, contentPath]);

  useEffect(() => { fetchProjects(); }, [fetchProjects, refreshKey]);

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(p => p.slug.toLowerCase().includes(q));
  }, [projects, search]);

  return (
    <div style={{
      width: '20%',
      minWidth: 180,
      maxWidth: 280,
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.3px' }}>MDX CMS</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', background: '#f1f5f9', padding: '2px 5px', borderRadius: 3 }}>{owner}</span>
          <button
            onClick={fetchProjects}
            title="Refresh"
            disabled={loading}
            style={{ background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, color: '#94a3b8', padding: 2, lineHeight: 1 }}
          >
            ↺
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '6px 8px', borderBottom: '1px solid #f8fafc' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 5, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск..."
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 11, color: '#0f172a', width: '100%' }}
          />
        </div>
      </div>

      {/* Project list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {loading && !projects.length && (
          <div style={{ padding: 12, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>Loading...</div>
        )}
        {error && (
          <div style={{ margin: 8, padding: 8, background: '#fee2e2', borderRadius: 4, fontSize: 10, color: '#dc2626' }}>{error}</div>
        )}
        {filtered.map(p => {
          const isActive = activeFile === p.path;
          return (
            <div
              key={p.slug}
              onClick={() => onSelectFile(p.path)}
              style={{
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: isActive ? '#eff6ff' : 'transparent',
                borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                color: isActive ? '#1d4ed8' : '#64748b',
                fontWeight: isActive ? 500 : 400,
                fontSize: 11,
              }}
            >
              <span style={{ color: isActive ? '#3b82f6' : '#cbd5e1', fontSize: 9 }}>◆</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.slug}</span>
            </div>
          );
        })}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: 12, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
            {search ? 'Ничего не найдено' : 'Нет проектов'}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: 8, borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={onNewProject}
          style={{ background: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: 5, padding: '6px 8px', fontSize: 10, fontWeight: 500, cursor: 'pointer' }}
        >
          + Новый проект
        </button>
        <button
          onClick={onDisconnect}
          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 10, cursor: 'pointer', padding: '2px 0' }}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
