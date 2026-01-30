"""
CSMarketAPI Price Tracking Example

Build a price tracker that monitors specific CS2 items and detects price changes.
"""
import asyncio
import os
from datetime import datetime
from csmarketapi import CSMarketAPI
from csmarketapi.enums import Market, Currency

# Items to track
WATCHLIST = [
    "Chroma 2 Case",
    "AWP | Asiimov (Field-Tested)",
    "AK-47 | Redline (Field-Tested)",
    "Glove Case",
]

# Price alerts: item -> target price
PRICE_ALERTS = {
    "Chroma 2 Case": 0.40,
    "AWP | Asiimov (Field-Tested)": 35.00,
    "AK-47 | Redline (Field-Tested)": 15.00,
}

CHECK_INTERVAL = 300  # 5 minutes


async def get_item_prices(client, item_name):
    """Fetch current prices for an item across all markets."""
    res = await client.get_listings_latest_aggregated(
        market_hash_name=item_name,
        markets=list(Market),
        currency=Currency.USD
    )
    return res


async def track_watchlist(client):
    """Track prices for all items in watchlist."""
    print("=" * 60)
    print("CS2 PRICE TRACKER")
    print("=" * 60)

    for item_name in WATCHLIST:
        try:
            res = await client.get_listings_latest_aggregated(
                market_hash_name=item_name,
                markets=list(Market),
                currency=Currency.USD
            )

            if res.listings:
                # Find lowest price
                lowest = min(res.listings, key=lambda x: x.min_price)
                avg_price = sum(l.min_price for l in res.listings) / len(res.listings)

                print(f"\n{item_name}")
                print(f"  Lowest: ${lowest.min_price:.2f} on {lowest.market}")
                print(f"  Average: ${avg_price:.2f} across {len(res.listings)} markets")
            else:
                print(f"\n{item_name}: No listings found")

        except Exception as e:
            print(f"\n{item_name}: Error - {e}")


async def check_alerts(client):
    """Check for price drops and trigger alerts."""
    alerts_triggered = []

    for item_name, target_price in PRICE_ALERTS.items():
        try:
            res = await client.get_listings_latest_aggregated(
                market_hash_name=item_name,
                markets=list(Market),
                currency=Currency.USD
            )

            if res.listings:
                lowest = min(res.listings, key=lambda x: x.min_price)

                if lowest.min_price <= target_price:
                    alerts_triggered.append({
                        "item": item_name,
                        "price": lowest.min_price,
                        "target": target_price,
                        "market": lowest.market,
                    })

        except Exception as e:
            print(f"Error checking {item_name}: {e}")

    return alerts_triggered


async def run_periodic_check(client):
    """Run price checks on a schedule."""
    print("Starting price tracker. Press Ctrl+C to stop.")

    while True:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"\n[{timestamp}] Checking prices...")

        for item_name in WATCHLIST[:2]:  # Check first 2 items for demo
            try:
                res = await client.get_listings_latest_aggregated(
                    market_hash_name=item_name,
                    markets=list(Market),
                    currency=Currency.USD
                )
                if res.listings:
                    lowest = min(res.listings, key=lambda x: x.min_price)
                    print(f"  {item_name}: ${lowest.min_price:.2f} ({lowest.market})")
            except Exception as e:
                print(f"  {item_name}: Error - {e}")

        await asyncio.sleep(CHECK_INTERVAL)


async def main():
    api_key = os.environ["CSMARKETAPI_KEY"]

    async with CSMarketAPI(api_key) as client:
        # Run watchlist tracker
        await track_watchlist(client)

        # Check price alerts
        print("\n" + "=" * 60)
        print("CHECKING PRICE ALERTS")
        print("=" * 60)

        alerts = await check_alerts(client)

        if alerts:
            print("\nPrice alerts triggered!")
            for alert in alerts:
                savings = alert["target"] - alert["price"]
                print(f"  {alert['item']}")
                print(f"    Price: ${alert['price']:.2f} (target: ${alert['target']:.2f})")
                print(f"    Market: {alert['market']}")
                print(f"    Savings: ${savings:.2f}")
        else:
            print("\nNo alerts triggered. All prices above targets.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nStopped.")
