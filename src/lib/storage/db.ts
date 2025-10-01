import Dexie, { Table } from 'dexie';

export interface Wallet {
  id?: number;
  name: string;
  encryptedSeed: string;
  nonce: string;
  salt: string;
  address: string;
  publicKey: string;
  createdAt: Date;
  lastUsed: Date;
  isActive: boolean;
}

export interface Account {
  id?: number;
  walletId: number;
  index: number;
  name: string;
  address: string;
  publicKey: string;
  derivationPath: string;
  createdAt: Date;
}

export interface Transaction {
  id?: number;
  hash: string;
  from: string;
  to: string;
  amount: string;
  fee: string | null;
  status: 'pending' | 'success' | 'failed';
  blockNumber?: number;
  blockHash?: string;
  timestamp: Date;
  type: 'send' | 'receive' | 'faucet';
  method?: string;
  extrinsicIndex?: number;
  errorMessage?: string | null;
  metadata?: unknown;
}

export interface Contact {
  id?: number;
  name: string;
  address: string;
  notes?: string;
  createdAt: Date;
  lastUsed?: Date;
}

export interface Activity {
  id?: number;
  type: string;
  points: number;
  timestamp: Date;
  metadata?: unknown;
}

export interface Settings {
  id?: number;
  key: string;
  value: unknown;
  updatedAt: Date;
}

class GlinWalletDB extends Dexie {
  wallets!: Table<Wallet>;
  accounts!: Table<Account>;
  transactions!: Table<Transaction>;
  contacts!: Table<Contact>;
  activities!: Table<Activity>;
  settings!: Table<Settings>;

  constructor() {
    super('GlinWalletDB');

    // Version 2: Changed index strategy for isActive
    this.version(2).stores({
      wallets: '++id, address',
      accounts: '++id, walletId, address',
      transactions: '++id, hash, from, to, timestamp',
      contacts: '++id, address',
      activities: '++id, type, timestamp',
      settings: '++id, key'
    }).upgrade(async trans => {
      // Migration: ensure isActive is properly set
      const wallets = trans.table('wallets');
      await wallets.toCollection().modify(wallet => {
        if (wallet.isActive === undefined) {
          wallet.isActive = false;
        }
      });
    });

    // Keep version 1 for backward compatibility
    this.version(1).stores({
      wallets: '++id, address, isActive',
      accounts: '++id, walletId, address',
      transactions: '++id, hash, from, to, timestamp',
      contacts: '++id, address',
      activities: '++id, type, timestamp',
      settings: '++id, key'
    });
  }

  /**
   * Clear all data (for logout)
   */
  async clearAll(): Promise<void> {
    await this.wallets.clear();
    await this.accounts.clear();
    await this.transactions.clear();
    await this.contacts.clear();
    await this.activities.clear();
    await this.settings.clear();
  }

  /**
   * Get active wallet
   */
  async getActiveWallet(): Promise<Wallet | undefined> {
    // Use filter instead of where clause to avoid IndexedDB boolean issues
    const wallets = await this.wallets.toArray();
    return wallets.find(w => w.isActive === true);
  }

  /**
   * Set active wallet
   */
  async setActiveWallet(walletId: number): Promise<void> {
    await this.transaction('rw', this.wallets, async () => {
      // Deactivate all wallets
      const allWallets = await this.wallets.toArray();
      for (const wallet of allWallets) {
        if (wallet.isActive && wallet.id) {
          await this.wallets.update(wallet.id, { isActive: false });
        }
      }
      // Activate selected wallet
      await this.wallets.update(walletId, { isActive: true, lastUsed: new Date() });
    });
  }

  /**
   * Get wallet accounts
   */
  async getWalletAccounts(walletId: number): Promise<Account[]> {
    return await this.accounts.where('walletId').equals(walletId).toArray();
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(address: string, limit: number = 10): Promise<Transaction[]> {
    return await this.transactions
      .where('from').equals(address)
      .or('to').equals(address)
      .reverse()
      .limit(limit)
      .toArray();
  }

  /**
   * Get setting
   */
  async getSetting(key: string): Promise<unknown> {
    const setting = await this.settings.where('key').equals(key).first();
    return setting?.value;
  }

  /**
   * Set setting
   */
  async setSetting(key: string, value: unknown): Promise<void> {
    const existing = await this.settings.where('key').equals(key).first();
    if (existing) {
      await this.settings.update(existing.id!, { value, updatedAt: new Date() });
    } else {
      await this.settings.add({ key, value, updatedAt: new Date() });
    }
  }
}

export const db = new GlinWalletDB();