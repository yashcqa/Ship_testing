import { NextResponse } from "next/server";

export function json(body, status = 200) {
  return NextResponse.json(body, { status });
}

export function fail(status, error, fields) {
  return NextResponse.json(fields ? { error, fields } : { error }, { status });
}

export async function readJson(request) {
  try {
    const body = await request.json();
    if (body === null || typeof body !== "object" || Array.isArray(body)) return null;
    return body;
  } catch {
    return null;
  }
}
