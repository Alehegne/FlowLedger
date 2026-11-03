import { api } from "@/lib/api/client";
import type { CurrentSession, LoginResponse } from "@/types/auth";

export const authService = {
  /**
   * Submits credentials to the backend, sets HttpOnly session cookie, and returns session data.
   */
  async signIn(email: string, password: string): Promise<LoginResponse> {
    return api.post<LoginResponse>("v1/auth/login", { email, password });
  },

  /**
   * Clears the session cookie on the backend.
   */
  async signOut(): Promise<void> {
    await api.post("v1/auth/logout");
  },

  /**
   * Retrieves current authenticated user session, organization, and permissions.
   */
  async getCurrentSession(): Promise<CurrentSession> {
    return api.get<CurrentSession>("v1/me");
  },
};
