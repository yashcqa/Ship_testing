"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateLogin, validateSignup, hasErrors } from "@/lib/validation";
import { useStore } from "./StoreProvider";
import Field from "./Field";

function safeNext() {
  try {
    const next = new URLSearchParams(window.location.search).get("next");
    return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  } catch {
    return "/";
  }
}

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const { login } = useStore();
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const prefix = isSignup ? "signup" : "login";

  function set(name) {
    return (e) => setValues((v) => ({ ...v, [name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const payload = isSignup
      ? values
      : { email: values.email, password: values.password };
    const found = isSignup ? validateSignup(payload) : validateLogin(payload);
    setErrors(found);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      const res = await fetch(isSignup ? "/api/signup" : "/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        router.push(safeNext());
        return;
      }
      if (res.status === 400 && data.fields) setErrors(data.fields);
      setFormError(data.error || "Something went wrong. Try again.");
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
      aria-describedby={errors[name] ? `${name}-error` : undefined}
      data-testid={`${prefix}-${name === "confirmPassword" ? "confirm-password" : name}`}
      {...props}
    />
  );

  return (
    <section className="auth" data-testid={`${prefix}-page`}>
      <h1>{isSignup ? "Create an account" : "Log in"}</h1>
      {!isSignup && (
        <p className="note" data-testid="demo-hint">
          Demo account: demo@example.com with password password123
        </p>
      )}
      <form className="form" onSubmit={handleSubmit} noValidate data-testid={`${prefix}-form`}>
        {formError && (
          <div className="banner banner--error" role="alert" data-testid={`${prefix}-error`}>{formError}</div>
        )}
        {isSignup && (
          <Field id="name" label="Name" error={errors.name}>{input("name", { autoComplete: "name" })}</Field>
        )}
        <Field id="email" label="Email" error={errors.email}>
          {input("email", { type: "email", autoComplete: "email" })}
        </Field>
        <Field
          id="password"
          label="Password"
          error={errors.password}
          hint={isSignup ? "At least 8 characters." : undefined}
        >
          {input("password", { type: "password", autoComplete: isSignup ? "new-password" : "current-password" })}
        </Field>
        {isSignup && (
          <Field id="confirmPassword" label="Confirm password" error={errors.confirmPassword}>
            {input("confirmPassword", { type: "password", autoComplete: "new-password" })}
          </Field>
        )}
        <button type="submit" className="button button--wide" disabled={submitting} data-testid={`${prefix}-submit`}>
          {submitting ? (isSignup ? "Creating account…" : "Logging in…") : isSignup ? "Create account" : "Log in"}
        </button>
      </form>
      <p className="auth__switch">
        {isSignup ? (
          <>Already have an account? <Link href="/login" data-testid="go-to-login">Log in</Link></>
        ) : (
          <>New to Page &amp; Pine? <Link href="/signup" data-testid="go-to-signup">Create an account</Link></>
        )}
      </p>
    </section>
  );
}
