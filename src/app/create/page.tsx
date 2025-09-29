'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Copy, Check, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/use-wallet';
import { MnemonicService } from '@/lib/crypto/mnemonic';

export default function CreateWalletPage() {
  const router = useRouter();
  const { createWallet } = useWallet();
  const [step, setStep] = useState(1);
  const [walletName, setWalletName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateMnemonic = () => {
    if (!walletName) {
      setError('Please enter a wallet name');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const newMnemonic = MnemonicService.generate();
    setMnemonic(newMnemonic);
    setError('');
    setStep(2);
  };

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateWallet = async () => {
    if (!confirmed) {
      setError('Please confirm that you have saved your seed phrase');
      return;
    }

    setIsCreating(true);
    try {
      await createWallet(walletName, password, mnemonic);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create wallet');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/50 backdrop-blur-xl border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => step === 1 ? router.push('/') : setStep(1)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Badge variant="outline" className="text-purple-400 border-purple-400">
              Step {step} of 2
            </Badge>
          </div>

          <CardTitle className="text-2xl text-white">
            {step === 1 ? 'Create New Wallet' : 'Save Your Seed Phrase'}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {step === 1
              ? 'Choose a name and secure password for your wallet'
              : 'Write down these words in order. You\'ll need them to recover your wallet.'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-6 bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="wallet-name" className="text-white">Wallet Name</Label>
                <Input
                  id="wallet-name"
                  placeholder="My GLIN Wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Lock className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-semibold mb-1">Password Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-300">
                      <li>At least 8 characters long</li>
                      <li>Store it safely - it cannot be recovered</li>
                      <li>Required to unlock your wallet</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerateMnemonic}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                size="lg"
              >
                Generate Seed Phrase
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="text-sm text-red-200">
                    <p className="font-semibold mb-1">Critical Security Warning:</p>
                    <ul className="list-disc list-inside space-y-1 text-red-300">
                      <li>Never share your seed phrase with anyone</li>
                      <li>GLIN team will never ask for your seed phrase</li>
                      <li>Store it offline in a secure location</li>
                      <li>Anyone with these words can steal your funds</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-black/50 rounded-lg p-6 border border-white/20">
                <div className="grid grid-cols-3 gap-3">
                  {mnemonic.split(' ').map((word, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded px-3 py-2 border border-white/10 flex items-center space-x-2"
                    >
                      <span className="text-purple-400 text-xs font-mono">{index + 1}.</span>
                      <span className="text-white font-mono">{word}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCopyMnemonic}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Seed Phrase
                  </>
                )}
              </Button>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="confirm"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="confirm" className="text-sm text-gray-300">
                  I have securely saved my seed phrase and understand that I will need it to recover my wallet.
                  I understand that GLIN cannot recover my seed phrase if I lose it.
                </label>
              </div>

              <Button
                onClick={handleCreateWallet}
                disabled={!confirmed || isCreating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
                size="lg"
              >
                {isCreating ? 'Creating Wallet...' : 'Create Wallet'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}