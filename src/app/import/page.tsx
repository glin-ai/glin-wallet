'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWallet } from '@/hooks/use-wallet';
import { MnemonicService } from '@/lib/crypto/mnemonic';

export default function ImportWalletPage() {
  const router = useRouter();
  const { importWallet, isConnected, isInitializing, error: walletError } = useWallet();
  const [walletName, setWalletName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [mnemonicWords, setMnemonicWords] = useState(Array(12).fill(''));
  const [showPassword, setShowPassword] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');
  const [inputMethod, setInputMethod] = useState<'paste' | 'manual'>('paste');

  const handleMnemonicWordChange = (index: number, value: string) => {
    const newWords = [...mnemonicWords];
    newWords[index] = value.toLowerCase().trim();
    setMnemonicWords(newWords);
    setMnemonic(newWords.filter(w => w).join(' '));
  };

  const handlePasteMnemonic = (value: string) => {
    setMnemonic(value.trim());
    const words = value.trim().split(/\s+/);
    if (words.length === 12 || words.length === 24) {
      const newWords = Array(12).fill('');
      words.forEach((word, index) => {
        if (index < 12) newWords[index] = word;
      });
      setMnemonicWords(newWords);
    }
  };

  const handleImportWallet = async () => {
    // Validation
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

    const finalMnemonic = inputMethod === 'manual'
      ? mnemonicWords.filter(w => w).join(' ')
      : mnemonic;

    if (!MnemonicService.validate(finalMnemonic)) {
      setError('Invalid seed phrase. Please check and try again.');
      return;
    }

    setIsImporting(true);
    setError('');

    try {
      await importWallet(walletName, finalMnemonic, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to import wallet');
      setIsImporting(false);
    }
  };

  // Show loading state while wallet is initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/50 backdrop-blur-xl border-white/20 p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-white">Connecting to network...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Show error if wallet failed to initialize
  if (!isConnected && walletError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/50 backdrop-blur-xl border-white/20 p-8">
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-400">
              Failed to connect to network. Please check your connection and try again.
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => window.location.reload()}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Retry Connection
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/50 backdrop-blur-xl border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <CardTitle className="text-2xl text-white">Import Existing Wallet</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your seed phrase to restore your wallet
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="wallet-name" className="text-white">Wallet Name</Label>
            <Input
              id="wallet-name"
              placeholder="My Imported Wallet"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>

          <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as 'paste' | 'manual')}>
            <TabsList className="grid w-full grid-cols-2 bg-white/10">
              <TabsTrigger value="paste" className="data-[state=active]:bg-purple-600">
                <FileText className="h-4 w-4 mr-2" />
                Paste Phrase
              </TabsTrigger>
              <TabsTrigger value="manual" className="data-[state=active]:bg-purple-600">
                Manual Entry
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-2 mt-4">
              <Label className="text-white">Seed Phrase</Label>
              <textarea
                className="w-full h-32 p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-gray-500 resize-none font-mono text-sm"
                placeholder="Enter your 12 or 24 word seed phrase..."
                value={mnemonic}
                onChange={(e) => handlePasteMnemonic(e.target.value)}
              />
            </TabsContent>

            <TabsContent value="manual" className="mt-4">
              <Label className="text-white mb-3 block">Enter each word</Label>
              <div className="grid grid-cols-3 gap-3">
                {mnemonicWords.map((word, index) => (
                  <div key={index} className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-xs">
                      {index + 1}.
                    </span>
                    <Input
                      type="text"
                      value={word}
                      onChange={(e) => handleMnemonicWordChange(index, e.target.value)}
                      className="pl-8 bg-white/5 border-white/20 text-white placeholder:text-gray-600 font-mono text-sm"
                      placeholder="word"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">New Password</Label>
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
          </div>

          <Alert className="bg-yellow-500/10 border-yellow-500/20">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-300">
              Make sure you're importing the correct wallet. This action will create a new wallet instance
              with the provided seed phrase.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleImportWallet}
            disabled={isImporting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
            size="lg"
          >
            {isImporting ? 'Importing Wallet...' : 'Import Wallet'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}