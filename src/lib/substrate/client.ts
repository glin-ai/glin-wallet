import { ApiPromise, WsProvider } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import type { ISubmittableResult } from '@polkadot/types/types';

export interface ChainInfo {
  name: string;
  tokenSymbol: string;
  tokenDecimals: number;
  ss58Format: number;
}

export interface Balance {
  free: string;
  reserved: string;
  frozen: string;
  flags: string;
}

export class SubstrateClient {
  private api: ApiPromise | null = null;
  private provider: WsProvider | null = null;
  private connectionPromise: Promise<void> | null = null;

  constructor(private endpoint: string) {}

  /**
   * Connect to the chain
   */
  async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._connect();
    return this.connectionPromise;
  }

  private async _connect(): Promise<void> {
    try {
      this.provider = new WsProvider(this.endpoint);
      this.api = await ApiPromise.create({ provider: this.provider });

      // Wait for the API to be ready
      await this.api.isReady;

      console.log('Connected to chain:', this.api.runtimeChain.toString());
    } catch (error) {
      this.api = null;
      this.provider = null;
      this.connectionPromise = null;
      throw error;
    }
  }

  /**
   * Disconnect from the chain
   */
  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
      this.provider = null;
      this.connectionPromise = null;
    }
  }

  /**
   * Get API instance
   */
  getApi(): ApiPromise {
    if (!this.api) {
      throw new Error('Not connected to chain. Call connect() first.');
    }
    return this.api;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.api !== null && this.api.isConnected;
  }

  /**
   * Get chain info
   */
  async getChainInfo(): Promise<ChainInfo> {
    const api = this.getApi();
    const properties = api.registry.getChainProperties();

    const tokenSymbolArray = properties?.tokenSymbol.toJSON() as string[] | undefined;
    const tokenDecimalsArray = properties?.tokenDecimals.toJSON() as number[] | undefined;
    const ss58FormatValue = properties?.ss58Format.toJSON() as number | undefined;

    return {
      name: api.runtimeChain.toString(),
      tokenSymbol: tokenSymbolArray?.[0] || 'GLIN',
      tokenDecimals: tokenDecimalsArray?.[0] || 18,
      ss58Format: ss58FormatValue || 42
    };
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<Balance> {
    const api = this.getApi();
    const account = await api.query.system.account(address);

    // Type assertion for Substrate account structure
    const accountInfo = account as unknown as {
      data: {
        free: { toString(): string };
        reserved: { toString(): string };
        frozen: { toString(): string };
        flags: { toString(): string };
      }
    };

    return {
      free: accountInfo.data.free.toString(),
      reserved: accountInfo.data.reserved.toString(),
      frozen: accountInfo.data.frozen.toString(),
      flags: accountInfo.data.flags.toString()
    };
  }

  /**
   * Get current block number
   */
  async getCurrentBlock(): Promise<number> {
    const api = this.getApi();
    const header = await api.rpc.chain.getHeader();
    return header.number.toNumber();
  }

  /**
   * Subscribe to balance changes
   */
  subscribeBalance(
    address: string,
    callback: (balance: Balance) => void
  ): () => void {
    const api = this.getApi();
    let unsubscribe: (() => void) | null = null;

    api.query.system.account(address, (account: unknown) => {
      const accountInfo = account as {
        data: {
          free: { toString(): string };
          reserved: { toString(): string };
          frozen: { toString(): string };
          flags: { toString(): string };
        }
      };
      callback({
        free: accountInfo.data.free.toString(),
        reserved: accountInfo.data.reserved.toString(),
        frozen: accountInfo.data.frozen.toString(),
        flags: accountInfo.data.flags.toString()
      });
    }).then((unsub: unknown) => {
      unsubscribe = unsub as () => void;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  /**
   * Transfer tokens
   */
  async transfer(
    from: KeyringPair,
    to: string,
    amount: string,
    onStatus?: (status: ISubmittableResult) => void
  ): Promise<string> {
    const api = this.getApi();

    // Convert amount to smallest unit (18 decimals for tGLIN)
    const decimals = 18;
    const amountInSmallestUnit = BigInt(Math.floor(parseFloat(amount) * (10 ** decimals))).toString();

    const transfer = api.tx.balances.transferKeepAlive(to, amountInSmallestUnit);

    return new Promise((resolve, reject) => {
      transfer.signAndSend(from, (result) => {
        if (onStatus) {
          onStatus(result);
        }

        if (result.status.isInBlock) {
          console.log(`Transaction included in block ${result.status.asInBlock}`);
        }

        if (result.status.isFinalized) {
          const hash = result.status.asFinalized.toString();
          console.log(`Transaction finalized in block ${hash}`);
          resolve(hash);
        }

        if (result.isError) {
          reject(new Error('Transaction failed'));
        }
      }).catch(reject);
    });
  }

  /**
   * Estimate transaction fee
   */
  async estimateFee(
    from: string,
    to: string,
    amount: string
  ): Promise<string> {
    const api = this.getApi();

    // Convert amount to smallest unit (18 decimals for tGLIN)
    const decimals = 18;
    const amountInSmallestUnit = BigInt(Math.floor(parseFloat(amount) * (10 ** decimals))).toString();

    const transfer = api.tx.balances.transferKeepAlive(to, amountInSmallestUnit);
    const info = await transfer.paymentInfo(from);
    return info.partialFee.toString();
  }

  /**
   * Get transaction details
   */
  async getTransaction(hash: string): Promise<{ hash: string; method: string; section: string; args: string[] } | null> {
    const api = this.getApi();
    const blockHash = await api.rpc.chain.getBlockHash();
    const signedBlock = await api.rpc.chain.getBlock(blockHash);

    // Find transaction in block
    const tx = signedBlock.block.extrinsics.find(
      (ex) => ex.hash.toString() === hash
    );

    if (tx) {
      return {
        hash: tx.hash.toString(),
        method: tx.method.method,
        section: tx.method.section,
        args: tx.args.map(arg => arg.toString())
      };
    }

    return null;
  }

  /**
   * Subscribe to new blocks
   */
  subscribeNewHeads(callback: (blockNumber: number) => void): () => void {
    const api = this.getApi();
    let unsubscribe: (() => void) | null = null;

    api.rpc.chain.subscribeNewHeads((header) => {
      callback(header.number.toNumber());
    }).then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }
}