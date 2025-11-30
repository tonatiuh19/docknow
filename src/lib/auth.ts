import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key"
);

export interface JWTPayload {
  userId: number;
  email: string;
  userType: "guest" | "host" | "admin";
}

export async function signToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashPassword(password: string): string {
  // Note: For production, use bcrypt or argon2
  // This is a placeholder
  return password;
}

export function comparePassword(password: string, hash: string): boolean {
  // Note: For production, use bcrypt or argon2
  // This is a placeholder
  return password === hash;
}
