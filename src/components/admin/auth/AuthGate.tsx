import { useState } from 'react';
import { GitHubClient, type RepoConfig } from './GitHubClient';

const STORAGE_KEY = 'admin_github_config';

export interface StoredConfig extends RepoConfig {
  contentPath: string;
}

export function getStoredConfig(): StoredConfig | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function clearStoredConfig(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

interface AuthGateProps {
  onAuth?: (config: RepoConfig & { contentPath: string }) => void;
  onDisconnect?: () => void;
}

export function AuthGate({ onAuth, onDisconnect }: AuthGateProps) {
  const storedConfig = getStoredConfig();
  const isConnected = !!storedConfig;
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('kkrugley');
  const [repo, setRepo] = useState('kkrugley.github.io');
  const [branch, setBranch] = useState('main');
  const [contentPath, setContentPath] = useState('src/content/projects');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const config: RepoConfig = { token, owner, repo, branch };
      const client = new GitHubClient(config);
      await client.validateToken();

      const storedConfig: StoredConfig = { ...config, contentPath };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedConfig));
      onAuth?.({ ...config, contentPath });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate token');
    } finally {
      setLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div style={styles.form}>
        <h2 style={styles.title}>Connected to GitHub</h2>
        <div style={styles.connectedInfo}>
          <p style={styles.infoText}>
            Owner: <strong>{storedConfig.owner}</strong>
          </p>
          <p style={styles.infoText}>
            Repo: <strong>{storedConfig.repo}</strong>
          </p>
          <p style={styles.infoText}>
            Branch: <strong>{storedConfig.branch}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            clearStoredConfig();
            onDisconnect?.();
          }}
          style={styles.disconnectButton}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Connect to GitHub</h2>

      <div style={styles.field}>
        <label htmlFor="token" style={styles.label}>GitHub Token</label>
        <input
          id="token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          style={styles.input}
          placeholder="ghp_xxxx..."
        />
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label htmlFor="owner" style={styles.label}>Owner</label>
          <input
            id="owner"
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="repo" style={styles.label}>Repo</label>
          <input
            id="repo"
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            required
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label htmlFor="branch" style={styles.label}>Branch</label>
          <input
            id="branch"
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="contentPath" style={styles.label}>Content Path</label>
          <input
            id="contentPath"
            type="text"
            value={contentPath}
            onChange={(e) => setContentPath(e.target.value)}
            required
            style={styles.input}
          />
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Validating...' : 'Connect'}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    maxWidth: 480,
    margin: '0 auto',
    padding: 24,
    fontFamily: 'system-ui, sans-serif',
  },
  title: {
    margin: '0 0 24px',
    fontSize: 20,
    fontWeight: 600,
    color: '#1a1a1a',
  },
  connectedInfo: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 6,
  },
  infoText: {
    margin: '8px 0',
    fontSize: 14,
    color: '#166534',
  },
  field: {
    marginBottom: 16,
    flex: 1,
  },
  row: {
    display: 'flex',
    gap: 16,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #d1d5db',
    borderRadius: 6,
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px 16px',
    fontSize: 14,
    fontWeight: 500,
    color: '#fff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    marginTop: 8,
  },
  disconnectButton: {
    width: '100%',
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 500,
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: 6,
    cursor: 'pointer',
  },
  error: {
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    border: '1px solid #fecaca',
  },
};