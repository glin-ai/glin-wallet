# GLIN Wallet

Web wallet for the GLIN incentivized testnet. Built with Next.js 15, Polkadot.js, and shadcn/ui.

## Features

- 🔐 **Secure Key Management**: Client-side only key generation with encrypted storage
- 💰 **Token Management**: Send, receive, and track tGLIN tokens
- 🏆 **Points System**: Track testnet points for mainnet airdrop
- 🚰 **Faucet Integration**: Claim testnet tokens with social verification
- 📊 **Activity Tracking**: Monitor your testnet participation
- 🌙 **Dark/Light Mode**: Beautiful UI with theme support
- 📱 **Mobile Responsive**: Works on any device

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Blockchain**: Polkadot.js API
- **UI**: shadcn/ui + Tailwind CSS
- **State**: Zustand
- **Storage**: IndexedDB with Dexie
- **Encryption**: TweetNaCl
- **Query**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/glin-ai/glin-wallet.git
cd glin-wallet

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the wallet.

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_RPC_ENDPOINT=wss://rpc.glin-testnet.railway.app
NEXT_PUBLIC_BACKEND_URL=https://api.glin-testnet.railway.app
NEXT_PUBLIC_CHAIN_NAME=GLIN Testnet
NEXT_PUBLIC_TOKEN_SYMBOL=tGLIN
NEXT_PUBLIC_TOKEN_DECIMALS=18
```

## Security

### Key Storage

- Private keys are **never** sent to any server
- All keys are encrypted with user password before storage
- Encryption uses TweetNaCl with Blake2 key derivation
- Keys stored in browser's IndexedDB

### Best Practices

1. **Never share your seed phrase**
2. **Use a strong password**
3. **Export and backup your seed phrase**
4. **Verify the wallet URL**
5. **Use a dedicated browser for crypto**

## Architecture

```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── lib/                 # Core libraries
│   ├── crypto/         # Encryption & key management
│   ├── storage/        # IndexedDB interface
│   └── substrate/      # Blockchain connection
├── hooks/              # Custom React hooks
└── store/              # Zustand state management
```

## Core Libraries

### Crypto (`/lib/crypto`)
- `mnemonic.ts` - Seed phrase generation and validation
- `keyring.ts` - Account management
- `encryption.ts` - Secure storage encryption

### Storage (`/lib/storage`)
- `db.ts` - IndexedDB schema with Dexie

### Substrate (`/lib/substrate`)
- `client.ts` - Polkadot.js API wrapper
- `wallet.ts` - Wallet operations

## Development

### Build for Production

```bash
npm run build
npm start
```

### Run Tests

```bash
npm test
```

### Code Style

```bash
npm run lint
npm run format
```

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/glin-ai/glin-wallet)

### Docker

```bash
docker build -t glin-wallet .
docker run -p 3000:3000 glin-wallet
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## Support

- **Discord**: [Join our community](https://discord.gg/glin-ai)
- **GitHub Issues**: [Report bugs](https://github.com/glin-ai/glin-wallet/issues)
- **Documentation**: [docs.glin.ai](https://docs.glin.ai)

## License

Apache 2.0 - see [LICENSE](LICENSE) for details.

## Disclaimer

This is testnet software. tGLIN tokens have no monetary value. Always verify transactions and never share your seed phrase.