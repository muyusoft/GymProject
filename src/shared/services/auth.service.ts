import * as SecureStore from "expo-secure-store";
import httpClient from "@/config/http-client";
import { AuthTokens, AuthUser } from "@/shared/types/auth.types";

const TOKENS_KEY = "auth_tokens";

export const authService = {
  async login(
    email: string,
    password: string,
  ): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const { data } = await httpClient.post("/auth/login", { email, password });
    await SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(data.tokens));
    return data;
  },

  async logout(): Promise<void> {
    try {
      await httpClient.post("/auth/logout");
    } finally {
      await SecureStore.deleteItemAsync(TOKENS_KEY);
    }
  },

  async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const tokens = await SecureStore.getItemAsync(TOKENS_KEY);
      return tokens ? JSON.parse(tokens) : null;
    } catch {
      return null;
    }
  },

  async setTokens(tokens: AuthTokens): Promise<void> {
    await SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(tokens));
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKENS_KEY);
  },
};
