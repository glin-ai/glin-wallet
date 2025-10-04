'use client';

import { useState } from 'react';
import { Globe, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NetworkId, getAllNetworks, validateRpcUrl } from '@/lib/network/types';

interface NetworkSwitcherProps {
  currentNetwork: NetworkId;
  onNetworkChange: (networkId: NetworkId, customRpcUrl?: string) => Promise<void>;
}

export function NetworkSwitcher({ currentNetwork, onNetworkChange }: NetworkSwitcherProps) {
  const [switching, setSwitching] = useState(false);
  const [customRpcUrl, setCustomRpcUrl] = useState('');
  const [rpcError, setRpcError] = useState('');

  const networks = getAllNetworks();

  const handleNetworkSelect = async (networkId: NetworkId) => {
    if (networkId === currentNetwork || switching) return;

    setSwitching(true);
    try {
      await onNetworkChange(networkId);
    } catch (error) {
      console.error('Failed to switch network:', error);
      alert('Failed to switch network: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSwitching(false);
    }
  };

  const handleCustomRpcConnect = async () => {
    // Validate RPC URL
    const validation = validateRpcUrl(customRpcUrl);
    if (!validation.valid) {
      setRpcError(validation.error || 'Invalid RPC URL');
      return;
    }

    setRpcError('');
    setSwitching(true);
    try {
      await onNetworkChange('custom', customRpcUrl);
    } catch (error) {
      console.error('Failed to connect to custom RPC:', error);
      alert('Failed to connect to custom RPC: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSwitching(false);
    }
  };

  const getNetworkBadgeColor = (networkId: NetworkId) => {
    switch (networkId) {
      case 'mainnet':
        return 'bg-green-500';
      case 'testnet':
        return 'bg-yellow-500';
      case 'localhost':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {currentNetwork === 'testnet' && (
        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-300">
            ⚠️ You are on a testnet. Tokens have no real value. Switch to mainnet when ready for production.
          </AlertDescription>
        </Alert>
      )}

      {currentNetwork === 'localhost' && (
        <Alert className="bg-indigo-500/10 border-indigo-500/20">
          <AlertCircle className="h-4 w-4 text-indigo-400" />
          <AlertDescription className="text-indigo-300">
            💻 You are connected to a local development node. Make sure your local blockchain is running on ws://localhost:9944.
          </AlertDescription>
        </Alert>
      )}

      {/* Predefined Networks */}
      <div className="space-y-3">
        {networks.map((network) => (
          <Card
            key={network.id}
            className={`cursor-pointer transition-all ${
              network.id === currentNetwork
                ? 'bg-white/10 border-purple-500/50'
                : 'bg-white/5 border-white/20 hover:bg-white/10'
            }`}
            onClick={() => handleNetworkSelect(network.id)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getNetworkBadgeColor(network.id)}`} />
                  <div>
                    <div className="text-white font-medium">{network.name}</div>
                    <div className="text-gray-400 text-sm font-mono">{network.rpcUrl}</div>
                  </div>
                </div>
                {network.id === currentNetwork && (
                  <span className="text-purple-400 text-sm font-semibold">✓ Active</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Custom RPC Section */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <Globe className="h-4 w-4 mr-2 text-purple-400" />
          Custom RPC
        </h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="customRpcUrl" className="text-gray-400">
              WebSocket URL
            </Label>
            <Input
              id="customRpcUrl"
              type="text"
              placeholder="ws://localhost:9944 or wss://..."
              value={customRpcUrl}
              onChange={(e) => {
                setCustomRpcUrl(e.target.value);
                setRpcError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCustomRpcConnect();
                }
              }}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 mt-1"
            />
            {rpcError && (
              <p className="text-red-400 text-sm mt-1">{rpcError}</p>
            )}
          </div>
          <Button
            onClick={handleCustomRpcConnect}
            disabled={switching || !customRpcUrl}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          >
            {switching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect to Custom RPC'
            )}
          </Button>
        </div>
      </div>

      {switching && (
        <div className="text-center text-gray-400 text-sm">
          Switching network... This may take a moment.
        </div>
      )}
    </div>
  );
}
