# Page & Pine

A small, deterministic online bookstore built with Next.js (App Router) and plain CSS. It exists as a test fixture: every rule is fixed, documented below, and the same input always gives the same result. There is no database.

## Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. For a production build use `npm run build` then `npm start`.

To check every API rule against a running copy:

```bash
npm run smoke
BASE_URL=https://page-and-pine.vercel.app npm run smoke
```

## Pages

| Path | What it does |
| --- | --- |
| `/` | Catalogue of 10 books with a search box (title or author, case-insensitive) and a genre filter |
| `/books/[id]` | Book detail with price, description, stock and an Add to cart button |
| `/cart` | Cart with quantity stepper, remove and a live subtotal |
| `/checkout` | Checkout form with field validation |
| `/order-confirmation` | Confirmation of the last order placed in this browser tab |
| `/signup` | Create an account |
| `/login` | Log in |
| `/admin` | Add a book. Redirects to `/login?next=/admin` when logged out |
| `/openapi.yaml` | The API description, served as a static file |

## Deterministic rules

### Accounts

| Rule | Value |
| --- | --- |
| Demo login that always works | `demo@example.com` / `password123` |
| Any other email or password on `/login` | 401, "That email and password don't match an account." |
| Email that always returns "already registered" on sign up | `taken@example.com` (also `demo@example.com`) → 409 |
| Any other valid sign up | 201, and the user is logged in immediately |
| Password rule | At least 8 characters; confirm password must match |
| Session token | Every session uses the fixed token `demo-token` |

The login API only accepts the demo account. Accounts created through sign up are not stored on the server, so they cannot log in again later; sign up logs you in directly instead.

### Catalogue

| Rule | Value |
| --- | --- |
| Number of books | 10 |
| Genres | Fiction, Mystery, Science Fiction, Fantasy, Non-fiction, Poetry |
| Book that is always out of stock | `the-silent-orchard` ("The Silent Orchard"), stock 0, Add to cart disabled |
| Low stock label | Stock of 1 to 3 shows "Only N left" (`signals-from-kepler` has 3) |
| Search | Matches title or author, case-insensitive, substring |

Full catalogue (`lib/books.js`):

| id | Title | Genre | Price | Stock |
| --- | --- | --- | --- | --- |
| the-lantern-keeper | The Lantern Keeper | Fiction | $16.99 | 12 |
| north-of-the-tideline | North of the Tideline | Fiction | $14.50 | 7 |
| the-silent-orchard | The Silent Orchard | Mystery | $18.00 | 0 |
| a-murder-in-maple-lane | A Murder in Maple Lane | Mystery | $12.99 | 5 |
| the-glass-cartographer | The Glass Cartographer | Science Fiction | $21.00 | 9 |
| signals-from-kepler | Signals from Kepler | Science Fiction | $15.75 | 3 |
| the-ember-crown | The Ember Crown | Fantasy | $19.99 | 8 |
| roots-and-rivers | Roots and Rivers | Non-fiction | $24.00 | 6 |
| the-quiet-workshop | The Quiet Workshop | Non-fiction | $17.25 | 10 |
| small-hours | Small Hours | Poetry | $11.00 | 4 |

### Cart

| Rule | Value |
| --- | --- |
| Storage | Browser localStorage key `pp_cart` |
| Quantity limits | Minimum 1, maximum the book's stock. Values outside the range are clamped |
| Adding more than stock | The cart quantity is capped at stock and a message says so |
| Subtotal | Sum of price × quantity, updates immediately |
| Shipping | Always free; total equals subtotal |

### Checkout

| Field | Rule |
| --- | --- |
| Full name, street address, city | Required |
| Email | Required, must look like `name@domain.tld` |
| ZIP code | Exactly 5 digits |
| Card number | Exactly 16 digits after removing spaces and dashes |
| Expiry | `MM/YY` with month 01 to 12 (the date is not compared to today, so it never expires) |
| Security code | Exactly 3 digits |

| Card number | Result |
| --- | --- |
| `4000000000000002` | Always declined: 402, "Your card was declined. Use a different card." |
| `4242424242424242` | Always succeeds (any other valid 16-digit number also succeeds) |

The order number is a hash of the email and items, so the same email and cart always give the same order number (for example `PP-` followed by 7 characters). After a successful order the cart is emptied.

### Admin

