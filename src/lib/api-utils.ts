// API utility functions for Next.js API routes
import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  user_type: "guest" | "host" | "admin";
}

// Generate JWT token
export async function generateToken(user: AuthUser): Promise<string> {
  return await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload.user as AuthUser;
  } catch (error) {
    return null;
  }
}

// Get user from request
export async function getUserFromRequest(
  request: NextRequest
): Promise<AuthUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  return await verifyToken(token);
}

// Require authentication middleware
export async function requireAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return handler(request, user);
}

// Require specific user type
export async function requireUserType(
  request: NextRequest,
  allowedTypes: Array<"guest" | "host" | "admin">,
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!allowedTypes.includes(user.user_type)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return handler(request, user);
}

// Success response
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// Error response
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Validate required fields
export function validateRequiredFields(
  data: any,
  requiredFields: string[]
): string | null {
  for (const field of requiredFields) {
    if (!data[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

// Parse request body
export async function parseRequestBody(request: NextRequest): Promise<any> {
  try {
    return await request.json();
  } catch (error) {
    return null;
  }
}

// CORS headers
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS for CORS
export function handleOptions() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
