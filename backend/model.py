"""Economic modeling utilities for the Nigeria Music Analytics System (NMAS) prototype."""

from __future__ import annotations

from typing import Dict

AVG_PAYOUT_PER_STREAM = 0.003  # USD per stream, illustrative industry average
ECONOMIC_MULTIPLIER = 1.75  # Captures downstream effects (events, merch, etc.)
JOBS_PER_MILLION_USD = 50  # Simplified ratio for creative sector employment


def calculate_economic_impact(aggregated_data: Dict[str, float]) -> Dict[str, float]:
    """Estimate GDP contribution and jobs supported from aggregated metrics.

    Parameters
    ----------
    aggregated_data: dict
        Expected keys include ``total_streams`` and ``concert_revenue`` (both in
        absolute units). Additional keys are ignored for now but allow the
        function to evolve without breaking callers.

    Returns
    -------
    dict
        Contains ``gdp_contribution_usd`` and ``jobs_supported``.

    Formula
    -------
    1. Convert streams into direct revenue using ``AVG_PAYOUT_PER_STREAM``.
    2. Add concert revenue (already in USD) to obtain total direct revenue.
    3. Multiply the direct revenue by ``ECONOMIC_MULTIPLIER`` to capture
       indirect and induced impact across the wider economy.
    4. Estimate jobs supported using ``JOBS_PER_MILLION_USD`` to keep the model
       transparent and easy to explain to policymakers.
    """

    total_streams = float(aggregated_data.get("total_streams", 0))
    concert_revenue = float(aggregated_data.get("concert_revenue", 0))

    direct_streaming_revenue = total_streams * AVG_PAYOUT_PER_STREAM
    direct_revenue = direct_streaming_revenue + concert_revenue

    gdp_contribution = direct_revenue * ECONOMIC_MULTIPLIER
    jobs_supported = (gdp_contribution / 1_000_000) * JOBS_PER_MILLION_USD

    return {
        "gdp_contribution_usd": gdp_contribution,
        "jobs_supported": jobs_supported,
        "direct_streaming_revenue_usd": direct_streaming_revenue,
        "assumptions": {
            "avg_payout_per_stream": AVG_PAYOUT_PER_STREAM,
            "economic_multiplier": ECONOMIC_MULTIPLIER,
            "jobs_per_million_usd": JOBS_PER_MILLION_USD,
        },
    }
