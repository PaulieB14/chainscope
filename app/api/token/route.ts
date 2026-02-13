import { NextRequest, NextResponse } from "next/server";

const BASE = "https://token-api.thegraph.com";

export async function GET(req: NextRequest) {
  const jwt = req.headers.get("x-token-jwt");
  if (!jwt) return NextResponse.json({ error: "Missing JWT" }, { status: 401 });

  const path = req.nextUrl.searchParams.get("path");
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  const params = new URLSearchParams();
  req.nextUrl.searchParams.forEach((val, key) => {
    if (key !== "path") params.append(key, val);
  });

  const url = `${BASE}${path}${params.toString() ? "?" + params.toString() : ""}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "API request failed" }, { status: 502 });
  }
}
