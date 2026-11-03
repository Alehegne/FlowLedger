import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "@/services/auth";
import { api, ApiError } from "@/lib/api/client";

vi.mock("@/lib/api/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/client")>("@/lib/api/client");
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signIn sends credentials to v1/auth/login", async () => {
    const mockResponse = {
      accessToken: "mock.jwt.token",
      tokenType: "Bearer",
      expiresIn: 3600,
      user: {
        id: "22222222-2222-2222-2222-222222222222",
        email: "abebe@acme.co",
        fullName: "Abebe Girma",
      },
      organization: {
        id: "11111111-1111-1111-1111-111111111111",
        name: "Acme Trading Co.",
        role: "OWNER",
      },
    };

    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await authService.signIn("abebe@acme.co", "password");

    expect(api.post).toHaveBeenCalledWith("v1/auth/login", {
      email: "abebe@acme.co",
      password: "password",
    });
    expect(result.accessToken).toBe("mock.jwt.token");
    expect(result.user.email).toBe("abebe@acme.co");
    expect(result.organization.role).toBe("OWNER");
  });

  it("signOut sends request to v1/auth/logout", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ message: "Logged out successfully" });

    await authService.signOut();

    expect(api.post).toHaveBeenCalledWith("v1/auth/logout");
  });

  it("getCurrentSession requests v1/me", async () => {
    const mockSession = {
      user: {
        id: "22222222-2222-2222-2222-222222222222",
        name: "Abebe Girma",
        email: "abebe@acme.co",
      },
      organization: {
        id: "11111111-1111-1111-1111-111111111111",
        name: "Acme Trading Co.",
        role: "OWNER",
      },
      permissions: ["invoices:read", "invoices:approve"],
    };

    vi.mocked(api.get).mockResolvedValueOnce(mockSession);

    const session = await authService.getCurrentSession();

    expect(api.get).toHaveBeenCalledWith("v1/me");
    expect(session.user.name).toBe("Abebe Girma");
    expect(session.organization.name).toBe("Acme Trading Co.");
  });

  it("handles 401 unauthorized errors on sign in", async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      new ApiError("Invalid email or password", 401, null, "/api/v1/auth/login")
    );

    await expect(authService.signIn("wrong@acme.co", "badpass")).rejects.toThrow(
      "Invalid email or password"
    );
  });
});
