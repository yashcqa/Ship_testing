import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty" data-testid="not-found">
      <h1>Page not found</h1>
      <p>That address doesn't match any page in the store.</p>
      <Link href="/" className="button" data-testid="back-to-catalogue">Browse all books</Link>
    </div>
  );
}
