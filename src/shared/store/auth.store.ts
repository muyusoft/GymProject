import { create } from "zustand";
import { AuthState, AuthUser, AuthTokens } from "@/shared/types/auth.types";
import { persistedStore } from "./middleware";

interface AuthStore extends AuthState {
  setUser: (user: AuthUser | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>(
  persistedStore("auth", (set) => ({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user, isAuthenticated: user !== null }),
    setTokens: (tokens) => set({ tokens }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    logout: () =>
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        error: null,
      }),
  })),
);
