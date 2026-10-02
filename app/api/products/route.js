import { BOOKS, GENRES, filterBooks, slugify } from "@/lib/books";
import { SESSION_TOKEN } from "@/lib/rules";
import { validateBook, hasErrors } from "@/lib/validation";
import { json, fail, readJson } from "@/lib/http";

export function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const genre = searchParams.get("genre") || "";
  if (genre && genre !== "All" && !GENRES.includes(genre)) {
    return fail(400, `Unknown genre "${genre}". Use one of: ${GENRES.join(", ")}.`);
  }
  const books = filterBooks(BOOKS, { q, genre });
  return json({ count: books.length, books });
}

export async function POST(request) {
  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${SESSION_TOKEN}`) {
    return fail(401, "Log in to add books. Send Authorization: Bearer demo-token.");
  }
  const body = await readJson(request);
  if (!body) return fail(400, "Send the book as a JSON object.");
  const errors = validateBook(body);
  if (hasErrors(errors)) return fail(400, "Some fields need attention.", errors);

  const id = slugify(body.title);
  if (!id) return fail(400, "Some fields need attention.", { title: "Use letters or numbers in the title." });
  if (BOOKS.some((book) => book.id === id)) {
    return fail(409, `A book with the id "${id}" already exists.`);
  }

  const book = {
    id,
    title: body.title.trim(),
    author: body.author.trim(),
    genre: body.genre,
    priceCents: Math.round(Number(body.price) * 100),
    stock: Number(body.stock),
    cover: "#36524A",
    description: body.description.trim()
  };
  return json({ book, persisted: false }, 201);
}
