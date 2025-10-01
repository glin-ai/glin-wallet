/**
 * GLIN Backend API Client
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface User {
  id: string;
  walletAddress: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'available' | 'active' | 'completed' | 'failed';
  createdAt: string;
  deadline?: string;
}

export interface ProviderStatus {
  status: 'active' | 'idle' | 'offline';
  tasks: {
    active: number;
    completed: number;
    failed: number;
  };
  earnings: {
    today: number;
    total: number;
    pending: number;
  };
}

export interface TestnetPoints {
  total: number;
  rank: number;
  activities: Array<{
    type: string;
    points: number;
    timestamp: string;
  }>;
}

export class BackendAPIClient {
  private baseUrl: string;
  private tokens: AuthTokens | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set authentication tokens
   */
  setTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
  }

  /**
   * Get authentication tokens
   */
  getTokens(): AuthTokens | null {
    return this.tokens;
  }

  /**
   * Make authenticated request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    if (this.tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${this.tokens.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get nonce for wallet authentication
   */
  async getNonce(walletAddress: string): Promise<{
    nonce: string;
    message: string;
    expiresAt: string;
  }> {
    return this.request('/api/v1/auth/nonce', {
      method: 'POST',
      body: JSON.stringify({ wallet_address: walletAddress }),
    });
  }

  /**
   * Login with wallet signature
   */
  async loginWithWallet(
    walletAddress: string,
    signature: string,
    nonce: string
  ): Promise<{
    access_token: string;
    refresh_token: string;
    user: User;
  }> {
    const response = await this.request<{
      access_token: string;
      refresh_token: string;
      user: User;
    }>('/api/v1/auth/login/wallet', {
      method: 'POST',
      body: JSON.stringify({
        wallet_address: walletAddress,
        signature,
        nonce,
      }),
    });

    // Store tokens
    this.setTokens({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: Date.now() + 3600000, // 1 hour
    });

    return response;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<{
      access_token: string;
      refresh_token: string;
    }>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: this.tokens.refreshToken,
      }),
    });

    // Update tokens
    this.setTokens({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: Date.now() + 3600000,
    });

    return response;
  }

  /**
   * Get provider status
   */
  async getProviderStatus(): Promise<ProviderStatus> {
    return this.request('/api/v1/provider/status');
  }

  /**
   * Get available tasks
   */
  async getTasks(status?: string): Promise<Task[]> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/api/v1/tasks${query}`);
  }

  /**
   * Accept a task
   */
  async acceptTask(taskId: string): Promise<Task> {
    return this.request(`/api/v1/tasks/${taskId}/accept`, {
      method: 'POST',
    });
  }

  /**
   * Submit task result
   */
  async submitTask(
    taskId: string,
    result: unknown
  ): Promise<{ success: boolean; reward: number }> {
    return this.request(`/api/v1/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ result }),
    });
  }

  /**
   * Get testnet points
   */
  async getTestnetPoints(): Promise<TestnetPoints> {
    return this.request('/api/v1/testnet/points');
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit = 100): Promise<
    Array<{
      rank: number;
      walletAddress: string;
      points: number;
    }>
  > {
    return this.request(`/api/v1/testnet/leaderboard?limit=${limit}`);
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<User> {
    return this.request('/api/v1/user/profile');
  }

  /**
   * Update provider metadata
   */
  async updateProviderMetadata(metadata: {
    hardwareInfo?: unknown;
    availability?: string;
  }): Promise<{ success: boolean }> {
    return this.request('/api/v1/provider/metadata', {
      method: 'PUT',
      body: JSON.stringify(metadata),
    });
  }

  /**
   * Get transactions for an address
   */
  async getTransactions(
    address: string,
    query?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ): Promise<{
    transactions: Array<{
      hash: string;
      blockNumber: number;
      blockHash: string;
      timestamp: string;
      extrinsicIndex: number;
      fromAddress: string;
      toAddress: string;
      amount: string;
      fee: string | null;
      method: string;
      status: 'pending' | 'success' | 'failed';
      errorMessage: string | null;
    }>;
    totalCount: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams();
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());
    if (query?.status) params.append('status', query.status);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/v1/transactions/${address}${queryString}`);
  }

  /**
   * Get transaction by hash
   */
  async getTransactionByHash(hash: string): Promise<{
    hash: string;
    blockNumber: number;
    blockHash: string;
    timestamp: string;
    extrinsicIndex: number;
    fromAddress: string;
    toAddress: string;
    amount: string;
    fee: string | null;
    method: string;
    status: 'pending' | 'success' | 'failed';
    errorMessage: string | null;
  }> {
    return this.request(`/api/v1/transactions/by-hash/${hash}`);
  }

  /**
   * Get WebSocket URL for real-time updates
   */
  async getWebSocketUrl(): Promise<string> {
    // Convert HTTP(S) URL to WS(S)
    const wsUrl = this.baseUrl.replace(/^http/, 'ws');
    return `${wsUrl}/api/v1/ws/global`;
  }
}
