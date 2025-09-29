import { mnemonicGenerate, mnemonicValidate, mnemonicToLegacySeed } from '@polkadot/util-crypto';

export class MnemonicService {
  /**
   * Generate a new 12-word mnemonic phrase
   */
  static generate(): string {
    return mnemonicGenerate(12);
  }

  /**
   * Generate a new 24-word mnemonic phrase for extra security
   */
  static generateLong(): string {
    return mnemonicGenerate(24);
  }

  /**
   * Validate a mnemonic phrase
   */
  static validate(mnemonic: string): boolean {
    try {
      return mnemonicValidate(mnemonic);
    } catch {
      return false;
    }
  }

  /**
   * Convert mnemonic to seed with optional password
   */
  static toSeed(mnemonic: string, password?: string): Uint8Array {
    if (!this.validate(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }
    return mnemonicToLegacySeed(mnemonic, password);
  }

  /**
   * Split mnemonic into words array
   */
  static toWords(mnemonic: string): string[] {
    return mnemonic.trim().split(/\s+/);
  }

  /**
   * Join words array into mnemonic string
   */
  static fromWords(words: string[]): string {
    return words.join(' ').trim();
  }

  /**
   * Mask mnemonic for display (show first and last word only)
   */
  static mask(mnemonic: string): string {
    const words = this.toWords(mnemonic);
    if (words.length < 3) return '***';

    return `${words[0]} ... ${words[words.length - 1]}`;
  }
}