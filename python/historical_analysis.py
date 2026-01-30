"""
CSMarketAPI Historical Analysis Example

Analyze historical CS2 skin prices and market trends.
"""
import asyncio
import os
from csmarketapi import CSMarketAPI
from csmarketapi.enums import Market, Currency


async def get_price_history(client, item_name):
    """Get historical listings data for an item."""
    res = await client.get_listings_history_aggregated(
        market_hash_name=item_name,
        markets=list(Market),
        currency=Currency.USD
    )
    return res.items


async def get_sales_history(client, item_name, start_date, end_date):
    """Get historical sales data for an item."""
    res = await client.get_sales_history_aggregated(
        market_hash_name=item_name,
        markets=list(Market),
        start=start_date,
        end=end_date,
        currency=Currency.USD
    )
    return res.items


async def analyze_price_trends(client, item_name, start_date, end_date):
    """Calculate price statistics for an item."""
    res = await client.get_sales_history_aggregated(
        market_hash_name=item_name,
        markets=list(Market),
        start=start_date,
        end=end_date,
        currency=Currency.USD
    )

    if not res.items:
        return None

    # Each day has sales from multiple markets
    # Aggregate daily volumes and find prices
    daily_volumes = []
    all_prices = []

    for day in res.items:
        day_volume = sum(sale.volume for sale in day.sales if sale.volume)
        daily_volumes.append(day_volume)

        # Collect prices where available
        for sale in day.sales:
            if sale.mean_price:
                all_prices.append(sale.mean_price)
            elif sale.median_price:
                all_prices.append(sale.median_price)

    if not all_prices:
        return None

    stats = {
        "min_price": min(all_prices),
        "max_price": max(all_prices),
        "avg_price": sum(all_prices) / len(all_prices),
        "total_volume": sum(daily_volumes),
        "avg_daily_volume": sum(daily_volumes) / len(daily_volumes),
        "days_tracked": len(res.items),
    }

    return stats


async def analyze_player_correlation(client, item_name, start_date, end_date):
    """Analyze correlation between player counts and prices."""
    # Fetch both datasets
    sales_res = await client.get_sales_history_aggregated(
        market_hash_name=item_name,
        markets=list(Market),
        start=start_date,
        end=end_date,
        currency=Currency.USD
    )

    player_res = await client.get_player_counts_history(
        start=start_date,
        end=end_date
    )

    sales_items = sales_res.items
    player_items = player_res.items

    print(f"Item: {item_name}")
    print("=" * 60)
    print(f"{'Date':<12} {'Volume':>10} {'Players':>12}")
    print("-" * 60)

    # Note: This is a simplified view. In practice, you'd align
    # the data by date for proper correlation analysis.
    for i, day in enumerate(sales_items[:7]):  # First 7 days
        day_volume = sum(sale.volume for sale in day.sales if sale.volume)
        players = player_items[i].count if i < len(player_items) else "N/A"
        print(f"{day.day}  {day_volume:>10} {players:>12}")


async def main():
    api_key = os.environ["CSMARKETAPI_KEY"]

    async with CSMarketAPI(api_key) as client:
        item_name = "AK-47 | Redline (Field-Tested)"
        start_date = "2024-01-01"
        end_date = "2024-01-31"

        # 1. Get recent price history
        print("Recent Price History (Listings)")
        print("-" * 40)
        history = await get_price_history(client, item_name)
        for snapshot in history[:10]:  # Last 10 data points
            # Each snapshot has timestamp and listings list
            lowest_price = min(l.min_price for l in snapshot.listings if l.min_price)
            print(f"{snapshot.timestamp}: ${lowest_price:.2f}")

        # 2. Analyze price trends from sales data
        print("\n" + "=" * 50)
        print("Price Analysis from Sales Data")
        print("=" * 50)

        stats = await analyze_price_trends(client, item_name, start_date, end_date)

        if stats:
            print(f"Min Price:      ${stats['min_price']:.2f}")
            print(f"Max Price:      ${stats['max_price']:.2f}")
            print(f"Average Price:  ${stats['avg_price']:.2f}")
            print(f"Total Volume:   {stats['total_volume']} items")
            print(f"Avg Daily Vol:  {stats['avg_daily_volume']:.0f} items/day")
            print(f"Days Tracked:   {stats['days_tracked']}")
        else:
            print("No sales data available for this period")

        # 3. Correlate with player counts
        print("\n" + "=" * 60)
        print("Player Count Correlation")
        print("=" * 60)

        await analyze_player_correlation(
            client,
            "Chroma 2 Case",
            "2024-01-01",
            "2024-01-07"
        )


if __name__ == "__main__":
    asyncio.run(main())
