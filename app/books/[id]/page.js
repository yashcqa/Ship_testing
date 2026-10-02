import { BOOKS, findBook } from "@/lib/books";
import BookDetail from "@/components/BookDetail";

export function generateStaticParams() {
  return BOOKS.map((book) => ({ id: book.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const book = findBook(id);
  return { title: book ? book.title : "Book" };
}

export default async function BookPage({ params }) {
  const { id } = await params;
  return <BookDetail id={id} />;
}
