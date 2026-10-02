import { GENRES } from "./books";
import { MIN_PASSWORD_LENGTH } from "./rules";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function isEmail(value) {
  return EMAIL_RE.test(str(value));
}

export function normaliseCard(value) {
  return str(value).replace(/[\s-]/g, "");
}

export function validateLogin(input = {}) {
  const errors = {};
  if (!str(input.email)) errors.email = "Enter your email address.";
  else if (!isEmail(input.email)) errors.email = "Enter a valid email address.";
  if (!str(input.password)) errors.password = "Enter your password.";
  return errors;
}

export function validateSignup(input = {}) {
  const errors = {};
  if (!str(input.name)) errors.name = "Enter your name.";
  if (!str(input.email)) errors.email = "Enter your email address.";
  else if (!isEmail(input.email)) errors.email = "Enter a valid email address.";
  const password = typeof input.password === "string" ? input.password : "";
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (input.confirmPassword !== undefined && input.confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

export function validateCheckout(input = {}) {
  const errors = {};
  if (!str(input.name)) errors.name = "Enter the name on your order.";
  if (!str(input.email)) errors.email = "Enter your email address.";
  else if (!isEmail(input.email)) errors.email = "Enter a valid email address.";
  if (!str(input.address)) errors.address = "Enter your street address.";
  if (!str(input.city)) errors.city = "Enter your city.";
  if (!/^\d{5}$/.test(str(input.zip))) errors.zip = "Enter a 5-digit ZIP code.";
  if (!/^\d{16}$/.test(normaliseCard(input.cardNumber))) {
    errors.cardNumber = "Enter a 16-digit card number.";
  }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(str(input.expiry))) {
    errors.expiry = "Enter the expiry as MM/YY.";
  }
  if (!/^\d{3}$/.test(str(input.cvc))) errors.cvc = "Enter the 3-digit security code.";
  return errors;
}

export function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "Add at least one book to your order.";
  }
  for (const item of items) {
    if (!item || typeof item.bookId !== "string" || !item.bookId) {
      return "Each item needs a bookId.";
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return "Each item needs a whole-number quantity of at least 1.";
    }
  }
  return null;
}

export function validateBook(input = {}) {
  const errors = {};
  const title = str(input.title);
  if (!title) errors.title = "Enter a title.";
  else if (title.length > 100) errors.title = "Keep the title under 100 characters.";
  if (!str(input.author)) errors.author = "Enter an author.";
  if (!GENRES.includes(input.genre)) errors.genre = "Choose a genre from the list.";
  const price = Number(input.price);
  if (input.price === "" || input.price === undefined || !Number.isFinite(price) || price <= 0 || price > 1000) {
    errors.price = "Enter a price between 0.01 and 1000.";
  }
  const stock = Number(input.stock);
  if (input.stock === "" || input.stock === undefined || !Number.isInteger(stock) || stock < 0 || stock > 999) {
    errors.stock = "Enter a whole number of copies from 0 to 999.";
  }
  if (str(input.description).length < 10) {
    errors.description = "Write a description of at least 10 characters.";
  }
  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
