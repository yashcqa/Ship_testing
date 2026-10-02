export default function BookCover({ book, size = "md" }) {
  return (
    <div
      className={`cover cover--${size}`}
      style={{ "--cover": book.cover || "#36524A" }}
      aria-hidden="true"
      data-testid={`book-cover-${book.id}`}
    >
      <span className="cover__title">{book.title}</span>
      <span className="cover__author">{book.author}</span>
    </div>
  );
}
