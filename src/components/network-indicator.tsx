'use client';

import { NetworkId } from '@/lib/network/types';
import { Globe } from 'lucide-react';

interface NetworkIndicatorProps {
  networkId: NetworkId;
  onClick?: () => void;
}

const getNetworkColor = (networkId: NetworkId) => {
  switch (networkId) {
    case 'mainnet':
      return 'text-green-400 border-green-400/30 bg-green-400/10';
    case 'testnet':
      return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    case 'localhost':
      return 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10';
    default:
      return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
  }
};

const getNetworkDotColor = (networkId: NetworkId) => {
  switch (networkId) {
    case 'mainnet':
      return 'bg-green-400';
    case 'testnet':
      return 'bg-yellow-400';
    case 'localhost':
      return 'bg-indigo-400';
    default:
      return 'bg-gray-400';
  }
};

const getNetworkDisplayName = (networkId: NetworkId): string => {
  switch (networkId) {
    case 'mainnet':
      return 'Mainnet';
    case 'testnet':
      return 'Testnet';
    case 'localhost':
      return 'Local';
    case 'custom':
      return 'Custom';
    default:
      return 'Unknown';
  }
};

export function NetworkIndicator({ networkId, onClick }: NetworkIndicatorProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-2 px-3 py-1.5 rounded-full border
        transition-all hover:scale-105 active:scale-95
        ${getNetworkColor(networkId)}
      `}
    >
      <div className={`w-2 h-2 rounded-full animate-pulse ${getNetworkDotColor(networkId)}`} />
      <span className="text-sm font-medium">{getNetworkDisplayName(networkId)}</span>
      <Globe className="h-3.5 w-3.5" />
    </button>
  );
}
