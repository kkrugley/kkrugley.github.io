import { useState, useEffect, useCallback } from 'react';
import { GitHubClient } from './auth/GitHubClient';
import { AuthGate, getStoredConfig, clearStoredConfig } from './auth/AuthGate';
import { Sidebar } from './Sidebar';
import { EditorLayout } from './editor/EditorLayout';
import { NewProjectModal } from './editor/NewProjectModal';
import { generateMDX, type TemplateType } from './templates';

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

  // Restore session on mount
  useEffect(() => {
    const stored = getStoredConfig();
    if (stored) {
      setClient(new GitHubClient(stored));
      setOwner(stored.owner);
    }
  }, []);

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

  const handleNewProject = useCallback(async (slug: string, templateType: TemplateType) => {
    if (!client) return;
    try {
      const mdx = generateMDX(slug, templateType);
      await client.saveFile(`${CONTENT_PATH}/${slug}/index.mdx`, mdx, `Create project: ${slug}`);
      await client.saveFile(`${GALLERY_PATH}/${slug}/img/.gitkeep`, '', `Create project: ${slug}`);
      setRefreshKey(k => k + 1);
      setActiveFile(`${CONTENT_PATH}/${slug}/index.mdx`);
      setShowNewProject(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create project');
    }
  }, [client]);

  // Auth screen
  if (!client) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <AuthGate onAuth={handleAuth} onDisconnect={handleDisconnect} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Sidebar
        client={client}
        owner={owner}
        contentPath={CONTENT_PATH}
        activeFile={activeFile}
        onSelectFile={setActiveFile}
        onNewProject={() => setShowNewProject(true)}
        onDisconnect={handleDisconnect}
        refreshKey={refreshKey}
      />

      {/* Right area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loadingFile && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
            Loading...
          </div>
        )}
        {!loadingFile && fileError && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: 13 }}>
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
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
            Выбери проект слева
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
