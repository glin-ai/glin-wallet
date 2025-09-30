'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Zap, Trophy, ArrowRight } from 'lucide-react';
import { GlinCoinIcon } from '@/components/icons/glin-coin-icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWallet } from '@/hooks/use-wallet';

export default function Home() {
  const router = useRouter();
  const { hasWallet, isConnected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && hasWallet) {
      router.push('/dashboard');
    }
  }, [mounted, hasWallet, router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative rounded-full">
                <GlinCoinIcon size={80} />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            GLIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Wallet</span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your gateway to the GLIN incentivized testnet. Earn points, claim rewards, and be part of the federated learning revolution.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full">
          <FeatureCard
            icon={<Shield className="h-6 w-6" />}
            title="Secure & Private"
            description="Your keys never leave your device. Military-grade encryption."
          />
          <FeatureCard
            icon={<Trophy className="h-6 w-6" />}
            title="Earn Points"
            description="Participate in testnet activities and earn mainnet airdrop points."
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Lightning Fast"
            description="Instant transactions with minimal fees on GLIN testnet."
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => router.push('/create')}
            className="px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg hover:scale-105 transition-all duration-200"
            size="lg"
          >
            Create New Wallet
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            onClick={() => router.push('/import')}
            variant="outline"
            className="px-8 py-6 text-lg border-white/20 text-white hover:bg-white/10"
            size="lg"
          >
            Import Existing Wallet
          </Button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          <span className="text-gray-400">
            {isConnected ? 'Connected to GLIN Testnet' : 'Connecting to network...'}
          </span>
        </div>

        {/* Bottom Links */}
        <div className="absolute bottom-8 flex items-center space-x-6 text-sm text-gray-400">
          <a href="https://docs.glin.ai" className="hover:text-white transition-colors">
            Documentation
          </a>
          <a href="https://github.com/glin-ai/glin-wallet" className="hover:text-white transition-colors">
            GitHub
          </a>
          <a href="https://discord.gg/glin-ai" className="hover:text-white transition-colors">
            Discord
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="relative group bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
      <div className="relative p-6">
        <div className="flex items-center mb-3">
          <div className="p-2 bg-white/10 rounded-lg text-purple-400">
            {icon}
          </div>
        </div>
        <h3 className="text-white font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </Card>
  );
}
