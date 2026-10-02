"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BOOKS } from "@/lib/books";

const StoreContext = createContext(null);

const KEYS = {
  cart: "pp_cart",
  session: "pp_session",
  customBooks: "pp_custom_books"
};

function load(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function StoreProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState([]);
  const [session, setSession] = useState(null);
  const [customBooks, setCustomBooks] = useState([]);

  useEffect(() => {
    setCart(load(KEYS.cart, []));
    setSession(load(KEYS.session, null));
    setCustomBooks(load(KEYS.customBooks, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) save(KEYS.cart, cart);
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) save(KEYS.session, session);
  }, [session, hydrated]);

  useEffect(() => {
    if (hydrated) save(KEYS.customBooks, customBooks);
  }, [customBooks, hydrated]);

  const books = useMemo(() => [...BOOKS, ...customBooks], [customBooks]);

  const getBook = useCallback((id) => books.find((b) => b.id === id) || null, [books]);

  const addToCart = useCallback(
    (id, quantity) => {
      const book = books.find((b) => b.id === id);
      if (!book || book.stock <= 0) return 0;
      const existing = cart.find((line) => line.id === id);
      const finalQty = Math.min((existing ? existing.quantity : 0) + quantity, book.stock);
      setCart((current) =>
        current.some((line) => line.id === id)
          ? current.map((line) => (line.id === id ? { ...line, quantity: finalQty } : line))
          : [...current, { id, quantity: finalQty }]
      );
      return finalQty;
    },
    [books, cart]
  );

  const updateQuantity = useCallback(
    (id, quantity) => {
      const book = books.find((b) => b.id === id);
      if (!book) return;
      const clamped = Math.max(1, Math.min(quantity, book.stock));
      setCart((current) => current.map((line) => (line.id === id ? { ...line, quantity: clamped } : line)));
    },
    [books]
  );

  const removeFromCart = useCallback((id) => {
    setCart((current) => current.filter((line) => line.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartLines = useMemo(
    () =>
      cart
        .map((line) => {
          const book = books.find((b) => b.id === line.id);
          return book ? { ...line, book, lineTotalCents: book.priceCents * line.quantity } : null;
        })
        .filter(Boolean),
    [cart, books]
  );

  const subtotalCents = cartLines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  const login = useCallback((user, token) => setSession({ user, token }), []);
  const logout = useCallback(() => setSession(null), []);

  const addCustomBook = useCallback((book) => {
    setCustomBooks((current) => [...current.filter((b) => b.id !== book.id), book]);
  }, []);

  const value = {
    hydrated,
    books,
    getBook,
    cartLines,
    cartCount,
    subtotalCents,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    user: session ? session.user : null,
    token: session ? session.token : null,
    login,
    logout,
    customBooks,
    addCustomBook
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
