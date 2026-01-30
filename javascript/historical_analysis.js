/**
 * CSMarketAPI Historical Analysis Example
 *
 * Analyze historical CS2 skin prices and market trends.
 */
import { CSMarketAPI, Market, Currency } from "csmarketapi"

async function getPriceHistory(client, itemName) {
  const res = await client.getListingsHistoryAggregated({
    marketHashName: itemName,
    markets: Object.values(Market),
    currency: Currency.USD,
  })
  return res.items
}

async function getSalesHistory(client, itemName, startDate, endDate) {
  const res = await client.getSalesHistoryAggregated({
    marketHashName: itemName,
    start: startDate,
    end: endDate,
    currency: Currency.USD,
  })
  return res.items
}

async function analyzePriceTrends(client, itemName, startDate, endDate) {
  const res = await client.getSalesHistoryAggregated({
    marketHashName: itemName,
    start: startDate,
    end: endDate,
    currency: Currency.USD,
  })

  const items = res.items
  if (!items || items.length === 0) {
    return null
  }

  // Each day has multiple sales from different markets
  // Aggregate to get daily totals
  const dailyData = items.map(day => {
    const dayVolume = day.sales.reduce((sum, sale) => sum + (sale.volume || 0), 0)
    // Get prices from sales that have them
    const prices = day.sales
      .filter(s => s.mean_price || s.median_price)
      .map(s => s.mean_price || s.median_price)
    const avgPrice = prices.length > 0
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : null
    return { day: day.day, volume: dayVolume, avgPrice }
  }).filter(d => d.avgPrice !== null)

  if (dailyData.length === 0) {
    return null
  }

  const prices = dailyData.map(d => d.avgPrice)
  const volumes = dailyData.map(d => d.volume)

  const stats = {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
    totalVolume: volumes.reduce((a, b) => a + b, 0),
    avgDailyVolume: volumes.reduce((a, b) => a + b, 0) / volumes.length,
    priceChange: prices[prices.length - 1] - prices[0],
    priceChangePct: ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100,
    daysTracked: dailyData.length,
  }

  return stats
}

async function analyzePlayerCorrelation(client, itemName, startDate, endDate) {
  // Fetch both datasets
  const salesRes = await client.getSalesHistoryAggregated({
    marketHashName: itemName,
    start: startDate,
    end: endDate,
    currency: Currency.USD,
  })

  const playerRes = await client.getPlayerCountsHistory({
    start: startDate,
    end: endDate,
  })

  const salesHistory = salesRes.items
  const playerHistory = playerRes.items

  console.log(`Item: ${itemName}`)
  console.log("=".repeat(60))
  console.log(`${"Date".padEnd(12)} ${"Volume".padStart(10)} ${"Players".padStart(12)}`)
  console.log("-".repeat(60))

  // Show available days
  for (let i = 0; i < Math.min(7, salesHistory.length); i++) {
    const day = salesHistory[i]
    const dayVolume = day.sales.reduce((sum, sale) => sum + (sale.volume || 0), 0)
    const players = i < playerHistory.length ? playerHistory[i].count : "N/A"
    console.log(
      `${day.day.padEnd(12)} ${String(dayVolume).padStart(10)} ${String(players).padStart(12)}`
    )
  }
}

// Main execution
const client = new CSMarketAPI({
  apiKey: process.env.CSMARKETAPI_KEY
})

const itemName = "AK-47 | Redline (Field-Tested)"
const startDate = "2024-01-01"
const endDate = "2024-01-31"

// 1. Get recent price history (listings)
console.log("Recent Price History (Listings)")
console.log("-".repeat(40))

const history = await getPriceHistory(client, itemName)
for (const snapshot of history.slice(0, 10)) {
  // Each snapshot has timestamp and listings array
  const lowestPrice = snapshot.listings.reduce(
    (min, l) => l.min_price < min ? l.min_price : min,
    Infinity
  )
  console.log(`${snapshot.timestamp}: $${lowestPrice.toFixed(2)}`)
}

// 2. Analyze price trends from sales data
console.log("\n" + "=".repeat(50))
console.log("Price Analysis from Sales Data")
console.log("=".repeat(50))

const stats = await analyzePriceTrends(client, itemName, startDate, endDate)

if (stats) {
  console.log(`Min Price:      $${stats.minPrice.toFixed(2)}`)
  console.log(`Max Price:      $${stats.maxPrice.toFixed(2)}`)
  console.log(`Average Price:  $${stats.avgPrice.toFixed(2)}`)
  console.log(`Price Change:   $${stats.priceChange.toFixed(2)} (${stats.priceChangePct.toFixed(1)}%)`)
  console.log(`Total Volume:   ${stats.totalVolume} items`)
  console.log(`Avg Daily Vol:  ${Math.round(stats.avgDailyVolume)} items/day`)
  console.log(`Days Tracked:   ${stats.daysTracked}`)
} else {
  console.log("No sales data available for this period")
}

// 3. Correlate with player counts
console.log("\n" + "=".repeat(60))
console.log("Player Count Correlation")
console.log("=".repeat(60))

await analyzePlayerCorrelation(
  client,
  "Chroma 2 Case",
  "2024-01-01",
  "2024-01-07"
)
