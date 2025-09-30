'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Copy, Check, Download, QrCode, Sparkles, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWallet } from '@/hooks/use-wallet';
import QRCode from 'qrcode';

export default function ReceivePage() {
  const router = useRouter();
  const { wallet, isLocked } = useWallet();
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (isLocked || !wallet) {
      router.push('/');
    }
  }, [isLocked, wallet, router]);

  useEffect(() => {
    if (wallet?.address) {
      // Generate QR code
      QRCode.toDataURL(wallet.address, {
        width: 256,
        margin: 2,
        color: {
          dark: '#9333ea',
          light: '#ffffff'
        }
      })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [wallet?.address]);

  const handleCopyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (wallet?.address && navigator.share) {
      try {
        await navigator.share({
          title: 'My GLIN Wallet Address',
          text: `My GLIN testnet wallet address: ${wallet.address}`,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
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
              <Download className="h-6 w-6 mr-2 text-purple-400" />
              Receive tGLIN
            </CardTitle>
            <CardDescription className="text-gray-400">
              Share your address to receive tokens on GLIN testnet
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl">
                {qrDataUrl ? (
                  <Image src={qrDataUrl} alt="Wallet QR Code" width={256} height={256} />
                ) : (
                  <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                    <QrCode className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Info */}
            <div className="bg-purple-600/20 border border-purple-600/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Wallet Name</span>
                <span className="text-white font-medium">{wallet.name}</span>
              </div>
              <Separator className="bg-white/10" />
              <div className="space-y-2">
                <span className="text-gray-400 text-sm">Address</span>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-white font-mono text-sm break-all bg-black/30 p-3 rounded">
                    {wallet.address}
                  </code>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleCopyAddress}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Address
                  </>
                )}
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                disabled={!navigator.share}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Instructions */}
            <Alert className="bg-blue-500/10 border-blue-500/20">
              <QrCode className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-300">
                <p className="font-semibold mb-2">How to receive tGLIN:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Share your address or QR code with the sender</li>
                  <li>Wait for them to send the transaction</li>
                  <li>Transaction will appear in your dashboard</li>
                  <li>Testnet transactions are usually instant</li>
                </ol>
              </AlertDescription>
            </Alert>

            {/* Network Badge */}
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-green-400 border-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Connected to GLIN Testnet
              </Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}