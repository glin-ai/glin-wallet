/**
 * Network storage utilities using localStorage
 */

import {
  NetworkId,
  STORAGE_KEY_NETWORK,
  STORAGE_KEY_CUSTOM_RPC,
  getNetworkById,
  getDefaultNetwork,
} from './types';

/**
 * Get current network from localStorage
 */
export function getCurrentNetwork(): { networkId: NetworkId; customRpcUrl?: string } {
  if (typeof window === 'undefined') {
    // SSR: return default network
    return { networkId: 'localhost' };
  }

  try {
    const networkId = (localStorage.getItem(STORAGE_KEY_NETWORK) as NetworkId) || 'localhost';
    const customRpcUrl = localStorage.getItem(STORAGE_KEY_CUSTOM_RPC) || undefined;

    console.log('[Network Storage] Retrieved network:', { networkId, customRpcUrl });

    return { networkId, customRpcUrl };
  } catch (error) {
    console.error('[Network Storage] Failed to get network:', error);
    // Return default network on error
    return { networkId: 'localhost' };
  }
}

/**
 * Set current network in localStorage
 */
export function setCurrentNetwork(
  networkId: NetworkId,
  customRpcUrl?: string
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY_NETWORK, networkId);

    if (networkId === 'custom' && customRpcUrl) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_RPC, customRpcUrl);
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_RPC);
    }

    console.log('[Network Storage] Saved network:', { networkId, customRpcUrl });
  } catch (error) {
    console.error('[Network Storage] Failed to save network:', error);
    throw error;
  }
}

/**
 * Get RPC URL for current network
 */
export function getCurrentRpcUrl(): string {
  const { networkId, customRpcUrl } = getCurrentNetwork();

  const network = getNetworkById(networkId, customRpcUrl);
  if (!network) {
    console.warn('[Network Storage] Network not found, using default');
    return getDefaultNetwork().rpcUrl;
  }

  return network.rpcUrl;
}

/**
 * Initialize network storage with default value on first use
 */
export function initializeNetworkStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const existing = localStorage.getItem(STORAGE_KEY_NETWORK);

    if (!existing) {
      // First use, set default network
      setCurrentNetwork('localhost');
      console.log('[Network Storage] Initialized with default network: localhost');
    }
  } catch (error) {
    console.error('[Network Storage] Failed to initialize:', error);
  }
}
