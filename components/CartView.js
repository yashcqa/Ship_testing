"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/books";
import { useStore } from "./StoreProvider";

export default function CartView() {
  const { hydrated, cartLines, subtotalCents, updateQuantity, removeFromCart } = useStore();

  if (!hydrated) return <p className="loading" data-testid="cart-loading">Loading cart…</p>;

  if (cartLines.length === 0) {
    return (
      <div className="empty" data-testid="cart-empty">
        <p>Your cart is empty.</p>
        <Link href="/" className="button" data-testid="continue-shopping">Browse books</Link>
      </div>
    );
  }

  return (
    <div className="cart" data-testid="cart">
      <div className="table-wrap">
        <table className="cart-table">
          <thead>
            <tr>
              <th scope="col">Book</th>
              <th scope="col">Price</th>
              <th scope="col">Quantity</th>
              <th scope="col" className="num">Total</th>
              <th scope="col"><span className="visually-hidden">Remove</span></th>
            </tr>
          </thead>
          <tbody>
            {cartLines.map(({ id, quantity, book, lineTotalCents }) => (
              <tr key={id} data-testid={`cart-item-${id}`}>
                <td>
                  <Link href={`/books/${id}`} data-testid={`cart-item-title-${id}`}>{book.title}</Link>
                  <span className="cart-table__author">{book.author}</span>
                </td>
                <td data-testid={`cart-item-price-${id}`}>{formatPrice(book.priceCents)}</td>
                <td>
                  <div className="stepper">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${book.title}`}
                      onClick={() => updateQuantity(id, quantity - 1)}
                      disabled={quantity <= 1}
                      data-testid={`cart-decrease-${id}`}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={book.stock}
                      value={quantity}
                      aria-label={`Quantity of ${book.title}`}
                      onChange={(e) => {
                        const n = parseInt(e.target.value, 10);
                        if (!Number.isNaN(n)) updateQuantity(id, n);
                      }}
                      data-testid={`cart-qty-${id}`}
                    />
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${book.title}`}
                      onClick={() => updateQuantity(id, quantity + 1)}
                      disabled={quantity >= book.stock}
                      data-testid={`cart-increase-${id}`}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="num" data-testid={`cart-line-total-${id}`}>{formatPrice(lineTotalCents)}</td>
                <td>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => removeFromCart(id)}
                    data-testid={`cart-remove-${id}`}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="cart__summary">
        <p className="summary-row">
          <span>Subtotal</span>
          <strong data-testid="cart-subtotal" aria-live="polite">{formatPrice(subtotalCents)}</strong>
        </p>
        <p className="field__hint">Shipping is free on every order.</p>
        <Link href="/checkout" className="button" data-testid="checkout-button">Go to checkout</Link>
      </div>
    </div>
  );
}
