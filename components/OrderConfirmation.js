"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/books";

export default function OrderConfirmation() {
  const [order, setOrder] = useState(undefined);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("pp_last_order");
      setOrder(raw ? JSON.parse(raw) : null);
    } catch {
      setOrder(null);
    }
  }, []);

  if (order === undefined) return <p className="loading" data-testid="confirmation-loading">Loading your order…</p>;

  if (!order) {
    return (
      <div className="empty" data-testid="no-order">
        <h1>No recent order</h1>
        <p>Orders you place in this tab will show up here.</p>
        <Link href="/" className="button" data-testid="continue-shopping">Browse books</Link>
      </div>
    );
  }

  return (
    <section className="confirmation" data-testid="order-confirmation">
      <h1 data-testid="confirmation-heading">Thank you, your order is confirmed</h1>
      <p>
        Order number <strong data-testid="order-id">{order.id}</strong>. A receipt is on its way to{" "}
        <span data-testid="order-email">{order.email}</span>.
      </p>
      <ul className="confirmation__items">
        {order.items.map((item) => (
          <li key={item.bookId} data-testid={`confirmation-item-${item.bookId}`}>
            <span>{item.title} × {item.quantity}</span>
            <span>{formatPrice(item.lineTotalCents)}</span>
          </li>
        ))}
      </ul>
      <p className="summary-row summary-row--total">
        <span>Total paid with card ending {order.cardLast4}</span>
        <strong data-testid="order-total">{formatPrice(order.totalCents)}</strong>
      </p>
      <Link href="/" className="button" data-testid="continue-shopping">Keep browsing</Link>
    </section>
  );
}
