const BASE_URL = 'https://api.github.com';

export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

export interface FileContent {
  path: string;
  content: string;
  sha: string;
  type: 'file' | 'dir';
}

export interface TreeNode {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
}

export class GitHubClient {
  private config: RepoConfig;

  constructor(config: RepoConfig) {
    this.config = config;
  }

  private get headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.config.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  async validateToken(): Promise<{ login: string; name: string }> {
    return this.request<{ login: string; name: string }>(`${BASE_URL}/user`);
  }

  async getRepo(): Promise<any> {
    return this.request(`${BASE_URL}/repos/${this.config.owner}/${this.config.repo}`);
  }

  async getFileTree(): Promise<TreeNode[]> {
    const data = await this.request<{ tree: TreeNode[] }>(
      `${BASE_URL}/repos/${this.config.owner}/${this.config.repo}/git/trees/${this.config.branch}?recursive=1`
    );
    return data.tree;
  }

  async getFileContent(path: string): Promise<FileContent> {
    return this.request<FileContent>(
      `${BASE_URL}/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`
    );
  }

  async getFile(path: string): Promise<{ content: string; sha: string }> {
    const data = await this.getFileContent(path);
    const content = atob(data.content);
    return { content, sha: data.sha };
  }

  async saveFile(path: string, content: string, message: string, sha?: string): Promise<{ commit: any }> {
    const body: Record<string, string> = {
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: this.config.branch,
    };

    if (sha) {
      body.sha = sha;
    }

    return this.request(`${BASE_URL}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async deleteFile(path: string, sha: string, message: string): Promise<void> {
    await this.request(`${BASE_URL}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`, {
      method: 'DELETE',
      body: JSON.stringify({
        message,
        sha,
        branch: this.config.branch,
      }),
    });
  }

  async uploadBinary(path: string, file: File, message: string): Promise<void> {
    const buffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const cleanBase64 = base64.replace(/^data:.*?;base64,/, '');

    await this.request(`${BASE_URL}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: cleanBase64,
        branch: this.config.branch,
      }),
    });
  }
}
