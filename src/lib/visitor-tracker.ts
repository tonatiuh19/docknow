// Client-side visitor tracking utility
import { randomUUID } from "crypto";

// Generate UUID compatible with both browser and Node.js
function generateUUID(): string {
  if (typeof window !== "undefined" && window.crypto) {
    return window.crypto.randomUUID();
  }
  return randomUUID();
}

const SESSION_ID_KEY = "docknow_session_id";
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

class VisitorTracker {
  private static instance: VisitorTracker;
  private sessionId: string | null = null;
  private lastActivity: number = Date.now();

  private constructor() {
    this.initSession();
  }

  public static getInstance(): VisitorTracker {
    if (!VisitorTracker.instance) {
      VisitorTracker.instance = new VisitorTracker();
    }
    return VisitorTracker.instance;
  }

  private initSession(): void {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(SESSION_ID_KEY);
    const now = Date.now();

    if (stored) {
      try {
        const { sessionId, timestamp } = JSON.parse(stored);
        if (now - timestamp < SESSION_DURATION) {
          this.sessionId = sessionId;
          this.lastActivity = timestamp;
          return;
        }
      } catch (e) {
        // Invalid stored data, create new session
      }
    }

    // Create new session
    this.sessionId = generateUUID();
    this.saveSession();
  }

  private saveSession(): void {
    if (typeof window === "undefined" || !this.sessionId) return;

    localStorage.setItem(
      SESSION_ID_KEY,
      JSON.stringify({
        sessionId: this.sessionId,
        timestamp: Date.now(),
      })
    );
  }

  public getSessionId(): string | null {
    const now = Date.now();

    // Refresh session if expired
    if (this.sessionId && now - this.lastActivity > SESSION_DURATION) {
      this.sessionId = generateUUID();
    }

    this.lastActivity = now;
    this.saveSession();
    return this.sessionId;
  }

  public getHeaders(userId?: number): Record<string, string> {
    const headers: Record<string, string> = {};

    const sessionId = this.getSessionId();
    if (sessionId) {
      headers["x-session-id"] = sessionId;
    }

    if (userId) {
      headers["x-user-id"] = userId.toString();
    }

    return headers;
  }

  public reset(): void {
    if (typeof window === "undefined") return;

    this.sessionId = generateUUID();
    this.lastActivity = Date.now();
    this.saveSession();
  }
}

export const visitorTracker = VisitorTracker.getInstance();

// Helper hook for React components
export function useVisitorTracking(userId?: number) {
  if (typeof window === "undefined") {
    return { sessionId: null, headers: {} };
  }

  const sessionId = visitorTracker.getSessionId();
  const headers = visitorTracker.getHeaders(userId);

  return { sessionId, headers };
}
