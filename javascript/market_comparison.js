/**
 * CSMarketAPI Market Comparison Example
 *
 * Compare prices across different marketplaces to find arbitrage opportunities.
 */
import { CSMarketAPI, Market, Currency } from "csmarketapi"

// Seller fees (as decimal) - from /v1/markets/ endpoint
const MARKETPLACE_FEES = {
  STEAMCOMMUNITY: 0.15,
  SKINBARON: 0.15,
  SKINPORT: 0.08,
  CSMONEY: 0.06, // 5-7%, using average
  WHITEMARKET: 0.05,
  BUFFMARKET: 0.045,
  GAMERPAYGG: 0.03,
  CSFLOAT: 0.02,
  CSDEALS: 0.02,
  SKINS: 0.0,
}

async function compareMarkets(client, itemName) {
  const res = await client.getListingsLatestAggregated({
    marketHashName: itemName,
    markets: Object.values(Market),
    currency: Currency.USD,
  })

  if (res.listings.length === 0) {
    console.log(`No listings found for ${itemName}`)
    return null
  }

  // Sort by lowest price
  const sortedListings = [...res.listings].sort((a, b) => a.min_price - b.min_price)

  console.log(`\nPrices for: ${res.market_hash_name}`)
  console.log("-".repeat(50))

  for (const listing of sortedListings) {
    console.log(
      `${listing.market.padEnd(20)} $${listing.min_price.toFixed(2).padStart(8)}  (${listing.listings} listings)`
    )
  }

  return sortedListings
}

function calculateProfit(buyPrice, sellPrice, sellFee) {
  const netSell = sellPrice * (1 - sellFee)
  return netSell - buyPrice
}

async function findArbitrage(client, itemName) {
  const res = await client.getListingsLatestAggregated({
    marketHashName: itemName,
    markets: Object.values(Market),
    currency: Currency.USD,
  })

  if (res.listings.length < 2) {
    return []
  }

  const opportunities = []

  // Find lowest price (buy from)
  const sortedByPrice = [...res.listings].sort((a, b) => a.min_price - b.min_price)
  const buyListing = sortedByPrice[0]

  // Check profit selling on each other market
  for (const sellListing of sortedByPrice.slice(1)) {
    const sellFee = MARKETPLACE_FEES[sellListing.market] ?? 0.10
    const profit = calculateProfit(buyListing.min_price, sellListing.min_price, sellFee)

    if (profit > 0) {
      const roi = (profit / buyListing.min_price) * 100
      opportunities.push({
        buyMarket: buyListing.market,
        buyPrice: buyListing.min_price,
        sellMarket: sellListing.market,
        sellPrice: sellListing.min_price,
        profit,
        roi,
      })
    }
  }

  return opportunities
}

// Main execution
const client = new CSMarketAPI({
  apiKey: process.env.CSMARKETAPI_KEY
})

const itemsToCheck = [
  "AK-47 | Redline (Field-Tested)",
  "AWP | Asiimov (Field-Tested)",
  "M4A4 | Asiimov (Field-Tested)",
]

// First, compare markets for a single item
await compareMarkets(client, "AK-47 | Redline (Field-Tested)")

// Then scan for arbitrage opportunities
console.log("\n" + "=".repeat(60))
console.log("ARBITRAGE SCANNER")
console.log("=".repeat(60))

for (const itemName of itemsToCheck) {
  try {
    const opportunities = await findArbitrage(client, itemName)

    if (opportunities.length > 0) {
      console.log(`\n${itemName}`)
      const topOpps = opportunities.sort((a, b) => b.roi - a.roi).slice(0, 3)
      for (const opp of topOpps) {
        console.log(`  Buy on ${opp.buyMarket} @ $${opp.buyPrice.toFixed(2)}`)
        console.log(`  Sell on ${opp.sellMarket} @ $${opp.sellPrice.toFixed(2)}`)
        console.log(`  Profit: $${opp.profit.toFixed(2)} (${opp.roi.toFixed(1)}% ROI)`)
        console.log()
      }
    }
  } catch (error) {
    console.log(`\n${itemName}: Error - ${error.message}`)
  }
}
