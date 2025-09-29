import { useEffect, useState } from 'react';
import { useWalletStore } from '@/store/wallet-store';

export const useWallet = () => {
  const {
    currentWallet,
    balance,
    isConnected,
    isLocked,
    transactions,
    initWallet,
    createWallet,
    importWallet,
    unlockWallet,
    lockWallet,
    sendTransaction,
    refreshBalance,
    refreshTransactions,
    deleteWallet,
    exportSeedPhrase
  } = useWalletStore();

  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!isConnected && !isInitializing) {
        setIsInitializing(true);
        try {
          const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'wss://rpc.glin-testnet.railway.app';
          await initWallet(rpcEndpoint);
          setError(null);
        } catch (err) {
          console.error('Failed to initialize wallet:', err);
          setError('Failed to connect to network');
        } finally {
          setIsInitializing(false);
        }
      }
    };

    init();
  }, [isConnected, isInitializing, initWallet]);

  // Auto-refresh balance every 10 seconds when unlocked
  useEffect(() => {
    if (!isLocked && currentWallet) {
      const interval = setInterval(() => {
        refreshBalance();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isLocked, currentWallet, refreshBalance]);

  return {
    // State
    wallet: currentWallet,
    balance,
    isConnected,
    isLocked,
    transactions,
    isInitializing,
    error,

    // Actions
    createWallet,
    importWallet,
    unlockWallet,
    lockWallet,
    sendTransaction,
    refreshBalance,
    refreshTransactions,
    deleteWallet,
    exportSeedPhrase,

    // Computed
    hasWallet: currentWallet !== null,
    formattedBalance: formatBalance(balance),
    shortAddress: currentWallet ? formatAddress(currentWallet.address) : ''
  };
};

// Helper functions
function formatBalance(balance: string): string {
  const decimals = 18;
  const value = BigInt(balance) / BigInt(10 ** decimals);
  return value.toString();
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}