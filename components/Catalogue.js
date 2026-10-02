"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GENRES, filterBooks, formatPrice, stockLabel } from "@/lib/books";
import { useStore } from "./StoreProvider";
import BookCover from "./BookCover";

export default function Catalogue() {
  const { books } = useStore();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");

  const results = useMemo(() => filterBooks(books, { q: query, genre }), [books, query, genre]);

  function clearFilters() {
    setQuery("");
    setGenre("All");
  }

  return (
    <section className="catalogue" data-testid="catalogue">
      <div className="toolbar" role="search">
        <div className="toolbar__search">
          <label htmlFor="search" className="visually-hidden">Search by title or author</label>
          <input
            id="search"
            type="search"
            placeholder="Search by title or author"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="search-input"
          />
        </div>
        <div className="toolbar__genre">
          <label htmlFor="genre">Genre</label>
          <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} data-testid="genre-filter">
            <option value="All">All genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <p className="toolbar__count" data-testid="results-count" aria-live="polite">
          {results.length} {results.length === 1 ? "book" : "books"}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="empty" data-testid="no-results">
          <p>No books match those filters.</p>
          <button type="button" className="button button--quiet" onClick={clearFilters} data-testid="clear-filters-button">
            Clear search and genre
          </button>
        </div>
      ) : (
        <ul className="shelf" data-testid="book-list">
          {results.map((book) => (
            <li key={book.id} className="shelf__item" data-testid={`book-card-${book.id}`}>
              <Link href={`/books/${book.id}`} className="book-card" data-testid={`book-link-${book.id}`}>
                <BookCover book={book} />
                <span className="book-card__title" data-testid={`book-title-${book.id}`}>{book.title}</span>
                <span className="book-card__author">{book.author}</span>
                <span className="book-card__meta">
                  <span data-testid={`book-price-${book.id}`}>{formatPrice(book.priceCents)}</span>
                  <span
                    className={`stock stock--${book.stock <= 0 ? "out" : book.stock <= 3 ? "low" : "in"}`}
                    data-testid={`book-stock-${book.id}`}
                  >
                    {stockLabel(book.stock)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
