const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const goodOrder = {
  name: "Ada Reader",
  email: "ada@example.com",
  address: "1 Pine Street",
  city: "Portland",
  zip: "97201",
  cardNumber: "4242 4242 4242 4242",
  expiry: "12/30",
  cvc: "123",
  items: [{ bookId: "the-lantern-keeper", quantity: 2 }]
};

const checks = [
  ["GET /api/products", "GET", "/api/products", null, {}, 200, (b) => b.count === 10],
  ["GET /api/products?genre=Mystery", "GET", "/api/products?genre=Mystery", null, {}, 200, (b) => b.count === 2],
  ["GET /api/products?q=kepler", "GET", "/api/products?q=kepler", null, {}, 200, (b) => b.count === 1],
  ["GET /api/products?genre=Cooking", "GET", "/api/products?genre=Cooking", null, {}, 400],
  ["GET /api/products/the-lantern-keeper", "GET", "/api/products/the-lantern-keeper", null, {}, 200, (b) => b.book.stock === 12],
  ["GET /api/products/the-silent-orchard", "GET", "/api/products/the-silent-orchard", null, {}, 200, (b) => b.book.stock === 0],
  ["GET /api/products/no-such-book", "GET", "/api/products/no-such-book", null, {}, 404],
  ["POST /api/login demo", "POST", "/api/login", { email: "demo@example.com", password: "password123" }, {}, 200, (b) => b.token === "demo-token"],
  ["POST /api/login wrong password", "POST", "/api/login", { email: "demo@example.com", password: "nope" }, {}, 401],
  ["POST /api/login missing fields", "POST", "/api/login", {}, {}, 400],
  ["POST /api/signup new", "POST", "/api/signup", { name: "Ada", email: "ada@example.com", password: "longenough" }, {}, 201],
  ["POST /api/signup taken", "POST", "/api/signup", { name: "Tom", email: "taken@example.com", password: "longenough" }, {}, 409],
  ["POST /api/signup short password", "POST", "/api/signup", { name: "Ada", email: "ada@example.com", password: "short" }, {}, 400],
  ["POST /api/orders ok", "POST", "/api/orders", goodOrder, {}, 201, (b) => b.order.totalCents === 3398 && b.order.id.startsWith("PP-")],
  ["POST /api/orders declined", "POST", "/api/orders", { ...goodOrder, cardNumber: "4000000000000002" }, {}, 402],
  ["POST /api/orders out of stock", "POST", "/api/orders", { ...goodOrder, items: [{ bookId: "the-silent-orchard", quantity: 1 }] }, {}, 409],
  ["POST /api/orders too many", "POST", "/api/orders", { ...goodOrder, items: [{ bookId: "signals-from-kepler", quantity: 4 }] }, {}, 409],
  ["POST /api/orders unknown book", "POST", "/api/orders", { ...goodOrder, items: [{ bookId: "no-such-book", quantity: 1 }] }, {}, 404],
  ["POST /api/orders bad zip", "POST", "/api/orders", { ...goodOrder, zip: "12" }, {}, 400, (b) => Boolean(b.fields && b.fields.zip)],
  ["POST /api/orders empty items", "POST", "/api/orders", { ...goodOrder, items: [] }, {}, 400],
  ["POST /api/products no token", "POST", "/api/products", { title: "X" }, {}, 401],
  [
    "POST /api/products ok",
    "POST",
    "/api/products",
    { title: "Fresh Snow", author: "A. Writer", genre: "Poetry", price: 9.5, stock: 3, description: "A new collection of winter poems." },
    { Authorization: "Bearer demo-token" },
    201,
    (b) => b.book.id === "fresh-snow" && b.book.priceCents === 950
  ],
  [
    "POST /api/products duplicate",
    "POST",
    "/api/products",
    { title: "Small Hours", author: "A. Writer", genre: "Poetry", price: 9.5, stock: 3, description: "A duplicate title on purpose." },
    { Authorization: "Bearer demo-token" },
    409
  ],
  ["POST /api/products invalid", "POST", "/api/products", { title: "" }, { Authorization: "Bearer demo-token" }, 400]
];

let failed = 0;
for (const [name, method, path, body, headers, expected, test] of checks) {
  try {
    const res = await fetch(BASE_URL + path, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined
    });
    const type = res.headers.get("content-type") || "";
    const data = type.includes("application/json") ? await res.json() : null;
    const ok = res.status === expected && data !== null && (!test || test(data));
    if (!ok) failed += 1;
    console.log(`${ok ? "PASS" : "FAIL"}  ${res.status}  ${name}${ok ? "" : `  (expected ${expected} with JSON)`}`);
  } catch (err) {
    failed += 1;
    console.log(`FAIL  ---  ${name}  (${err.message})`);
  }
}

console.log(`\n${checks.length - failed}/${checks.length} checks passed against ${BASE_URL}`);
process.exit(failed ? 1 : 0);
