import { DEMO_USER, SESSION_TOKEN } from "@/lib/rules";
import { validateLogin, hasErrors } from "@/lib/validation";
import { json, fail, readJson } from "@/lib/http";

export async function POST(request) {
  const body = await readJson(request);
  if (!body) return fail(400, "Send email and password as a JSON object.");
  const errors = validateLogin(body);
  if (hasErrors(errors)) return fail(400, "Some fields need attention.", errors);

  const email = body.email.trim().toLowerCase();
  if (email !== DEMO_USER.email || body.password !== DEMO_USER.password) {
    return fail(401, "That email and password don't match an account.");
  }
  return json({
    token: SESSION_TOKEN,
    user: { name: DEMO_USER.name, email: DEMO_USER.email }
  });
}
