import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WalletManager } from '@/lib/substrate/wallet';
import { Wallet, Transaction } from '@/lib/storage/db';
import { NetworkId } from '@/lib/network/types';

interface WalletState {
  // State
  walletManager: WalletManager | null;
  currentWallet: Wallet | null;
  balance: string;
  isConnected: boolean;
  isLocked: boolean;
  transactions: Transaction[];
  currentNetwork: NetworkId;

  // Actions
  initWallet: (rpcEndpoint: string) => Promise<void>;
  createWallet: (name: string, password: string) => Promise<{ wallet: Wallet; mnemonic: string }>;
  importWallet: (name: string, mnemonic: string, password: string) => Promise<Wallet>;
  unlockWallet: (walletId: number, password: string) => Promise<boolean>;
  lockWallet: () => void;
  sendTransaction: (to: string, amount: bigint, password: string) => Promise<string>;
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  deleteWallet: (walletId: number, password: string) => Promise<boolean>;
  exportSeedPhrase: (password: string) => string | null;
  changeNetwork: (networkId: NetworkId, customRpcUrl?: string) => Promise<void>;
  setCurrentNetwork: (networkId: NetworkId) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      walletManager: null,
      currentWallet: null,
      balance: '0',
      isConnected: false,
      isLocked: true,
      transactions: [],
      currentNetwork: 'localhost',

      // Initialize wallet manager
      initWallet: async (rpcEndpoint: string) => {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
          const manager = new WalletManager(rpcEndpoint, backendUrl);
          await manager.init();

          const currentWallet = manager.getCurrentWallet();

          set({
            walletManager: manager,
            currentWallet,
            isConnected: true,
            isLocked: currentWallet === null
          });

          if (currentWallet) {
            await get().refreshBalance();
            await get().refreshTransactions();
          }
        } catch (error) {
          console.error('Failed to initialize wallet:', error);
          set({ isConnected: false });
          throw error;
        }
      },

      // Create new wallet
      createWallet: async (name: string, password: string) => {
        const manager = get().walletManager;
        if (!manager) throw new Error('Wallet not initialized');

        const result = await manager.createWallet(name, password);

        set({
          currentWallet: result.wallet,
          isLocked: false
        });

        await get().refreshBalance();

        return result;
      },

      // Import wallet
      importWallet: async (name: string, mnemonic: string, password: string) => {
        const manager = get().walletManager;
        if (!manager) throw new Error('Wallet not initialized');

        const wallet = await manager.importWallet(name, mnemonic, password);

        set({
          currentWallet: wallet,
          isLocked: false
        });

        await get().refreshBalance();
        await get().refreshTransactions();

        return wallet;
      },

      // Unlock wallet
      unlockWallet: async (walletId: number, password: string) => {
        const manager = get().walletManager;
        if (!manager) throw new Error('Wallet not initialized');

        const success = await manager.unlockWallet(walletId, password);

        if (success) {
          const currentWallet = manager.getCurrentWallet();
          set({
            currentWallet,
            isLocked: false
          });

          await get().refreshBalance();
          await get().refreshTransactions();
        }

        return success;
      },

      // Lock wallet
      lockWallet: () => {
        const manager = get().walletManager;
        if (!manager) return;

        manager.lockWallet();
        set({
          currentWallet: null,
          isLocked: true,
          balance: '0',
          transactions: []
        });
      },

      // Send transaction
      sendTransaction: async (to: string, amount: bigint, password: string) => {
        const manager = get().walletManager;
        if (!manager) throw new Error('Wallet not initialized');

        const hash = await manager.sendTransaction(to, amount, password);

        // Refresh balance and transactions after sending
        setTimeout(async () => {
          await get().refreshBalance();
          await get().refreshTransactions();
        }, 2000);

        return hash;
      },

      // Refresh balance
      refreshBalance: async () => {
        const manager = get().walletManager;
        if (!manager || !get().currentWallet) return;

        try {
          const balance = await manager.getBalance();
          set({ balance });
        } catch (error) {
          console.error('Failed to refresh balance:', error);
        }
      },

      // Refresh transactions
      refreshTransactions: async () => {
        const manager = get().walletManager;
        if (!manager || !get().currentWallet) return;

        try {
          const transactions = await manager.getTransactionHistory();
          set({ transactions });
        } catch (error) {
          console.error('Failed to refresh transactions:', error);
        }
      },

      // Delete wallet
      deleteWallet: async (walletId: number, password: string) => {
        const manager = get().walletManager;
        if (!manager) throw new Error('Wallet not initialized');

        const success = await manager.deleteWallet(walletId, password);

        if (success && get().currentWallet?.id === walletId) {
          set({
            currentWallet: null,
            isLocked: true,
            balance: '0',
            transactions: []
          });
        }

        return success;
      },

      // Export seed phrase
      exportSeedPhrase: (password: string) => {
        const manager = get().walletManager;
        if (!manager) throw new Error('Wallet not initialized');

        return manager.exportSeedPhrase(password);
      },

      // Change network
      changeNetwork: async (networkId: NetworkId, customRpcUrl?: string) => {
        const { getNetworkById } = await import('@/lib/network/types');
        const { setCurrentNetwork: saveNetwork } = await import('@/lib/network/storage');

        // Validate network
        const network = getNetworkById(networkId, customRpcUrl);
        if (!network) {
          throw new Error('Invalid network configuration');
        }

        console.log('[Wallet Store] Changing network to:', network.name, network.rpcUrl);

        // Save network preference
        saveNetwork(networkId, customRpcUrl);

        // Disconnect existing wallet manager
        const manager = get().walletManager;
        if (manager) {
          try {
            await manager.disconnect();
          } catch (error) {
            console.error('[Wallet Store] Error disconnecting old manager:', error);
          }
        }

        // Reinitialize with new RPC URL
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
        const newManager = new WalletManager(network.rpcUrl, backendUrl);
        await newManager.init();

        const currentWallet = newManager.getCurrentWallet();

        set({
          walletManager: newManager,
          currentWallet,
          isConnected: true,
          isLocked: currentWallet === null,
          currentNetwork: networkId
        });

        // Refresh data if wallet is unlocked
        if (currentWallet) {
          await get().refreshBalance();
          await get().refreshTransactions();
        }
      },

      // Set current network (internal use)
      setCurrentNetwork: (networkId: NetworkId) => {
        set({ currentNetwork: networkId });
      }
    }),
    {
      name: 'glin-wallet-store',
      partialize: (state) => ({
        // Only persist non-sensitive data
        isConnected: state.isConnected,
        currentNetwork: state.currentNetwork
      })
    }
  )
);