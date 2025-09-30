import { Keyring } from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto';
import { hexToU8a } from '@polkadot/util';

export interface WalletAccount {
  address: string;
  name: string;
  publicKey: string;
  seed?: string;
  mnemonic?: string;
}

export class KeyringService {
  private keyring: Keyring | null = null;

  /**
   * Initialize the keyring
   */
  async init(): Promise<void> {
    await cryptoWaitReady();
    this.keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
  }

  /**
   * Get keyring instance
   */
  getKeyring(): Keyring {
    if (!this.keyring) {
      throw new Error('Keyring not initialized. Call init() first.');
    }
    return this.keyring;
  }

  /**
   * Create account from mnemonic
   */
  createFromMnemonic(mnemonic: string, name: string = 'Account'): KeyringPair {
    const keyring = this.getKeyring();
    const pair = keyring.addFromUri(mnemonic, { name }, 'sr25519');
    return pair;
  }

  /**
   * Create account from seed
   */
  createFromSeed(seed: Uint8Array, name: string = 'Account'): KeyringPair {
    const keyring = this.getKeyring();
    const pair = keyring.addFromSeed(seed, { name }, 'sr25519');
    return pair;
  }

  /**
   * Get account details
   */
  getAccountDetails(pair: KeyringPair): WalletAccount {
    return {
      address: pair.address,
      name: pair.meta.name as string || 'Account',
      publicKey: pair.publicKey.toString(),
    };
  }

  /**
   * Derive account at index
   */
  deriveAccount(mnemonic: string, index: number, name?: string): KeyringPair {
    const derivationPath = `//0//${index}`;
    const keyring = this.getKeyring();
    const pair = keyring.addFromUri(
      `${mnemonic}${derivationPath}`,
      { name: name || `Account ${index + 1}` },
      'sr25519'
    );
    return pair;
  }

  /**
   * Lock account with password
   */
  lockAccount(pair: KeyringPair, password: string): string {
    if (!pair.isLocked) {
      pair.lock();
    }
    return JSON.stringify(pair.toJson(password));
  }

  /**
   * Unlock account with password
   */
  unlockAccount(pair: KeyringPair, password: string): void {
    if (pair.isLocked) {
      pair.unlock(password);
    }
  }

  /**
   * Sign message
   */
  signMessage(pair: KeyringPair, message: string | Uint8Array): Uint8Array {
    return pair.sign(message);
  }

  /**
   * Verify signature
   */
  verifySignature(
    message: string | Uint8Array,
    signature: Uint8Array | string,
    address: string
  ): boolean {
    try {
      const signatureU8a = typeof signature === 'string' ? hexToU8a(signature) : signature;
      const result = signatureVerify(message, signatureU8a, address);
      return result.isValid;
    } catch {
      return false;
    }
  }
}