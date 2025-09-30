'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Droplets, Twitter, Github, Clock, AlertCircle, CheckCircle, Zap, Trophy } from 'lucide-react';
import { GlinCoinIcon } from '@/components/icons/glin-coin-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/hooks/use-wallet';

interface FaucetStatus {
  dailyLimit: number;
  dailyUsed: number;
  lastClaim?: string;
  nextClaimTime?: string;
  isEligible: boolean;
}

export default function FaucetPage() {
  const router = useRouter();
  const { wallet, isLocked, refreshBalance } = useWallet();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [error, setError] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'twitter' | 'github'>('twitter');
  const [faucetStatus, setFaucetStatus] = useState<FaucetStatus>({
    dailyLimit: 100,
    dailyUsed: 0,
    isEligible: true
  });

  const checkFaucetStatus = useCallback(async () => {
    if (!wallet?.address) return;

    // Simulate API call to check faucet status
    // In production, this would call the backend API
    const lastClaimStr = localStorage.getItem(`faucet_claim_${wallet.address}`);
    if (lastClaimStr) {
      const lastClaim = new Date(lastClaimStr);
      const hoursSinceLastClaim = (Date.now() - lastClaim.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastClaim < 24) {
        const nextClaimTime = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
        setFaucetStatus({
          dailyLimit: 100,
          dailyUsed: 100,
          lastClaim: lastClaim.toISOString(),
          nextClaimTime: nextClaimTime.toISOString(),
          isEligible: false
        });
      }
    }
  }, [wallet]);

  useEffect(() => {
    if (isLocked || !wallet) {
      router.push('/');
    }
  }, [isLocked, wallet, router]);

  useEffect(() => {
    // Check faucet status
    checkFaucetStatus();
  }, [wallet?.address, checkFaucetStatus]);

  const handleClaim = async () => {
    if (!wallet?.address || !faucetStatus.isEligible) return;

    setIsClaiming(true);
    setError('');
    setClaimSuccess(false);

    try {
      // Simulate faucet claim
      // In production, this would call the backend API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/faucet/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: wallet.address,
          verification_method: verificationMethod,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to claim from faucet');
      }

      // Mark successful claim
      localStorage.setItem(`faucet_claim_${wallet.address}`, new Date().toISOString());
      setClaimSuccess(true);

      // Refresh balance after a delay
      setTimeout(() => {
        refreshBalance();
        checkFaucetStatus();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim from faucet. Please try again later.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleSocialVerification = (platform: 'twitter' | 'github') => {
    // In production, this would initiate OAuth flow
    const authUrl = platform === 'twitter'
      ? `${process.env.NEXT_PUBLIC_API_URL}/auth/twitter?address=${wallet?.address}`
      : `${process.env.NEXT_PUBLIC_API_URL}/auth/github?address=${wallet?.address}`;

    window.open(authUrl, '_blank');
  };

  const timeUntilNextClaim = () => {
    if (!faucetStatus.nextClaimTime) return null;

    const now = Date.now();
    const nextClaim = new Date(faucetStatus.nextClaimTime).getTime();
    const diff = nextClaim - now;

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center space-x-2">
              <GlinCoinIcon size={24} />
              <span className="text-xl font-bold text-white">GLIN</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Main Faucet Card */}
        <Card className="bg-black/50 backdrop-blur-xl border-white/20 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white flex items-center">
                  <Droplets className="h-6 w-6 mr-2 text-purple-400" />
                  GLIN Testnet Faucet
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  Claim free tGLIN tokens for testing on the GLIN testnet
                </CardDescription>
              </div>
              <Badge className="bg-purple-600/20 text-purple-400 border-purple-400">
                <Zap className="h-3 w-3 mr-1" />
                100 tGLIN / day
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Display */}
            <div className="bg-purple-600/10 border border-purple-600/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400">Daily Limit Progress</span>
                <span className="text-white font-mono">
                  {faucetStatus.dailyUsed} / {faucetStatus.dailyLimit} tGLIN
                </span>
              </div>
              <Progress
                value={(faucetStatus.dailyUsed / faucetStatus.dailyLimit) * 100}
                className="h-2 bg-purple-900/50"
              />
            </div>

            {error && (
              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            {claimSuccess && (
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  Successfully claimed 100 tGLIN! Check your balance in a few seconds.
                </AlertDescription>
              </Alert>
            )}

            {!faucetStatus.isEligible && (
              <Alert className="bg-yellow-500/10 border-yellow-500/20">
                <Clock className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-300">
                  You can claim again in {timeUntilNextClaim()}. One claim per day per address.
                </AlertDescription>
              </Alert>
            )}

            {/* Verification Methods */}
            <Tabs value={verificationMethod} onValueChange={(v) => setVerificationMethod(v as 'twitter' | 'github')}>
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="twitter" className="data-[state=active]:bg-purple-600">
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter Verification
                </TabsTrigger>
                <TabsTrigger value="github" className="data-[state=active]:bg-purple-600">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub Verification
                </TabsTrigger>
              </TabsList>

              <TabsContent value="twitter" className="mt-4 space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Twitter Verification Requirements:</h3>
                  <ul className="space-y-1 text-sm text-blue-300">
                    <li>• Account must be at least 1 month old</li>
                    <li>• Must have at least 10 followers</li>
                    <li>• Must follow @GLIN_Network</li>
                  </ul>
                </div>

                <Button
                  onClick={() => handleSocialVerification('twitter')}
                  variant="outline"
                  className="w-full border-blue-400/50 text-blue-400 hover:bg-blue-400/10"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Verify with Twitter
                </Button>
              </TabsContent>

              <TabsContent value="github" className="mt-4 space-y-4">
                <div className="bg-gray-700/20 border border-gray-600/30 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">GitHub Verification Requirements:</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Account must be at least 3 months old</li>
                    <li>• Must have at least 1 repository</li>
                    <li>• Must have made at least 5 commits</li>
                  </ul>
                </div>

                <Button
                  onClick={() => handleSocialVerification('github')}
                  variant="outline"
                  className="w-full border-gray-400/50 text-gray-300 hover:bg-gray-400/10"
                >
                  <Github className="h-4 w-4 mr-2" />
                  Verify with GitHub
                </Button>
              </TabsContent>
            </Tabs>

            {/* Claim Button */}
            <Button
              onClick={handleClaim}
              disabled={isClaiming || !faucetStatus.isEligible}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
              size="lg"
            >
              {isClaiming ? (
                <>
                  <Droplets className="h-5 w-5 mr-2 animate-pulse" />
                  Claiming tGLIN...
                </>
              ) : !faucetStatus.isEligible ? (
                <>
                  <Clock className="h-5 w-5 mr-2" />
                  Claim Available in {timeUntilNextClaim()}
                </>
              ) : (
                <>
                  <Droplets className="h-5 w-5 mr-2" />
                  Claim 100 tGLIN
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-black/50 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                Earn Extra Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-3">
                Complete these tasks to earn testnet points:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  First faucet claim: 50 points
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  Daily claims: 10 points/day
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  Social verification: 100 points
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-black/50 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-blue-400" />
                About Testnet Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                tGLIN tokens are for testing purposes only and have no real value.
                They allow you to interact with the GLIN testnet, participate in ML tasks,
                and earn points for the mainnet airdrop.
              </p>
              <div className="mt-3 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                <p className="text-blue-300 text-xs">
                  Never send real funds to testnet addresses!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}