'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, Download, Trophy, Activity, Settings, LogOut,
  Copy, Check, TrendingUp, Sparkles, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useWallet } from '@/hooks/use-wallet';

export default function DashboardPage() {
  const router = useRouter();
  const {
    wallet,
    isLocked,
    transactions,
    formattedBalance,
    shortAddress,
    lockWallet
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState(0);

  useEffect(() => {
    if (isLocked || !wallet) {
      router.push('/');
    }
  }, [isLocked, wallet, router]);

  useEffect(() => {
    // Simulate loading points (replace with real API call)
    setTimeout(() => {
      setPoints(Math.floor(Math.random() * 10000));
      setRank(Math.floor(Math.random() * 100) + 1);
    }, 1000);
  }, []);

  const handleCopyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    lockWallet();
    router.push('/');
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">GLIN</span>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Testnet
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => router.push('/settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Wallet Info Card */}
        <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 bg-purple-600">
                  <AvatarFallback className="text-white">
                    {wallet.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-white">{wallet.name}</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 font-mono text-sm">{shortAddress}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      onClick={handleCopyAddress}
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {formattedBalance} <span className="text-lg text-purple-400">tGLIN</span>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  ≈ $0.00 USD
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={() => router.push('/send')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button
                onClick={() => router.push('/receive')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Receive
              </Button>
              <Button
                onClick={() => router.push('/faucet')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Zap className="h-4 w-4 mr-2" />
                Faucet
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Testnet Points"
            value={points.toLocaleString()}
            icon={<Trophy className="h-5 w-5" />}
            trend="+12.5%"
            trendUp={true}
          />
          <StatsCard
            title="Global Rank"
            value={`#${rank}`}
            icon={<TrendingUp className="h-5 w-5" />}
            subtitle="Top 1%"
          />
          <StatsCard
            title="Activities"
            value="24"
            icon={<Activity className="h-5 w-5" />}
            subtitle="This week"
          />
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="transactions" className="data-[state=active]:bg-purple-600">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="points" className="data-[state=active]:bg-purple-600">
              Points Activity
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-600">
              ML Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-6">
            <Card className="bg-black/20 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Transactions</CardTitle>
                <CardDescription className="text-gray-400">
                  Your transaction history on GLIN testnet
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No transactions yet. Try claiming from the faucet!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx, index) => (
                      <TransactionItem key={index} transaction={tx} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="points" className="mt-6">
            <Card className="bg-black/20 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Points Activity</CardTitle>
                <CardDescription className="text-gray-400">
                  Track your testnet participation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  Points tracking coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <Card className="bg-black/20 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">ML Training Tasks</CardTitle>
                <CardDescription className="text-gray-400">
                  Participate in federated learning tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  ML task participation coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  subtitle
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
}) {
  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400">
            {icon}
          </div>
          {trend && (
            <Badge
              variant="outline"
              className={trendUp ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}
            >
              {trend}
            </Badge>
          )}
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400 mt-1">{subtitle || title}</div>
      </CardContent>
    </Card>
  );
}

function TransactionItem({ transaction }: { transaction: { type: string; timestamp: Date; amount: string; status: string } }) {
  const isReceived = transaction.type === 'receive';

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${isReceived ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          {isReceived ? (
            <Download className="h-4 w-4 text-green-400" />
          ) : (
            <Send className="h-4 w-4 text-red-400" />
          )}
        </div>
        <div>
          <div className="text-white font-medium">
            {isReceived ? 'Received' : 'Sent'}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(transaction.timestamp).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-mono ${isReceived ? 'text-green-400' : 'text-red-400'}`}>
          {isReceived ? '+' : '-'}{transaction.amount} tGLIN
        </div>
        <Badge variant="outline" className="text-xs">
          {transaction.status}
        </Badge>
      </div>
    </div>
  );
}