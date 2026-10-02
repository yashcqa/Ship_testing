export const DEMO_USER = {
  name: "Demo Reader",
  email: "demo@example.com",
  password: "password123"
};

export const SESSION_TOKEN = "demo-token";

export const REGISTERED_EMAILS = ["demo@example.com", "taken@example.com"];

export const SUCCESS_CARD = "4242424242424242";
export const DECLINED_CARD = "4000000000000002";

export const MIN_PASSWORD_LENGTH = 8;

export function orderIdFor(email, items) {
  const source =
    email.trim().toLowerCase() +
    "|" +
    items
      .map((item) => `${item.bookId}x${item.quantity}`)
      .sort()
      .join(",");
  let hash = 5381;
  for (let i = 0; i < source.length; i += 1) {
    hash = ((hash * 33) ^ source.charCodeAt(i)) >>> 0;
  }
  return "PP-" + hash.toString(36).toUpperCase().padStart(7, "0").slice(-7);
}
