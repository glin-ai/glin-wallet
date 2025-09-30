'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Settings, Key, Shield, Download, Trash2, AlertCircle,
  Eye, EyeOff, Copy, Check, Lock, User, Globe, Moon, Sun
} from 'lucide-react';
import { GlinCoinIcon } from '@/components/icons/glin-coin-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWallet } from '@/hooks/use-wallet';

export default function SettingsPage() {
  const router = useRouter();
  const {
    wallet,
    isLocked,
    exportSeedPhrase,
    deleteWallet
  } = useWallet();

  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Security Settings
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [autoLockTime, setAutoLockTime] = useState('15');

  // Delete Wallet Dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (isLocked || !wallet) {
      router.push('/');
    }
  }, [isLocked, wallet, router]);

  const handleExportSeedPhrase = () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      const mnemonic = exportSeedPhrase(password);
      if (mnemonic) {
        setSeedPhrase(mnemonic);
        setShowSeedPhrase(true);
        setPassword('');
        setError('');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export seed phrase');
    }
  };

  const handleCopySeedPhrase = () => {
    navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteWallet = async () => {
    if (!wallet) return;

    if (deleteConfirmation !== wallet.name) {
      setError('Wallet name does not match');
      return;
    }

    if (!deletePassword) {
      setError('Please enter your password');
      return;
    }

    try {
      const success = await deleteWallet(wallet.id!, deletePassword);
      if (success) {
        router.push('/');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete wallet');
    }
  };

  const handleExportData = () => {
    if (!wallet) return;

    const exportData = {
      wallet: {
        name: wallet.name,
        address: wallet.address,
        createdAt: wallet.createdAt
      },
      settings: {
        autoLock: autoLockEnabled,
        autoLockTime,
        theme
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glin-wallet-${wallet.name}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
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
        <Card className="bg-black/50 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Settings className="h-6 w-6 mr-2 text-purple-400" />
              Wallet Settings
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage your wallet security and preferences
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/10 mb-6">
                <TabsTrigger value="general" className="data-[state=active]:bg-purple-600">
                  <User className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-purple-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-600">
                  <Key className="h-4 w-4 mr-2" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Wallet Information</Label>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-400">Name</span>
                        <span className="text-white font-medium">{wallet.name}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-400">Address</span>
                        <span className="text-white font-mono text-sm">
                          {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-400">Created</span>
                        <span className="text-white">
                          {new Date(wallet.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div>
                    <Label className="text-white">Appearance</Label>
                    <div className="mt-3 flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {theme === 'dark' ? <Moon className="h-4 w-4 text-purple-400" /> : <Sun className="h-4 w-4 text-yellow-400" />}
                        <span className="text-gray-300">Theme</span>
                      </div>
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div>
                    <Label className="text-white">Network</Label>
                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-green-400" />
                          <span className="text-gray-300">GLIN Testnet</span>
                        </div>
                        <span className="text-green-400 text-sm">Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                {error && (
                  <Alert className="bg-red-500/10 border-red-500/20">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Auto-Lock</Label>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300">Enable Auto-Lock</span>
                        <Switch
                          checked={autoLockEnabled}
                          onCheckedChange={setAutoLockEnabled}
                          className="data-[state=checked]:bg-purple-600"
                        />
                      </div>
                      {autoLockEnabled && (
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-300">Lock after (minutes)</span>
                          <Input
                            type="number"
                            value={autoLockTime}
                            onChange={(e) => setAutoLockTime(e.target.value)}
                            className="w-20 bg-white/5 border-white/20 text-white"
                            min="1"
                            max="60"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div>
                    <Label className="text-white">Backup</Label>
                    <div className="mt-3 space-y-3">
                      <Button
                        onClick={handleExportData}
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Wallet Data
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div>
                    <Label className="text-white">Change Password</Label>
                    <Button
                      variant="outline"
                      className="mt-3 w-full border-white/20 text-white hover:bg-white/10"
                      disabled
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <Alert className="bg-yellow-500/10 border-yellow-500/20 mb-6">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-300">
                    Warning: These actions are irreversible. Make sure you have backed up your seed phrase.
                  </AlertDescription>
                </Alert>

                {/* Export Seed Phrase */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Export Seed Phrase</Label>
                    <p className="text-sm text-gray-400 mt-1 mb-3">
                      Reveal your 12-word recovery phrase. Keep this secret and secure.
                    </p>

                    {!showSeedPhrase ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password to reveal seed phrase"
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
                        <Button
                          onClick={handleExportSeedPhrase}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Reveal Seed Phrase
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                          <div className="grid grid-cols-3 gap-2">
                            {seedPhrase.split(' ').map((word, index) => (
                              <div key={index} className="bg-black/50 rounded px-2 py-1 text-center">
                                <span className="text-purple-400 text-xs">{index + 1}.</span>
                                <span className="text-white text-sm ml-1 font-mono">{word}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleCopySeedPhrase}
                            variant="outline"
                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4 mr-2 text-green-400" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setShowSeedPhrase(false);
                              setSeedPhrase('');
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            Hide
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Delete Wallet */}
                  <div>
                    <Label className="text-white">Delete Wallet</Label>
                    <p className="text-sm text-gray-400 mt-1 mb-3">
                      Permanently delete this wallet from your device. This cannot be undone.
                    </p>
                    <Button
                      onClick={() => setShowDeleteDialog(true)}
                      variant="destructive"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Wallet
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-slate-900 text-white border-white/20">
            <DialogHeader>
              <DialogTitle className="text-red-400 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Delete Wallet
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently delete your wallet from this device.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="confirm-name" className="text-white">
                  Type &quot;{wallet.name}&quot; to confirm
                </Label>
                <Input
                  id="confirm-name"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                  placeholder="Enter wallet name"
                />
              </div>

              <div>
                <Label htmlFor="confirm-password" className="text-white">
                  Enter your password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                  placeholder="Enter password"
                />
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmation('');
                  setDeletePassword('');
                  setError('');
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteWallet}
                disabled={deleteConfirmation !== wallet.name || !deletePassword}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                Delete Wallet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}