"""Notification stubs.

Replace with actual email/SMS provider (e.g., SendGrid, Twilio) when ready.
Order status change events call these hooks.
"""

from __future__ import annotations
import logging

logger = logging.getLogger(__name__)


async def on_order_confirmed(order_id: str, user_email: str, total: float) -> None:
    """Called when an order transitions to 'confirmed'."""
    logger.info(
        "ORDER CONFIRMED: order_id=%s email=%s total=%.2f",
        order_id, user_email, total
    )
    # TODO: send confirmation email via SendGrid / AWS SES


async def on_order_status_changed(
    order_id: str, user_email: str, new_status: str
) -> None:
    """Called whenever admin updates order status."""
    logger.info(
        "ORDER STATUS CHANGED: order_id=%s email=%s status=%s",
        order_id, user_email, new_status
    )
    # TODO: send SMS via Twilio / Jazz SMS API
