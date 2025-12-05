# AidLedger - Smart Contract Backend

[![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com/)
[![Anchor](https://img.shields.io/badge/Anchor-663399?style=for-the-badge&logo=anchor&logoColor=white)](https://www.anchor-lang.com/)
[![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**AidLedger** is a decentralized platform built on Solana for registering NGOs and publishing verifiable, tamper-proof impact data on-chain. This repository contains the **smart contract backend** and blockchain infrastructure that powers transparent, auditable aid distribution tracking.

## 🔗 **Live Deployment**

**📍 Solana Devnet Program ID**: **`4wcEn4cPenW3GM1eYfNoAHsmnN1SPNLnLqSCtBruaobD`**

🔍 **[View on Solana Explorer](https://explorer.solana.com/address/4wcEn4cPenW3GM1eYfNoAHsmnN1SPNLnLqSCtBruaobD?cluster=devnet)** | 🌐 **Network**: Devnet

> **Note**: This is the **backend/blockchain** repository. For the web application frontend, see [aidledger-frontend](../aidledger-frontend).

## 🌟 Overview

AidLedger addresses the critical need for transparency and accountability in humanitarian aid distribution. By leveraging Solana's high-performance blockchain, we enable:

- **Immutable Record Keeping**: All NGO registrations and aid distribution batches are permanently recorded on-chain
- **Real-time Verification**: Stakeholders can instantly verify aid distribution data without intermediaries
- **Cost-Effective Operations**: Solana's low transaction fees make micro-transactions economically viable
- **Global Accessibility**: Decentralized infrastructure ensures 24/7 availability regardless of location
- **Cryptographic Integrity**: Merkle trees and on-chain verification prevent data tampering

## 🚀 Why Solana?

### Performance & Scalability
- **Sub-second finality**: Transactions confirm in ~400ms, enabling real-time aid tracking
- **High throughput**: 65,000+ TPS capacity handles global scale humanitarian operations
- **Low costs**: ~$0.00025 per transaction makes frequent updates economically viable

### Developer Experience
- **Anchor Framework**: Type-safe smart contract development with automatic IDL generation
- **Rich Tooling**: Comprehensive CLI tools, local development networks, and debugging capabilities
- **Account Model**: Flexible data storage patterns optimized for complex application state

### Ecosystem Benefits
- **Composability**: Easy integration with DeFi protocols for automated fund management
- **Interoperability**: Cross-chain bridges enable multi-blockchain humanitarian ecosystems
- **Energy Efficiency**: Proof-of-History consensus is environmentally sustainable

## 🏗️ Technical Architecture

### Smart Contract Design

```rust
// Core program instructions
pub fn register_ngo(ctx: Context<RegisterNgo>, metadata_uri: String) -> Result<()>
pub fn submit_batch(
    ctx: Context<SubmitBatch>,
    batch_index: u64,
    merkle_root: [u8; 32],
    data_uri: String,
    region: String,
    program_tag: String,
    start_time: i64,
    end_time: i64,
) -> Result<()>
```

### Account Structure

#### NGO Account (`~310 bytes`)
```rust
pub struct Ngo {
    pub admin: Pubkey,           // 32 bytes - NGO administrator wallet
    pub metadata_uri: String,    // Variable - IPFS link to detailed NGO information
    pub is_active: bool,         // 1 byte - Active status flag
    pub bump: u8,               // 1 byte - PDA bump seed
    pub created_at: i64,        // 8 bytes - Unix timestamp
}
```

#### Batch Account (`~494 bytes`)
```rust
pub struct Batch {
    pub ngo: Pubkey,            // 32 bytes - Associated NGO account
    pub batch_index: u64,       // 8 bytes - Sequential batch identifier
    pub merkle_root: [u8; 32],  // 32 bytes - Root hash of beneficiary data
    pub data_uri: String,       // Variable - IPFS link to full batch data
    pub region: String,         // Variable - Geographic region
    pub program_tag: String,    // Variable - Aid program identifier
    pub start_time: i64,        // 8 bytes - Distribution period start
    pub end_time: i64,          // 8 bytes - Distribution period end
    pub is_flagged: bool,       // 1 byte - Audit flag
    pub bump: u8,              // 1 byte - PDA bump seed
}
```

### Program Derived Addresses (PDAs)

```rust
// NGO Account PDA: Deterministic address per wallet
seeds = [b"ngo", admin.key().as_ref()]

// Batch Account PDA: Deterministic address per NGO + batch index
seeds = [b"batch", ngo.key().as_ref(), &batch_index.to_le_bytes()]
```

## 🛠️ Technology Stack

### Core Blockchain
- **[Solana](https://solana.com/)**: Layer-1 blockchain with sub-second finality
- **[Anchor Framework v0.30.1](https://www.anchor-lang.com/)**: Solana's Sealevel runtime framework
- **[Rust](https://www.rust-lang.org/)**: Systems programming language for on-chain programs

### Development Tools
- **[Anchor CLI](https://www.anchor-lang.com/docs/cli)**: Build, test, and deploy smart contracts
- **[Solana CLI](https://docs.solana.com/cli)**: Blockchain interaction and wallet management
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe off-chain interaction scripts

### Infrastructure
- **[IPFS](https://ipfs.io/)**: Decentralized storage for metadata and batch data
- **[Pinata](https://pinata.cloud/)**: IPFS pinning service for data persistence
- **[Solana Devnet](https://docs.solana.com/clusters#devnet)**: Testing and development environment

## 📂 Project Structure

```
aidledger/
├── programs/
│   └── aidledger/
│       ├── src/
│       │   ├── lib.rs              # Main program entry point
│       │   ├── instructions.rs     # Program instructions implementation
│       │   └── state.rs           # Account structure definitions
│       └── Cargo.toml             # Rust dependencies
├── offchain/
│   ├── registerNgo.ts            # NGO registration script
│   ├── submitBatch.ts            # Batch submission script
│   └── package.json              # Node.js dependencies
├── tests/
│   └── aidledger.ts              # Comprehensive test suite
├── migrations/
│   └── deploy.ts                 # Deployment script
├── Anchor.toml                   # Anchor configuration
├── Cargo.toml                    # Workspace configuration
└── package.json                  # Project metadata
```

## 🚀 Quick Start

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Install Anchor CLI
npm install -g @coral-xyz/anchor-cli@0.30.1

# Install Node.js dependencies
yarn install
```

### Development Setup

```bash
# Configure Solana for devnet
solana config set --url devnet

# Generate a new wallet (or use existing)
solana-keygen new --outfile ~/.config/solana/id.json

# Request SOL airdrop for testing
solana airdrop 2

# Build the smart contract
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### Local Development

```bash
# Start local validator
solana-test-validator

# Deploy to local network
anchor deploy --provider.cluster localnet

# Run interactive tests
anchor test --skip-local-validator
```

## 🧪 Testing

### Comprehensive Test Suite

Our test suite covers all critical functionality:

```bash
# Run all tests
anchor test

# Run specific test categories
anchor test --grep "NGO Registration"
anchor test --grep "Batch Submission"
anchor test --grep "Error Handling"
```

### Test Coverage
- ✅ NGO registration with metadata validation
- ✅ Duplicate NGO prevention
- ✅ Batch submission with proper authority checks
- ✅ Sequential batch indexing
- ✅ Account size validation
- ✅ Unauthorized access prevention
- ✅ Edge case error handling

## 📋 Usage Examples

### NGO Registration

```typescript
// Register a new NGO on-chain
const metadataUri = "ipfs://QmNGOMetadataHash";
const tx = await program.methods
  .registerNgo(metadataUri)
  .accounts({
    ngo: ngoPda,
    admin: adminKeypair.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .signers([adminKeypair])
  .rpc();
```

### Batch Submission

```typescript
// Submit aid distribution batch
const tx = await program.methods
  .submitBatch(
    new anchor.BN(batchIndex),
    merkleRoot,
    "ipfs://QmBatchDataHash",
    "Kenya",
    "CashTransfers-2024",
    new anchor.BN(startTime),
    new anchor.BN(endTime)
  )
  .accounts({
    ngo: ngoPda,
    batch: batchPda,
    admin: adminKeypair.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .signers([adminKeypair])
  .rpc();
```

## 🔧 CLI Tools

### NGO Registration Script

```bash
cd offchain
ANCHOR_WALLET=~/.config/solana/id.json \
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
npx ts-node registerNgo.ts "ipfs://QmYourMetadataHash"
```

### Batch Submission Script

```bash
cd offchain
ANCHOR_WALLET=~/.config/solana/id.json \
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
npx ts-node submitBatch.ts \
  "NGO_PDA_ADDRESS" \
  "0" \
  "ipfs://QmBatchDataHash" \
  "Kenya" \
  "CashTransfers-2024" \
  "1640995200" \
  "1643587200"
```

## 🌐 Deployment

### Current Deployments

- **Program ID**: `4wcEn4cPenW3GM1eYfNoAHsmnN1SPNLnLqSCtBruaobD`
- **Network**: Solana Devnet
- **RPC Endpoint**: `https://api.devnet.solana.com`

### Production Deployment

```bash
# Configure for mainnet
solana config set --url mainnet-beta

# Deploy with sufficient SOL for rent exemption
anchor deploy --provider.cluster mainnet-beta

# Update program ID in Anchor.toml
anchor keys sync
```

## 🤝 Integration with Frontend

This smart contract backend integrates seamlessly with the [aidledger-frontend](../aidledger-frontend) web application:

### API Integration Points
- **NGO Management**: Registration, listing, and metadata retrieval
- **Batch Operations**: Submission, querying, and verification
- **Wallet Integration**: Multi-wallet support and transaction signing
- **Real-time Updates**: WebSocket connections for live data synchronization

### IDL Generation
```bash
# Generate TypeScript client
anchor build
# IDL available at: target/idl/aidledger.json
```

## 📊 Performance Metrics

### Transaction Costs (Devnet)
- NGO Registration: ~0.003 SOL (~$0.10)
- Batch Submission: ~0.004 SOL (~$0.13)
- Account Queries: Free (RPC calls)

### Throughput Capabilities
- Theoretical: 65,000+ TPS (Solana network limit)
- Practical: Limited by application logic and account contention
- Batch Processing: Parallel submissions across different NGOs

## 🔒 Security Considerations

### Access Control
- Only NGO administrators can submit batches for their organization
- Program Derived Addresses prevent unauthorized account access
- Signer validation on all state-changing operations

### Data Integrity
- Merkle roots provide cryptographic proof of batch data integrity
- IPFS content addressing ensures immutable metadata storage
- On-chain timestamps prevent backdating of aid distribution

### Audit Trail
- All operations emit events for external monitoring
- Account state changes are permanently recorded
- Batch flagging mechanism for dispute resolution

## 🛣️ Roadmap

### Phase 1: Core Infrastructure ✅
- [x] NGO registration system
- [x] Batch submission mechanism  
- [x] Basic access controls
- [x] Test coverage

### Phase 2: Enhanced Features 🚧
- [ ] Multi-signature NGO administration
- [ ] Batch verification challenges
- [ ] Automated compliance checks
- [ ] Cross-program composability

### Phase 3: Ecosystem Integration 🔮
- [ ] DeFi integration for automated funding
- [ ] Cross-chain bridge support
- [ ] Mobile SDK development
- [ ] Enterprise API gateway

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:
- Code style and standards
- Testing requirements
- Pull request process
- Security vulnerability reporting

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/yourusername/aidledger-dev/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/aidledger-dev/discussions)
- **Discord**: [AidLedger Community](https://discord.gg/aidledger)

---

**Built with ❤️ for humanitarian transparency on Solana**
