# CSMarketAPI Code Examples

Official code examples for the [CSMarketAPI](https://csmarketapi.com) - Real-time CS2 skin price API.

[![Python](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/downloads/)
[![Node.js](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This repository contains working code examples demonstrating how to use the CSMarketAPI with both Python and JavaScript/TypeScript SDKs.

## Examples

| Example | Description | Python | JavaScript |
|---------|-------------|--------|------------|
| **Quickstart** | Basic API usage - fetch item prices | [quickstart.py](python/quickstart.py) | [quickstart.js](javascript/quickstart.js) |
| **Price Tracking** | Monitor prices with alerts | [price_tracking.py](python/price_tracking.py) | [price_tracking.js](javascript/price_tracking.js) |
| **Market Comparison** | Compare prices & find arbitrage | [market_comparison.py](python/market_comparison.py) | [market_comparison.js](javascript/market_comparison.js) |
| **Historical Analysis** | Analyze price trends over time | [historical_analysis.py](python/historical_analysis.py) | [historical_analysis.js](javascript/historical_analysis.js) |

## Quick Start

### Get an API Key

Sign up at [csmarketapi.com/dashboard](https://csmarketapi.com/dashboard) to get your free API key.

### Python

```bash
cd python
pip install -r requirements.txt
export CSMARKETAPI_KEY="your_api_key"
python quickstart.py
```

### JavaScript/Node.js

```bash
cd javascript
npm install
export CSMARKETAPI_KEY="your_api_key"
node quickstart.js
```

## SDK Installation

### Python SDK

```bash
pip install csmarketapi
```

**Requirements:** Python 3.13+

### JavaScript SDK

```bash
npm install csmarketapi
```

**Requirements:** Node.js 18+ or Bun 1+

## Documentation

- [Full Documentation](https://docs.csmarketapi.com)
- [API Reference](https://docs.csmarketapi.com/api-reference/introduction)
- [Python SDK](https://docs.csmarketapi.com/sdks/python)
- [JavaScript SDK](https://docs.csmarketapi.com/sdks/javascript)

## Supported Markets

CSMarketAPI aggregates prices from 12+ marketplaces:

- Steam Community Market
- Buff.market (BUFF163)
- CSFloat
- Skinport
- DMarket
- Skinbaron
- CS.Money
- WhiteMarket
- GamerPay
- CS.Deals
- Market.CSGO
- Skins.com

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- [Discord](https://discord.com/channels/1338877427396513884/1338877428017397782)
- [GitHub Issues](https://github.com/csmarketapi/examples/issues)
