import { KeyringPair } from '@polkadot/keyring/types';
import { MnemonicService } from '../crypto/mnemonic';
import { KeyringService } from '../crypto/keyring';
import { EncryptionService } from '../crypto/encryption';
import { db, Wallet, Account, Transaction } from '../storage/db';
import { SubstrateClient } from './client';

export interface WalletService {
  currentWallet: Wallet | null;
  currentAccount: KeyringPair | null;
  client: SubstrateClient;
}

export class WalletManager {
  private keyringService: KeyringService;
  private client: SubstrateClient;
  private currentWallet: Wallet | null = null;
  private currentPair: KeyringPair | null = null;

  constructor(rpcEndpoint: string) {
    this.keyringService = new KeyringService();
    this.client = new SubstrateClient(rpcEndpoint);
  }

  /**
   * Initialize wallet manager
   */
  async init(): Promise<void> {
    await this.keyringService.init();
    await this.client.connect();

    // Load active wallet if exists
    const activeWallet = await db.getActiveWallet();
    if (activeWallet) {
      this.currentWallet = activeWallet;
    }
  }

  /**
   * Create new wallet
   */
  async createWallet(
    name: string,
    password: string,
    mnemonic?: string
  ): Promise<{ wallet: Wallet; mnemonic: string }> {
    // Generate or validate mnemonic
    const seedPhrase = mnemonic || MnemonicService.generate();
    if (!MnemonicService.validate(seedPhrase)) {
      throw new Error('Invalid mnemonic phrase');
    }

    // Create keypair
    const pair = this.keyringService.createFromMnemonic(seedPhrase, name);

    // Encrypt seed for storage
    const encrypted = EncryptionService.encrypt(seedPhrase, password);

    // Save to database
    const wallet: Wallet = {
      name,
      encryptedSeed: encrypted.encrypted,
      nonce: encrypted.nonce,
      salt: encrypted.salt,
      address: pair.address,
      publicKey: pair.publicKey.toString(),
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: true
    };

    // Deactivate other wallets
    await db.wallets.where('isActive').equals(true).modify({ isActive: false });

    // Save new wallet
    const id = await db.wallets.add(wallet);
    wallet.id = id;

    // Create default account
    await this.createAccount(id, 0, 'Main Account');

    // Set as current
    this.currentWallet = wallet;
    this.currentPair = pair;

    return { wallet, mnemonic: seedPhrase };
  }

  /**
   * Import wallet from mnemonic
   */
  async importWallet(
    name: string,
    mnemonic: string,
    password: string
  ): Promise<Wallet> {
    const result = await this.createWallet(name, password, mnemonic);
    return result.wallet;
  }

  /**
   * Unlock wallet with password
   */
  async unlockWallet(walletId: number, password: string): Promise<boolean> {
    const wallet = await db.wallets.get(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Try to decrypt seed
    const decryptedSeed = EncryptionService.decrypt(
      wallet.encryptedSeed,
      wallet.nonce,
      wallet.salt,
      password
    );

    if (!decryptedSeed) {
      return false;
    }

    // Create keypair from seed
    const pair = this.keyringService.createFromMnemonic(decryptedSeed, wallet.name);

    // Set as current
    this.currentWallet = wallet;
    this.currentPair = pair;

    // Update last used
    await db.wallets.update(walletId, { lastUsed: new Date() });
    await db.setActiveWallet(walletId);

    return true;
  }

  /**
   * Lock current wallet
   */
  lockWallet(): void {
    this.currentWallet = null;
    this.currentPair = null;
  }

  /**
   * Create new account (derivation)
   */
  async createAccount(
    walletId: number,
    index: number,
    name: string
  ): Promise<Account> {
    const wallet = await db.wallets.get(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const derivationPath = `//0//${index}`;

    // For display purposes, we need to derive the address
    // In a real unlock scenario, we'd derive from the decrypted mnemonic
    const account: Account = {
      walletId,
      index,
      name,
      address: `${wallet.address.slice(0, 6)}...${index}`, // Placeholder
      publicKey: wallet.publicKey,
      derivationPath,
      createdAt: new Date()
    };

    const id = await db.accounts.add(account);
    account.id = id;

    return account;
  }

  /**
   * Get wallet balance
   */
  async getBalance(address?: string): Promise<string> {
    const addr = address || this.currentWallet?.address;
    if (!addr) {
      throw new Error('No wallet selected');
    }

    const balance = await this.client.getBalance(addr);
    return balance.free;
  }

  /**
   * Send transaction
   */
  async sendTransaction(
    to: string,
    amount: string,
    password: string
  ): Promise<string> {
    if (!this.currentWallet || !this.currentPair) {
      throw new Error('No wallet unlocked');
    }

    // Verify password
    const decryptedSeed = EncryptionService.decrypt(
      this.currentWallet.encryptedSeed,
      this.currentWallet.nonce,
      this.currentWallet.salt,
      password
    );

    if (!decryptedSeed) {
      throw new Error('Invalid password');
    }

    // Send transaction
    const hash = await this.client.transfer(
      this.currentPair,
      to,
      amount,
      (status) => {
        console.log('Transaction status:', status.status.toString());
      }
    );

    // Save transaction to database
    await db.transactions.add({
      hash,
      from: this.currentWallet.address,
      to,
      amount,
      fee: '0', // Will be updated with actual fee
      status: 'pending',
      timestamp: new Date(),
      type: 'send'
    });

    return hash;
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(address?: string): Promise<Transaction[]> {
    const addr = address || this.currentWallet?.address;
    if (!addr) {
      throw new Error('No wallet selected');
    }

    return await db.getRecentTransactions(addr, 50);
  }

  /**
   * Estimate transaction fee
   */
  async estimateFee(to: string, amount: string): Promise<string> {
    if (!this.currentWallet) {
      throw new Error('No wallet selected');
    }

    return await this.client.estimateFee(
      this.currentWallet.address,
      to,
      amount
    );
  }

  /**
   * Get all wallets
   */
  async getWallets(): Promise<Wallet[]> {
    return await db.wallets.toArray();
  }

  /**
   * Delete wallet
   */
  async deleteWallet(walletId: number, password: string): Promise<boolean> {
    const wallet = await db.wallets.get(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Verify password
    const decryptedSeed = EncryptionService.decrypt(
      wallet.encryptedSeed,
      wallet.nonce,
      wallet.salt,
      password
    );

    if (!decryptedSeed) {
      return false;
    }

    // Delete wallet and related data
    await db.transaction('rw', db.wallets, db.accounts, db.transactions, async () => {
      await db.wallets.delete(walletId);
      await db.accounts.where('walletId').equals(walletId).delete();
      // Keep transactions for history
    });

    // If this was the current wallet, clear it
    if (this.currentWallet?.id === walletId) {
      this.lockWallet();
    }

    return true;
  }

  /**
   * Export wallet seed phrase
   */
  exportSeedPhrase(password: string): string | null {
    if (!this.currentWallet) {
      throw new Error('No wallet selected');
    }

    return EncryptionService.decrypt(
      this.currentWallet.encryptedSeed,
      this.currentWallet.nonce,
      this.currentWallet.salt,
      password
    );
  }

  /**
   * Get current wallet
   */
  getCurrentWallet(): Wallet | null {
    return this.currentWallet;
  }

  /**
   * Get substrate client
   */
  getClient(): SubstrateClient {
    return this.client;
  }
}