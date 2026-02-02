/**
 * CSMarketAPI Quickstart Example
 *
 * Get real-time CS2 skin prices across multiple marketplaces.
 */
import { CSMarketAPI, Currency } from "csmarketapi"

// Get API key from environment variable
// Set it with: export CSMARKETAPI_KEY="your_api_key"
const client = new CSMarketAPI({
  apiKey: process.env.CSMARKETAPI_KEY
})

const res = await client.getListingsLatestAggregated({
  marketHashName: "Chroma 2 Case",  // Replace with your item
  currency: Currency.USD,
})

console.log(`Item: ${res.market_hash_name}`)
for (const listing of res.listings) {
  console.log(`  ${listing.market}: $${listing.min_price.toFixed(2)}`)
}
