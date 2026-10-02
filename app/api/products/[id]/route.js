import { findBook } from "@/lib/books";
import { json, fail } from "@/lib/http";

export async function GET(_request, { params }) {
  const { id } = await params;
  const book = findBook(id);
  if (!book) return fail(404, `No book found with id "${id}".`);
  return json({ book });
}