| Rule | Value |
| --- | --- |
| Access | Logged-in users only; otherwise redirect to `/login?next=/admin` |
| Book id | Slug of the title, for example "Fresh Snow" → `fresh-snow` |
| Duplicate title | A title whose slug matches an existing book → 409 |
| Persistence | The API validates and returns the book but does not store it. The web app keeps added books in localStorage key `pp_custom_books`, so they appear only in the browser that added them |
| Field rules | Title required (max 100), author required, genre from the list, price 0.01 to 1000, stock whole number 0 to 999, description at least 10 characters |

## API

All responses are JSON. Errors have the shape `{ "error": "message" }`, and validation errors add `"fields": { "fieldName": "message" }`. The full description is in [`openapi.yaml`](./openapi.yaml).

| Method | Path | Status codes |
| --- | --- | --- |
| GET | `/api/products?q=&genre=` | 200 list, 400 unknown genre |
| POST | `/api/products` | 201 created, 400 invalid, 401 no `Authorization: Bearer demo-token`, 409 duplicate |
| GET | `/api/products/{id}` | 200 found, 404 not found |
| POST | `/api/login` | 200 demo account, 400 missing fields, 401 wrong credentials |
| POST | `/api/signup` | 201 created, 400 invalid, 409 already registered |
| POST | `/api/orders` | 201 confirmed, 400 invalid, 402 declined card, 404 unknown book, 409 out of stock or above stock |

`POST /api/orders` checks in this order: 400, 404, 409, 402, then 201.

Example:

```bash
curl -s -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@example.com","address":"1 Pine St","city":"Portland","zip":"97201","cardNumber":"4000000000000002","expiry":"12/30","cvc":"123","items":[{"bookId":"small-hours","quantity":1}]}'
```

returns status 402 with `{"error":"Your card was declined. Use a different card."}`.

## Test ids

Every button, input and key element has a stable `data-testid`. Ids that refer to a book end with the book id.

| Area | Test ids |
| --- | --- |
| Header | `site-header`, `nav-home`, `nav-catalogue`, `nav-login`, `nav-signup`, `nav-admin`, `nav-user-email`, `logout-button`, `nav-cart`, `cart-count` |
| Catalogue | `catalogue`, `search-input`, `genre-filter`, `results-count`, `book-list`, `book-card-{id}`, `book-link-{id}`, `book-title-{id}`, `book-price-{id}`, `book-stock-{id}`, `book-cover-{id}`, `no-results`, `clear-filters-button` |
| Book detail | `book-detail`, `book-title`, `book-author`, `book-genre`, `book-price`, `stock-status`, `stock-count`, `book-description`, `quantity-input`, `add-to-cart-button`, `add-to-cart-message`, `out-of-stock-message`, `view-cart-link`, `back-link`, `book-not-found` |
| Cart | `cart`, `cart-empty`, `cart-item-{id}`, `cart-item-title-{id}`, `cart-item-price-{id}`, `cart-qty-{id}`, `cart-increase-{id}`, `cart-decrease-{id}`, `cart-line-total-{id}`, `cart-remove-{id}`, `cart-subtotal`, `checkout-button`, `continue-shopping` |
| Checkout | `checkout-form`, `checkout-name`, `checkout-email`, `checkout-address`, `checkout-city`, `checkout-zip`, `checkout-cardNumber`, `checkout-expiry`, `checkout-cvc`, `place-order-button`, `checkout-error`, `error-{field}`, `order-summary`, `summary-item-{id}`, `summary-total`, `checkout-empty` |
| Confirmation | `order-confirmation`, `confirmation-heading`, `order-id`, `order-email`, `confirmation-item-{id}`, `order-total`, `no-order` |
| Log in | `login-page`, `login-form`, `login-email`, `login-password`, `login-submit`, `login-error`, `demo-hint`, `go-to-signup` |
| Sign up | `signup-page`, `signup-form`, `signup-name`, `signup-email`, `signup-password`, `signup-confirm-password`, `signup-submit`, `signup-error`, `go-to-login` |
| Admin | `admin-page`, `admin-redirect`, `add-book-form`, `admin-title`, `admin-author`, `admin-genre`, `admin-price`, `admin-stock`, `admin-description`, `add-book-submit`, `admin-success`, `admin-error`, `admin-view-book`, `custom-book-list`, `custom-book-{id}` |

## Project structure

```
app/                 Pages and API routes (App Router)
  api/               products, products/[id], login, signup, orders
components/          Client components and the cart/session store
lib/books.js         The fixed catalogue and helpers
lib/rules.js         Demo account, test cards, order id hashing
lib/validation.js    Validation shared by the browser and the API
openapi.yaml         API description (copied to public/ at build time by scripts/copy-openapi.mjs)
scripts/smoke-test.mjs  API checks for every status code
```
