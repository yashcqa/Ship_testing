"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice, stockLabel } from "@/lib/books";
import { useStore } from "./StoreProvider";
import BookCover from "./BookCover";

export default function BookDetail({ id }) {
  const { getBook, addToCart, hydrated, cartLines } = useStore();
  const book = getBook(id);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  if (!book) {
    if (!hydrated) {
      return <p className="loading" data-testid="book-loading">Loading book…</p>;
    }
    return (
      <div className="empty" data-testid="book-not-found">
        <h1>Book not found</h1>
        <p>There is no book at this address. It may have been added in another browser.</p>
        <Link href="/" className="button" data-testid="back-to-catalogue">Browse all books</Link>
      </div>
    );
  }

  const outOfStock = book.stock <= 0;
  const inCart = cartLines.find((line) => line.id === book.id)?.quantity || 0;
  const remaining = Math.max(0, book.stock - inCart);

  function handleAdd() {
    const qty = Math.max(1, Math.min(quantity, book.stock));
    const total = addToCart(book.id, qty);
    if (total > 0) {
      setMessage(
        total < inCart + qty
          ? `Only ${book.stock} available. Your cart now has ${total}.`
          : `Added to cart. Your cart has ${total} of this book.`
      );
    }
  }

  return (
    <article className="detail" data-testid="book-detail">
      <Link href="/" className="back-link" data-testid="back-link">All books</Link>
      <div className="detail__grid">
        <BookCover book={book} size="lg" />
        <div className="detail__body">
          <p className="detail__genre" data-testid="book-genre">{book.genre}</p>
          <h1 className="detail__title" data-testid="book-title">{book.title}</h1>
          <p className="detail__author" data-testid="book-author">by {book.author}</p>
          <p className="detail__price" data-testid="book-price">{formatPrice(book.priceCents)}</p>
          <p
            className={`stock stock--${outOfStock ? "out" : book.stock <= 3 ? "low" : "in"}`}
            data-testid="stock-status"
          >
            {stockLabel(book.stock)}
            {!outOfStock && <span data-testid="stock-count"> ({book.stock} copies)</span>}
          </p>
          <p className="detail__description" data-testid="book-description">{book.description}</p>

          <div className="buy">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={Math.max(1, book.stock)}
              value={quantity}
              disabled={outOfStock}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                setQuantity(Number.isNaN(n) ? 1 : n);
              }}
              data-testid="quantity-input"
            />
            <button
              type="button"
              className="button"
              disabled={outOfStock || remaining === 0}
              onClick={handleAdd}
              data-testid="add-to-cart-button"
            >
              {outOfStock ? "Out of stock" : "Add to cart"}
            </button>
          </div>
          {outOfStock && (
            <p className="note" data-testid="out-of-stock-message">
              This book is out of stock and can't be added to your cart.
            </p>
          )}
          {message && (
            <p className="note note--success" role="status" data-testid="add-to-cart-message">
              {message} <Link href="/cart" data-testid="view-cart-link">View cart</Link>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
