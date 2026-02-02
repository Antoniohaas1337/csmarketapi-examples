/**
 * CSMarketAPI Price Tracking Example
 *
 * Build a price tracker that monitors specific CS2 items and detects price changes.
 */
import { CSMarketAPI, Market, Currency } from "csmarketapi"

// Items to track - replace with your items
const WATCHLIST = [
  "Chroma 2 Case",
  "AWP | Asiimov (Field-Tested)",
  "AK-47 | Redline (Field-Tested)",
  "Glove Case",
]

// Price alerts: item -> target price - customize your alerts
const PRICE_ALERTS = {
  "Chroma 2 Case": 0.40,
  "AWP | Asiimov (Field-Tested)": 35.00,
  "AK-47 | Redline (Field-Tested)": 15.00,
}

const CHECK_INTERVAL = 300_000 // 5 minutes in ms

async function getItemPrices(client, itemName) {
  return await client.getListingsLatestAggregated({
    marketHashName: itemName,
    markets: Object.values(Market),
    currency: Currency.USD,
  })
}

async function trackWatchlist(client) {
  console.log("=".repeat(60))
  console.log("CS2 PRICE TRACKER")
  console.log("=".repeat(60))

  for (const itemName of WATCHLIST) {
    try {
      const res = await client.getListingsLatestAggregated({
        marketHashName: itemName,
        currency: Currency.USD,
      })

      if (res.listings.length > 0) {
        const lowest = res.listings.reduce((a, b) =>
          a.min_price < b.min_price ? a : b
        )
        const avgPrice = res.listings.reduce((sum, l) =>
          sum + l.min_price, 0
        ) / res.listings.length

        console.log(`\n${itemName}`)
        console.log(`  Lowest: $${lowest.min_price.toFixed(2)} on ${lowest.market}`)
        console.log(`  Average: $${avgPrice.toFixed(2)} across ${res.listings.length} markets`)
      } else {
        console.log(`\n${itemName}: No listings found`)
      }
    } catch (error) {
      console.log(`\n${itemName}: Error - ${error.message}`)
    }
  }
}

async function checkAlerts(client) {
  const alertsTriggered = []

  for (const [itemName, targetPrice] of Object.entries(PRICE_ALERTS)) {
    try {
      const res = await client.getListingsLatestAggregated({
        marketHashName: itemName,
        currency: Currency.USD,
      })

      if (res.listings.length > 0) {
        const lowest = res.listings.reduce((a, b) =>
          a.min_price < b.min_price ? a : b
        )

        if (lowest.min_price <= targetPrice) {
          alertsTriggered.push({
            item: itemName,
            price: lowest.min_price,
            target: targetPrice,
            market: lowest.market,
          })
        }
      }
    } catch (error) {
      console.log(`Error checking ${itemName}: ${error.message}`)
    }
  }

  return alertsTriggered
}

// Main execution
// Get API key from environment variable
// Set it with: export CSMARKETAPI_KEY="your_api_key"
const client = new CSMarketAPI({
  apiKey: process.env.CSMARKETAPI_KEY
})

// Run watchlist tracker
await trackWatchlist(client)

// Check price alerts
console.log("\n" + "=".repeat(60))
console.log("CHECKING PRICE ALERTS")
console.log("=".repeat(60))

const alerts = await checkAlerts(client)

if (alerts.length > 0) {
  console.log("\nPrice alerts triggered!")
  for (const alert of alerts) {
    const savings = alert.target - alert.price
    console.log(`  ${alert.item}`)
    console.log(`    Price: $${alert.price.toFixed(2)} (target: $${alert.target.toFixed(2)})`)
    console.log(`    Market: ${alert.market}`)
    console.log(`    Savings: $${savings.toFixed(2)}`)
  }
} else {
  console.log("\nNo alerts triggered. All prices above targets.")
}
