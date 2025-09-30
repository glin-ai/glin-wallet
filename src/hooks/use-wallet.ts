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
          const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'wss://glin-rpc-production.up.railway.app';
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

  // Convert to BigInt and divide by decimals
  const rawValue = BigInt(balance || '0');
  const divisor = BigInt(10 ** decimals);
  const wholePart = rawValue / divisor;
  const fractionalPart = rawValue % divisor;

  // Format whole part with thousand separators
  const wholeStr = wholePart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Get first 4 decimal places
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0').slice(0, 4);

  // Determine the unit based on value
  let unit = 'tGLIN';
  if (wholePart >= BigInt(1000000)) {
    unit = 'MtGLIN'; // Million tGLIN
    const millions = Number(wholePart) / 1000000;
    return `${millions.toFixed(4)} ${unit}`;
  }

  // Remove trailing zeros from fractional part
  const trimmedFractional = fractionalStr.replace(/0+$/, '');

  if (trimmedFractional) {
    return `${wholeStr}.${trimmedFractional} ${unit}`;
  }

  return `${wholeStr} ${unit}`;
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}