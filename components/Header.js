"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "./StoreProvider";

export default function Header() {
  const { cartCount, user, logout } = useStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className="site-header" data-testid="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" data-testid="nav-home">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M12 2 5 12h4l-5 7h6v3h4v-3h6l-5-7h4z" fill="currentColor" />
            </svg>
          </span>
          Page &amp; Pine
        </Link>
        <nav className="site-nav" aria-label="Main">
          <Link href="/" data-testid="nav-catalogue">Books</Link>
          {user && (
            <Link href="/admin" data-testid="nav-admin">Add a book</Link>
          )}
          {user ? (
            <>
              <span className="site-nav__user" data-testid="nav-user-email">{user.email}</span>
              <button type="button" className="link-button" onClick={handleLogout} data-testid="logout-button">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" data-testid="nav-login">Log in</Link>
              <Link href="/signup" data-testid="nav-signup">Sign up</Link>
            </>
          )}
          <Link href="/cart" className="cart-link" data-testid="nav-cart">
            Cart <span className="cart-link__count" data-testid="cart-count">{cartCount}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
