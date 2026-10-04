/**
 * Auth store tests
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../auth.store";

describe("Auth Store", () => {
  const mockUser = {
    id: "user-123",
    email: "user@example.com",
    name: "Test User",
  };

  const mockTokens = {
    accessToken: "token-123",
    refreshToken: "refresh-token-456",
    expiresIn: 3600,
  };

  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it("should initialize with null user", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should set user and mark as authenticated", () => {
    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("should set tokens", () => {
    useAuthStore.getState().setTokens(mockTokens);
    const state = useAuthStore.getState();
    expect(state.tokens).toEqual(mockTokens);
  });

  it("should set loading state", () => {
    useAuthStore.getState().setLoading(true);
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(true);
  });

  it("should set error", () => {
    useAuthStore.getState().setError("Invalid credentials");
    const state = useAuthStore.getState();
    expect(state.error).toBe("Invalid credentials");
  });

  it("should logout and clear all data", () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setTokens(mockTokens);
    useAuthStore.getState().setError("Some error");

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should update user", () => {
    useAuthStore.getState().setUser(mockUser);
    const updatedUser = { ...mockUser, name: "Updated Name" };
    useAuthStore.getState().setUser(updatedUser);

    const state = useAuthStore.getState();
    expect(state.user?.name).toBe("Updated Name");
  });

  it("should have all required store methods", () => {
    const state = useAuthStore.getState();
    expect(typeof state.setUser).toBe("function");
    expect(typeof state.setTokens).toBe("function");
    expect(typeof state.setLoading).toBe("function");
    expect(typeof state.setError).toBe("function");
    expect(typeof state.logout).toBe("function");
  });
});
