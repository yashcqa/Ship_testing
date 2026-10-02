"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/books";
import { validateCheckout, hasErrors } from "@/lib/validation";
import { useStore } from "./StoreProvider";
import Field from "./Field";

const EMPTY = { name: "", email: "", address: "", city: "", zip: "", cardNumber: "", expiry: "", cvc: "" };

export default function CheckoutForm() {
  const { hydrated, cartLines, subtotalCents, clearCart, user } = useStore();
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) setValues((v) => ({ ...v, name: v.name || user.name, email: v.email || user.email }));
  }, [user]);

  if (!hydrated) return <p className="loading" data-testid="checkout-loading">Loading checkout…</p>;

  if (cartLines.length === 0 && !submitting) {
    return (
      <div className="empty" data-testid="checkout-empty">
        <p>Your cart is empty, so there is nothing to check out.</p>
        <Link href="/" className="button" data-testid="continue-shopping">Browse books</Link>
      </div>
    );
  }

  function set(name) {
    return (e) => setValues((v) => ({ ...v, [name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const found = validateCheckout(values);
    setErrors(found);
    if (hasErrors(found)) {
      setFormError("Check the highlighted fields and try again.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          items: cartLines.map((line) => ({ bookId: line.id, quantity: line.quantity }))
        })
      });
      const data = await res.json();
      if (res.status === 201) {
        try {
          window.sessionStorage.setItem("pp_last_order", JSON.stringify(data.order));
        } catch {}
        clearCart();
        router.push(`/order-confirmation?id=${encodeURIComponent(data.order.id)}`);
        return;
      }
      if (res.status === 400 && data.fields) setErrors(data.fields);
      setFormError(data.error || "The order could not be placed.");
      setSubmitting(false);
    } catch {
      setFormError("The order could not be sent. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  const input = (name, props = {}) => (
    <input
      id={name}
      name={name}
      value={values[name]}
      onChange={set(name)}
      aria-invalid={errors[name] ? "true" : "false"}
      aria-describedby={errors[name] ? `${name}-error` : undefined}
      data-testid={`checkout-${name}`}
      {...props}
    />
  );

  return (
    <div className="checkout" data-testid="checkout">
      <form className="form" onSubmit={handleSubmit} noValidate data-testid="checkout-form">
        {formError && (
          <div className="banner banner--error" role="alert" data-testid="checkout-error">{formError}</div>
        )}
        <fieldset>
          <legend>Contact and delivery</legend>
          <Field id="name" label="Full name" error={errors.name}>{input("name", { autoComplete: "name" })}</Field>
          <Field id="email" label="Email" error={errors.email}>
            {input("email", { type: "email", autoComplete: "email" })}
          </Field>
          <Field id="address" label="Street address" error={errors.address}>
            {input("address", { autoComplete: "street-address" })}
          </Field>
          <div className="field-row">
            <Field id="city" label="City" error={errors.city}>{input("city", { autoComplete: "address-level2" })}</Field>
            <Field id="zip" label="ZIP code" error={errors.zip}>
              {input("zip", { inputMode: "numeric", autoComplete: "postal-code", maxLength: 5 })}
            </Field>
          </div>
        </fieldset>
        <fieldset>
          <legend>Payment</legend>
          <Field id="cardNumber" label="Card number" error={errors.cardNumber} hint="Test card: 4242 4242 4242 4242">
            {input("cardNumber", { inputMode: "numeric", autoComplete: "cc-number", maxLength: 19 })}
          </Field>
          <div className="field-row">
            <Field id="expiry" label="Expiry (MM/YY)" error={errors.expiry}>
              {input("expiry", { placeholder: "MM/YY", autoComplete: "cc-exp", maxLength: 5 })}
            </Field>
            <Field id="cvc" label="Security code" error={errors.cvc}>
              {input("cvc", { inputMode: "numeric", autoComplete: "cc-csc", maxLength: 3 })}
            </Field>
          </div>
        </fieldset>
        <button type="submit" className="button button--wide" disabled={submitting} data-testid="place-order-button">
          {submitting ? "Placing order…" : `Place order (${formatPrice(subtotalCents)})`}
        </button>
      </form>

      <aside className="order-summary" data-testid="order-summary">
        <h2>Your order</h2>
        <ul>
          {cartLines.map((line) => (
            <li key={line.id} data-testid={`summary-item-${line.id}`}>
              <span>{line.book.title} × {line.quantity}</span>
              <span>{formatPrice(line.lineTotalCents)}</span>
            </li>
          ))}
        </ul>
        <p className="summary-row">
          <span>Shipping</span>
          <span data-testid="summary-shipping">Free</span>
        </p>
        <p className="summary-row summary-row--total">
          <span>Total</span>
          <strong data-testid="summary-total">{formatPrice(subtotalCents)}</strong>
        </p>
      </aside>
    </div>
  );
}
