/**
 * CSMarketAPI Quickstart Example
 *
 * Get real-time CS2 skin prices across multiple marketplaces.
 */
import { CSMarketAPI, Currency } from "csmarketapi"

const client = new CSMarketAPI({
  apiKey: process.env.CSMARKETAPI_KEY
})

const res = await client.getListingsLatestAggregated({
  marketHashName: "Chroma 2 Case",
  currency: Currency.USD,
})

console.log(`Item: ${res.market_hash_name}`)
for (const listing of res.listings) {
  console.log(`  ${listing.market}: $${listing.min_price.toFixed(2)}`)
}
