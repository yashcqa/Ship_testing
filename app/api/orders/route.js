import { findBook } from "@/lib/books";
import { DECLINED_CARD, orderIdFor } from "@/lib/rules";
import { validateCheckout, validateItems, normaliseCard, hasErrors } from "@/lib/validation";
import { json, fail, readJson } from "@/lib/http";

export async function POST(request) {
  const body = await readJson(request);
  if (!body) return fail(400, "Send the order as a JSON object.");

  const errors = validateCheckout(body);
  if (hasErrors(errors)) return fail(400, "Some fields need attention.", errors);

  const itemsError = validateItems(body.items);
  if (itemsError) return fail(400, itemsError);

  const lines = [];
  for (const item of body.items) {
    const book = findBook(item.bookId);
    if (!book) return fail(404, `No book found with id "${item.bookId}".`);
    if (book.stock === 0) return fail(409, `"${book.title}" is out of stock.`);
    if (item.quantity > book.stock) {
      return fail(409, `Only ${book.stock} copies of "${book.title}" are available.`);
    }
    lines.push({
      bookId: book.id,
      title: book.title,
      quantity: item.quantity,
      unitPriceCents: book.priceCents,
      lineTotalCents: book.priceCents * item.quantity
    });
  }

  if (normaliseCard(body.cardNumber) === DECLINED_CARD) {
    return fail(402, "Your card was declined. Use a different card.");
  }

  const subtotalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  const email = body.email.trim().toLowerCase();
  const order = {
    id: orderIdFor(email, lines),
    status: "confirmed",
    email,
    name: body.name.trim(),
    shippingAddress: {
      address: body.address.trim(),
      city: body.city.trim(),
      zip: body.zip.trim()
    },
    items: lines,
    subtotalCents,
    shippingCents: 0,
    totalCents: subtotalCents,
    cardLast4: normaliseCard(body.cardNumber).slice(-4)
  };
  return json({ order }, 201);
}
