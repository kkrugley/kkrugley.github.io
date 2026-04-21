import { useState, useEffect, useCallback } from 'react';
import { GitHubClient } from './auth/GitHubClient';
import { AuthGate, getStoredConfig, clearStoredConfig } from './auth/AuthGate';
import { Sidebar } from './Sidebar';
import { EditorLayout } from './editor/EditorLayout';
import { NewProjectModal } from './editor/NewProjectModal';
import { generateMDX, type TemplateType } from './templates';
import { useIsMobile } from './utils/useIsMobile';

const CONTENT_PATH = 'src/content/projects';
const GALLERY_PATH = 'public/gallery';

export default function App() {
  const [client, setClient] = useState<GitHubClient | null>(null);
  const [owner, setOwner] = useState('kkrugley');
  const [activeFile, setActiveFile] = useState<string | undefined>();
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileSha, setFileSha] = useState<string>('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isMobile = useIsMobile();

  // Restore session on mount
  useEffect(() => {
    const stored = getStoredConfig();
    if (stored) {
      setClient(new GitHubClient(stored));
      setOwner(stored.owner);
    }
  }, []);

  // On mobile, default sidebar closed when editor is open
  useEffect(() => {
    if (isMobile && activeFile) setSidebarOpen(false);
  }, [isMobile, activeFile]);

  // Load file when selected
  useEffect(() => {
    if (!activeFile || !client) {
      setFileContent(null);
      setFileSha('');
      return;
    }
    setLoadingFile(true);
    setFileError(null);
    client.getFile(activeFile)
      .then(({ content, sha }) => {
        setFileContent(content);
        setFileSha(sha);
      })
      .catch(err => setFileError(err instanceof Error ? err.message : 'Failed to load file'))
      .finally(() => setLoadingFile(false));
  }, [activeFile, client]);

  const handleAuth = useCallback((config: { owner: string; repo: string; branch: string; token: string; contentPath?: string }) => {
    setClient(new GitHubClient(config));
    setOwner(config.owner);
  }, []);

  const handleDisconnect = useCallback(() => {
    clearStoredConfig();
    setClient(null);
    setActiveFile(undefined);
    setFileContent(null);
    setFileSha('');
  }, []);

  const handleSelectFile = useCallback((path: string) => {
    setActiveFile(path);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleNewProject = useCallback(async (slug: string, templateType: TemplateType) => {
    if (!client) return;
    try {
      const mdx = generateMDX(slug, templateType);
      await client.saveFile(`${CONTENT_PATH}/${slug}/index.mdx`, mdx, `Create project: ${slug}`);
      await client.saveFile(`${GALLERY_PATH}/${slug}/img/.gitkeep`, '', `Create project: ${slug}`);
      setRefreshKey(k => k + 1);
      setActiveFile(`${CONTENT_PATH}/${slug}/index.mdx`);
      setShowNewProject(false);
      if (isMobile) setSidebarOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create project');
    }
  }, [client, isMobile]);

  if (!client) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: 16 }}>
        <AuthGate onAuth={handleAuth} onDisconnect={handleDisconnect} />
      </div>
    );
  }

  const showSidebar = !isMobile || sidebarOpen;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", position: 'relative' }}>

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div style={isMobile ? {
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
          width: '80vw', maxWidth: 300,
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        } : {}}>
          <Sidebar
            client={client}
            owner={owner}
            contentPath={CONTENT_PATH}
            activeFile={activeFile}
            onSelectFile={handleSelectFile}
            onNewProject={() => setShowNewProject(true)}
            onDisconnect={handleDisconnect}
            refreshKey={refreshKey}
            onClose={isMobile ? () => setSidebarOpen(false) : undefined}
          />
        </div>
      )}

      {/* Right area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Mobile header bar */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 10px', fontSize: 16, cursor: 'pointer', color: '#374151', lineHeight: 1 }}
              title="Open sidebar"
            >
              ☰
            </button>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>MDX CMS</span>
            {activeFile && (
              <span style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {activeFile.split('/').at(-2)}
              </span>
            )}
          </div>
        )}

        {loadingFile && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
            Loading...
          </div>
        )}
        {!loadingFile && fileError && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: 13, padding: 16, textAlign: 'center' }}>
            {fileError}
          </div>
        )}
        {!loadingFile && !fileError && fileContent !== null && activeFile && (
          <EditorLayout
            client={client}
            filePath={activeFile}
            initialContent={fileContent}
            initialSha={fileSha}
            onSaveSuccess={() => setRefreshKey(k => k + 1)}
            onDeleteSuccess={() => {
              setActiveFile(undefined);
              setFileContent(null);
              setRefreshKey(k => k + 1);
            }}
          />
        )}
        {!loadingFile && !fileError && fileContent === null && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14, gap: 12 }}>
            <span>Выбери проект</span>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}
              >
                Открыть список
              </button>
            )}
          </div>
        )}
      </div>

      {showNewProject && (
        <NewProjectModal
          onSubmit={handleNewProject}
          onCancel={() => setShowNewProject(false)}
        />
      )}
    </div>
  );
}
