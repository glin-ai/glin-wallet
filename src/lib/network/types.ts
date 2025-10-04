/**
 * Network configuration types and utilities for GLIN Wallet
 */

export type NetworkId = 'mainnet' | 'testnet' | 'localhost' | 'custom';

export interface Network {
  id: NetworkId;
  name: string;
  rpcUrl: string;
  isCustom: boolean;
}

/**
 * Predefined networks
 */
export const NETWORKS: Record<Exclude<NetworkId, 'custom'>, Network> = {
  mainnet: {
    id: 'mainnet',
    name: 'GLIN Mainnet',
    rpcUrl: 'wss://glin-rpc-mainnet.up.railway.app',
    isCustom: false,
  },
  testnet: {
    id: 'testnet',
    name: 'GLIN Testnet',
    rpcUrl: 'wss://glin-rpc-production.up.railway.app',
    isCustom: false,
  },
  localhost: {
    id: 'localhost',
    name: 'Local Node',
    rpcUrl: 'ws://localhost:9944',
    isCustom: false,
  },
};

/**
 * Get all available networks as array
 */
export function getAllNetworks(): Network[] {
  return Object.values(NETWORKS);
}

/**
 * Get network by ID
 */
export function getNetworkById(id: NetworkId, customRpcUrl?: string): Network | null {
  if (id === 'custom') {
    if (!customRpcUrl) {
      return null;
    }
    return {
      id: 'custom',
      name: 'Custom RPC',
      rpcUrl: customRpcUrl,
      isCustom: true,
    };
  }

  return NETWORKS[id] || null;
}

/**
 * Get default network (localhost for development)
 */
export function getDefaultNetwork(): Network {
  return NETWORKS.localhost;
}

/**
 * Validate RPC URL format
 */
export function validateRpcUrl(url: string): { valid: boolean; error?: string } {
  if (!url || url.trim().length === 0) {
    return { valid: false, error: 'RPC URL cannot be empty' };
  }

  // Check if starts with ws:// or wss://
  if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
    return { valid: false, error: 'RPC URL must start with ws:// or wss://' };
  }

  // Basic URL validation
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'ws:' && parsedUrl.protocol !== 'wss:') {
      return { valid: false, error: 'Invalid WebSocket protocol' };
    }
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  return { valid: true };
}

/**
 * LocalStorage keys for network configuration
 */
export const STORAGE_KEY_NETWORK = 'glin:currentNetwork';
export const STORAGE_KEY_CUSTOM_RPC = 'glin:customRpcUrl';

/**
 * Network storage interface
 */
export interface NetworkStorage {
  networkId: NetworkId;
  customRpcUrl?: string;
}
