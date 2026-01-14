# @meshsdk/hydra

A powerful TypeScript SDK for interacting with Hydra Heads on Cardano.

[![npm version](https://img.shields.io/npm/v/@meshsdk/hydra)](https://www.npmjs.com/package/@meshsdk/hydra)
[![Documentation](https://img.shields.io/badge/docs-meshjs.dev-blue)](https://meshjs.dev/hydra)

## Overview

Hydra is a layer 2 protocol for Cardano that enables fast, low-cost transactions by creating off-chain "heads" where multiple parties can interact. This package provides a complete SDK for:

- Connecting to and managing Hydra Heads
- Committing and decommitting funds
- Building and submitting transactions within Hydra Heads
- Handling all Hydra protocol operations (init, abort, close, contest, fanout)
- Event-driven architecture for real-time updates

## Installation

```bash
npm install @meshsdk/hydra
```

## Quick Start

### Basic Setup

```typescript
import { HydraProvider, HydraInstance } from "@meshsdk/hydra";
import { BlockfrostProvider } from "@meshsdk/core";

const hydraProvider = new HydraProvider({
  httpUrl: "http://localhost:4001", // Your Hydra node URL
});

await hydraProvider.connect();

const blockchainProvider = new BlockfrostProvider("YOUR_BLOCKFROST_KEY");

const hydraInstance = new HydraInstance({
  provider: hydraProvider,
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
});
```

### Initialize a Head

```typescript
await hydraProvider.init();

// Wait for all parties to commit
// Once all parties have committed, the head will open automatically
```

### Commit Funds

```typescript
const emptyCommitTx = await hydraInstance.commitEmpty();
await wallet.submitTx(emptyCommitTx);

```

### Submit Transactions in Hydra Head

```typescript
const txHash = await hydraProvider.newTx({
  type: "Tx ConwayEra",
  cborHex: unsignedTransactionCbor,
});
```

## API Reference

### HydraProvider

The main class for connecting to and managing Hydra Heads.

#### Constructor

```typescript
new HydraProvider({
  httpUrl: string;       
  wsUrl?: string;      
  history?: boolean;     
  address?: string;      
})
```

#### Methods

##### Connection Management

- `connect()` - Establishes connection to the Hydra Head
- `disconnect(timeout?: number)` - Disconnects from the Hydra Head (default timeout: 5 minutes)

##### Head Lifecycle Commands

- `init()` - Initializes a new Hydra Head (only when status is Idle)
- `abort()` - Aborts a head before it opens (only during Initializing phase)
- `close()` - Closes an open head, starting the contest period
- `contest()` - Contests a closed head if needed
- `fanout()` - Finalizes the head closure and distributes funds

##### Transaction Operations

- `newTx(transaction: hydraTransaction)` - Submits a transaction to the open head
- `recover(txHash: string)` - Recovers a deposit transaction by its hash

##### Data Fetching (implements IFetcher)

- `fetchUTxOs(address?: string)` - Fetches UTxOs from the Hydra Head
- `fetchProtocolParameters()` - Fetches protocol parameters

##### Transaction Submission (implements ISubmitter)

- `submitTx(tx: string)` - Submits a transaction to the Hydra Head

##### Event Handling

- `onStatusChange(event: string, callback: Function)` - Listen to Hydra events
- `onMessage(callback: Function)` - Register a callback for all messages

#### Events

The provider emits various events:

- `Greetings` - Initial connection message with head status
- `HeadIsInitializing` - Head initialization started
- `HeadIsOpen` - Head is now open and ready
- `HeadIsClosed` - Head has been closed
- `HeadIsAborted` - Head was aborted
- `TxValid` - Transaction was accepted
- `TxInvalid` - Transaction was rejected
- `Snapshot` - New snapshot created
- `Commit` - New commit received
- `Decommit` - Decommit occurred
- And more...

### HydraInstance

A higher-level interface for interacting with Hydra Heads, providing convenient methods for common operations.

#### Constructor

```typescript
new HydraInstance({
  provider: HydraProvider;
  fetcher: 'blockchainProvider';       
  submitter: 'blockchainProvider';   
})
```

#### Methods

##### Commit Operations

- `commitEmpty()` - Creates an empty commit transaction (no funds)
- `commitFunds(txHash: string, outputIndex: number)` - Commits a specific UTxO to the head
- `commitBlueprint(txHash: string, outputIndex: number, transaction: hydraTransaction)` - Commits a UTxO as a blueprint transaction

##### Decommit Operations

- `decommit()` - Decommits all your funds from the head

## Examples

### Complete Workflow Example

```typescript
import { HydraProvider, HydraInstance } from "@meshsdk/hydra";
import { BlockfrostProvider, MeshTxBuilder, MeshWallet } from "@meshsdk/core";

// Setup providers
const hydraProvider = new HydraProvider({
  httpUrl: "http://localhost:4001",
});

const blockchainProvider = new BlockfrostProvider("YOUR_BLOCKFROST_KEY");

const hydraInstance = new HydraInstance({
  provider: hydraProvider,
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
});

await hydraProvider.connect();
await hydraProvider.init();

const commitTx = await hydraInstance.commitFunds(txHash, outputIndex);
await wallet.submitTx(commitTx);

hydraProvider.onMessage("HeadIsOpen", async () => {
  const txBuilder = new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    params: await hydraProvider.fetchProtocolParameters(),
    isHydra: true, 
  });

  // Add your transaction logic
  const unsignedTx = await txBuilder
    .sendLovelace(address, "1000000")
    .complete();

  const txHash = await hydraProvider.newTx({
    type: "Tx ConwayEra",
    cborHex: unsignedTx,
  });

  console.log("Transaction submitted:", txHash);
});

// When done, close the head
await hydraProvider.close();
await hydraProvider.fanout();
```

### Event-Driven Example

```typescript
const hydraProvider = new HydraProvider({
  httpUrl: "http://localhost:4001",
});

await hydraProvider.connect();

hydraProvider.onMessage((message) => {
  switch (message.tag) {
    case "Greetings":
      console.log("Connected! Head status:", message.headStatus);
      break;
    case "HeadIsOpen":
      console.log("Head is now open!");
      break;
    case "TxValid":
      console.log("Transaction accepted:", message.transactionId);
      break;
    case "TxInvalid":
      console.error("Transaction rejected:", message.validationError);
      break;
    case "Snapshot":
      console.log("New snapshot:", message.snapshot);
      break;
  }
});
```

## Requirements

- Node.js 16+ or modern browser with ES module support
- Access to a Hydra node (local or remote)
- Mesh SDK peer dependencies installed

## Documentation

For more detailed documentation, examples, and guides, visit:

- **Official Documentation**: [meshjs.dev/hydra](https://meshjs.dev/hydra)
- **Hydra Protocol Docs**: [hydra.family/head-protocol](https://hydra.family/head-protocol)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the terms specified in the LICENSE file.

## Support

For support and questions:
- Check the [documentation](https://meshjs.dev/hydra)
- Open an issue on GitHub
- Visit the Mesh community forums

---