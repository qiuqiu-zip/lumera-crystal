import { NextRequest, NextResponse } from "next/server";

const DEFAULT_INTERNAL_API_BASE_URL = "http://localhost:18000/api/v1";

function resolveBaseUrl() {
  return (
    process.env.NEXT_INTERNAL_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    DEFAULT_INTERNAL_API_BASE_URL
  );
}

function buildTargetUrl(path: string[], request: NextRequest) {
  const base = resolveBaseUrl();
  const url = new URL(base.replace(/\/$/, "") + "/" + path.join("/"));
  url.search = request.nextUrl.search;
  return url;
}

async function forward(request: NextRequest, ctx: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  const resolvedParams = await Promise.resolve(ctx.params);
  const target = buildTargetUrl(resolvedParams.path, request);
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");
  if (contentType) headers.set("content-type", contentType);
  if (authorization) headers.set("authorization", authorization);

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(target, init);
  const body = await upstream.arrayBuffer();
  const response = new NextResponse(body, { status: upstream.status });
  response.headers.set("x-lumera-proxy-target", target.toString());
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) {
    response.headers.set("content-type", upstreamType);
  }
  return response;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, ctx: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return forward(request, ctx);
}
export async function POST(request: NextRequest, ctx: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return forward(request, ctx);
}
export async function PUT(request: NextRequest, ctx: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return forward(request, ctx);
}
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return forward(request, ctx);
}
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return forward(request, ctx);
}
