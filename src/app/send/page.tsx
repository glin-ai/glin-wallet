'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, AlertCircle, Loader2, Sparkles, User, Zap, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/hooks/use-wallet';

export default function SendPage() {
  const router = useRouter();
  const {
    wallet,
    formattedBalance,
    sendTransaction,
    isLocked
  } = useWallet();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [estimatedFee] = useState('0.001');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isLocked || !wallet) {
      router.push('/');
    }
  }, [isLocked, wallet, router]);

  const validateAddress = (address: string): boolean => {
    // Basic Substrate address validation
    return address.startsWith('5') && address.length === 48;
  };

  const handleQuickAmount = (percentage: number) => {
    const balanceNum = parseFloat(formattedBalance);
    const feeNum = parseFloat(estimatedFee);
    const maxAmount = Math.max(0, balanceNum - feeNum);
    const selectedAmount = (maxAmount * percentage / 100).toFixed(4);
    setAmount(selectedAmount);
  };

  const handleSend = async () => {
    // Validation
    if (!recipient) {
      setError('Please enter a recipient address');
      return;
    }

    if (!validateAddress(recipient)) {
      setError('Invalid recipient address format');
      return;
    }

    if (recipient === wallet?.address) {
      setError('Cannot send to yourself');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const balanceNum = parseFloat(formattedBalance);
    const feeNum = parseFloat(estimatedFee);

    if (amountNum + feeNum > balanceNum) {
      setError('Insufficient balance (including fees)');
      return;
    }

    if (!password) {
      setError('Please enter your password to sign the transaction');
      return;
    }

    setIsSending(true);
    setError('');
    setSuccess(false);

    try {
      const txHash = await sendTransaction(recipient, amount, password);
      setTxHash(txHash);
      setSuccess(true);
      setPassword(''); // Clear password after success

      // Reset form after successful send
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
      setPassword(''); // Clear password on error
    } finally {
      setIsSending(false);
    }
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
              <Sparkles className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold text-white">GLIN</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="bg-black/50 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Send className="h-6 w-6 mr-2 text-purple-400" />
              Send tGLIN
            </CardTitle>
            <CardDescription className="text-gray-400">
              Transfer tokens to another wallet on GLIN testnet
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Balance Display */}
            <div className="bg-purple-600/20 border border-purple-600/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Available Balance</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {formattedBalance} <span className="text-lg text-purple-400">tGLIN</span>
                  </div>
                  <div className="text-sm text-gray-500">≈ $0.00 USD</div>
                </div>
              </div>
            </div>

            {error && (
              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-500/10 border-green-500/20">
                <Zap className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  Transaction sent successfully!
                  {txHash && (
                    <div className="mt-2 font-mono text-xs break-all">
                      Hash: {txHash}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="address" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="address" className="data-[state=active]:bg-purple-600">
                  <User className="h-4 w-4 mr-2" />
                  To Address
                </TabsTrigger>
                <TabsTrigger value="contacts" disabled className="opacity-50">
                  Contacts (Soon)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="address" className="space-y-4 mt-4">
                {/* Recipient Address */}
                <div className="space-y-2">
                  <Label htmlFor="recipient" className="text-white">
                    Recipient Address
                  </Label>
                  <Input
                    id="recipient"
                    placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-400">
                    Enter a valid GLIN testnet address
                  </p>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white">
                    Amount to Send
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 pr-16"
                      step="0.0001"
                      min="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 font-medium">
                      tGLIN
                    </span>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAmount(25)}
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      25%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAmount(50)}
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      50%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAmount(75)}
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      75%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAmount(100)}
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      MAX
                    </Button>
                  </div>
                </div>

                {/* Fee Display */}
                <div className="bg-black/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Network Fee</span>
                    <span className="text-white font-mono">{estimatedFee} tGLIN</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Amount</span>
                    <span className="text-purple-400 font-mono font-bold">
                      {(parseFloat(amount || '0') + parseFloat(estimatedFee)).toFixed(4)} tGLIN
                    </span>
                  </div>
                </div>

                {/* Password Confirmation */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-purple-400" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your wallet password"
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
                  <p className="text-xs text-gray-400">
                    Required to sign and send the transaction
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Warning */}
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-300 text-sm">
                Double-check the recipient address. Transactions cannot be reversed.
              </AlertDescription>
            </Alert>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={isSending || !recipient || !amount || !password}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
              size="lg"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Sending Transaction...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send tGLIN
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}