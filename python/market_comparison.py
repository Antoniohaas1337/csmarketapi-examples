"""
CSMarketAPI Market Comparison Example

Compare prices across different marketplaces to find arbitrage opportunities.
"""
import asyncio
import os
from csmarketapi import CSMarketAPI
from csmarketapi.enums import Market, Currency

# Seller fees (as decimal) - from /v1/markets/ endpoint
MARKETPLACE_FEES = {
    "STEAMCOMMUNITY": 0.15,
    "SKINBARON": 0.15,
    "SKINPORT": 0.08,
    "CSMONEY": 0.06,  # 5-7%, using average
    "WHITEMARKET": 0.05,
    "BUFFMARKET": 0.045,
    "GAMERPAYGG": 0.03,
    "CSFLOAT": 0.02,
    "CSDEALS": 0.02,
    "SKINS": 0.0,
}


async def compare_markets(client, item_name):
    """Compare prices across all markets for an item."""
    res = await client.get_listings_latest_aggregated(
        market_hash_name=item_name,
        markets=list(Market),
        currency=Currency.USD
    )

    if not res.listings:
        print(f"No listings found for {item_name}")
        return None

    # Sort by lowest price
    sorted_listings = sorted(res.listings, key=lambda x: x.min_price)

    print(f"\nPrices for: {res.market_hash_name}")
    print("-" * 50)

    for listing in sorted_listings:
        print(f"{listing.market:20} ${listing.min_price:>8.2f}  ({listing.listings} listings)")

    return sorted_listings


def calculate_profit(buy_price, sell_price, sell_fee):
    """Calculate profit after fees."""
    net_sell = sell_price * (1 - sell_fee)
    profit = net_sell - buy_price
    return profit


async def find_arbitrage(client, item_name):
    """Find arbitrage opportunities for an item."""
    res = await client.get_listings_latest_aggregated(
        market_hash_name=item_name,
        markets=list(Market),
        currency=Currency.USD
    )

    if len(res.listings) < 2:
        return []

    opportunities = []

    # Find lowest price (buy from)
    sorted_by_price = sorted(res.listings, key=lambda x: x.min_price)
    buy_listing = sorted_by_price[0]

    # Check profit selling on each other market
    for sell_listing in sorted_by_price[1:]:
        sell_fee = MARKETPLACE_FEES.get(sell_listing.market, 0.10)
        profit = calculate_profit(
            buy_listing.min_price,
            sell_listing.min_price,
            sell_fee
        )

        if profit > 0:
            roi = (profit / buy_listing.min_price) * 100
            opportunities.append({
                "buy_market": buy_listing.market,
                "buy_price": buy_listing.min_price,
                "sell_market": sell_listing.market,
                "sell_price": sell_listing.min_price,
                "profit": profit,
                "roi": roi,
            })

    return opportunities


async def main():
    api_key = os.environ["CSMARKETAPI_KEY"]

    items_to_check = [
        "AK-47 | Redline (Field-Tested)",
        "AWP | Asiimov (Field-Tested)",
        "M4A4 | Asiimov (Field-Tested)",
    ]

    async with CSMarketAPI(api_key) as client:
        # First, compare markets for a single item
        await compare_markets(client, "AK-47 | Redline (Field-Tested)")

        # Then scan for arbitrage opportunities
        print("\n" + "=" * 60)
        print("ARBITRAGE SCANNER")
        print("=" * 60)

        for item_name in items_to_check:
            try:
                opportunities = await find_arbitrage(client, item_name)

                if opportunities:
                    print(f"\n{item_name}")
                    for opp in sorted(opportunities, key=lambda x: -x["roi"])[:3]:
                        print(f"  Buy on {opp['buy_market']} @ ${opp['buy_price']:.2f}")
                        print(f"  Sell on {opp['sell_market']} @ ${opp['sell_price']:.2f}")
                        print(f"  Profit: ${opp['profit']:.2f} ({opp['roi']:.1f}% ROI)")
                        print()

            except Exception as e:
                print(f"\n{item_name}: Error - {e}")


if __name__ == "__main__":
    asyncio.run(main())
