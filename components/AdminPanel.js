"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GENRES, formatPrice } from "@/lib/books";
import { validateBook, hasErrors } from "@/lib/validation";
import { useStore } from "./StoreProvider";
import Field from "./Field";

const EMPTY = { title: "", author: "", genre: "", price: "", stock: "", description: "" };

export default function AdminPanel() {
  const { hydrated, user, token, addCustomBook, customBooks, books } = useStore();
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [added, setAdded] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login?next=/admin");
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return <p className="loading" data-testid="admin-redirect">Checking that you're logged in…</p>;
  }

  function set(name) {
    return (e) => setValues((v) => ({ ...v, [name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setAdded(null);
    const found = validateBook(values);
    setErrors(found);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...values, price: Number(values.price), stock: Number(values.stock) })
      });
      const data = await res.json();
      if (res.status === 201) {
        if (books.some((b) => b.id === data.book.id)) {
          setFormError(`A book with the id "${data.book.id}" already exists.`);
        } else {
          addCustomBook(data.book);
          setAdded(data.book);
          setValues(EMPTY);
        }
      } else {
        if (res.status === 400 && data.fields) setErrors(data.fields);
        setFormError(data.error || "The book could not be added.");
      }
    } catch {
      setFormError("The request could not be sent. Check your connection and try again.");
    }
    setSubmitting(false);
  }

  const input = (name, props = {}) => (
    <input
      id={name}
      name={name}
      value={values[name]}
      onChange={set(name)}
      aria-invalid={errors[name] ? "true" : "false"}
      data-testid={`admin-${name}`}
      {...props}
    />
  );

  return (
    <section className="admin" data-testid="admin-page">
      <h1>Add a book</h1>
      <p className="lede">New books appear in the catalogue in this browser right away.</p>
      <form className="form" onSubmit={handleSubmit} noValidate data-testid="add-book-form">
        {formError && <div className="banner banner--error" role="alert" data-testid="admin-error">{formError}</div>}
        {added && (
          <div className="banner banner--success" role="status" data-testid="admin-success">
            Added “{added.title}”. <Link href={`/books/${added.id}`} data-testid="admin-view-book">View book</Link>
          </div>
        )}
        <Field id="title" label="Title" error={errors.title}>{input("title")}</Field>
        <Field id="author" label="Author" error={errors.author}>{input("author")}</Field>
        <Field id="genre" label="Genre" error={errors.genre}>
          <select id="genre" value={values.genre} onChange={set("genre")} data-testid="admin-genre">
            <option value="">Choose a genre</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
        <div className="field-row">
          <Field id="price" label="Price (USD)" error={errors.price}>
            {input("price", { type: "number", min: "0.01", step: "0.01", inputMode: "decimal" })}
          </Field>
          <Field id="stock" label="Copies in stock" error={errors.stock}>
            {input("stock", { type: "number", min: "0", step: "1", inputMode: "numeric" })}
          </Field>
        </div>
        <Field id="description" label="Description" error={errors.description}>
          <textarea
            id="description"
            rows="4"
            value={values.description}
            onChange={set("description")}
            data-testid="admin-description"
          />
        </Field>
        <button type="submit" className="button button--wide" disabled={submitting} data-testid="add-book-submit">
          {submitting ? "Adding book…" : "Add book"}
        </button>
      </form>

      {customBooks.length > 0 && (
        <div className="admin__list" data-testid="custom-book-list">
          <h2>Books you've added</h2>
          <ul>
            {customBooks.map((b) => (
              <li key={b.id} data-testid={`custom-book-${b.id}`}>
                <Link href={`/books/${b.id}`}>{b.title}</Link> <span>{formatPrice(b.priceCents)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
