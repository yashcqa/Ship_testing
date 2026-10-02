import { REGISTERED_EMAILS, SESSION_TOKEN } from "@/lib/rules";
import { validateSignup, hasErrors } from "@/lib/validation";
import { json, fail, readJson } from "@/lib/http";

export async function POST(request) {
  const body = await readJson(request);
  if (!body) return fail(400, "Send name, email and password as a JSON object.");
  const errors = validateSignup(body);
  if (hasErrors(errors)) return fail(400, "Some fields need attention.", errors);

  const email = body.email.trim().toLowerCase();
  if (REGISTERED_EMAILS.includes(email)) {
    return fail(409, "That email is already registered. Log in instead.");
  }
  return json(
    {
      token: SESSION_TOKEN,
      user: { name: body.name.trim(), email }
    },
    201
  );
}
