"""
CSMarketAPI Quickstart Example

Get real-time CS2 skin prices across multiple marketplaces.
"""
import asyncio
import os
from csmarketapi import CSMarketAPI
from csmarketapi.enums import Market, Currency


async def main():
    async with CSMarketAPI(os.environ["CSMARKETAPI_KEY"]) as client:
        res = await client.get_listings_latest_aggregated(
            market_hash_name="Chroma 2 Case",
            markets=list(Market),
            currency=Currency.USD
        )

        print(f"Item: {res.market_hash_name}")
        for listing in res.listings:
            print(f"  {listing.market}: ${listing.min_price:.2f}")


if __name__ == "__main__":
    asyncio.run(main())
