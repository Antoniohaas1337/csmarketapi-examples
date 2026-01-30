# JavaScript Examples

## Requirements

- Node.js 18+ or Bun 1+
- CSMarketAPI JavaScript SDK

## Installation

```bash
npm install
```

## Running Examples

Set your API key as an environment variable:

```bash
export CSMARKETAPI_KEY="your_api_key"
```

Then run any example:

```bash
node quickstart.js
node price_tracking.js
node market_comparison.js
node historical_analysis.js
```

Or use npm scripts:

```bash
npm run quickstart
npm run price-tracking
npm run market-comparison
npm run historical-analysis
```

## Examples

### quickstart.js
Basic example showing how to fetch current prices for an item across all marketplaces.

### price_tracking.js
Demonstrates tracking multiple items, setting price alerts, and running periodic checks.

### market_comparison.js
Compare prices across marketplaces and find arbitrage opportunities.

### historical_analysis.js
Analyze historical price data, sales trends, and correlate with player counts.

## TypeScript

These examples can be run directly with TypeScript by using ts-node or Bun:

```bash
bun quickstart.js
```

For TypeScript type definitions, the SDK exports all types:

```typescript
import type { Listing, LatestListings } from "csmarketapi"
```
